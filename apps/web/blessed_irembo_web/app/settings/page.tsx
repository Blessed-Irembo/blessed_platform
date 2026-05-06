'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useRequireAuth } from '@/lib/authHooks';
import {
    updatePassword,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/lib/LanguageContext';
import Header from '@/components/layout/Header';

export default function SettingsPage() {
    const { t } = useLanguage();
    const { loading } = useRequireAuth();
    const { currentUser } = useAuth();
    const router = useRouter();

    // ─── Profile state ─────────────────────────────────────────────────────────
    const [profileFullName, setProfileFullName] = useState('');
    const [profilePhone, setProfilePhone] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // ─── Password state ─────────────────────────────────────────────────────────
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // ─── Delete account state ──────────────────────────────────────────────────
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // ─── Preferences state (UI only for now) ──────────────────────────────────
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [dataSharing, setDataSharing] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // ─── Load user profile from Firestore ─────────────────────────────────────
    useEffect(() => {
        async function loadProfile() {
            if (!currentUser) return;
            try {
                const snap = await getDoc(doc(db, 'users', currentUser.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    setProfileFullName(data.fullName ?? currentUser.displayName ?? '');
                    setProfilePhone(data.phoneNumber ?? '');
                }
            } catch { }
        }
        loadProfile();
    }, [currentUser]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setProfileMessage(null);
        setProfileLoading(true);
        try {
            // Update Firestore
            await updateDoc(doc(db, 'users', currentUser.uid), {
                fullName: profileFullName.trim(),
                phoneNumber: profilePhone.trim(),
            });
            // Update Firebase Auth display name
            await updateProfile(currentUser, { displayName: profileFullName.trim() });
            setProfileMessage({ type: 'success', text: t.settings.profile.success });
        } catch {
            setProfileMessage({ type: 'error', text: t.settings.profile.error });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: t.settings.password.errorMinLength });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: t.settings.password.errorMismatch });
            return;
        }
        if (!currentUser?.email) return;
        setPasswordLoading(true);

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            setPasswordMessage({ type: 'success', text: t.settings.password.success });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            switch (error.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setPasswordMessage({ type: 'error', text: t.settings.password.errorIncorrect });
                    break;
                case 'auth/too-many-requests':
                    setPasswordMessage({ type: 'error', text: t.login.errors.tooManyRequests });
                    break;
                default:
                    setPasswordMessage({ type: 'error', text: t.settings.password.errorGeneric });
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeleteError(null);
        if (!currentUser?.email) return;
        setDeleteLoading(true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
            await reauthenticateWithCredential(currentUser, credential);
            // Delete Firestore user doc first
            await deleteDoc(doc(db, 'users', currentUser.uid));
            // Then delete Firebase Auth account
            await deleteUser(currentUser);
            router.replace('/');
        } catch (error: any) {
            switch (error.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setDeleteError(t.settings.delete.errorIncorrect);
                    break;
                case 'auth/too-many-requests':
                    setDeleteError(t.login.errors.tooManyRequests);
                    break;
                default:
                    setDeleteError(t.settings.delete.errorGeneric);
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-12">
                {/* Back link */}
                <Link
                    href="/pharmacies"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    {t.profile.backToPharmacies}
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-8">{t.settings.title}</h1>

                <div className="space-y-6">

                    {/* ── Update Profile ────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">{t.settings.profile.title}</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{t.settings.profile.subtitle}</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="px-6 py-6 space-y-4">
                            {profileMessage && (
                                <div className={`px-4 py-3 rounded-lg text-sm ${profileMessage.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {profileMessage.text}
                                </div>
                            )}

                            <div>
                                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t.settings.profile.fullName}
                                </label>
                                <input
                                    id="profile-name"
                                    type="text"
                                    value={profileFullName}
                                    onChange={(e) => setProfileFullName(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder={t.settings.profile.fullNamePlaceholder}
                                />
                            </div>

                            <div>
                                <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t.settings.profile.phone}
                                </label>
                                <input
                                    id="profile-phone"
                                    type="tel"
                                    value={profilePhone}
                                    onChange={(e) => setProfilePhone(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder={t.settings.profile.phonePlaceholder}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                    {t.settings.profile.email}
                                </label>
                                <p className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
                                    {currentUser?.email ?? '—'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{t.settings.profile.emailLocked}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="w-full py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {profileLoading ? t.settings.profile.saving : t.settings.profile.save}
                            </button>
                        </form>
                    </div>

                    {/* ── Change Password ──────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">{t.settings.password.title}</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{t.settings.password.subtitle}</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="px-6 py-6 space-y-4">
                            {passwordMessage && (
                                <div className={`px-4 py-3 rounded-lg text-sm ${passwordMessage.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {passwordMessage.text}
                                </div>
                            )}

                            <div>
                                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t.settings.password.current}
                                </label>
                                <input
                                    id="current-password"
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder={t.settings.password.currentPlaceholder}
                                />
                            </div>

                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t.settings.password.new}
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder={t.settings.password.newPlaceholder}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t.settings.password.confirm}
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder={t.settings.password.confirmPlaceholder}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="w-full py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {passwordLoading ? t.settings.password.updating : t.settings.password.update}
                            </button>
                        </form>
                    </div>

                    {/* ── Notification Settings ──────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">{t.settings.notifications.title}</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{t.settings.notifications.subtitle}</p>
                            </div>
                        </div>
                        <div className="px-6 py-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{t.settings.notifications.push}</p>
                                    <p className="text-xs text-gray-500">{t.settings.notifications.pushDesc}</p>
                                </div>
                                <button 
                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-teal-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{t.settings.notifications.email}</p>
                                    <p className="text-xs text-gray-500">{t.settings.notifications.emailDesc}</p>
                                </div>
                                <button 
                                    onClick={() => setEmailAlerts(!emailAlerts)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailAlerts ? 'bg-teal-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Location & Privacy ──────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">{t.settings.privacy.title}</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{t.settings.privacy.subtitle}</p>
                            </div>
                        </div>
                        <div className="px-6 py-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{t.settings.privacy.location}</p>
                                    <p className="text-xs text-gray-500">{t.settings.privacy.locationDesc}</p>
                                </div>
                                <button 
                                    onClick={() => setLocationEnabled(!locationEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${locationEnabled ? 'bg-teal-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${locationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{t.settings.privacy.analytics}</p>
                                    <p className="text-xs text-gray-500">{t.settings.privacy.analyticsDesc}</p>
                                </div>
                                <button 
                                    onClick={() => setDataSharing(!dataSharing)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dataSharing ? 'bg-teal-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dataSharing ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Appearance Settings ──────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">{t.settings.appearance.title}</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{t.settings.appearance.subtitle}</p>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{t.settings.appearance.darkMode}</p>
                                    <p className="text-xs text-gray-500">{t.settings.appearance.darkModeDesc}</p>
                                </div>
                                <button 
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-teal-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Danger Zone — Delete Account ─────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-red-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-semibold text-red-600">{t.settings.delete.title}</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{t.settings.delete.subtitle}</p>
                            </div>
                        </div>

                        <div className="px-6 py-5">
                            {!showDeleteConfirm ? (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        {t.settings.delete.warning}
                                    </p>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="ml-4 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shrink-0"
                                    >
                                        {t.settings.delete.button}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleDeleteAccount} className="space-y-4">
                                    <p className="text-sm text-gray-700 font-medium">
                                        {t.settings.delete.confirmPrompt}
                                    </p>
                                    {deleteError && (
                                        <div className="px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                                            {deleteError}
                                        </div>
                                    )}
                                    <input
                                        type="password"
                                        required
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-red-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
                                        placeholder={t.settings.delete.passwordPlaceholder}
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); setDeletePassword(''); }}
                                            className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {t.settings.delete.cancel}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={deleteLoading}
                                            className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {deleteLoading ? t.settings.delete.deleting : t.settings.delete.confirm}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

