#!/usr/bin/env python3
"""
seed_pharmacies.py
==================
Parses the Rwanda FDA "List of Licensed Human Retail Pharmacies – December 2025" PDF
and seeds the Firestore `licensed_pharmacies` collection.

Run once:
  python3 seed_pharmacies.py

Requirements:
  pip install pdfplumber firebase-admin

Set GOOGLE_APPLICATION_CREDENTIALS env var to your Firebase service account JSON, or
place serviceAccountKey.json in the same directory as this script.
"""

import re
import json
import os
import sys
from datetime import datetime

try:
    import pdfplumber
except ImportError:
    print("❌  pdfplumber not installed. Run: pip install pdfplumber")
    sys.exit(1)

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("❌  firebase-admin not installed. Run: pip install firebase-admin")
    sys.exit(1)

# ─── Configuration ─────────────────────────────────────────────────────────────

PDF_PATH = os.path.join(os.path.dirname(__file__), "LIST LICENSED HUMAN RETAIL PHARMACIES-DECEMBER 2025.pdf")
SERVICE_ACCOUNT = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
COLLECTION = "licensed_pharmacies"

# ─── Firebase init ─────────────────────────────────────────────────────────────

if os.path.exists(SERVICE_ACCOUNT):
    cred = credentials.Certificate(SERVICE_ACCOUNT)
elif os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
    cred = credentials.ApplicationDefault()
else:
    print("❌  No Firebase credentials found.")
    print("    Place serviceAccountKey.json next to this script, or set GOOGLE_APPLICATION_CREDENTIALS.")
    sys.exit(1)

firebase_admin.initialize_app(cred)
db = firestore.client()

# ─── Regex helpers ─────────────────────────────────────────────────────────────

# Lenient pattern: captures all common PDF typos observed in this document
#   Normal:       NPC/A0899   (correct)
#   Missing digit: NPC/A670   → pad to NPC/A0670
#   Missing A:    NPC/1267    → insert A → NPC/A1267
#   Missing slash: NPCA0909   → insert / → NPC/A0909
REG_LENIENT_RE = re.compile(
    r'NPC'           # always starts NPC
    r'(?:/)?'        # optional slash (handles NPCA0909)
    r'A?'            # optional A     (handles NPC/1267)
    r'(\d{3,4})'     # 3 or 4 digits  (handles NPC/A670 → 3 digits)
)

DATE_RE = re.compile(r'\d{2}/\d{2}/\d{4}')
PROVINCES = {"KIGALI CITY", "EASTERN", "WESTERN", "NORTHERN", "SOUTHERN"}


def normalize_reg(raw: str) -> str:
    """Normalise any observed PDF typo into canonical NPC/Axxxx (4-digit zero-padded)."""
    raw = raw.strip().upper()
    m = REG_LENIENT_RE.search(raw)
    if not m:
        return raw
    digits = m.group(1).zfill(4)   # zero-pad 3-digit numbers to 4 digits
    return f"NPC/A{digits}"


def parse_expiry(date_str: str) -> str:
    """Convert DD/MM/YYYY → YYYY-MM-DD (ISO 8601)."""
    try:
        return datetime.strptime(date_str, "%d/%m/%Y").strftime("%Y-%m-%d")
    except ValueError:
        return date_str


