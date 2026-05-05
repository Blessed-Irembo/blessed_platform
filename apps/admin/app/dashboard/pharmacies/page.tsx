'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAdmin } from '@/lib/adminAuthHooks';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function PharmaciesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any | null>(null);
  // Use a ref to track selected ID so the snapshot listener never needs to restart
  const selectedIdRef = useRef<string | null>(null);

  const { loading: authLoading } = useRequireAdmin();

  useEffect(() => {
    if (authLoading) return;

    const unsub = onSnapshot(collection(db, 'pharmacies'), (snapshot) => {
      const now = new Date();
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        const endData = data.subscriptionEndDate?.toDate();

        let subscriptionStatus = 'Expired';
        let isActive = false;

        if (endData) {
          isActive = endData > now;
          subscriptionStatus = isActive ? 'Premium' : 'Expired';
        } else if (data.createdAt) {
          const trialEnd = new Date(data.createdAt.toDate());
          trialEnd.setDate(trialEnd.getDate() + 90);
          isActive = trialEnd > now;
          subscriptionStatus = isActive ? 'Free Trial' : 'Expired';
        }

        return {
          id: doc.id,
          name: data.name || 'Unknown',
          address: data.address || '',
          phone: data.phoneNumber || '',
          email: data.email || '',
          license: data.registrationNumber || data.licenseNumber || 'N/A',
          subscription: subscriptionStatus,
          status: data.status || 'pending',
          verified: data.isVerified || false,
          ...data
        };
      });

      // Sort alphabetically
      list.sort((a, b) => a.name.localeCompare(b.name));
      setPharmacies(list);
      setLoading(false);

      // Keep the modal in sync if a pharmacy is currently open — use ref to
      // avoid adding selectedPharmacy to the dep array (which would restart the listener)
      if (selectedIdRef.current) {
        const updated = list.find(p => p.id === selectedIdRef.current);
        if (updated) setSelectedPharmacy(updated);
      }
    });

    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]); // intentionally omit selectedPharmacy — use ref instead

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    return pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.license.toLowerCase().includes(searchQuery.toLowerCase());
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
                  placeholder="Search pharmacies by name, address, or registration number..."
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
                <div key={pharmacy.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-all bg-white">
                  {/* Pharmacy Header */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
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
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {pharmacy.address}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {pharmacy.phone}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                          <span className="text-gray-500 font-medium">Council Reg Number:</span>
                          <span className="font-bold text-gray-900">{pharmacy.license}</span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg border font-semibold ${
                          pharmacy.subscription === 'Premium' ? 'bg-teal-50 border-teal-200 text-teal-700' :
                          pharmacy.subscription === 'Free Trial' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          {pharmacy.subscription}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="shrink-0 w-full sm:w-auto">
                      <button 
                        onClick={() => { selectedIdRef.current = pharmacy.id; setSelectedPharmacy(pharmacy); }}
                        className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                      >
                        View Details
                      </button>
                    </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Pharmacy Details</h2>
              <button onClick={() => { selectedIdRef.current = null; setSelectedPharmacy(null); }} className="text-gray-400 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-8 overflow-y-auto">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Pharmacy Name</span>
                    <span className="font-bold text-gray-900">{selectedPharmacy.name}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Council Reg Number</span>
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{selectedPharmacy.license}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Email</span>
                    <span className="font-medium text-gray-900">{selectedPharmacy.email || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Phone</span>
                    <span className="font-medium text-gray-900">{selectedPharmacy.phone || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Physical Address</span>
                    <span className="font-medium text-gray-900">{selectedPharmacy.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Engagement Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* WhatsApp Clicks */}
                  <div className="bg-green-50 rounded-xl p-4 flex items-center gap-4 border border-green-100 shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M2.004 22l1.352-4.968A9.992 9.992 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.989 9.989 0 01-5.02-1.341L2.004 22zm10-18.3A8.309 8.309 0 003.7 12c0 1.458.375 2.874 1.085 4.108l-.87 3.2 3.275-.86A8.286 8.309 0 0012 20.3c4.586 0 8.3-3.714 8.3-8.3S16.586 3.7 12 3.7zm4.27 11.517c-.234-.117-1.385-.685-1.599-.763-.214-.078-.37-.117-.526.117-.156.234-.606.763-.742.92-.136.156-.273.175-.507.058-.234-.117-.988-.363-1.882-1.026-.694-.515-1.163-1.15-1.3-1.384-.136-.234-.015-.36.102-.477.105-.105.234-.273.351-.409.117-.136.156-.234.234-.39.078-.156.039-.293-.02-.409-.058-.117-.526-1.27-.721-1.74-.191-.46-.386-.398-.526-.405-.136-.007-.292-.007-.448-.007s-.409.058-.624.293c-.214.234-.818.8-.818 1.95s.838 2.264.954 2.42c.117.156 1.652 2.52 3.998 3.513 1.956.826 2.535.79 3.003.738.537-.06 1.385-.566 1.58-1.112.195-.546.195-1.015.136-1.112-.058-.098-.214-.156-.448-.273z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-bold text-2xl">{selectedPharmacy.whatsappClicks || 0}</h4>
                      <p className="text-sm text-green-700 font-medium">WhatsApp Inquiries</p>
                    </div>
                  </div>

                  {/* Profile Views */}
                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4 border border-blue-100 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-bold text-2xl">{selectedPharmacy.profileViews || 0}</h4>
                      <p className="text-sm text-blue-700 font-medium">Platform Profile Views</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Operating Hours */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Operating Schedule</h3>
                {selectedPharmacy.operatingHours ? (
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                    {selectedPharmacy.operatingHours.is24Hours ? (
                      <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Open 24/7
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-teal-600 font-bold text-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Specific Hours
                        </div>
                        <div className="grid grid-cols-12 gap-y-3 gap-x-4 max-w-lg bg-white p-4 rounded-lg border border-gray-200">
                          <span className="col-span-5 text-gray-500 font-semibold text-sm self-center">Days Operation:</span>
                          <span className="col-span-7 text-gray-900 font-medium text-sm line-clamp-2">
                            {selectedPharmacy.operatingHours.days?.join(', ') || 'N/A'}
                          </span>
                          
                          <span className="col-span-5 text-gray-500 font-semibold text-sm self-center">Opening Time:</span>
                          <span className="col-span-7 text-gray-900 font-medium text-sm">
                            {selectedPharmacy.operatingHours.openTime || 'N/A'}
                          </span>
                          
                          <span className="col-span-5 text-gray-500 font-semibold text-sm self-center">Closing Time:</span>
                          <span className="col-span-7 text-gray-900 font-medium text-sm">
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
            
            <div className="p-5 border-t border-gray-100 flex justify-end bg-gray-50">
              <button 
                onClick={() => { selectedIdRef.current = null; setSelectedPharmacy(null); }}
                className="px-8 py-2.5 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
