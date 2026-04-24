'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useRequireAdmin } from '@/lib/adminAuthHooks';
import { collection, doc, updateDoc, getDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Pharmacy {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: any;
  subscriptionEndDate: any;
  isActive: boolean;
  expiresOn: string;
}

interface SubscriptionRequest {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  planId: string;
  amount: number;
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

type TabType = 'pending' | 'active' | 'expired';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAdmin();
  
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [loading, setLoading] = useState(true);
  
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [activePharmacies, setActivePharmacies] = useState<Pharmacy[]>([]);
  const [expiredPharmacies, setExpiredPharmacies] = useState<Pharmacy[]>([]);
  
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    // 1. Listen to pending requests
    const reqQ = query(
      collection(db, 'subscription_requests'),
      where('status', '==', 'pending')
    );
    
    const unsubRequests = onSnapshot(reqQ, (snap) => {
      let fetchedRequests: SubscriptionRequest[] = [];
      snap.forEach(doc => {
        fetchedRequests.push({ id: doc.id, ...doc.data() } as SubscriptionRequest);
      });
      // Sort in memory to avoid composite index requirement
      fetchedRequests.sort((a, b) => {
        const timeA = a.createdAt?.toDate().getTime() || 0;
        const timeB = b.createdAt?.toDate().getTime() || 0;
        return timeB - timeA;
      });
      setRequests(fetchedRequests);
    });

    // 2. Listen to pharmacies to calculate Active vs Expired
    const unsubPharmacies = onSnapshot(collection(db, 'pharmacies'), (snap) => {
      const activeList: Pharmacy[] = [];
      const expiredList: Pharmacy[] = [];
      const now = new Date();

      snap.forEach(doc => {
        const data = doc.data();
        const endData = data.subscriptionEndDate?.toDate();
        
        let isActive = false;
        let expiresOn = 'N/A';

        if (endData) {
          isActive = endData > now;
          expiresOn = endData.toLocaleDateString();
        } else if (data.createdAt) {
          const trialEnd = new Date(data.createdAt.toDate());
          trialEnd.setDate(trialEnd.getDate() + 90);
          isActive = trialEnd > now;
          expiresOn = `${trialEnd.toLocaleDateString()} (Trial)`;
        } else {
          // Legacy pharmacies with no dates
          isActive = false;
          expiresOn = 'Expired';
        }

        const pharm: Pharmacy = {
          id: doc.id,
          name: data.name || 'Unknown',
          email: data.email || 'N/A',
          phone: data.phoneNumber || 'N/A',
          createdAt: data.createdAt,
          subscriptionEndDate: data.subscriptionEndDate,
          isActive,
          expiresOn
        };

        if (isActive) {
          activeList.push(pharm);
        } else {
          expiredList.push(pharm);
        }
      });

      // Sort by name
      activeList.sort((a, b) => a.name.localeCompare(b.name));
      expiredList.sort((a, b) => a.name.localeCompare(b.name));

      setActivePharmacies(activeList);
      setExpiredPharmacies(expiredList);
      setLoading(false);
    });

    return () => {
      unsubRequests();
      unsubPharmacies();
    };
  }, [authLoading]);

  const handleApprove = async (req: SubscriptionRequest) => {
    if (!confirm(`Are you sure you want to approve this ${req.amount} RWF payment for ${req.pharmacyName}?`)) return;
    
    setActionLoading(req.id);
    try {
      const pharmacyRef = doc(db, 'pharmacies', req.pharmacyId);
      const pharmacySnap = await getDoc(pharmacyRef);
      if (!pharmacySnap.exists()) throw new Error("Pharmacy not found");
      
      const data = pharmacySnap.data();
      let currentEnd = data.subscriptionEndDate?.toDate();
      
      // If no explicit end date, check trial period
      if (!currentEnd) {
        if (data.createdAt) {
          const trialEnd = new Date(data.createdAt.toDate());
          trialEnd.setDate(trialEnd.getDate() + 90);
          currentEnd = trialEnd;
        } else {
          currentEnd = new Date(0);
        }
      }

      const now = new Date();
      const baseDate = currentEnd > now ? currentEnd : now;
      
      // Fallback check on amount to ensure we always give correct duration
      let monthsToAdd = 0;
      if (req.planId === '1_month' || req.amount === 1000) monthsToAdd = 1;
      else if (req.planId === '3_months' || req.amount === 3000) monthsToAdd = 3;
      else if (req.planId === '12_months' || req.amount === 10000) monthsToAdd = 12;

      if (monthsToAdd === 0) {
         throw new Error("Could not determine duration from plan amount");
      }

      const newEndDate = new Date(baseDate);
      newEndDate.setMonth(newEndDate.getMonth() + monthsToAdd);

      await updateDoc(pharmacyRef, {
        subscriptionEndDate: newEndDate
      });

      await updateDoc(doc(db, 'subscription_requests', req.id), {
        status: 'approved',
        reviewedAt: new Date()
      });

    } catch (err) {
      console.error(err);
      alert('Failed to approve request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reqId: string) => {
    if (!confirm('Are you sure you want to REJECT this payment?')) return;
    setActionLoading(reqId);
    try {
      await updateDoc(doc(db, 'subscription_requests', reqId), {
        status: 'rejected',
        reviewedAt: new Date()
      });
    } catch (err) {
      console.error(err);
      alert('Failed to reject request.');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 w-full p-4 sm:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-500 mt-1">Review pending MoMo payments and track pharmacy subscriptions.</p>
          </div>

          {/* Clickable Stats Cards / Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Pending Requests Card */}
            <div 
              onClick={() => setActiveTab('pending')}
              className={`cursor-pointer rounded-xl border p-6 transition-all ${
                activeTab === 'pending' 
                  ? 'bg-blue-50 border-blue-400 shadow-md ring-1 ring-blue-400' 
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <h3 className="text-gray-600 text-sm font-medium mb-4">Pending Intentions</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">{loading ? '-' : requests.length}</div>
              <div className="text-sm text-gray-500 font-medium">Awaiting admin approval</div>
            </div>

            {/* Active Subscriptions Card */}
            <div 
              onClick={() => setActiveTab('active')}
              className={`cursor-pointer rounded-xl border p-6 transition-all ${
                activeTab === 'active' 
                  ? 'bg-teal-50 border-teal-400 shadow-md ring-1 ring-teal-400' 
                  : 'bg-white border-gray-200 hover:border-teal-300 hover:shadow-sm'
              }`}
            >
              <h3 className="text-gray-600 text-sm font-medium mb-4">Active Access</h3>
              <div className="text-4xl font-bold text-teal-600 mb-2">{loading ? '-' : activePharmacies.length}</div>
              <div className="text-sm text-gray-500 font-medium">Premium & Free Trials</div>
            </div>

            {/* Expired Subscriptions Card */}
            <div 
              onClick={() => setActiveTab('expired')}
              className={`cursor-pointer rounded-xl border p-6 transition-all ${
                activeTab === 'expired' 
                  ? 'bg-red-50 border-red-400 shadow-md ring-1 ring-red-400' 
                  : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-sm'
              }`}
            >
              <h3 className="text-gray-600 text-sm font-medium mb-4">Expired Access</h3>
              <div className="text-4xl font-bold text-red-600 mb-2">{loading ? '-' : expiredPharmacies.length}</div>
              <div className="text-sm text-gray-500 font-medium">Locked out pharmacies</div>
            </div>

          </div>

          {/* Dynamic Content Area based on Tab */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
            
            {/* --- PENDING TAB --- */}
            {activeTab === 'pending' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Payment Approvals</h2>
                {loading ? (
                  <p className="text-gray-500">Loading requests...</p>
                ) : requests.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">All Caught Up</h3>
                    <p className="text-gray-500 mt-1">There are no pending subscription requests to review.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map(req => (
                          <tr key={req.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{req.pharmacyName}</div>
                              <div className="text-xs text-gray-500">{new Date(req.createdAt?.toDate()).toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                                {req.planId.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {req.amount.toLocaleString()} RWF
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {req.receiptUrl ? (
                                <button 
                                  onClick={() => setSelectedReceipt(req.receiptUrl)}
                                  className="text-teal-600 hover:text-teal-900 font-medium text-sm flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Receipt
                                </button>
                              ) : (
                                <span className="text-amber-600 text-sm italic font-medium">No receipt provided</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleApprove(req)}
                                disabled={actionLoading === req.id}
                                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 mr-2 disabled:opacity-50"
                              >
                                {actionLoading === req.id ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                disabled={actionLoading === req.id}
                                className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* --- ACTIVE TAB --- */}
            {activeTab === 'active' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Active Pharmacies</h2>
                {activePharmacies.length === 0 ? (
                  <p className="text-gray-500">No active pharmacies found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires On</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activePharmacies.map(pharm => (
                          <tr key={pharm.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{pharm.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{pharm.email}</div>
                              <div className="text-xs text-gray-500">{pharm.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {pharm.subscriptionEndDate ? (
                                <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs font-semibold">Premium</span>
                              ) : (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">Free Trial</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {pharm.expiresOn}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* --- EXPIRED TAB --- */}
            {activeTab === 'expired' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Expired Pharmacies</h2>
                {expiredPharmacies.length === 0 ? (
                  <p className="text-gray-500">No expired pharmacies found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expired On</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expiredPharmacies.map(pharm => (
                          <tr key={pharm.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{pharm.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{pharm.email}</div>
                              <div className="text-xs text-gray-500">{pharm.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                              {pharm.expiresOn}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

          </div>
        </main>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Payment Receipt</h3>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-gray-100 min-h-[300px]">
              <img 
                src={selectedReceipt} 
                alt="MoMo Receipt" 
                className="max-w-full h-auto object-contain rounded shadow-sm border border-gray-200"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
