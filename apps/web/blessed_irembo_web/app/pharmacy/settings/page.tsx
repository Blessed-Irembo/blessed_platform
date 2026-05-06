'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRequireAuth } from '@/lib/authHooks';
import { usePharmacyData } from '@/lib/usePharmacyData';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ExpiredSubscriptionWall from '@/components/ui/ExpiredSubscriptionWall';
import { getSubscriptionStatus } from '@/lib/useSubscriptionStatus';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useLanguage } from '@/lib/LanguageContext';

export default function PharmacySettings() {
  const { loading: authLoading } = useRequireAuth();
  const { currentUser } = useAuth();
  const { pharmacy, loading: pharmacyLoading } = usePharmacyData();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState('account');

  // Password State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Delete State
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Working Hours State
  const [hoursData, setHoursData] = useState({
    is24Hours: false,
    days: [] as string[],
    openTime: '',
    closeTime: ''
  });
  const [isUpdatingHours, setIsUpdatingHours] = useState(false);
  const [hoursSuccess, setHoursSuccess] = useState('');
  const [hoursError, setHoursError] = useState('');

  // Location State
  const [address, setAddress] = useState('');
  const [mapLocation, setMapLocation] = useState({ lat: -1.9536, lng: 30.0605 });
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState('');
  const [locationError, setLocationError] = useState('');

  const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

  const DAYS_OF_WEEK = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const getDayLabel = (day: string) => {
    switch (day) {
      case 'Monday': return t.pharmacyDetail.days.monday;
      case 'Tuesday': return t.pharmacyDetail.days.tuesday;
      case 'Wednesday': return t.pharmacyDetail.days.wednesday;
      case 'Thursday': return t.pharmacyDetail.days.thursday;
      case 'Friday': return t.pharmacyDetail.days.friday;
      case 'Saturday': return t.pharmacyDetail.days.saturday;
      case 'Sunday': return t.pharmacyDetail.days.sunday;
      default: return day;
    }
  };

  // Populate hoursData when pharmacy loads
  useEffect(() => {
    if (pharmacy) {
      if (pharmacy.operatingHours) {
        setHoursData({
          is24Hours: pharmacy.operatingHours.is24Hours || false,
          days: pharmacy.operatingHours.days || [],
          openTime: pharmacy.operatingHours.openTime || '',
          closeTime: pharmacy.operatingHours.closeTime || ''
        });
      }
      setAddress(pharmacy.address || '');
      if (pharmacy.latitude && pharmacy.longitude) {
        setMapLocation({ lat: pharmacy.latitude, lng: pharmacy.longitude });
      }
    }
  }, [pharmacy]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      return setPasswordError(t.registerPharmacy.errors.passwordsMismatch);
    }
    if (formData.newPassword.length < 6) {
      return setPasswordError(t.registerPharmacy.errors.passwordMinLength);
    }
    if (!currentUser?.email) return;

    setIsUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, formData.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, formData.newPassword);
      setPasswordSuccess(t.pharmacyDashboard.settings.account.success);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setPasswordError(t.pharmacyDashboard.settings.location.errors.incorrectPassword);
      } else {
        setPasswordError(t.registerPharmacy.errors.generic);
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setHoursError('');
    setHoursSuccess('');

    if (!hoursData.is24Hours && (!hoursData.openTime || !hoursData.closeTime || hoursData.days.length === 0)) {
      return setHoursError(t.pharmacyDashboard.settings.location.errors.fillHours);
    }

    setIsUpdatingHours(true);
    try {
      await updateDoc(doc(db, 'pharmacies', currentUser.uid), {
        operatingHours: {
          is24Hours: hoursData.is24Hours,
          days: hoursData.is24Hours ? DAYS_OF_WEEK : hoursData.days,
          openTime: hoursData.is24Hours ? '00:00' : hoursData.openTime,
          closeTime: hoursData.is24Hours ? '23:59' : hoursData.closeTime
        }
      });
      setHoursSuccess(t.pharmacyDashboard.settings.workingHours.success);
      setTimeout(() => setHoursSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setHoursError(t.pharmacyDashboard.settings.location.errors.hoursUpdateFailed);
    } finally {
      setIsUpdatingHours(false);
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLocationError('');
    setLocationSuccess('');

    if (!address.trim()) {
      return setLocationError(t.pharmacyDashboard.settings.location.errors.addressEmpty);
    }

    setIsUpdatingLocation(true);
    try {
      let finalLat = mapLocation.lat;
      let finalLng = mapLocation.lng;
      let district = pharmacy?.district || '';

      // If the map pin hasn't been moved from 0,0, try geocoding
      if (finalLat === 0 && finalLng === 0) {
        try {
          if (MAPS_API_KEY) {
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address.trim())}&key=${MAPS_API_KEY}`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              const loc = data.results[0].geometry.location;
              finalLat = loc.lat;
              finalLng = loc.lng;
              
              const components = data.results[0].address_components;
              const districtComponent = components.find((c: any) => 
                c.types.includes('administrative_area_level_2') || 
                c.types.includes('locality')
              );
              if (districtComponent) {
                district = districtComponent.long_name;
              }
            }
          }
        } catch (geocodeErr) {
          console.error('Error geocoding address:', geocodeErr);
        }
      }

      await updateDoc(doc(db, 'pharmacies', currentUser.uid), {
        address: address.trim(),
        latitude: finalLat,
        longitude: finalLng,
        district
      });
      
      setLocationSuccess(t.pharmacyDashboard.settings.location.success);
      setTimeout(() => setLocationSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setLocationError(t.pharmacyDashboard.settings.location.errors.locationUpdateFailed);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const toggleDay = (day: string) => {
    setHoursData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return setDeleteError(t.pharmacyDashboard.settings.location.errors.deleteConfirmPassword);
    if (!currentUser?.email) return;

    setIsDeleting(true);
    setDeleteError('');
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete Firestore document
      await deleteDoc(doc(db, 'pharmacies', currentUser.uid));
      // Delete Auth user
      await deleteUser(currentUser);

      window.location.href = '/';
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setDeleteError(t.pharmacyDashboard.settings.location.errors.incorrectPassword);
      } else {
        setDeleteError(t.pharmacyDashboard.settings.location.errors.deleteAccountFailed);
      }
      setIsDeleting(false);
    }
  };

  if (authLoading || pharmacyLoading) {
    return <LoadingScreen text={language === 'en' ? "Loading settings…" : "Igenamiterere rirategurwa..."} />;
  }

  const subscriptionStatus = getSubscriptionStatus(pharmacy);
  if (subscriptionStatus.isExpired) {
    return <ExpiredSubscriptionWall statusResult={subscriptionStatus} pharmacyName={pharmacy?.name} />;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl">
        {/* Back to Dashboard Link */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/pharmacy/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.pharmacyDashboard.profile.backToDashboard}
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{t.pharmacyDashboard.settings.title}</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">{t.pharmacyDashboard.settings.subtitle}</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('account')}
            className={`shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              activeTab === 'account' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 border border-gray-100 hover:border-teal-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t.pharmacyDashboard.settings.tabs.account}
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              activeTab === 'general' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 border border-gray-100 hover:border-teal-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.pharmacyDashboard.settings.tabs.workingHours}
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              activeTab === 'location' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 border border-gray-100 hover:border-teal-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t.pharmacyDashboard.settings.tabs.location}
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'account' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Change Password Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{t.pharmacyDashboard.settings.account.changePassword}</h2>
                  {passwordSuccess && (
                    <div className="p-4 mb-6 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {passwordSuccess}
                    </div>
                  )}
                  {passwordError && (
                    <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg border border-red-200">{passwordError}</div>
                  )}
                  <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.pharmacyDashboard.settings.account.currentPassword}</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showCurrentPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.888 9.888L3 3m18 18l-6.888-6.888m4.432-4.432a9.95 9.95 0 001.454-3.68c-1.274-4.057-5.064-7-9.542-7-1.274 0-2.483.236-3.597.666" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.pharmacyDashboard.settings.account.newPassword}</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showNewPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.888 9.888L3 3m18 18l-6.888-6.888m4.432-4.432a9.95 9.95 0 001.454-3.68c-1.274-4.057-5.064-7-9.542-7-1.274 0-2.483.236-3.597.666" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.pharmacyDashboard.settings.account.confirmPassword}</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.888 9.888L3 3m18 18l-6.888-6.888m4.432-4.432a9.95 9.95 0 001.454-3.68c-1.274-4.057-5.064-7-9.542-7-1.274 0-2.483.236-3.597.666" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="w-full sm:w-auto px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none"
                    >
                      {isUpdatingPassword ? t.pharmacyDashboard.settings.account.updating : t.pharmacyDashboard.settings.account.updateButton}
                    </button>
                  </form>
                </div>
              </div>

              {/* 2FA Placeholder Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t.pharmacyDashboard.settings.account.twoFactor}</h2>
                <p className="text-gray-500 text-sm mb-6">{t.pharmacyDashboard.settings.account.twoFactorSubtitle}</p>
                <button
                  onClick={() => alert('2FA setup will be implemented')}
                  className="flex items-center gap-2 px-6 py-2.5 border-2 border-teal-100 text-teal-600 rounded-xl font-bold hover:bg-teal-50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t.pharmacyDashboard.settings.account.enable2FA}
                </button>
              </div>

              {/* Danger Zone Card */}
              <div className="bg-white rounded-2xl border-2 border-red-50 shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-bold text-red-600 mb-2">{t.pharmacyDashboard.settings.account.deleteAccount}</h2>
                <p className="text-gray-500 text-sm mb-6">{t.pharmacyDashboard.settings.account.deleteSubtitle}</p>
                
                {!showDeletePrompt ? (
                  <button
                    onClick={() => setShowDeletePrompt(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t.pharmacyDashboard.settings.account.deleteAccount}
                  </button>
                ) : (
                  <div className="bg-red-50 rounded-xl p-5 border border-red-100 max-w-2xl">
                    <p className="text-red-900 font-bold mb-4">{t.pharmacyDashboard.settings.account.confirmDelete}</p>
                    {deleteError && (
                      <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-xs font-bold">{deleteError}</div>
                    )}
                    <input
                      type="password"
                      placeholder={t.pharmacyDashboard.settings.account.currentPassword}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-red-100 rounded-xl focus:ring-2 focus:ring-red-600 outline-none mb-4 transition-all"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        {isDeleting ? (language === 'en' ? 'Deleting...' : 'Gusiba...') : t.pharmacyDashboard.settings.account.confirmButton}
                      </button>
                      <button
                        onClick={() => { setShowDeletePrompt(false); setDeletePassword(''); setDeleteError(''); }}
                        disabled={isDeleting}
                        className="px-6 py-2 bg-white text-gray-700 border border-red-200 rounded-lg font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                      >
                        {t.pharmacyDashboard.settings.account.cancelButton}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t.pharmacyDashboard.settings.workingHours.title}</h2>
                {hoursSuccess && (
                  <div className="p-4 mb-6 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {hoursSuccess}
                  </div>
                )}
                <form onSubmit={handleUpdateHours} className="space-y-8 max-w-2xl">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="is24Hours"
                        checked={hoursData.is24Hours}
                        onChange={(e) => setHoursData({ ...hoursData, is24Hours: e.target.checked })}
                        className="w-6 h-6 text-teal-600 border-gray-300 rounded-lg focus:ring-teal-500 cursor-pointer"
                      />
                    </div>
                    <label htmlFor="is24Hours" className="font-bold text-gray-900 cursor-pointer">{t.pharmacyDashboard.settings.workingHours.is24Hours}</label>
                  </div>

                  {!hoursData.is24Hours && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">{t.pharmacyDashboard.settings.workingHours.days}</label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              type="button"
                              key={day}
                              onClick={() => toggleDay(day)}
                              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                                hoursData.days.includes(day)
                                  ? 'bg-teal-600 text-white border-teal-600 shadow-md scale-105'
                                  : 'bg-white text-gray-600 border-gray-100 hover:border-teal-200 hover:text-teal-600'
                              }`}
                            >
                              {getDayLabel(day)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.pharmacyDashboard.settings.workingHours.openTime}</label>
                          <input
                            type="time"
                            value={hoursData.openTime}
                            onChange={(e) => setHoursData({ ...hoursData, openTime: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.pharmacyDashboard.settings.workingHours.closeTime}</label>
                          <input
                            type="time"
                            value={hoursData.closeTime}
                            onChange={(e) => setHoursData({ ...hoursData, closeTime: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdatingHours}
                    className="w-full sm:w-auto px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {isUpdatingHours ? t.pharmacyDashboard.settings.workingHours.saving : t.pharmacyDashboard.settings.workingHours.saveButton}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t.pharmacyDashboard.settings.location.title}</h2>
                {locationSuccess && (
                  <div className="p-4 mb-6 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {locationSuccess}
                  </div>
                )}
                <form onSubmit={handleUpdateLocation} className="space-y-8 max-w-2xl">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      {t.pharmacyDashboard.settings.location.pinLocation}
                    </label>
                    <p className="text-sm text-gray-500 mb-4">{t.pharmacyDashboard.settings.location.pinSubtitle}</p>
                    <div className="w-full h-80 rounded-2xl overflow-hidden border-2 border-gray-100 relative shadow-inner">
                      <APIProvider apiKey={MAPS_API_KEY}>
                        <Map
                          defaultCenter={mapLocation}
                          defaultZoom={14}
                          mapId="PHARMACY_SETTINGS_MAP"
                          disableDefaultUI={true}
                          zoomControl={true}
                          onClick={(e) => {
                            if (e.detail.latLng) {
                              setMapLocation({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
                            }
                          }}
                        >
                          <Marker position={mapLocation} />
                        </Map>
                      </APIProvider>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      {t.pharmacyDashboard.settings.location.address}
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t.pharmacyDashboard.settings.location.addressPlaceholder}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingLocation}
                    className="w-full sm:w-auto px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {isUpdatingLocation ? t.pharmacyDashboard.settings.location.saving : t.pharmacyDashboard.settings.location.saveButton}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
