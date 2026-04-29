'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { usePharmacyData } from '@/lib/usePharmacyData';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { sendNotification } from '@/lib/notificationUtils';

const PLANS = [
  {
    id: '1_month',
    name: '1 Month',
    price: 1000,
    label: '1,000 RWF / month',
  },
  {
    id: '3_months',
    name: '3 Months',
    price: 3000,
    label: '3,000 RWF / 3 months',
    popular: true,
  },
  {
    id: '12_months',
    name: '12 Months',
    price: 10000,
    label: '10,000 RWF / year',
  },
];

export default function PharmacySubscription() {
  const router = useRouter();
  const { currentUser, signOut } = useAuth();
  const { pharmacy, loading: pharmacyLoading } = usePharmacyData();

  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingIntent, setIsSubmittingIntent] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [checkingPending, setCheckingPending] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check if they already have a pending request
  useEffect(() => {
    async function checkPending() {
      if (!currentUser?.uid) return;
      try {
        const q = query(
          collection(db, 'subscription_requests'),
          where('pharmacyId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const reqDoc = snap.docs[0];
          setPendingRequest({ id: reqDoc.id, ...reqDoc.data() });
        }
      } catch (error) {
        console.error('Error checking pending requests:', error);
      } finally {
        setCheckingPending(false);
      }
    }
    checkPending();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmitIntent = async () => {
    if (!selectedPlan) return;
    if (!currentUser?.uid || !pharmacy) return;

    setIsSubmittingIntent(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Write to Firestore (no image yet)
      const docRef = await addDoc(collection(db, 'subscription_requests'), {
        pharmacyId: currentUser.uid,
        pharmacyName: pharmacy.name,
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        receiptUrl: '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setPendingRequest({
        id: docRef.id,
        pharmacyId: currentUser.uid,
        pharmacyName: pharmacy.name,
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        receiptUrl: '',
        status: 'pending'
      });
      
      setSuccessMsg('Your payment request has been submitted and is under review.');
      setSelectedPlan(null);
    } catch (error: any) {
      console.error('Submit intent error:', error);
      setErrorMsg(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmittingIntent(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile || !pendingRequest) {
      setErrorMsg('Please select a screenshot first.');
      return;
    }
    if (!currentUser?.uid) return;

    setIsUploading(true);
    setErrorMsg('');
    try {
      // 1. Upload receipt image to Firebase Storage
      const storageRef = ref(storage, `receipts/${currentUser.uid}_${Date.now()}_${receiptFile.name}`);
      const uploadResult = await uploadBytes(storageRef, receiptFile);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // 2. Update existing Firestore request
      await updateDoc(doc(db, 'subscription_requests', pendingRequest.id), {
        receiptUrl: downloadUrl
      });

      setPendingRequest({ ...pendingRequest, receiptUrl: downloadUrl });
      setSuccessMsg('Your receipt has been securely uploaded.');
      setReceiptFile(null);

      // Notify admins
      await sendNotification(
        'ADMIN',
        'New Receipt Uploaded',
        `Pharmacy ${pharmacy?.name || 'Unknown'} uploaded a payment receipt.`,
        'subscription',
        '/dashboard/subscriptions' // Admin panel URL
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      setErrorMsg('Failed to upload receipt. Storage rules might be missing or network error occurred.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingRequest || !confirm("Are you sure you want to cancel this request?")) return;
    try {
      await deleteDoc(doc(db, 'subscription_requests', pendingRequest.id));
      setPendingRequest(null);
      setReceiptFile(null);
      setErrorMsg('');
      setSuccessMsg('');
    } catch (err) {
      console.error("Failed to delete request", err);
      alert("Failed to cancel request.");
    }
  };

  if (pharmacyLoading || checkingPending) {
    return <LoadingScreen text="Loading subscription details..." />;
  }

  // Calculate current status
  const now = new Date();
  let subEndDate = pharmacy?.subscriptionEndDate?.toDate();
  if (!subEndDate && pharmacy?.createdAt) {
      const fallback = new Date(pharmacy.createdAt.toDate());
      fallback.setDate(fallback.getDate() + 90);
      subEndDate = fallback;
  }

  const isActive = subEndDate && subEndDate > now;
  const statusLabel = isActive ? 'Active' : 'Expired';
  const endsOn = subEndDate ? subEndDate.toLocaleDateString() : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo1.png" alt="Blessed Irembo" width={40} height={40} className="shrink-0" />
              <Link href="/pharmacy/dashboard" className="text-teal-600 font-semibold text-sm sm:text-base">
                My Pharmacy
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={handleLogout} className="text-sm px-3 py-2 text-gray-700 hover:text-gray-900 font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 shrink-0">
          <div className="p-6">
            <nav className="space-y-2">
              <Link href="/pharmacy/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
                <span className="font-medium">Overview</span>
              </Link>
              <Link href="/pharmacy/subscription" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-600 text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-medium">Subscription</span>
              </Link>
            </nav>
            <div className="my-6 border-t border-gray-200" />
            <nav className="space-y-2">
              <Link href="/pharmacy/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Profile</span>
              </Link>
              <Link href="/pharmacy/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Settings</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Subscription Management</h1>

            {/* Current Status Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Current Status</h2>
                  {!isActive && (
                    <p className="text-red-600 text-sm font-medium mt-1">Your access has expired or is pending renewal.</p>
                  )}
                </div>
                <span className={`px-4 py-1.5 rounded-lg font-semibold text-sm shrink-0 ${
                  isActive ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'
                }`}>
                  {statusLabel}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Access Valid Until</p>
                <p className="text-gray-900 font-semibold">{endsOn}</p>
              </div>
            </div>

            {/* Pending Request Banner */}
            {pendingRequest ? (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="text-lg font-bold text-blue-900">Request Sent to Admin</h3>
                </div>
                <p className="text-blue-800 mb-4">
                  We have notified the admin that you intend to pay <strong>{pendingRequest.amount.toLocaleString()} RWF</strong>. 
                  The admin is reviewing your request.
                </p>

                {/* Step 2: Upload Receipt (If not yet uploaded) */}
                {!pendingRequest.receiptUrl ? (
                  <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm mt-4">
                    <h4 className="font-bold text-gray-900 mb-3">Step 2: Upload Receipt</h4>
                    <p className="text-sm text-gray-700 mb-2 font-medium">To speed up approval, upload a screenshot of your MoMo receipt:</p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-teal-50 file:text-teal-700
                          hover:file:bg-teal-100 cursor-pointer max-w-sm"
                      />
                      <button
                        onClick={handleUploadReceipt}
                        disabled={isUploading || !receiptFile}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors whitespace-nowrap mt-3 sm:mt-0"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Receipt'}
                      </button>
                    </div>
                    {errorMsg && <p className="text-red-600 text-sm mt-3">{errorMsg}</p>}
                    {successMsg && <p className="text-teal-600 text-sm mt-3">{successMsg}</p>}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-teal-200 mt-4 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Receipt uploaded successfully.</p>
                      <p className="text-sm text-gray-500">The admin will review it shortly to activate your subscription.</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-blue-200">
                  <button
                    onClick={handleCancelRequest}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors bg-white px-4 py-2 rounded-lg border border-red-200 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Cancel Pending Request
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Pricing Plans */}
                <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Plan to Renew</h2>
                {errorMsg && <p className="text-red-600 text-sm font-medium mb-4">{errorMsg}</p>}
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`cursor-pointer bg-white rounded-xl border-2 p-5 sm:p-6 relative transition-all ${
                        selectedPlan?.id === plan.id
                          ? 'border-teal-600 shadow-md bg-teal-50/30'
                          : plan.popular
                          ? 'border-blue-200 hover:border-blue-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            Best Value
                          </span>
                        </div>
                      )}
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="text-2xl font-bold text-teal-600 mb-1">{plan.price.toLocaleString()} RWF</div>
                        <p className="text-xs text-gray-500">Total amount</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Information and Button (Shows when a plan is selected) */}
                {selectedPlan && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Your Payment</h2>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                      <p className="text-sm text-gray-700 mb-2 font-bold">Step 1: Make the payment</p>
                      <p className="text-sm text-gray-700 mb-2">Open your phone dialer and enter the following code:</p>
                      <div className="bg-white px-4 py-3 border border-gray-300 rounded-md inline-block font-mono text-lg sm:text-xl text-gray-900 font-bold mb-2">
                        *182*8*1*38220*{selectedPlan.price}#
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        You will be prompted to confirm a payment to <span className="font-bold text-gray-900">Blessed HealthConnect LTD</span> for {selectedPlan.price.toLocaleString()} RWF.
                      </p>
                    </div>

                    <button
                      onClick={handleSubmitIntent}
                      disabled={isSubmittingIntent}
                      className="w-full bg-teal-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 text-lg shadow-sm"
                    >
                      {isSubmittingIntent ? 'Sending Request...' : 'I have Paid (Intend to Pay)'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-4 h-16">
          <Link href="/pharmacy/dashboard" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-teal-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" /></svg>
            <span className="text-xs font-medium">Overview</span>
          </Link>
          <Link href="/pharmacy/subscription" className="flex flex-col items-center justify-center gap-1 text-teal-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            <span className="text-xs font-medium">Subscription</span>
          </Link>
          <Link href="/pharmacy/profile" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-teal-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-xs font-medium">Profile</span>
          </Link>
          <Link href="/pharmacy/settings" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-teal-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
