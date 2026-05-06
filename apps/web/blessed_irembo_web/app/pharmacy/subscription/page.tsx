'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { usePharmacyData } from '@/lib/usePharmacyData';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { sendNotification } from '@/lib/notificationUtils';
import { useLanguage } from '@/lib/LanguageContext';

export default function PharmacySubscription() {
  const { currentUser } = useAuth();
  const { pharmacy, loading: pharmacyLoading } = usePharmacyData();
  const { t, language } = useLanguage();

  const PLANS = [
    {
      id: '1_month',
      name: language === 'en' ? '1 Month' : 'Ukwezi 1',
      price: 1000,
      label: language === 'en' ? '1,000 RWF / month' : '1,000 RWF / kwezi',
    },
    {
      id: '3_months',
      name: language === 'en' ? '3 Months' : 'Amezi 3',
      price: 3000,
      label: language === 'en' ? '3,000 RWF / 3 months' : '3,000 RWF / mezi 3',
      popular: true,
    },
    {
      id: '12_months',
      name: language === 'en' ? '12 Months' : 'Amezi 12',
      price: 10000,
      label: language === 'en' ? '10,000 RWF / year' : '10,000 RWF / mwaka',
    },
  ];

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
      
      setSuccessMsg(t.pharmacyDashboard.subscription.pending.success);
      setSelectedPlan(null);
    } catch (error: any) {
      console.error('Submit intent error:', error);
      setErrorMsg(error.message || t.registerPharmacy.errors.generic);
    } finally {
      setIsSubmittingIntent(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile || !pendingRequest) {
      setErrorMsg(t.pharmacyDashboard.subscription.payment.errors.selectScreenshot);
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
      setSuccessMsg(t.pharmacyDashboard.subscription.pending.success);
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
      setErrorMsg(t.pharmacyDashboard.subscription.payment.errors.uploadFailed);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingRequest || !confirm(t.pharmacyDashboard.subscription.payment.errors.cancelConfirm)) return;
    try {
      await deleteDoc(doc(db, 'subscription_requests', pendingRequest.id));
      setPendingRequest(null);
      setReceiptFile(null);
      setErrorMsg('');
      setSuccessMsg('');
    } catch (err) {
      console.error("Failed to delete request", err);
      alert(t.pharmacyDashboard.subscription.payment.errors.cancelFailed);
    }
  };

  if (pharmacyLoading || checkingPending) {
    return <LoadingScreen text={language === 'en' ? "Loading subscription details..." : "Ibijyanye n'ifatabuguzi birategurwa..."} />;
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
  const statusLabel = isActive ? t.pharmacyDashboard.subscription.status.active : t.pharmacyDashboard.subscription.status.expired;
  const endsOn = subEndDate ? subEndDate.toLocaleDateString() : 'N/A';

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">{t.pharmacyDashboard.subscription.title}</h1>

        {/* Current Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8 shadow-sm overflow-hidden relative">
          <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 ${isActive ? 'bg-teal-600' : 'bg-red-600'}`}></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{t.pharmacyDashboard.subscription.status.title}</h2>
                <span className={`px-4 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${
                  isActive ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'
                }`}>
                  {statusLabel}
                </span>
              </div>
              {!isActive && (
                <p className="text-red-600 text-sm font-bold flex items-center gap-1.5 animate-pulse">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {t.pharmacyDashboard.subscription.status.expiredMsg}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t.pharmacyDashboard.subscription.status.validUntil}</p>
                  <p className="text-xl font-bold text-gray-900">{endsOn}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Request Banner */}
        {pendingRequest ? (
          <div className="bg-white rounded-2xl border-2 border-blue-50 shadow-sm overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-600 px-6 py-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-lg font-bold text-white">{t.pharmacyDashboard.subscription.pending.title}</h3>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-gray-700 mb-8 text-lg">
                {t.pharmacyDashboard.subscription.pending.msg.replace('{amount}', pendingRequest.amount.toLocaleString())}
              </p>

              {/* Step 2: Upload Receipt */}
              {!pendingRequest.receiptUrl ? (
                <div className="bg-blue-50/50 rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-inner">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                    {t.pharmacyDashboard.subscription.pending.step2}
                  </h4>
                  <p className="text-sm text-gray-600 mb-6 font-medium">{t.pharmacyDashboard.subscription.pending.step2Msg}</p>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex-1">
                      <label className="block w-full">
                        <span className="sr-only">{language === 'en' ? "Choose screenshot" : "Hitamo ifoto"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2.5 file:px-4
                            file:rounded-xl file:border-0
                            file:text-sm file:font-bold
                            file:bg-blue-600 file:text-white
                            hover:file:bg-blue-700 cursor-pointer transition-all"
                        />
                      </label>
                    </div>
                    <button
                      onClick={handleUploadReceipt}
                      disabled={isUploading || !receiptFile}
                      className="bg-teal-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                    >
                      {isUploading ? t.pharmacyDashboard.subscription.pending.uploading : t.pharmacyDashboard.subscription.pending.uploadButton}
                    </button>
                  </div>
                  {errorMsg && <p className="text-red-600 text-sm mt-4 font-bold">{errorMsg}</p>}
                </div>
              ) : (
                <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100 flex items-center gap-4 shadow-inner">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{t.pharmacyDashboard.subscription.pending.success}</p>
                    <p className="text-gray-600 font-medium">{t.pharmacyDashboard.subscription.pending.approvalPending}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleCancelRequest}
                  className="text-red-600 hover:text-red-700 text-sm font-bold flex items-center gap-2 transition-colors px-4 py-2 hover:bg-red-50 rounded-xl"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t.pharmacyDashboard.subscription.pending.cancelButton}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* Pricing Plans */}
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
              {t.pharmacyDashboard.subscription.plans.title}
            </h2>
            {errorMsg && <p className="text-red-600 text-sm font-bold mb-6 bg-red-50 p-4 rounded-xl border border-red-100">{errorMsg}</p>}
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`group cursor-pointer bg-white rounded-2xl border-2 p-6 sm:p-8 relative transition-all duration-300 ${
                    selectedPlan?.id === plan.id
                      ? 'border-teal-600 shadow-xl scale-105 z-10 bg-teal-50/20'
                      : plan.popular
                      ? 'border-blue-100 hover:border-blue-300 hover:shadow-lg'
                      : 'border-gray-100 hover:border-teal-200 hover:shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                        {t.pharmacyDashboard.subscription.plans.bestValue}
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-black text-gray-900 mb-4 group-hover:text-teal-600 transition-colors uppercase tracking-widest">{plan.name}</h3>
                    <div className="text-3xl font-black text-teal-600 mb-1">{plan.price.toLocaleString()} RWF</div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.pharmacyDashboard.subscription.plans.totalAmount}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Section */}
            {selectedPlan && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-teal-600"></div>
                <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  {t.pharmacyDashboard.subscription.payment.title}
                </h2>
                
                <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl mb-10 border border-gray-100 shadow-inner">
                  <p className="text-sm font-black text-teal-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {t.pharmacyDashboard.subscription.payment.step1}
                  </p>
                  <p className="text-gray-700 mb-6 font-bold text-lg">{t.pharmacyDashboard.subscription.payment.instruction}</p>
                  <div className="bg-white px-8 py-6 border-2 border-dashed border-teal-200 rounded-2xl inline-block font-mono text-2xl sm:text-4xl text-teal-700 font-black mb-6 shadow-sm tracking-tighter">
                    *182*8*1*38220*{selectedPlan.price}#
                  </div>
                  <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 flex items-start gap-3">
                    <svg className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm text-gray-600 font-bold leading-relaxed">
                      {t.pharmacyDashboard.subscription.payment.confirmation.replace('{amount}', selectedPlan.price.toLocaleString())}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSubmitIntent}
                  disabled={isSubmittingIntent}
                  className="w-full bg-teal-600 text-white font-black py-5 px-6 rounded-2xl hover:bg-teal-700 transition-all disabled:opacity-50 text-xl shadow-lg hover:shadow-2xl active:scale-[0.98]"
                >
                  {isSubmittingIntent ? t.pharmacyDashboard.subscription.payment.sending : t.pharmacyDashboard.subscription.payment.paidButton}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