def extract_pharmacies(pdf_path: str) -> list[dict]:
    """Parse all 725 pharmacy records from the PDF, tolerating OCR/formatting issues."""
    pharmacies = []
    seen_sns: set[int] = set()

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            text = page.extract_text() or ""
            lines = text.split("\n")

            i = 0
            while i < len(lines):
                line = lines[i].strip()

                # Each data row starts with "N." where N is the serial number
                row_match = re.match(r'^(\d+)\.\s+(.+)', line)
                if not row_match:
                    i += 1
                    continue

                sn = int(row_match.group(1))
                # Skip duplicate SNs that appear due to page-span edge cases
                if sn in seen_sns:
                    i += 1
                    continue

                rest = row_match.group(2)

                # Collect up to 4 continuation lines (handles long names & wrapped columns)
                full_text = rest
                for j in range(1, 5):
                    if i + j >= len(lines):
                        break
                    next_line = lines[i + j].strip()
                    # Stop at next row, page footer, or blank line
                    if re.match(r'^\d+\.', next_line):
                        break
                    if "Rwanda FDA" in next_line or next_line.startswith("Page"):
                        break
                    if not next_line:
                        break
                    full_text += " " + next_line

                # Find registration number (lenient match)
                reg_match = REG_LENIENT_RE.search(full_text)
                if not reg_match:
                    # Still missing — log and skip
                    print(f"  ⚠️  SN {sn}: no reg number found in: {full_text[:100]!r}")
                    i += 1
                    continue

                reg_number = normalize_reg(reg_match.group())
                seen_sns.add(sn)

                # Extract expiry date
                date_match = DATE_RE.search(full_text)
                expiry = parse_expiry(date_match.group()) if date_match else ""

                # Extract province
                province = ""
                for prov in PROVINCES:
                    if prov in full_text:
                        province = prov
                        break

                # Extract pharmacy name — everything before "MEDICAL PRODUCTS"
                name_match = re.match(r'^(.+?)\s+MEDICAL\s+PRODUCTS', full_text)
                if name_match:
                    name = name_match.group(1).strip()
                else:
                    name = rest.split("MEDICAL")[0].strip()

                # Extract council technician — between "PRODUCTS" and the reg number
                raw_reg = reg_match.group()
                tech_match = re.search(r'PRODUCTS\s+(.+?)\s+' + re.escape(raw_reg), full_text)
                technician = tech_match.group(1).strip() if tech_match else ""

                # Extract district / sector / cell (after province)
                district = sector = cell = ""
                if province:
                    orig_date = date_match.group() if date_match else ""
                    after_prov = full_text.split(province, 1)[-1].strip()
                    after_prov_clean = after_prov.replace(orig_date, "").strip()
                    loc_parts = after_prov_clean.split()
                    if loc_parts:
                        district = loc_parts[0]
                    if len(loc_parts) >= 2:
                        sector = loc_parts[1]
                    if len(loc_parts) >= 3:
                        cell = " ".join(loc_parts[2:])

                pharmacies.append({
                    "sn": sn,
                    "registrationNumber": reg_number,
                    "name": name,
                    "councilTechnician": technician,
                    "province": province,
                    "district": district,
                    "sector": sector,
                    "cell": cell,
                    "licenseExpiryDate": expiry,
                    "isRegistered": False,
                    "seededAt": firestore.SERVER_TIMESTAMP,
                })

                i += 1

    # Sort by SN for cleaner output
    pharmacies.sort(key=lambda p: p["sn"])
    return pharmacies


# ─── Seed Firestore ─────────────────────────────────────────────────────────────

def seed(pharmacies: list[dict], dry_run: bool = False) -> None:
    col = db.collection(COLLECTION)
    batch = db.batch()
    count = 0

    for pharmacy in pharmacies:
        reg = pharmacy["registrationNumber"]
        # Firestore doc IDs cannot contain '/' (it's treated as a path separator)
        # Store as NPC_A0899 but keep NPC/A0899 in the registrationNumber field
        doc_id = reg.replace("/", "_")
        doc_ref = col.document(doc_id)
        batch.set(doc_ref, pharmacy, merge=False)
        count += 1

        # Firestore batch limit is 500 operations
        if count % 499 == 0:
            if not dry_run:
                batch.commit()
                print(f"  ✅  Committed {count} documents…")
            batch = db.batch()

    if not dry_run:
        batch.commit()

    print(f"\n{'[DRY RUN] ' if dry_run else ''}✅  Seeded {count} pharmacies into `{COLLECTION}`")


# ─── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    show_all = "--show-all" in sys.argv

    print(f"📄  Parsing PDF: {os.path.basename(PDF_PATH)}")
    pharmacies = extract_pharmacies(PDF_PATH)
    print(f"📊  Found {len(pharmacies)} pharmacy records\n")

    if dry_run or show_all:
        limit = len(pharmacies) if show_all else 5
        print(f"First {limit} records:")
        for p in pharmacies[:limit]:
            print(json.dumps({k: v for k, v in p.items() if k != "seededAt"}, indent=2))
    
    if not dry_run:
        print(f"🚀  Seeding to Firestore collection `{COLLECTION}`…")
        seed(pharmacies, dry_run=False)
    else:
        seed(pharmacies, dry_run=True)

    print("\n🎉  Done!")
