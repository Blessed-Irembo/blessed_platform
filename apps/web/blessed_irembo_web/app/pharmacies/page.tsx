'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Pharmacy } from '@/components/PharmacyMap';
import { useRequireUserRole } from '@/lib/authHooks';
import { useAuth } from '@/lib/AuthContext';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { checkIfPharmacyIsOpen, formatOperatingHours } from '@/lib/pharmacyUtils';

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
  const [userPhone, setUserPhone] = useState('');
  const [expandedHoursId, setExpandedHoursId] = useState<string | null>(null);

  // ── Fetch pharmacies from Firestore on mount ──────────────────────────────
  useEffect(() => {
    async function loadPharmacies() {
      try {
        // Only show pharmacies where isActive is not explicitly false
        // (undefined/missing = active, for backwards-compat with existing pharmacies)
        const q = query(
          collection(db, 'pharmacies'),
          where('isActive', '!=', false)
        );
        const snapshot = await getDocs(q);
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
            isOpen: checkIfPharmacyIsOpen(data.operatingHours),
            hours: formatOperatingHours(data.operatingHours, data.hours),
            operatingHours: data.operatingHours ?? null,
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

  // Fetch user phone number from Firestore
  useEffect(() => {
    async function loadUserPhone() {
      if (!currentUser) return;
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) setUserPhone(snap.data().phoneNumber ?? '');
      } catch { }
    }
    loadUserPhone();
  }, [currentUser]);

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
    router.replace('/');
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
    return <LoadingScreen text="Loading pharmacies…" />;
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
              <div className="flex items-center gap-2 cursor-default">
                <Image
                  src="/logo1.png"
                  alt="Blessed Irembo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="text-lg font-semibold text-gray-900">Blessed Irembo</span>
              </div>
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
                      {userPhone && <p className="text-teal-200 text-xs truncate mt-0.5">{userPhone}</p>}
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <Link
                      href="/profile"
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

                  {/* Hours — Google-style dropdown */}
                  <div className="text-sm text-gray-600 mb-2">
                    {/* Trigger row */}
                    <button
                      className="flex items-center gap-1.5 w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedHoursId(
                          expandedHoursId === pharmacy.id ? null : pharmacy.id
                        );
                      }}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`font-medium ${pharmacy.isOpen ? 'text-green-600' : 'text-red-500'
                        }`}>
                        {pharmacy.isOpen ? 'Open now' : 'Closed'}
                      </span>
                      <span className="text-gray-400">·</span>
                      <span className="truncate text-gray-600">{pharmacy.hours}</span>
                      <svg
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform ml-auto shrink-0 ${expandedHoursId === pharmacy.id ? 'rotate-180' : ''
                          }`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded schedule */}
                    {expandedHoursId === pharmacy.id && (() => {
                      const oh = pharmacy.operatingHours;
                      const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                      const todayName = ALL_DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
                      const openDays: string[] = oh && Array.isArray(oh.days) ? oh.days : [];

                      return (
                        <div className="mt-1.5 rounded-md border border-gray-100 overflow-hidden text-xs">
                          {ALL_DAYS.map((day) => {
                            const isToday = day === todayName;
                            const isDayOpen = oh?.is24Hours || openDays.includes(day);
                            return (
                              <div
                                key={day}
                                className={`flex justify-between px-2.5 py-1.5 border-b border-gray-50 last:border-0 ${isToday ? 'bg-teal-50' : 'bg-white'
                                  }`}
                              >
                                <span className={isToday ? 'font-semibold text-teal-700' : 'text-gray-600'}>{day}</span>
                                <span className={`${isToday
                                    ? isDayOpen ? 'text-teal-600 font-semibold' : 'text-red-500 font-semibold'
                                    : isDayOpen ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
                                  {oh?.is24Hours
                                    ? 'Open 24 hours'
                                    : isDayOpen
                                      ? `${oh?.openTime ?? '?'} – ${oh?.closeTime ?? '?'}`
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
                      href={`tel:${pharmacy.phone.replace(/\D/g, '')}`}
                      className="bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center justify-center w-10 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                      title={`Call ${pharmacy.name}`}
                    >
                      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                    <a
                      href={`https://wa.me/${pharmacy.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hello, I found your pharmacy via the Blessed Irembo platform.')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="bg-[#dcfce7] text-[#16a34a] text-sm py-2 px-3 rounded-md font-medium hover:bg-[#bbf7d0] transition-colors flex items-center justify-center w-10 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetch(`/api/pharmacies/${pharmacy.id}/track-whatsapp`, { method: 'POST' }).catch(console.error);
                      }}
                      title={`WhatsApp ${pharmacy.name}`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M2.004 22l1.352-4.968A9.992 9.992 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.989 9.989 0 01-5.02-1.341L2.004 22zm10-18.3A8.309 8.309 0 003.7 12c0 1.458.375 2.874 1.085 4.108l-.87 3.2 3.275-.86A8.286 8.309 0 0012 20.3c4.586 0 8.3-3.714 8.3-8.3S16.586 3.7 12 3.7zm4.27 11.517c-.234-.117-1.385-.685-1.599-.763-.214-.078-.37-.117-.526.117-.156.234-.606.763-.742.92-.136.156-.273.175-.507.058-.234-.117-.988-.363-1.882-1.026-.694-.515-1.163-1.15-1.3-1.384-.136-.234-.015-.36.102-.477.105-.105.234-.273.351-.409.117-.136.156-.234.234-.39.078-.156.039-.293-.02-.409-.058-.117-.526-1.27-.721-1.74-.191-.46-.386-.398-.526-.405-.136-.007-.292-.007-.448-.007s-.409.058-.624.293c-.214.234-.818.8-.818 1.95s.838 2.264.954 2.42c.117.156 1.652 2.52 3.998 3.513 1.956.826 2.535.79 3.003.738.537-.06 1.385-.566 1.58-1.112.195-.546.195-1.015.136-1.112-.058-.098-.214-.156-.448-.273z" />
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
