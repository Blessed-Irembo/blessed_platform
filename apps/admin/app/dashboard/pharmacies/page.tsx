'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAdmin } from '@/lib/adminAuthHooks';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// Removed DEMO_PHARMACIES

export default function PharmaciesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any | null>(null);

  const { loading: authLoading } = useRequireAdmin();

  useEffect(() => {
    async function loadPharmacies() {
      try {
        const snapshot = await getDocs(collection(db, 'pharmacies'));
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unknown',
          address: doc.data().address || '',
          phone: doc.data().phoneNumber || '',
          email: doc.data().email || '',
          license: doc.data().licenseNumber || 'N/A',
          subscription: doc.data().subscriptionStatus || 'Free Trial',
          status: doc.data().status || 'pending',
          verified: doc.data().isVerified || false,
          ...doc.data()
        }));
        setPharmacies(list);
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPharmacies();
  }, []);

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    return pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 w-full overflow-hidden p-4 sm:p-8 pb-20 sm:pb-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Pharmacy Management</h1>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
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
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : (
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
                        {!(pharmacy.verified && pharmacy.status === 'pending') && (
                          <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full ${
                            pharmacy.status === 'pending' ? 'bg-amber-500' : 'bg-teal-600'
                          }`}>
                            {pharmacy.status}
                          </span>
                        )}
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
                    <button 
                      onClick={() => setSelectedPharmacy(pharmacy)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
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
            )}
          </div>
        </main>
      </div>

      <Footer />

      {/* Pharmacy Details Modal */}
      {selectedPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Pharmacy Details</h2>
              <button onClick={() => setSelectedPharmacy(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-xs text-gray-500">Name</span>
                    <span className="font-medium text-gray-900">{selectedPharmacy.name}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-xs text-gray-500">License Number</span>
                    <span className="font-medium text-gray-900">{selectedPharmacy.license}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-xs text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">{selectedPharmacy.email || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-xs text-gray-500">Phone</span>
                    <span className="font-medium text-gray-900">{selectedPharmacy.phone || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-gray-500">Address</span>
                    <span className="font-medium text-gray-900">{selectedPharmacy.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Engagement Metrics</h3>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 border border-gray-100">
                  <div className="w-12 h-12 bg-[#dcfce7] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-[#16a34a]" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M2.004 22l1.352-4.968A9.992 9.992 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.989 9.989 0 01-5.02-1.341L2.004 22zm10-18.3A8.309 8.309 0 003.7 12c0 1.458.375 2.874 1.085 4.108l-.87 3.2 3.275-.86A8.286 8.309 0 0012 20.3c4.586 0 8.3-3.714 8.3-8.3S16.586 3.7 12 3.7zm4.27 11.517c-.234-.117-1.385-.685-1.599-.763-.214-.078-.37-.117-.526.117-.156.234-.606.763-.742.92-.136.156-.273.175-.507.058-.234-.117-.988-.363-1.882-1.026-.694-.515-1.163-1.15-1.3-1.384-.136-.234-.015-.36.102-.477.105-.105.234-.273.351-.409.117-.136.156-.234.234-.39.078-.156.039-.293-.02-.409-.058-.117-.526-1.27-.721-1.74-.191-.46-.386-.398-.526-.405-.136-.007-.292-.007-.448-.007s-.409.058-.624.293c-.214.234-.818.8-.818 1.95s.838 2.264.954 2.42c.117.156 1.652 2.52 3.998 3.513 1.956.826 2.535.79 3.003.738.537-.06 1.385-.566 1.58-1.112.195-.546.195-1.015.136-1.112-.058-.098-.214-.156-.448-.273z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold text-2xl">{selectedPharmacy.whatsappClicks || 0}</h4>
                    <p className="text-sm text-gray-500">WhatsApp Clicks on Platform</p>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Operating Schedule</h3>
                {selectedPharmacy.operatingHours ? (
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                    {selectedPharmacy.operatingHours.is24Hours ? (
                      <div className="flex items-center gap-2 text-green-600 font-bold text-lg mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Open 24/7
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-teal-600 font-bold text-lg mb-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Specific Hours
                        </div>
                        <div className="grid grid-cols-12 gap-y-3 gap-x-4 max-w-lg">
                          <span className="col-span-4 text-gray-500 font-semibold text-sm self-center">Days Operations:</span>
                          <span className="col-span-8 text-gray-900 font-medium text-sm bg-white border border-gray-200 py-2 px-3 rounded-md line-clamp-2">
                            {selectedPharmacy.operatingHours.days?.join(', ') || 'N/A'}
                          </span>
                          
                          <span className="col-span-4 text-gray-500 font-semibold text-sm self-center">Opening Time:</span>
                          <span className="col-span-8 text-gray-900 font-medium text-sm bg-white border border-gray-200 py-2 px-3 rounded-md">
                            {selectedPharmacy.operatingHours.openTime || 'N/A'}
                          </span>
                          
                          <span className="col-span-4 text-gray-500 font-semibold text-sm self-center">Closing Time:</span>
                          <span className="col-span-8 text-gray-900 font-medium text-sm bg-white border border-gray-200 py-2 px-3 rounded-md">
                            {selectedPharmacy.operatingHours.closeTime || 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 p-6 rounded-lg text-gray-500 text-sm text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No operating hours specified by this pharmacy yet.
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-xl">
              <button 
                onClick={() => setSelectedPharmacy(null)}
                className="px-6 py-2 bg-white border border-gray-300 shadow-sm text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
