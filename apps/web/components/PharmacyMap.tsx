'use client';

import { useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Pharmacy {
  id: number;
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
}

interface PharmacyMapProps {
  pharmacies: Pharmacy[];
  selectedId: number | null;
  onSelectPharmacy: (id: number | null) => void;
}

// ─── Custom Pharmacy Pin SVG ──────────────────────────────────────────────────
// A pharmacy building pin: rounded building silhouette with diamond logo mark
// and a pin-point tail. Colors reflect open/closed/selected state.

export function buildPharmacyPinUrl(isOpen: boolean, isSelected: boolean): string {
  const bg = isSelected ? '#0D9488' : isOpen ? '#14B8A6' : '#6B7280';
  const ring = isSelected ? '#0F766E' : isOpen ? '#0D9488' : '#4B5563';
  const shadow = isSelected ? 'rgba(13,148,136,0.45)' : 'rgba(0,0,0,0.18)';
  const w = isSelected ? 52 : 42;
  const h = isSelected ? 66 : 54;

  // The pin is a circle on top + a sharp tail below, very legible on the map
  // Inside the circle: the Blessed Irembo diamond ◆ + small cross bars
  const cx = w / 2;
  const r = cx - 3;
  const tipY = h - 2;

  // Diamond path scaled to fill the circle nicely
  const dx = cx, dy = r + 3;
  const ds = r * 0.42; // half-width of diamond
  const diamondPath = `M${dx},${dy - ds * 1.1} L${dx + ds},${dy} L${dx},${dy + ds * 1.1} L${dx - ds},${dy} Z`;

  const svg = `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sh" x="-30%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="${isSelected ? 3 : 2}" flood-color="${shadow}"/>
    </filter>
  </defs>

  <!-- Pin tail -->
  <path d="M${cx - 6},${r * 2 + 3} Q${cx},${tipY + 4} ${cx + 6},${r * 2 + 3}" fill="${bg}" filter="url(#sh)"/>

  <!-- Outer ring (glow when selected) -->
  <circle cx="${cx}" cy="${r + 3}" r="${r + (isSelected ? 1 : 0)}" fill="${ring}" filter="url(#sh)"/>

  <!-- Main circle body -->
  <circle cx="${cx}" cy="${r + 3}" r="${r - 1}" fill="${bg}"/>

  <!-- Inner white disc -->
  <circle cx="${cx}" cy="${r + 3}" r="${r * 0.72}" fill="white" opacity="0.97"/>

  <!-- Blessed Irembo diamond mark (teal on white) -->
  <path d="${diamondPath}" fill="${bg}"/>

  <!-- Tiny pharmacy cross below diamond -->
  <rect x="${cx - 1.2}" y="${dy + ds * 1.1 + 2}" width="2.4" height="6" rx="1" fill="${ring}" opacity="0.7"/>
  <rect x="${cx - 3}" y="${dy + ds * 1.1 + 4}" width="6" height="2.4" rx="1" fill="${ring}" opacity="0.7"/>
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
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';
  const [infoWindowId, setInfoWindowId] = useState<number | null>(null);

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
                      <rect x="8" y="3" width="4" height="14" rx="1.5"/>
                      <rect x="3" y="8" width="14" height="4" rx="1.5"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#111827', lineHeight: 1.2 }}>
                        {infoPharmacy.name}
                      </p>
                      {infoPharmacy.verified && (
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="#0D9488">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
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
                    }}/>
                    {infoPharmacy.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 600 }}>★ {infoPharmacy.rating}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: 'auto' }}>{infoPharmacy.distance}</span>
                </div>

                {/* Address */}
                <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="11" height="11" viewBox="0 0 20 20" fill="#9ca3af">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  {infoPharmacy.address}
                </p>

                {/* CTA */}
                <Link
                  href={`/pharmacies/${infoPharmacy.id}`}
                  style={{
                    display: 'block', textAlign: 'center',
                    background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
                    color: '#ffffff', fontSize: '12px',
                    padding: '7px 14px', borderRadius: '8px',
                    fontWeight: 600, textDecoration: 'none',
                    boxShadow: '0 1px 4px rgba(13,148,136,0.35)',
                  }}
                >
                  View Details →
                </Link>
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
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#14B8A6', display: 'inline-block' }}/>
            Open
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6B7280', display: 'inline-block' }}/>
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
