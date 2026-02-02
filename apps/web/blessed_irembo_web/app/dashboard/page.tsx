'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser, logout, type UserSession } from '@/lib/auth';

/**
 * User Dashboard Page
 * 
 * Main dashboard for regular users after login.
 * Immediately shows pharmacy finder with map interface.
 */

// Demo pharmacy data
const DEMO_PHARMACIES = [
  {
    id: 1,
    name: 'City Central Pharmacy',
    address: 'KN 4 Ave, Kigali',
    district: 'Gasabo',
    phone: '+250 788 123 456',
    email: 'contact@citypharmacy.rw',
    isOpen: true,
    hours: 'Mon-Sat: 8AM-8PM, Sun: 9AM-5PM',
    rating: 4.8,
    distance: '0.5 km',
    verified: true,
    latitude: -1.9536,
    longitude: 30.0605,
  },
  {
    id: 2,
    name: 'Health Plus Pharmacy',
    address: 'KG 11 Ave, Kigali',
    district: 'Kicukiro',
    phone: '+250 788 234 567',
    email: 'info@healthplus.rw',
    isOpen: true,
    hours: 'Mon-Sun: 24/7',
    rating: 4.9,
    distance: '1.2 km',
    verified: true,
    latitude: -1.9659,
    longitude: 30.1046,
  },
  {
    id: 3,
    name: 'MediCare Pharmacy',
    address: 'KN 3 Rd, Kigali',
    district: 'Nyarugenge',
    phone: '+250 788 345 678',
    email: 'contact@medicare.rw',
    isOpen: false,
    hours: 'Mon-Sat: 8AM-6PM',
    rating: 4.6,
    distance: '2.1 km',
    verified: true,
    latitude: -1.9441,
    longitude: 30.0619,
  },
  {
    id: 4,
    name: 'Wellness Pharmacy',
    address: 'KK 15 Ave, Kigali',
    district: 'Gasabo',
    phone: '+250 788 456 789',
    email: 'info@wellness.rw',
    isOpen: true,
    hours: 'Mon-Fri: 8AM-7PM, Sat: 9AM-5PM',
    rating: 4.7,
    distance: '3.0 km',
    verified: true,
    latitude: -1.9403,
    longitude: 30.0677,
  },
  {
    id: 5,
    name: 'LifeCare Pharmacy',
    address: 'KG 7 Ave, Kigali',
    district: 'Kicukiro',
    phone: '+250 788 567 890',
    email: 'contact@lifecare.rw',
    isOpen: true,
    hours: 'Mon-Sun: 7AM-10PM',
    rating: 4.5,
    distance: '3.5 km',
    verified: true,
    latitude: -1.9706,
    longitude: 30.1261,
  },
  {
    id: 6,
    name: 'Green Cross Pharmacy',
    address: 'KN 8 St, Kigali',
    district: 'Nyarugenge',
    phone: '+250 788 678 901',
    email: 'info@greencross.rw',
    isOpen: false,
    hours: 'Mon-Sat: 8AM-8PM',
    rating: 4.4,
    distance: '4.2 km',
    verified: true,
    latitude: -1.9578,
    longitude: 30.0944,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<number | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    // If pharmacy, redirect to pharmacy dashboard
    if (currentUser.role === 'pharmacy') {
      router.push('/pharmacy/dashboard');
      return;
    }

    setUser(currentUser);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const filteredPharmacies = DEMO_PHARMACIES.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'all' || pharmacy.district === selectedDistrict;
    const matchesOpen = !showOpenOnly || pharmacy.isOpen;
    return matchesSearch && matchesDistrict && matchesOpen;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
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

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-teal-600 font-medium">
                Dashboard
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700 text-sm">Welcome, <span className="font-medium">{user.name}</span></span>
              <button
                onClick={handleLogout}
                className="text-gray-700 font-medium hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Pharmacies</h1>
          <p className="text-gray-600">Search and discover verified pharmacies across Rwanda</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-12 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* District Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
              >
                <option value="all">All Districts</option>
                <option value="Gasabo">Gasabo</option>
                <option value="Kicukiro">Kicukiro</option>
                <option value="Nyarugenge">Nyarugenge</option>
              </select>
            </div>

            {/* Open Now Toggle */}
            <div className="md:col-span-2 flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOpenOnly}
                  onChange={(e) => setShowOpenOnly(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Open now</span>
              </label>
            </div>

            {/* Location Button */}
            <div className="md:col-span-2">
              <button className="w-full bg-teal-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Near Me
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Found <span className="font-semibold text-gray-900">{filteredPharmacies.length}</span> {filteredPharmacies.length === 1 ? 'pharmacy' : 'pharmacies'}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-[600px]">
              {/* Sample Map */}
              <div className="w-full h-full bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 rounded-lg relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Background - Water bodies */}
                  <ellipse cx="650" cy="450" rx="120" ry="80" fill="#E0F2FE" opacity="0.6"/>
                  
                  {/* Districts - Different shaded areas */}
                  <path d="M 50 50 Q 200 100 350 80 L 350 300 Q 200 280 50 320 Z" fill="#FEF3C7" opacity="0.3"/>
                  <path d="M 350 80 Q 500 60 650 100 L 650 350 Q 500 320 350 300 Z" fill="#D1FAE5" opacity="0.3"/>
                  <path d="M 50 320 Q 200 340 350 300 L 350 550 Q 200 530 50 570 Z" fill="#E0E7FF" opacity="0.3"/>
                  <path d="M 350 300 Q 500 280 650 350 L 650 550 Q 500 520 350 550 Z" fill="#FCE7F3" opacity="0.3"/>
                  
                  {/* Major Roads */}
                  <line x1="100" y1="150" x2="700" y2="150" stroke="#94A3B8" strokeWidth="3" opacity="0.5"/>
                  <line x1="100" y1="300" x2="700" y2="300" stroke="#94A3B8" strokeWidth="3" opacity="0.5"/>
                  <line x1="100" y1="450" x2="700" y2="450" stroke="#94A3B8" strokeWidth="3" opacity="0.5"/>
                  <line x1="200" y1="50" x2="200" y2="550" stroke="#94A3B8" strokeWidth="3" opacity="0.5"/>
                  <line x1="400" y1="50" x2="400" y2="550" stroke="#94A3B8" strokeWidth="3" opacity="0.5"/>
                  <line x1="600" y1="50" x2="600" y2="550" stroke="#94A3B8" strokeWidth="3" opacity="0.5"/>
                  
                  {/* Secondary Roads */}
                  <line x1="50" y1="225" x2="750" y2="225" stroke="#CBD5E1" strokeWidth="2" opacity="0.4"/>
                  <line x1="50" y1="375" x2="750" y2="375" stroke="#CBD5E1" strokeWidth="2" opacity="0.4"/>
                  <line x1="300" y1="50" x2="300" y2="550" stroke="#CBD5E1" strokeWidth="2" opacity="0.4"/>
                  <line x1="500" y1="50" x2="500" y2="550" stroke="#CBD5E1" strokeWidth="2" opacity="0.4"/>
                  
                  {/* Green spaces - Parks */}
                  <circle cx="250" cy="200" r="30" fill="#86EFAC" opacity="0.4"/>
                  <circle cx="550" cy="400" r="40" fill="#86EFAC" opacity="0.4"/>
                  
                  {/* Pharmacy Markers */}
                  {/* City Central Pharmacy - Gasabo */}
                  <g className={selectedPharmacy === 1 ? "animate-bounce" : ""}>
                    <circle cx="220" cy="180" r="18" fill="#0D9488" opacity="0.2"/>
                    <path d="M220 165 L220 195 M205 180 L235 180" stroke="#0D9488" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="220" cy="180" r="20" fill="none" stroke="#0D9488" strokeWidth="3"/>
                    <circle cx="220" cy="180" r="3" fill="#0D9488"/>
                  </g>
                  
                  {/* Health Plus Pharmacy - Kicukiro */}
                  <g className={selectedPharmacy === 2 ? "animate-bounce" : ""}>
                    <circle cx="480" cy="420" r="18" fill="#0D9488" opacity="0.2"/>
                    <path d="M480 405 L480 435 M465 420 L495 420" stroke="#0D9488" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="480" cy="420" r="20" fill="none" stroke="#0D9488" strokeWidth="3"/>
                    <circle cx="480" cy="420" r="3" fill="#0D9488"/>
                  </g>
                  
                  {/* MediCare Pharmacy - Nyarugenge */}
                  <g className={selectedPharmacy === 3 ? "animate-bounce" : ""}>
                    <circle cx="180" cy="280" r="18" fill="#0D9488" opacity="0.2"/>
                    <path d="M180 265 L180 295 M165 280 L195 280" stroke="#0D9488" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="180" cy="280" r="20" fill="none" stroke="#0D9488" strokeWidth="3"/>
                    <circle cx="180" cy="280" r="3" fill="#0D9488"/>
                  </g>
                  
                  {/* Wellness Pharmacy - Gasabo */}
                  <g className={selectedPharmacy === 4 ? "animate-bounce" : ""}>
                    <circle cx="320" cy="140" r="18" fill="#0D9488" opacity="0.2"/>
                    <path d="M320 125 L320 155 M305 140 L335 140" stroke="#0D9488" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="320" cy="140" r="20" fill="none" stroke="#0D9488" strokeWidth="3"/>
                    <circle cx="320" cy="140" r="3" fill="#0D9488"/>
                  </g>
                  
                  {/* LifeCare Pharmacy - Kicukiro */}
                  <g className={selectedPharmacy === 5 ? "animate-bounce" : ""}>
                    <circle cx="580" cy="470" r="18" fill="#0D9488" opacity="0.2"/>
                    <path d="M580 455 L580 485 M565 470 L595 470" stroke="#0D9488" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="580" cy="470" r="20" fill="none" stroke="#0D9488" strokeWidth="3"/>
                    <circle cx="580" cy="470" r="3" fill="#0D9488"/>
                  </g>
                  
                  {/* Green Cross Pharmacy - Nyarugenge */}
                  <g className={selectedPharmacy === 6 ? "animate-bounce" : ""}>
                    <circle cx="380" cy="360" r="18" fill="#0D9488" opacity="0.2"/>
                    <path d="M380 345 L380 375 M365 360 L395 360" stroke="#0D9488" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="380" cy="360" r="20" fill="none" stroke="#0D9488" strokeWidth="3"/>
                    <circle cx="380" cy="360" r="3" fill="#0D9488"/>
                  </g>
                  
                  {/* District Labels */}
                  <text x="180" y="150" fill="#64748B" fontSize="16" fontWeight="600" opacity="0.6">Gasabo</text>
                  <text x="480" y="200" fill="#64748B" fontSize="16" fontWeight="600" opacity="0.6">Kicukiro</text>
                  <text x="150" y="400" fill="#64748B" fontSize="16" fontWeight="600" opacity="0.6">Nyarugenge</text>
                </svg>
                
                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Map Legend</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-600">Pharmacy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-1 bg-gray-400"></div>
                      <span className="text-xs text-gray-600">Major Road</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-300 opacity-50"></div>
                      <span className="text-xs text-gray-600">Park</span>
                    </div>
                  </div>
                </div>
                
                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors">
                    <svg className="w-5 h-5 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors">
                    <svg className="w-5 h-5 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M20 12H4" />
                    </svg>
                  </button>
                  <button className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors">
                    <svg className="w-5 h-5 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                {/* Location indicator */}
                <div className="absolute bottom-4 right-4 bg-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                  Kigali, Rwanda
                </div>
              </div>
            </div>
          </div>

          {/* Pharmacy List */}
          <div className="lg:col-span-1">
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredPharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  onClick={() => setSelectedPharmacy(pharmacy.id)}
                  className={`bg-white rounded-lg border ${
                    selectedPharmacy === pharmacy.id ? 'border-teal-500 shadow-lg' : 'border-gray-200'
                  } p-4 cursor-pointer hover:shadow-md transition-shadow`}
                >
                  {/* Pharmacy Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                        {pharmacy.verified && (
                          <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          pharmacy.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
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

                  {/* Location */}
                  <div className="flex items-start text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{pharmacy.address} • {pharmacy.distance}</span>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2 shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{pharmacy.phone}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/pharmacies/${pharmacy.id}`}
                      className="flex-1 bg-teal-600 text-white text-sm py-2 px-3 rounded-md font-medium hover:bg-teal-700 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    <button className="bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-md font-medium hover:bg-gray-200 transition-colors">
                      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {filteredPharmacies.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-600 font-medium">No pharmacies found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
