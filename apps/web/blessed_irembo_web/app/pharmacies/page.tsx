'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Pharmacy } from '@/components/PharmacyMap';
import { useRequireUserRole } from '@/lib/authHooks';
import { useAuth } from '@/lib/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Load PharmacyMap client-side only (Google Maps needs browser APIs)
const PharmacyMap = dynamic(() => import('@/components/PharmacyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading map…</p>
      </div>
    </div>
  ),
});

// ─── Page Component ────────────────────────────────────────────────────────────

export default function PharmaciesPage() {
  // Require authentication — redirects to /login if not signed in
  // useRequireUserRole: redirects to /login if unauthenticated, to /pharmacy/dashboard if pharmacy
  const { loading, userRole } = useRequireUserRole();
  const { currentUser, signOut } = useAuth();
  const router = useRouter();

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [pharmaciesLoading, setPharmaciesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch pharmacies from Firestore on mount ──────────────────────────────
  useEffect(() => {
    async function loadPharmacies() {
      try {
        const snapshot = await getDocs(collection(db, 'pharmacies'));
        const list: Pharmacy[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          // Normalize district to Title Case so it matches dropdown values
          // e.g. 'muhanga' stored in Firestore → 'Muhanga' in the dropdown
          const rawDistrict: string = data.district ?? '';
          const district = rawDistrict
            .split(' ')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
          return {
            id: docSnap.id,
            name: data.name ?? 'Unknown Pharmacy',
            address: data.address ?? '',
            district,
            phone: data.phoneNumber ?? '',
            email: data.email ?? '',
            isOpen: true,
            hours: data.hours ?? '',
            rating: data.rating ?? 0,
            distance: '',
            verified: data.isVerified ?? false,
            latitude: data.latitude ?? 0,
            longitude: data.longitude ?? 0,
          };
        });
        // Only show pharmacies that have valid coordinates on the map
        setPharmacies(list.filter((p) => p.latitude !== 0 && p.longitude !== 0));
      } catch (err) {
        console.error('Failed to load pharmacies from Firestore:', err);
      } finally {
        setPharmaciesLoading(false);
      }
    }
    loadPharmacies();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  // Derive display name and initials from Firebase user
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const email = currentUser?.email || '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Request the user's GPS location and select the nearest pharmacy
  // Must be defined before any early returns (Rules of Hooks)
  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;

        // Find nearest pharmacy using Haversine-like approximation
        let nearestId: string | null = null;
        let minDist = Infinity;

        pharmacies.forEach((p) => {
          const dlat = p.latitude - latitude;
          const dlng = p.longitude - longitude;
          const dist = Math.sqrt(dlat * dlat + dlng * dlng);
          if (dist < minDist) {
            minDist = dist;
            nearestId = p.id;
          }
        });

        setSelectedPharmacy(nearestId);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please allow location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          default:
            setLocationError('Unable to determine your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [pharmacies]);

  // Show spinner while:
  //  - Firebase is resolving auth (loading)
  //  - Pharmacy data is loading
  //  - User is a pharmacy role (redirect is in-flight, hide map completely)
  if (loading || pharmaciesLoading || userRole === 'pharmacy') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Redirecting…</p>
        </div>
      </div>
    );
  }

  // Filter pharmacies based on search, district, and open status
  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch =
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict =
      selectedDistrict === 'all' ||
      pharmacy.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesOpen = !showOpenOnly || pharmacy.isOpen;
    return matchesSearch && matchesDistrict && matchesOpen;
  });


  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ────────────────────────────────────────────────────── */}
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


            {/* User profile avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="user-menu-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 focus:outline-none group"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {/* Avatar circle */}
                <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-teal-200 group-hover:ring-teal-400 transition-all">
                  {currentUser?.photoURL ? (
                    <Image
                      src={currentUser.photoURL}
                      alt={displayName}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                {/* Name — hidden on small screens */}
                <span className="hidden md:block text-sm font-medium text-gray-900 max-w-[120px] truncate">
                  {displayName}
                </span>
                {/* Chevron */}
                <svg
                  className={`hidden md:block w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden"
                  role="menu"
                >
                  {/* User info header */}
                  <div className="bg-teal-600 px-4 py-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-800 flex items-center justify-center text-white text-lg font-bold shrink-0">
                      {currentUser?.photoURL ? (
                        <Image
                          src={currentUser.photoURL}
                          alt={displayName}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate uppercase">{displayName}</p>
                      <p className="text-teal-100 text-xs truncate">{email}</p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <Link
                      href="/pharmacy/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                      role="menuitem"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                      role="menuitem"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>

                    <Link
                      href="/pharmacy/inquiries"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                      role="menuitem"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Inquiries
                    </Link>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      role="menuitem"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Page title ──────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Pharmacies</h1>
          <p className="text-gray-600">
            Search and discover verified pharmacies across Rwanda
          </p>
        </div>

        {/* ── Search & Filters ────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-12 gap-4">
            {/* Search bar */}
            <div className="md:col-span-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="pharmacy-search"
                  placeholder="Search by name or location…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* District filter */}
            <div className="md:col-span-3">
              <select
                id="district-filter"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Districts</option>
                <optgroup label="Kigali City">
                  <option value="Gasabo">Gasabo</option>
                  <option value="Kicukiro">Kicukiro</option>
                  <option value="Nyarugenge">Nyarugenge</option>
                </optgroup>
                <optgroup label="Northern Province">
                  <option value="Burera">Burera</option>
                  <option value="Gakenke">Gakenke</option>
                  <option value="Gicumbi">Gicumbi</option>
                  <option value="Musanze">Musanze</option>
                  <option value="Rulindo">Rulindo</option>
                </optgroup>
                <optgroup label="Southern Province">
                  <option value="Gisagara">Gisagara</option>
                  <option value="Huye">Huye</option>
                  <option value="Kamonyi">Kamonyi</option>
                  <option value="Muhanga">Muhanga</option>
                  <option value="Nyamagabe">Nyamagabe</option>
                  <option value="Nyanza">Nyanza</option>
                  <option value="Nyaruguru">Nyaruguru</option>
                  <option value="Ruhango">Ruhango</option>
                </optgroup>
                <optgroup label="Eastern Province">
                  <option value="Bugesera">Bugesera</option>
                  <option value="Gatsibo">Gatsibo</option>
                  <option value="Kayonza">Kayonza</option>
                  <option value="Kirehe">Kirehe</option>
                  <option value="Ngoma">Ngoma</option>
                  <option value="Nyagatare">Nyagatare</option>
                  <option value="Rwamagana">Rwamagana</option>
                </optgroup>
                <optgroup label="Western Province">
                  <option value="Karongi">Karongi</option>
                  <option value="Ngororero">Ngororero</option>
                  <option value="Nyabihu">Nyabihu</option>
                  <option value="Nyamasheke">Nyamasheke</option>
                  <option value="Rubavu">Rubavu</option>
                  <option value="Rutsiro">Rutsiro</option>
                  <option value="Rusizi">Rusizi</option>
                </optgroup>
              </select>
            </div>

            {/* Open-now toggle */}
            <div className="md:col-span-2 flex items-center">
              <label htmlFor="open-now" className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="open-now"
                  checked={showOpenOnly}
                  onChange={(e) => setShowOpenOnly(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Open now</span>
              </label>
            </div>

            {/* Near Me button */}
            <div className="md:col-span-2">
              <button
                id="near-me-btn"
                onClick={handleNearMe}
                disabled={isLocating}
                className="w-full bg-teal-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-60 transition-colors flex items-center justify-center"
              >
                {isLocating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Locating…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Near Me
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Location error */}
          {locationError && (
            <div className="mt-3 text-sm text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {locationError}
            </div>
          )}

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Found{' '}
            <span className="font-semibold text-gray-900">{filteredPharmacies.length}</span>{' '}
            {filteredPharmacies.length === 1 ? 'pharmacy' : 'pharmacies'}
          </div>
        </div>

        {/* ── Map + Sidebar layout ─────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Google Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-2 h-[600px]">
              <PharmacyMap
                pharmacies={filteredPharmacies}
                selectedId={selectedPharmacy}
                onSelectPharmacy={setSelectedPharmacy}
              />
            </div>
          </div>

          {/* Pharmacy sidebar list */}
          <div className="lg:col-span-1">
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {filteredPharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  onClick={() => setSelectedPharmacy(pharmacy.id)}
                  className={`bg-white rounded-lg border ${selectedPharmacy === pharmacy.id
                    ? 'border-teal-500 shadow-lg ring-1 ring-teal-500'
                    : 'border-gray-200'
                    } p-4 cursor-pointer hover:shadow-md transition-all`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                        {pharmacy.verified && (
                          <svg className="w-4 h-4 text-teal-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${pharmacy.isOpen
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {pharmacy.isOpen ? 'Open' : 'Closed'}
                        </span>
                        <span className="flex items-center text-yellow-600">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {pharmacy.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start text-sm text-gray-600 mb-2">
                    <svg
                      className="w-4 h-4 mr-2 mt-0.5 shrink-0"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {pharmacy.address} • {pharmacy.distance}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <svg
                      className="w-4 h-4 mr-2 shrink-0"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{pharmacy.phone}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/pharmacies/${pharmacy.id}`}
                      className="flex-1 bg-teal-600 text-white text-sm py-2 px-3 rounded-md font-medium hover:bg-teal-700 transition-colors text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details
                    </Link>
                    <a
                      href={`tel:${pharmacy.phone.replace(/\s/g, '')}`}
                      className="bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Call ${pharmacy.name}`}
                    >
                      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}

              {filteredPharmacies.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-600 font-medium">No pharmacies found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
