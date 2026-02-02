'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Pharmacies Page
 * 
 * Main pharmacy search and discovery page with map integration.
 * Users can search, filter, and view pharmacy details.
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

export default function PharmaciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<number | null>(null);

  const filteredPharmacies = DEMO_PHARMACIES.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'all' || pharmacy.district === selectedDistrict;
    const matchesOpen = !showOpenOnly || pharmacy.isOpen;
    return matchesSearch && matchesDistrict && matchesOpen;
  });

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

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-700 font-medium hover:text-teal-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/pharmacies" className="text-teal-600 font-medium">
                Find Pharmacies
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 font-medium hover:text-red-600 transition-colors">
                Logout
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* District Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
              {/* Map Placeholder */}
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                    <circle cx="200" cy="200" r="100" stroke="#0D9488" strokeWidth="2" />
                    <circle cx="150" cy="180" r="5" fill="#0D9488" />
                    <circle cx="220" cy="190" r="5" fill="#0D9488" />
                    <circle cx="180" cy="230" r="5" fill="#0D9488" />
                    <circle cx="240" cy="170" r="5" fill="#0D9488" />
                  </svg>
                </div>
                <div className="text-center z-10">
                  <svg className="w-16 h-16 text-teal-600 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-gray-600 font-medium">Interactive Map View</p>
                  <p className="text-sm text-gray-500 mt-1">Google Maps integration coming soon</p>
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
      </div>
    </div>
  );
}
