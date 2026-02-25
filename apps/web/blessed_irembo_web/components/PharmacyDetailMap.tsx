'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from '@vis.gl/react-google-maps';
import { MAP_STYLE, buildPharmacyPinUrl } from './PharmacyMap';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PharmacyLocation {
  id: number;
  name: string;
  isOpen: boolean;
  latitude: number;
  longitude: number;
}

export interface DirectionStep {
  instructions: string;
  distance: string;
  duration: string;
}

export interface DirectionsResult {
  duration: string;
  distance: string;
  steps: DirectionStep[];
}

interface PharmacyDetailMapProps {
  pharmacy: PharmacyLocation;
  origin: { lat: number; lng: number } | null;
  onDirectionsLoaded: (result: DirectionsResult | null) => void;
}

// ─── DirectionsLayer ─────────────────────────────────────────────────────────
// Renders the route on the map using DirectionsService + DirectionsRenderer

function DirectionsLayer({
  origin,
  destination,
  onLoaded,
}: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  onLoaded: (result: DirectionsResult | null) => void;
}) {
  const map = useMap();
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create renderer once
    if (!rendererRef.current) {
      rendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // keep our custom pharmacy pin
        polylineOptions: {
          strokeColor: '#0D9488',
          strokeWeight: 5,
          strokeOpacity: 0.85,
          zIndex: 5,
        },
      });
    }
    rendererRef.current.setMap(map);

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          rendererRef.current!.setDirections(result);

          const leg = result.routes[0].legs[0];
          const steps: DirectionStep[] = leg.steps.map((s) => ({
            instructions: s.instructions.replace(/<[^>]+>/g, '').trim(),
            distance: s.distance?.text ?? '',
            duration: s.duration?.text ?? '',
          }));

          onLoaded({
            duration: leg.duration?.text ?? '',
            distance: leg.distance?.text ?? '',
            steps,
          });

          // Fit map to route bounds
          if (result.routes[0].bounds) {
            map.fitBounds(result.routes[0].bounds, 48);
          }
        } else {
          onLoaded(null);
        }
      }
    );

    return () => {
      rendererRef.current?.setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, origin.lat, origin.lng, destination.lat, destination.lng]);

  return null;
}

// ─── PharmacyDetailMap ───────────────────────────────────────────────────────

export default function PharmacyDetailMap({
  pharmacy,
  origin,
  onDirectionsLoaded,
}: PharmacyDetailMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';
  const destination = { lat: pharmacy.latitude, lng: pharmacy.longitude };

  const pinUrl = buildPharmacyPinUrl(pharmacy.isOpen, true);

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-full rounded-xl overflow-hidden">
        <Map
          defaultCenter={destination}
          defaultZoom={16}
          gestureHandling="cooperative"
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          zoomControl={true}
          styles={MAP_STYLE}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Custom pharmacy pin — always shown */}
          <Marker
            position={destination}
            zIndex={100}
            icon={{
              url: pinUrl,
              scaledSize: { width: 56, height: 70, equals: () => false } as google.maps.Size,
              anchor: { x: 28, y: 68, equals: () => false } as google.maps.Point,
            }}
          />

          {/* User location pin — shown when directions are requested */}
          {origin && (
            <Marker
              position={origin}
              zIndex={90}
              icon={{
                path: 0, // CIRCLE
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
                scale: 10,
              }}
            />
          )}

          {/* Draw route on map */}
          {origin && (
            <DirectionsLayer
              origin={origin}
              destination={destination}
              onLoaded={onDirectionsLoaded}
            />
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
