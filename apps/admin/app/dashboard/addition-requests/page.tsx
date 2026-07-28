'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useRequireAdmin } from '@/lib/adminAuthHooks';
import { collection, doc, updateDoc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdditionRequest {
  id: string;
  pharmacyName: string;
  npcNumber: string;
  address: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  approvedAt?: any;
  rejectedAt?: any;
}

export default function AdditionRequestsPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAdmin();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AdditionRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const unsub = onSnapshot(collection(db, 'pharmacy_addition_requests'), (snapshot) => {
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as AdditionRequest[];

      // Sort by createdAt desc in memory
      list.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || a.createdAt?.seconds * 1000 || 0;
        const timeB = b.createdAt?.toDate?.()?.getTime() || b.createdAt?.seconds * 1000 || 0;
        return timeB - timeA;
      });

      setRequests(list);
      setLoading(false);
    });

    return () => unsub();
  }, [authLoading]);

  const handleApprove = async (req: AdditionRequest) => {
    const formattedNpc = req.npcNumber.toUpperCase().trim();
    if (!confirm(`Are you sure you want to APPROVE the request for "${req.pharmacyName}" and add NPC "${formattedNpc}" to the registry?`)) {
      return;
    }

    setActionLoading(req.id);
    try {
      const docId = formattedNpc.replace('/', '_');
      const licenseRef = doc(db, 'licensed_pharmacies', docId);

      // Check if document already exists to preserve registration status
      const licenseSnap = await getDoc(licenseRef);
      
      if (licenseSnap.exists()) {
        const existingData = licenseSnap.data();
        await setDoc(licenseRef, {
          registrationNumber: formattedNpc,
          name: req.pharmacyName.toUpperCase(),
          district: req.address,
          // Preserve critical fields
          isRegistered: existingData.isRegistered ?? false,
          registeredUid: existingData.registeredUid ?? null,
          createdAt: existingData.createdAt ?? serverTimestamp(),
        }, { merge: true });
      } else {
        // Create / merge target document in licensed_pharmacies
        await setDoc(licenseRef, {
          registrationNumber: formattedNpc,
          name: req.pharmacyName.toUpperCase(),
          councilTechnician: '',
          province: '',
          district: req.address,
          sector: '',
          cell: '',
          licenseExpiryDate: '',
          isRegistered: false,
          createdAt: serverTimestamp(),
        }, { merge: true });
      }

      // Update addition request status to approved
      const requestRef = doc(db, 'pharmacy_addition_requests', req.id);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
      });

      alert(`Successfully approved and added "${formattedNpc}" to licensed pharmacies list.`);
    } catch (err: any) {
      console.error('Error approving request:', err);
      alert(`Failed to approve request: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (req: AdditionRequest) => {
    if (!confirm(`Are you sure you want to REJECT the request for "${req.pharmacyName}" (NPC: ${req.npcNumber})?`)) {
      return;
    }

    setActionLoading(req.id);
    try {
      const requestRef = doc(db, 'pharmacy_addition_requests', req.id);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
      });

      alert('Request rejected successfully.');
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      alert(`Failed to reject request: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter lists based on selected status tab
  const filteredRequests = requests.filter(req => req.status === activeTab);

  // Search filter
  const displayRequests = filteredRequests.filter(req => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      req.pharmacyName.toLowerCase().includes(query) ||
      req.npcNumber.toLowerCase().includes(query) ||
      req.address.toLowerCase().includes(query) ||
      req.email.toLowerCase().includes(query) ||
      req.phone.toLowerCase().includes(query)
    );
  });

  const countPending = requests.filter(r => r.status === 'pending').length;
  const countApproved = requests.filter(r => r.status === 'approved').length;
  const countRejected = requests.filter(r => r.status === 'rejected').length;

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 w-full p-4 sm:p-8 pb-20 sm:pb-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Pharmacy NPC Addition Requests</h1>
            <p className="text-gray-600">Review, approve, or reject Council Registration Number (NPC) addition requests submitted by pharmacy owners.</p>
          </div>

          {/* Quick Stats Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Pending Requests Tab */}
            <div 
              onClick={() => setActiveTab('pending')}
              className={`cursor-pointer rounded-xl border p-6 transition-all ${
                activeTab === 'pending' 
                  ? 'bg-amber-50 border-amber-400 shadow-md ring-1 ring-amber-400' 
                  : 'bg-white border-gray-200 hover:border-amber-300 hover:shadow-sm'
              }`}
            >
              <h3 className="text-gray-600 text-sm font-medium mb-4">Pending Requests</h3>
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {loading ? '-' : countPending}
              </div>
              <div className="text-sm text-gray-500 font-medium">Awaiting verification</div>
            </div>

            {/* Approved Requests Tab */}
            <div 
              onClick={() => setActiveTab('approved')}
              className={`cursor-pointer rounded-xl border p-6 transition-all ${
                activeTab === 'approved' 
                  ? 'bg-teal-50 border-teal-400 shadow-md ring-1 ring-teal-400' 
                  : 'bg-white border-gray-200 hover:border-teal-300 hover:shadow-sm'
              }`}
            >
              <h3 className="text-gray-600 text-sm font-medium mb-4">Approved Requests</h3>
              <div className="text-4xl font-bold text-teal-600 mb-2">
                {loading ? '-' : countApproved}
              </div>
              <div className="text-sm text-gray-500 font-medium">Added to license registry</div>
            </div>

            {/* Rejected Requests Tab */}
            <div 
              onClick={() => setActiveTab('rejected')}
              className={`cursor-pointer rounded-xl border p-6 transition-all ${
                activeTab === 'rejected' 
                  ? 'bg-red-50 border-red-400 shadow-md ring-1 ring-red-400' 
                  : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-sm'
              }`}
            >
              <h3 className="text-gray-600 text-sm font-medium mb-4">Rejected Requests</h3>
              <div className="text-4xl font-bold text-red-600 mb-2">
                {loading ? '-' : countRejected}
              </div>
              <div className="text-sm text-gray-500 font-medium">Declined submissions</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search requests by name, NPC license, address, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* List Area */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {activeTab === 'pending' && 'Pending Verification'}
              {activeTab === 'approved' && 'Approved Additions'}
              {activeTab === 'rejected' && 'Rejected Submissions'}
            </h2>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : displayRequests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                <p className="text-gray-500 mt-1">
                  {searchQuery ? 'Try adjusting your search criteria.' : `There are no ${activeTab} requests in the system.`}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {displayRequests.map((req) => (
                  <div key={req.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Title & Status Badge */}
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{req.pharmacyName}</h3>
                        <span className={`text-white text-xs font-semibold px-2.5 py-1 rounded-full ${
                          req.status === 'pending' ? 'bg-amber-500' :
                          req.status === 'approved' ? 'bg-teal-600' :
                          'bg-red-500'
                        }`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-500">NPC Number:</span>
                          <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-mono uppercase">{req.npcNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-500">District:</span>
                          <span className="font-medium text-gray-900">{req.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-500">Phone:</span>
                          <span className="font-medium text-gray-900">{req.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                          <span className="font-semibold text-gray-500">Email:</span>
                          <span className="font-medium text-gray-900">{req.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-500">Submitted:</span>
                          <span className="font-medium text-gray-900">
                            {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleString() : 'N/A'}
                          </span>
                        </div>
                        {req.status === 'approved' && req.approvedAt && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-teal-600">Approved:</span>
                            <span className="font-medium text-gray-900">
                              {req.approvedAt?.toDate ? req.approvedAt.toDate().toLocaleString() : 'N/A'}
                            </span>
                          </div>
                        )}
                        {req.status === 'rejected' && req.rejectedAt && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-red-600">Rejected:</span>
                            <span className="font-medium text-gray-900">
                              {req.rejectedAt?.toDate ? req.rejectedAt.toDate().toLocaleString() : 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions panel */}
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => handleReject(req)}
                          className="flex-1 md:flex-initial px-5 py-2.5 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center"
                        >
                          Reject
                        </button>
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => handleApprove(req)}
                          className="flex-1 md:flex-initial px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center shadow-sm flex items-center justify-center gap-2"
                        >
                          {actionLoading === req.id && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          )}
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
