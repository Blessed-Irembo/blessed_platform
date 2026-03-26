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

  const DAYS_OF_WEEK = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Populate hoursData when pharmacy loads
  useEffect(() => {
    if (pharmacy && pharmacy.operatingHours) {
      setHoursData({
        is24Hours: pharmacy.operatingHours.is24Hours || false,
        days: pharmacy.operatingHours.days || [],
        openTime: pharmacy.operatingHours.openTime || '',
        closeTime: pharmacy.operatingHours.closeTime || ''
      });
    }
  }, [pharmacy]);

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <Link href="/">
                <Image src="/logo1.png" alt="Blessed Irembo" width={50} height={50} />
              </Link>
              <nav className="flex gap-8">
                <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
                  Home
                </Link>
                <Link href="/find-pharmacies" className="text-gray-700 hover:text-gray-900 font-medium">
                  Find Pharmacies
                </Link>
                <Link href="/pharmacy/dashboard" className="text-teal-600 font-semibold">
                  Dashboard
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-lg">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-teal-600 font-medium">Pharmacy</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
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
          <div className="p-8">
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

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
            </div>

            <div className="flex gap-8">
              {/* Settings Sidebar */}
              <div className="w-64">
                <nav className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'account'
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
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'notifications'
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="font-medium">Notifications</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('privacy')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'privacy'
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="font-medium">Privacy</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('general')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'general'
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">General</span>
                  </button>

                  <div className="border-t border-gray-200 my-4"></div>

                  <button
                    onClick={() => setActiveTab('help')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'help'
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Help & Support</span>
                  </button>

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
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                    hoursData.days.includes(day)
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
                
                {activeTab !== 'account' && activeTab !== 'general' && (
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
    </div>
  );
}
