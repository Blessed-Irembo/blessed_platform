package com.blessedirembo.app.data.model

import com.google.firebase.firestore.DocumentId

/**
 * OperatingHours — matches iOS OperatingHours struct stored in Firestore
 * at operatingHours: { is24Hours, days, openTime, closeTime }
 */
data class OperatingHours(
    val is24Hours: Boolean = false,
    val days: List<String> = emptyList(),
    val openTime: String = "08:00",  // HH:mm
    val closeTime: String = "20:00"  // HH:mm
)

/**
 * Pharmacy — Firestore model stored at /pharmacies/{id}
 */
data class Pharmacy(
    @DocumentId
    val id: String = "",
    val name: String = "",
    val address: String = "",
    val phone: String = "",
    val phoneNumber: String = "",
    val whatsAppNumber: String = "",
    val district: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    @get:com.google.firebase.firestore.PropertyName("isOpen")
    @com.google.firebase.firestore.PropertyName("isOpen")
    val isOpen: Boolean = false,
    
    @get:com.google.firebase.firestore.PropertyName("is24_7")
    @com.google.firebase.firestore.PropertyName("is24_7")
    val is24_7: Boolean = false,
    
    @get:com.google.firebase.firestore.PropertyName("isVerified")
    @com.google.firebase.firestore.PropertyName("isVerified")
    val isVerified: Boolean = false,
    val rating: Double = 0.0,
    val reviewCount: Int = 0,
    val ownerId: String = "",
    val ownerName: String = "",
    val licenseNumber: String = "",
    val description: String = "",
    val email: String = "",
    val openingHours: String = "",  // intentionally blank — do NOT default to any hours string
    // Structured operating hours (iOS-compatible)
    val operatingHours: Map<String, Any>? = null,
    val services: List<String> = emptyList(),
    val imageUrls: List<String> = emptyList(),
    // Dashboard metrics (mirroring iOS PharmacyDashboardViewModel)
    val whatsappClicks: Int = 0,
    val profileViews: Int = 0,
    val subscriptionPlan: String = "Free",
    val isPremium: Boolean = false,
    val isActive: Boolean = true,
    @com.google.firebase.firestore.ServerTimestamp
    val subscriptionEndDate: com.google.firebase.Timestamp? = null,
    @com.google.firebase.firestore.ServerTimestamp
    val createdAt: com.google.firebase.Timestamp? = null
) {
    /**
     * Parse the structured operatingHours map into a typed OperatingHours object.
     */
    @get:com.google.firebase.firestore.Exclude
    val parsedOperatingHours: OperatingHours
        get() = operatingHours?.let {
            OperatingHours(
                is24Hours = (it["is24Hours"] as? Boolean) ?: false,
                days = (it["days"] as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                openTime = (it["openTime"] as? String) ?: "08:00",
                closeTime = (it["closeTime"] as? String) ?: "20:00"
            )
        } ?: OperatingHours()

    /**
     * Determine if the pharmacy is currently open based on operating hours.
     *
     * Strategy (in priority order):
     *  1. is24_7 flag or operatingHours.is24Hours → always open.
     *  2. Structured operatingHours with a non-empty days list → precise day+time check.
     *  3. Plain-text openingHours string (e.g. "Mon-Sat: 8am-6pm") → parsed fallback.
     *  4. Static Firestore isOpen field → last resort for legacy data.
     *
     * Uses Africa/Kigali timezone (UTC+2) for all time comparisons.
     */
    @get:com.google.firebase.firestore.Exclude
    val isCurrentlyOpen: Boolean
        get() {
            // ── Priority 1: explicit 24/7 flags ──────────────────────────────────
            if (is24_7) return true
            val hours = parsedOperatingHours
            if (hours.is24Hours) return true

            val kigaliTz = java.util.TimeZone.getTimeZone("Africa/Kigali")
            val now = java.util.Calendar.getInstance(kigaliTz)
            val fullDayNames = listOf(
                "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
            )
            val todayFull = fullDayNames.getOrNull(now.get(java.util.Calendar.DAY_OF_WEEK) - 1)
                ?: return false
            val todayAbbrev = todayFull.take(3)
            val currentMinutes =
                now.get(java.util.Calendar.HOUR_OF_DAY) * 60 + now.get(java.util.Calendar.MINUTE)

            // ── Priority 2: structured operating hours ────────────────────────────
            // Gate on operatingHours != null (the raw Firestore field) rather than
            // days.isNotEmpty(). Some pharmacies (e.g. Akedah) have days=[] but
            // valid openTime/closeTime — matching iOS, empty days = open every day.
            if (operatingHours != null) {
                // If days list is non-empty, today must be a working day
                if (hours.days.isNotEmpty()) {
                    val isWorkingDay = hours.days.any { storedDay ->
                        storedDay.equals(todayFull, ignoreCase = true) ||
                        storedDay.equals(todayAbbrev, ignoreCase = true)
                    }
                    if (!isWorkingDay) return false
                }
                // (days empty = open every day — matches iOS isCurrentlyOpen)
                val openParts  = hours.openTime.split(":").mapNotNull { it.toIntOrNull() }
                val closeParts = hours.closeTime.split(":").mapNotNull { it.toIntOrNull() }
                if (openParts.size < 2 || closeParts.size < 2) return isOpen
                val openMinutes  = openParts[0] * 60 + openParts[1]
                val closeMinutes = closeParts[0] * 60 + closeParts[1]
                // Support overnight shifts (e.g. opens 07:00, closes 00:00 = midnight)
                return if (closeMinutes < openMinutes) {
                    currentMinutes >= openMinutes || currentMinutes <= closeMinutes
                } else {
                    currentMinutes >= openMinutes && currentMinutes <= closeMinutes
                }
            }

            // ── Priority 3: parse plain-text openingHours string ─────────────────
            // Only attempt if openingHours is non-blank (i.e. the pharmacy actually
            // stored a plain-text hours string — not the Kotlin default empty string).
            if (openingHours.isNotBlank()) {
                val fallback = parsePlainTextHours(openingHours)
                if (fallback != null) {
                    if (fallback.is24Hours) return true
                    val isWorkingDay = fallback.days.any { d ->
                        d.equals(todayFull, ignoreCase = true) ||
                        d.equals(todayAbbrev, ignoreCase = true)
                    }
                    if (!isWorkingDay) return false
                    val openParts  = fallback.openTime.split(":").mapNotNull { it.toIntOrNull() }
                    val closeParts = fallback.closeTime.split(":").mapNotNull { it.toIntOrNull() }
                    if (openParts.size < 2 || closeParts.size < 2) return false
                    val openMinutes  = openParts[0] * 60 + openParts[1]
                    val closeMinutes = closeParts[0] * 60 + closeParts[1]
                    return if (closeMinutes < openMinutes) {
                        currentMinutes >= openMinutes || currentMinutes <= closeMinutes
                    } else {
                        currentMinutes >= openMinutes && currentMinutes <= closeMinutes
                    }
                }
            }

            // ── Priority 4: static Firestore isOpen field (legacy) ────────────────
            return isOpen
        }

    /**
     * Parse the plain-text [openingHours] string into an [OperatingHours] object.
     * Returns null if the string is blank or does not match any known pattern.
     *
     * Supported formats:
     *  "Mon-Sat: 8am-6pm"     → Mon–Sat, 08:00–18:00
     *  "Mon–Fri: 08:00–18:00"  → Mon–Fri, 08:00–18:00
     *  "Mon-Sun: 24/7"        → all days, is24Hours = true
     *  "Mon-Sat: 7am-10pm"    → Mon–Sat, 07:00–22:00
     */
    @get:com.google.firebase.firestore.Exclude
    val parseFallbackHours: () -> OperatingHours?
        get() = { parsePlainTextHours(openingHours) }

    companion object {
        /**
         * Internal parser for plain-text hours strings. Separated so it can be
         * called from both [parseFallbackHours] and [isCurrentlyOpen] without
         * going through the property-lambda indirection.
         */
        internal fun parsePlainTextHours(raw: String): OperatingHours? {
            if (raw.isBlank()) return null

            // Normalise dash characters to ASCII "-"
            val s = raw.trim().replace("–", "-").replace("—", "-")
            val colonIdx = s.indexOf(':')
            if (colonIdx <= 0) return null

            val dayPart  = s.substring(0, colonIdx).trim()
            val timePart = s.substring(colonIdx + 1).trim()

            val allDays    = listOf("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")
            val abbrevDays = listOf("Mon","Tue","Wed","Thu","Fri","Sat","Sun")

            fun dayIndex(abbrev: String): Int =
                abbrevDays.indexOfFirst { it.equals(abbrev.trim(), ignoreCase = true) }

            val expandedDays: List<String> = if (dayPart.contains("-")) {
                val parts = dayPart.split("-")
                val fromIdx = dayIndex(parts[0])
                val toIdx   = dayIndex(parts.getOrElse(1) { parts[0] })
                if (fromIdx >= 0 && toIdx >= 0) {
                    if (fromIdx <= toIdx) allDays.subList(fromIdx, toIdx + 1)
                    else allDays.subList(fromIdx, allDays.size) + allDays.subList(0, toIdx + 1)
                } else emptyList()
            } else {
                val idx = dayIndex(dayPart)
                if (idx >= 0) listOf(allDays[idx]) else emptyList()
            }

            if (expandedDays.isEmpty()) return null

            if (timePart.contains("24/7", ignoreCase = true) ||
                timePart.contains("24hrs", ignoreCase = true) ||
                timePart.contains("24 hrs", ignoreCase = true)) {
                return OperatingHours(is24Hours = true, days = expandedDays, openTime = "00:00", closeTime = "23:59")
            }

            fun parseTime(t: String): String? {
                val clean = t.trim()
                val hhMm = Regex("^(\\d{1,2}):(\\d{2})$").find(clean)
                if (hhMm != null) {
                    val h = hhMm.groupValues[1].toIntOrNull() ?: return null
                    val m = hhMm.groupValues[2].toIntOrNull() ?: return null
                    return String.format("%02d:%02d", h, m)
                }
                val amPm = Regex("^(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)$", RegexOption.IGNORE_CASE).find(clean)
                if (amPm != null) {
                    var h = amPm.groupValues[1].toIntOrNull() ?: return null
                    val m = amPm.groupValues[2].toIntOrNull() ?: 0
                    val meridiem = amPm.groupValues[3].lowercase()
                    if (meridiem == "pm" && h != 12) h += 12
                    if (meridiem == "am" && h == 12) h = 0
                    return String.format("%02d:%02d", h, m)
                }
                return null
            }

            if (timePart.split("-").size < 2) return null
            val lastDash  = timePart.lastIndexOf('-')
            val openTime  = parseTime(timePart.substring(0, lastDash).trim()) ?: return null
            val closeTime = parseTime(timePart.substring(lastDash + 1).trim()) ?: return null
            return OperatingHours(is24Hours = false, days = expandedDays, openTime = openTime, closeTime = closeTime)
        }
    }

    @get:com.google.firebase.firestore.Exclude
    val displayOperatingHours: String
        get() {
            val hours = parsedOperatingHours
            if (hours.is24Hours) return "Open 24/7"
            if (hours.days.isNotEmpty()) {
                val dayStr = hours.days.joinToString(", ") { it.take(3) }
                return "$dayStr: ${hours.openTime}–${hours.closeTime}"
            }
            // days is empty but operatingHours exists in Firestore with valid times
            // (e.g. Akedah: days=[], openTime="07:00", closeTime="00:00")
            // Match iOS: show just the times without a day prefix.
            if (operatingHours != null &&
                hours.openTime.isNotBlank() && hours.closeTime.isNotBlank()) {
                return "${hours.openTime} – ${hours.closeTime}"
            }
            // Fall back to the plain-text string as-is, or a clear "not specified" label
            return openingHours.ifBlank { "Hours not specified" }
        }

    /**
     * Determine if the pharmacy has a valid subscription or is within the 90-day trial.
     */
    @get:com.google.firebase.firestore.Exclude
    val hasValidSubscription: Boolean
        get() {
            if (!isActive) return false
            
            val now = java.util.Date()
            if (subscriptionEndDate != null && subscriptionEndDate.toDate().after(now)) {
                return true
            }
            
            // Check 90-day trial based on createdAt
            if (createdAt != null) {
                val trialDurationMs = 90L * 24 * 60 * 60 * 1000
                val trialEndDate = java.util.Date(createdAt.toDate().time + trialDurationMs)
                if (trialEndDate.after(now)) {
                    return true
                }
            }
            
            return false
        }
}

/** Canonical ordered days list, matching iOS OperatingHours.allDays */
object AllDays {
    val list = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
}
