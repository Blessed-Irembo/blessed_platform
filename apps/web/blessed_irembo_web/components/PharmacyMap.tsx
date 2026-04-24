'use client';

import { useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string;
  email: string;
  isOpen: boolean;
  hours: string;
  rating: number;
  distance: string;
  verified: boolean;
  latitude: number;
  longitude: number;
  operatingHours?: {
    is24Hours: boolean;
    days: string[];
    openTime: string;
    closeTime: string;
  } | null;
}

interface PharmacyMapProps {
  pharmacies: Pharmacy[];
  selectedId: string | null;
  onSelectPharmacy: (id: string | null) => void;
}

// ─── Custom Pharmacy House Pin SVG ───────────────────────────────────────────
// A pharmacy building pin: house shape (roof + body + door + pharmacy cross)
// with a drop shadow and a sharp point at the bottom.

const LOGO_BASE64 = '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';

export function buildPharmacyPinUrl(isOpen: boolean, isSelected: boolean): string {
  const strokeColor = isSelected ? '#0F766E' : isOpen ? '#0D9488' : '#6B7280';
  const w = isSelected ? 60 : 50;
  const h = isSelected ? 70 : 60;
  const cx = w / 2;
  const cy = w / 2;
  const r = (w / 2) - 4;
  
  const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="${isSelected ? 3 : 2}" flood-color="rgba(0,0,0,0.25)"/>
    </filter>
  </defs>

  <!-- Pin tail (pointer) -->
  <path d="M ${cx} ${h - 2} L ${cx - 8} ${cy + 10} L ${cx + 8} ${cy + 10} Z" fill="#ffffff" filter="url(#sh)" />
  
  <!-- Circle background -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" filter="url(#sh)" />
  
  <!-- Inner Circle Border based on selection/open state -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="2.5" />
  
  <!-- Logo -->
  <image x="${cx - 16}" y="${cy - 9}" width="32" height="19" href="data:image/png;base64,${LOGO_BASE64}" />
</svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}


// ─── Clean Map Style ──────────────────────────────────────────────────────────
// Minimal, clinic-clean map: only roads, water, parks visible.
// POI noise removed. Road palette desaturated to let teal pins pop.

export const MAP_STYLE: google.maps.MapTypeStyle[] = [
  // ── Land ──
  { elementType: 'geometry', stylers: [{ color: '#f5f5f0' }] },

  // ── Road network ──
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0da' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a80' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e8e8e0' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#c8c8c0' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#555548' }] },

  // ── Water ──
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c8dde8' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6b8fa3' }] },

  // ── Parks / Green areas ──
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#ddeede' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d0e8d0' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#5a8a5a' }] },
  { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f0' }] },

  // ── Remove POI clutter (shops, restaurants, etc.) ──
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.government', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },

  // ── Keep medical/hospital POIs subtly visible ──
  { featureType: 'poi.medical', elementType: 'geometry', stylers: [{ color: '#fce8e8' }] },
  { featureType: 'poi.medical', elementType: 'labels.icon', stylers: [{ color: '#c84040' }] },
  { featureType: 'poi.medical', elementType: 'labels.text.fill', stylers: [{ color: '#c84040' }] },

  // ── Remove transit noise ──
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  // ── Administrative boundaries (subtle) ──
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c8c8c0' }, { weight: 0.5 }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#6b6b60' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#404038' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels', stylers: [{ visibility: 'off' }] },

  // ── Building footprints (very subtle) ──
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#ebebea' }] },
];

// ─── Map Pan Controller ───────────────────────────────────────────────────────

function MapController({ pharmacy }: { pharmacy: Pharmacy | null }) {
  const map = useMap();
  if (map && pharmacy) {
    map.panTo({ lat: pharmacy.latitude, lng: pharmacy.longitude });
  }
  return null;
}

// ─── PharmacyMap ─────────────────────────────────────────────────────────────

