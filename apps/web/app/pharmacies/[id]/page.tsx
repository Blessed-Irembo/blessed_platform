'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRequireUserRole } from '@/lib/authHooks';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [pharmacy, setPharmacy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
            isOpen: true, // Default
            hours: data.hours ?? '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    }, 1000);
  };

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

            {/* Hours */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Hours</div>
                <div className="text-gray-900 font-medium">{pharmacy.hours}</div>
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

        {/* Send Inquiry Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Send Inquiry</h2>

          {submitSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              Your inquiry has been sent successfully! The pharmacy will respond via email or phone.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Your Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+250 788 123 456"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="What would you like to know?"
                rows={4}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Inquiry
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-4">
            The pharmacy will receive your inquiry and respond via email or phone
          </p>
        </div>
      </main>
    </div>
  );
}
