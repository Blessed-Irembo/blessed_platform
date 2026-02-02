'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { getCurrentAdmin } from '@/lib/auth';

// Demo pharmacy data
const DEMO_PHARMACIES = [
  {
    id: 1,
    name: 'Kigali Central Pharmacy',
    address: 'KN 3 Ave, Kigali, Kigali',
    phone: '+250 788 123 456',
    email: 'info@kigalicentral.rw',
    license: 'RW-PH-2024-001',
    subscription: 'active',
    status: 'approved',
    verified: true,
  },
  {
    id: 2,
    name: 'Nyarugenge Health Pharmacy',
    address: 'KG 7 Ave, Nyarugenge, Kigali',
    phone: '+250 788 234 567',
    email: 'contact@nyarugenge.rw',
    license: 'RW-PH-2024-002',
    subscription: 'Free Trial',
    status: 'approved',
    verified: true,
  },
  {
    id: 3,
    name: 'Remera Medical Pharmacy',
    address: 'KG 17 Ave, Remera, Kigali',
    phone: '+250 788 345 678',
    email: 'info@remera.rw',
    license: 'RW-PH-2024-003',
    subscription: 'active',
    status: 'approved',
    verified: true,
  },
  {
    id: 4,
    name: 'Huye District Pharmacy',
    address: 'Huye District, Southern Province',
    phone: '+250 788 456 789',
    email: 'contact@huye.rw',
    license: 'RW-PH-2024-004',
    subscription: 'Free Trial',
    status: 'pending',
    verified: false,
  },
  {
    id: 5,
    name: 'Musanze Health Center Pharmacy',
    address: 'Musanze District, Northern Province',
    phone: '+250 788 567 890',
    email: 'info@musanze.rw',
    license: 'RW-PH-2024-005',
    subscription: 'active',
    status: 'approved',
    verified: true,
  },
  {
    id: 6,
    name: 'Rubavu Medical Pharmacy',
    address: 'Rubavu District, Western Province',
    phone: '+250 788 678 901',
    email: 'contact@rubavu.rw',
    license: 'RW-PH-2024-006',
    subscription: 'active',
    status: 'approved',
    verified: true,
  },
];

export default function PharmaciesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const admin = getCurrentAdmin();
    if (!admin) {
      router.push('/login');
    }
  }, [router]);

  const filteredPharmacies = DEMO_PHARMACIES.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && pharmacy.status === 'pending';
    if (activeTab === 'approved') return matchesSearch && pharmacy.status === 'approved';
    if (activeTab === 'suspended') return matchesSearch && pharmacy.status === 'suspended';
    
    return matchesSearch;
  });

  const getTabCount = (tab: string) => {
    if (tab === 'all') return DEMO_PHARMACIES.length;
    return DEMO_PHARMACIES.filter(p => p.status === tab).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Management</h1>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-t-xl border border-gray-200 border-b-0">
            <div className="flex gap-1 p-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                All ({getTabCount('all')})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Pending ({getTabCount('pending')})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'approved'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Approved ({getTabCount('approved')})
              </button>
              <button
                onClick={() => setActiveTab('suspended')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'suspended'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Suspended ({getTabCount('suspended')})
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-b-xl border border-gray-200 p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search pharmacies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Pharmacy List */}
            <div className="space-y-4">
              {filteredPharmacies.map((pharmacy) => (
                <div key={pharmacy.id} className="border border-gray-200 rounded-xl p-6">
                  {/* Pharmacy Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{pharmacy.name}</h3>
                        {pharmacy.verified && (
                          <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        )}
                        <span className="bg-teal-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {pharmacy.status}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div>{pharmacy.address}</div>
                        <div>{pharmacy.phone} • {pharmacy.email}</div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">License:</span> {pharmacy.license}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Subscription:</span> {pharmacy.subscription}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Suspend
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                      View Details
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
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
