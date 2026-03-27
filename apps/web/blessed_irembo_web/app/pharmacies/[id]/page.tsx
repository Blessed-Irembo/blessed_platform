'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRequireUserRole } from '@/lib/authHooks';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { checkIfPharmacyIsOpen, formatOperatingHours } from '@/lib/pharmacyUtils';

const PharmacyDetailMap = dynamic(() => import('@/components/PharmacyDetailMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading map…</div>
    </div>
  ),
});

/**
 * Pharmacy Detail Page
 * 
 * Shows complete pharmacy information including:
 * - Full details and badges
 * - Location map with coordinates
 * - Inquiry form for contacting pharmacy
 */

// Removed DEMO_PHARMACIES

export default function PharmacyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser: user, loading: authLoading } = useRequireUserRole();

  const [pharmacy, setPharmacy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoursExpanded, setHoursExpanded] = useState(false);

  // ── Directions state ──────────────────────────────────────────────────────
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [directions, setDirections] = useState<{
    duration: string;
    distance: string;
    steps: { instructions: string; distance: string; duration: string }[];
  } | null>(null);

  const handleGetDirections = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('idle');
      },
      () => setGeoStatus('error')
    );
  };


  useEffect(() => {
    async function fetchPharmacy() {
      if (!params.id) return;
      try {
        const docRef = doc(db, 'pharmacies', params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Normalize district to title case for display
          const rawDistrict: string = data.district ?? '';
          const district = rawDistrict
            .split(' ')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');

          setPharmacy({
            id: docSnap.id,
            name: data.name ?? 'Unknown Pharmacy',
            address: data.address ?? '',
            district,
            phone: data.phoneNumber ?? '',
            email: data.email ?? '',
            isOpen: checkIfPharmacyIsOpen(data.operatingHours),
            hours: formatOperatingHours(data.operatingHours, data.hours),
            operatingHours: data.operatingHours ?? null,
            rating: data.rating ?? 0,
            distance: '',
            verified: data.isVerified ?? false,
            is24_7: data.is24_7 ?? false,
            isPremium: data.isPremium ?? false,
            description: data.description ?? 'A verified pharmacy on Blessed Irembo.',
            latitude: data.latitude ?? 0,
            longitude: data.longitude ?? 0,
          });
        } else {
          setPharmacy(null);
        }
      } catch (err) {
        console.error('Error fetching pharmacy:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPharmacy();
  }, [params.id]);

  if (loading || authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!pharmacy && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pharmacy Not Found</h1>
          <p className="text-gray-600 mb-4">The pharmacy you're looking for doesn't exist.</p>
          <Link href="/pharmacies" className="text-teal-600 hover:text-teal-700 font-medium">
            Back to Pharmacies
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo1.png"
                  alt="Blessed Irembo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="text-lg font-semibold text-gray-900">Blessed Irembo</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-700 hover:text-teal-600 font-medium mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Pharmacy Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
          {/* Pharmacy Name and Badges */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{pharmacy.name}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {pharmacy.verified && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-600 text-white">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
            {pharmacy.is24_7 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                24/7 Available
              </span>
            )}
            {pharmacy.isPremium && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-blue-600 border-2 border-blue-600">
                Premium Member
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6">{pharmacy.description}</p>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <a
              href={`tel:${pharmacy.phone.replace(/\D/g, '')}`}
              className="bg-teal-50 border border-teal-200 text-teal-800 py-3 px-4 rounded-xl flex items-center justify-center font-semibold hover:bg-teal-100 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-3 text-teal-600" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Pharmacy
            </a>
            <a
              href={`https://wa.me/${pharmacy.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hello, I found your pharmacy via the Blessed Irembo platform.')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                fetch(`/api/pharmacies/${pharmacy.id}/track-whatsapp`, { method: 'POST' }).catch(console.error);
              }}
              className="bg-[#25D366] hover:bg-[#20BE5A] text-white py-3 px-4 rounded-xl flex items-center justify-center font-semibold transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                 <path fillRule="evenodd" clipRule="evenodd" d="M2.004 22l1.352-4.968A9.992 9.992 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.989 9.989 0 01-5.02-1.341L2.004 22zm10-18.3A8.309 8.309 0 003.7 12c0 1.458.375 2.874 1.085 4.108l-.87 3.2 3.275-.86A8.286 8.309 0 0012 20.3c4.586 0 8.3-3.714 8.3-8.3S16.586 3.7 12 3.7zm4.27 11.517c-.234-.117-1.385-.685-1.599-.763-.214-.078-.37-.117-.526.117-.156.234-.606.763-.742.92-.136.156-.273.175-.507.058-.234-.117-.988-.363-1.882-1.026-.694-.515-1.163-1.15-1.3-1.384-.136-.234-.015-.36.102-.477.105-.105.234-.273.351-.409.117-.136.156-.234.234-.39.078-.156.039-.293-.02-.409-.058-.117-.526-1.27-.721-1.74-.191-.46-.386-.398-.526-.405-.136-.007-.292-.007-.448-.007s-.409.058-.624.293c-.214.234-.818.8-.818 1.95s.838 2.264.954 2.42c.117.156 1.652 2.52 3.998 3.513 1.956.826 2.535.79 3.003.738.537-.06 1.385-.566 1.58-1.112.195-.546.195-1.015.136-1.112-.058-.098-.214-.156-.448-.273z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-teal-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Address</div>
                <div className="text-gray-900 font-medium">{pharmacy.address}</div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Phone</div>
                <div className="text-gray-900 font-medium">{pharmacy.phone}</div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Email</div>
                <div className="text-gray-900 font-medium">{pharmacy.email}</div>
              </div>
            </div>

            {/* Hours — Google-style dropdown */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-6 h-6 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-500 mb-1">Hours</div>

                {/* Trigger row */}
                <button
                  onClick={() => setHoursExpanded(prev => !prev)}
                  className="flex items-center gap-2 group w-full text-left"
                >
                  {/* Open / Closed badge */}
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                    pharmacy.isOpen ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      pharmacy.isOpen ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {pharmacy.isOpen ? 'Open now' : 'Closed now'}
                  </span>

                  {/* Summary */}
                  <span className="text-sm text-gray-600">·</span>
                  <span className="text-sm text-gray-700">{pharmacy.hours}</span>

                  {/* Chevron */}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ml-auto ${
                      hoursExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded day-by-day schedule */}
                {hoursExpanded && (() => {
                  const oh = pharmacy.operatingHours;
                  const ALL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
                  const todayName = ALL_DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

                  if (!oh) return (
                    <p className="mt-2 text-sm text-gray-500 italic">Hours not specified</p>
                  );

                  if (oh.is24Hours) return (
                    <div className="mt-3 rounded-lg border border-gray-100 overflow-hidden">
                      {ALL_DAYS.map((day) => (
                        <div
                          key={day}
                          className={`flex justify-between items-center px-3 py-2 text-sm ${
                            day === todayName ? 'bg-teal-50 font-semibold' : 'bg-white'
                          } ${ day !== 'Sunday' ? 'border-b border-gray-100' : ''}`}
                        >
                          <span className={day === todayName ? 'text-teal-700' : 'text-gray-700'}>{day}</span>
                          <span className={day === todayName ? 'text-teal-600' : 'text-gray-500'}>Open 24 hours</span>
                        </div>
                      ))}
                    </div>
                  );

                  const openDays: string[] = Array.isArray(oh.days) ? oh.days : [];
                  return (
                    <div className="mt-3 rounded-lg border border-gray-100 overflow-hidden">
                      {ALL_DAYS.map((day) => {
                        const isToday = day === todayName;
                        const isOpen = openDays.includes(day);
                        return (
                          <div
                            key={day}
                            className={`flex justify-between items-center px-3 py-2 text-sm border-b border-gray-100 last:border-0 ${
                              isToday ? 'bg-teal-50' : 'bg-white'
                            }`}
                          >
                            <span className={`${
                              isToday ? 'font-semibold text-teal-700' : 'text-gray-700'
                            }`}>{day}</span>
                            <span className={`${
                              isToday
                                ? isOpen ? 'text-teal-600 font-semibold' : 'text-red-500 font-semibold'
                                : isOpen ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {isOpen
                                ? `${oh.openTime || '?'} – ${oh.closeTime || '?'}`
                                : 'Closed'
                              }
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          {/* Header bar */}
          <div className="px-6 md:px-8 pt-6 pb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Location</h2>
            <span className="text-xs font-mono text-gray-400">
              {pharmacy.latitude.toFixed(4)}, {pharmacy.longitude.toFixed(4)}
            </span>
          </div>

          {/* Full-width map — 420px tall */}
          <div className="w-full" style={{ height: 420 }}>
            <PharmacyDetailMap
              pharmacy={{
                id: pharmacy.id,
                name: pharmacy.name,
                isOpen: pharmacy.isOpen,
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
              }}
              origin={userLocation}
              onDirectionsLoaded={setDirections}
            />
          </div>

          {/* Get Directions button / directions panel */}
          <div className="px-6 md:px-8 py-5">
            {/* CTA — before directions are requested */}
            {!userLocation && (
              <button
                onClick={handleGetDirections}
                disabled={geoStatus === 'loading'}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
              >
                {geoStatus === 'loading' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Getting your location…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Get Directions
                  </>
                )}
              </button>
            )}

            {/* Geolocation error */}
            {geoStatus === 'error' && (
              <p className="text-red-500 text-sm text-center">
                Location access denied. Please enable location in your browser settings.
              </p>
            )}

            {/* Directions panel — shown once route is computed */}
            {userLocation && directions && (
              <div>
                {/* Summary row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-center">
                    <div className="text-xs text-teal-600 font-medium mb-0.5">Duration</div>
                    <div className="text-lg font-bold text-teal-700">{directions.duration}</div>
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-0.5">Distance</div>
                    <div className="text-lg font-bold text-gray-700">{directions.distance}</div>
                  </div>
                  <button
                    onClick={() => { setUserLocation(null); setDirections(null); setGeoStatus('idle'); }}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Clear route"
                  >
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Step-by-step turns */}
                <div className="space-y-0 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-52 overflow-y-auto">
                  {directions.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-snug">{step.instructions}</p>
                        {(step.distance || step.duration) && (
                          <p className="text-xs text-gray-400 mt-0.5">{step.distance} · {step.duration}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading route */}
            {userLocation && !directions && geoStatus !== 'error' && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-400">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Calculating route…
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
