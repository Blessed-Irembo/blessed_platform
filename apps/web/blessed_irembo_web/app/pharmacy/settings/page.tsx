'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { useRequireAuth } from '@/lib/authHooks';
import { usePharmacyData } from '@/lib/usePharmacyData';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export default function PharmacySettings() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const { currentUser, signOut } = useAuth();
  const { pharmacy, loading: pharmacyLoading } = usePharmacyData();

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

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

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
      return setPasswordError('New passwords do not match.');
    }
    if (formData.newPassword.length < 6) {
      return setPasswordError('Password must be at least 6 characters.');
    }
    if (!currentUser?.email) return;

    setIsUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, formData.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, formData.newPassword);
      setPasswordSuccess('Password successfully updated!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setPasswordError('Incorrect current password.');
      } else {
        setPasswordError('Failed to update password. Please try again.');
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
      return setHoursError('Please fill out all operating hours fields or select 24/7.');
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
      setHoursSuccess('Operating hours updated successfully!');
      setTimeout(() => setHoursSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setHoursError('Failed to update operating hours.');
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
      return setLocationError('Address cannot be empty.');
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
      
      setLocationSuccess('Location and map coordinates updated successfully!');
      setTimeout(() => setLocationSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setLocationError('Failed to update location.');
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
    if (!deletePassword) return setDeleteError('Please enter your password to confirm.');
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

      router.replace('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setDeleteError('Incorrect password.');
      } else {
        setDeleteError('Failed to delete account. Please try again.');
      }
      setIsDeleting(false);
    }
  };

  if (authLoading || pharmacyLoading) {
    return <LoadingScreen text="Loading settings…" />;
  }

  // Redirect if subscription is expired
  if (pharmacy) {
    const now = new Date();
    let isExpired = false;
    
    if (pharmacy.subscriptionEndDate) {
      isExpired = pharmacy.subscriptionEndDate.toDate() < now;
    } else if (pharmacy.createdAt) {
      // Fallback for older pharmacies: 90 days from createdAt
      const trialEnd = new Date(pharmacy.createdAt.toDate());
      trialEnd.setDate(trialEnd.getDate() + 90);
      isExpired = trialEnd < now;
    } else {
      isExpired = true;
    }

    if (isExpired) {
      router.replace('/pharmacy/subscription');
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-lg">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-teal-600 font-medium text-sm">Pharmacy</span>
              </div>
              <button onClick={handleLogout} className="text-sm px-3 py-2 text-gray-700 hover:text-gray-900 font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pb-16 md:pb-0">
        {/* Sidebar — hidden on mobile */}
        <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 min-h-screen shrink-0">
          <div className="p-6">
            {/* Main Navigation */}
            <nav className="space-y-2">
              <Link
                href="/pharmacy/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
                <span className="font-medium">Overview</span>
              </Link>



              <Link
                href="/pharmacy/subscription"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-medium">Subscription</span>
              </Link>
            </nav>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200"></div>

            {/* Profile & Settings */}
            <nav className="space-y-2">
              <Link
                href="/pharmacy/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Profile</span>
              </Link>

              <Link
                href="/pharmacy/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-600 text-white transition-colors"
              >
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
        <main className="flex-1">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link
                href="/pharmacy/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
            </div>

            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account preferences and settings</p>
            </div>

            {/* Mobile tab bar — horizontal scrollable */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 md:hidden">
              <button
                onClick={() => setActiveTab('account')}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'account' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              >
                Working Hours
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'location' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              >
                Location & Address
              </button>
            </div>

            <div className="flex gap-6 md:gap-8">
              {/* Settings Sidebar — hidden on mobile */}
              <div className="hidden md:block w-56 shrink-0">
                <nav className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'account'
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium">Account</span>
                </button>

                <button
                  onClick={() => setActiveTab('general')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'general'
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Working Hours</span>
                </button>

                <button
                  onClick={() => setActiveTab('location')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'location'
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">Location</span>
                </button>

                <div className="border-t border-gray-200 my-4"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1 space-y-6">
                {activeTab === 'account' && (
                  <>
                    {/* Change Password */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                      {passwordSuccess && (
                        <div className="p-4 mb-6 bg-green-50 text-green-700 rounded-lg border border-green-200">{passwordSuccess}</div>
                      )}
                      {passwordError && (
                        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg border border-red-200">{passwordError}</div>
                      )}
                      <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-2xl">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              id="currentPassword"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              id="newPassword"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:opacity-50"
                        >
                          {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
                      <p className="text-gray-600 mb-6">Add an extra layer of security to your account</p>
                      <button
                        onClick={() => alert('2FA setup will be implemented')}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Enable 2FA
                      </button>
                    </div>

                    {/* Delete Account */}
                    <div className="bg-white rounded-xl border-2 border-red-200 p-6">
                      <h2 className="text-xl font-bold text-red-600 mb-2">Delete Account</h2>
                      <p className="text-gray-600 mb-6">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>

                      {!showDeletePrompt ? (
                        <button
                          onClick={() => setShowDeletePrompt(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Account
                        </button>
                      ) : (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 max-w-2xl">
                          <p className="text-red-800 font-semibold mb-4">Please confirm your current password to delete your account.</p>

                          {deleteError && (
                            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">{deleteError}</div>
                          )}

                          <input
                            type="password"
                            placeholder="Current Password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                            >
                              {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                            </button>
                            <button
                              onClick={() => { setShowDeletePrompt(false); setDeletePassword(''); setDeleteError(''); }}
                              disabled={isDeleting}
                              className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === 'general' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Working Hours</h2>
                    {hoursSuccess && (
                      <div className="p-4 mb-6 bg-green-50 text-green-700 rounded-lg border border-green-200">{hoursSuccess}</div>
                    )}
                    {hoursError && (
                      <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg border border-red-200">{hoursError}</div>
                    )}

                    <form onSubmit={handleUpdateHours} className="space-y-6 max-w-2xl">
                      {/* Checkbox for 24/7 */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="is24Hours"
                          checked={hoursData.is24Hours}
                          onChange={(e) => setHoursData({ ...hoursData, is24Hours: e.target.checked })}
                          className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <label htmlFor="is24Hours" className="font-semibold text-gray-700">Open 24/7</label>
                      </div>

                      {!hoursData.is24Hours && (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">Operating Days</label>
                            <div className="flex flex-wrap gap-2">
                              {DAYS_OF_WEEK.map((day) => (
                                <button
                                  type="button"
                                  key={day}
                                  onClick={() => toggleDay(day)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${hoursData.days.includes(day)
                                      ? 'bg-teal-600 text-white border-teal-600'
                                      : 'bg-white text-gray-600 border-gray-300 hover:border-teal-600 hover:text-teal-600'
                                    }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Opening Time</label>
                              <input
                                type="time"
                                value={hoursData.openTime}
                                onChange={(e) => setHoursData({ ...hoursData, openTime: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Closing Time</label>
                              <input
                                type="time"
                                value={hoursData.closeTime}
                                onChange={(e) => setHoursData({ ...hoursData, closeTime: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isUpdatingHours}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:opacity-50"
                      >
                        {isUpdatingHours ? 'Saving...' : 'Save Working Hours'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Location & Address</h2>
                    {locationSuccess && (
                      <div className="p-4 mb-6 bg-green-50 text-green-700 rounded-lg border border-green-200">{locationSuccess}</div>
                    )}
                    {locationError && (
                      <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg border border-red-200">{locationError}</div>
                    )}

                    <form onSubmit={handleUpdateLocation} className="space-y-6 max-w-2xl">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pin Location
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Click on the map to set your exact location.</p>
                        <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-300 relative">
                          <APIProvider apiKey={MAPS_API_KEY}>
                            <Map
                              defaultCenter={mapLocation}
                              defaultZoom={14}
                              mapTypeControl={false}
                              streetViewControl={false}
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
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                          Pharmacy Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. KN 5 Rd, Kigali"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdatingLocation}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:opacity-50"
                      >
                        {isUpdatingLocation ? 'Saving...' : 'Save Location'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab !== 'account' && activeTab !== 'general' && activeTab !== 'location' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <p className="text-gray-500 text-lg">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings coming soon
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-4 h-16">
          <Link href="/pharmacy/dashboard" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-teal-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" /></svg>
            <span className="text-xs font-medium">Overview</span>
          </Link>
          <Link href="/pharmacy/subscription" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-teal-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            <span className="text-xs font-medium">Subscription</span>
          </Link>
          <Link href="/pharmacy/profile" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-teal-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-xs font-medium">Profile</span>
          </Link>
          <Link href="/pharmacy/settings" className="flex flex-col items-center justify-center gap-1 text-teal-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