export default function PharmacyMap({
  pharmacies,
  selectedId,
  onSelectPharmacy,
}: PharmacyMapProps) {
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';
  const [infoWindowId, setInfoWindowId] = useState<string | null>(null);

  const selectedPharmacy = pharmacies.find((p) => p.id === selectedId) ?? null;
  const infoPharmacy = pharmacies.find((p) => p.id === infoWindowId) ?? null;

  const handleMarkerClick = useCallback(
    (pharmacy: Pharmacy) => {
      onSelectPharmacy(pharmacy.id);
      setInfoWindowId(pharmacy.id);
    },
    [onSelectPharmacy]
  );

  const handleInfoWindowClose = useCallback(() => {
    setInfoWindowId(null);
  }, []);

  const defaultCenter = { lat: -1.9536, lng: 30.0605 };

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          gestureHandling="greedy"
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          zoomControl={true}
          styles={MAP_STYLE}
          style={{ width: '100%', height: '100%' }}
        >
          <MapController pharmacy={selectedPharmacy} />

          {pharmacies.map((pharmacy) => {
            const isSelected = pharmacy.id === selectedId;
            const pinUrl = buildPharmacyPinUrl(pharmacy.isOpen, isSelected);
            const size = isSelected ? 52 : 42;
            const height = isSelected ? 66 : 54;

            return (
              <Marker
                key={pharmacy.id}
                position={{ lat: pharmacy.latitude, lng: pharmacy.longitude }}
                onClick={() => handleMarkerClick(pharmacy)}
                zIndex={isSelected ? 100 : pharmacy.isOpen ? 10 : 1}
                icon={{
                  url: pinUrl,
                  scaledSize: { width: size, height, equals: () => false } as google.maps.Size,
                  anchor: { x: size / 2, y: height - 2, equals: () => false } as google.maps.Point,
                }}
              />
            );
          })}

          {infoPharmacy && (
            <InfoWindow
              position={{ lat: infoPharmacy.latitude, lng: infoPharmacy.longitude }}
              onCloseClick={handleInfoWindowClose}
              pixelOffset={[0, -64]}
            >
              <div style={{ padding: '6px 2px 2px', minWidth: '210px', fontFamily: 'system-ui, sans-serif' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                  {/* Teal pill icon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '8px', background: '#0D9488',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="white">
                      <rect x="8" y="3" width="4" height="14" rx="1.5" />
                      <rect x="3" y="8" width="14" height="4" rx="1.5" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#111827', lineHeight: 1.2 }}>
                        {infoPharmacy.name}
                      </p>
                      {infoPharmacy.verified && (
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="#0D9488">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6b7280' }}>{infoPharmacy.district}</p>
                  </div>
                </div>

                {/* Status row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
                    background: infoPharmacy.isOpen ? '#dcfce7' : '#fee2e2',
                    color: infoPharmacy.isOpen ? '#166534' : '#991b1b',
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: infoPharmacy.isOpen ? '#22c55e' : '#ef4444',
                      display: 'inline-block',
                    }} />
                    {infoPharmacy.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 600 }}>★ {infoPharmacy.rating}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: 'auto' }}>{infoPharmacy.distance}</span>
                </div>

                {/* Address */}
                <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="11" height="11" viewBox="0 0 20 20" fill="#9ca3af">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {infoPharmacy.address}
                </p>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '8px' }}>
                  <button
                    onClick={() => router.push(`/pharmacies/${infoPharmacy.id}`)}
                    style={{
                      flex: 1, textAlign: 'center', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
                      color: '#ffffff', fontSize: '12px',
                      padding: '7px 0', borderRadius: '8px', border: 'none',
                      fontWeight: 600, textDecoration: 'none',
                      boxShadow: '0 1px 3px rgba(13,148,136,0.3)',
                    }}
                  >
                    View Details
                  </button>
                  <a
                    href={`tel:${infoPharmacy.phone.replace(/\D/g, '')}`}
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                      background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#4b5563', textDecoration: 'none'
                    }}
                    title="Call Pharmacy"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                  <a
                    href={`https://wa.me/${infoPharmacy.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hello, I found your pharmacy via the Blessed Irembo platform.')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                      background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#16a34a', textDecoration: 'none'
                    }}
                    onClick={() => {
                      fetch(`/api/pharmacies/${infoPharmacy.id}/track-whatsapp`, { method: 'POST' }).catch(console.error);
                    }}
                    title="WhatsApp Pharmacy"
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M2.004 22l1.352-4.968A9.992 9.992 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.989 9.989 0 01-5.02-1.341L2.004 22zm10-18.3A8.309 8.309 0 003.7 12c0 1.458.375 2.874 1.085 4.108l-.87 3.2 3.275-.86A8.286 8.309 0 0012 20.3c4.586 0 8.3-3.714 8.3-8.3S16.586 3.7 12 3.7zm4.27 11.517c-.234-.117-1.385-.685-1.599-.763-.214-.078-.37-.117-.526.117-.156.234-.606.763-.742.92-.136.156-.273.175-.507.058-.234-.117-.988-.363-1.882-1.026-.694-.515-1.163-1.15-1.3-1.384-.136-.234-.015-.36.102-.477.105-.105.234-.273.351-.409.117-.136.156-.234.234-.39.078-.156.039-.293-.02-.409-.058-.117-.526-1.27-.721-1.74-.191-.46-.386-.398-.526-.405-.136-.007-.292-.007-.448-.007s-.409.058-.624.293c-.214.234-.818.8-.818 1.95s.838 2.264.954 2.42c.117.156 1.652 2.52 3.998 3.513 1.956.826 2.535.79 3.003.738.537-.06 1.385-.566 1.58-1.112.195-.546.195-1.015.136-1.112-.058-.098-.214-.156-.448-.273z" />
                    </svg>
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Floating legend — minimal and clean */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          padding: '8px 12px',
          display: 'flex', gap: '14px', alignItems: 'center',
          fontSize: '11px', fontWeight: 600, color: '#374151',
          pointerEvents: 'none',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#14B8A6', display: 'inline-block' }} />
            Open
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6B7280', display: 'inline-block' }} />
            Closed
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6b7280', fontWeight: 400 }}>
            ◆ Blessed Irembo
          </span>
        </div>
      </div>
    </APIProvider>
  );
}
