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

export default function SettingsPage() {
    const { loading } = useRequireAuth();
    const { currentUser, signOut } = useAuth();
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

    const handleSignOut = async () => {
        await signOut();
        router.replace('/');
    };

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
            setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
        } catch {
            setProfileMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (!currentUser?.email) return;
        setPasswordLoading(true);

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            switch (error.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setPasswordMessage({ type: 'error', text: 'Current password is incorrect.' });
                    break;
                case 'auth/too-many-requests':
                    setPasswordMessage({ type: 'error', text: 'Too many attempts. Please try again later.' });
                    break;
                default:
                    setPasswordMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
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
                    setDeleteError('Password is incorrect.');
                    break;
                case 'auth/too-many-requests':
                    setDeleteError('Too many attempts. Please try again later.');
                    break;
                default:
                    setDeleteError('Something went wrong. Please try again.');
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
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Non-clickable logo */}
                        <div className="flex items-center gap-2 cursor-default">
                            <Image src="/logo1.png" alt="Blessed Irembo" width={40} height={40} className="object-contain" />
                            <span className="text-lg font-semibold text-gray-900">Blessed Irembo</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/pharmacies" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
                                Find Pharmacies
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

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
                    Back to Pharmacies
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h1>

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
                                <h2 className="font-semibold text-gray-900">Profile Information</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Update your name and phone number</p>
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
                                    Full Name
                                </label>
                                <input
                                    id="profile-name"
                                    type="text"
                                    value={profileFullName}
                                    onChange={(e) => setProfileFullName(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Phone Number
                                </label>
                                <input
                                    id="profile-phone"
                                    type="tel"
                                    value={profilePhone}
                                    onChange={(e) => setProfilePhone(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder="+250 7XX XXX XXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                    Email Address
                                </label>
                                <p className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
                                    {currentUser?.email ?? '—'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="w-full py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {profileLoading ? 'Saving...' : 'Save Profile'}
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
                                <h2 className="font-semibold text-gray-900">Change Password</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Update your account password</p>
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
                                    Current Password
                                </label>
                                <input
                                    id="current-password"
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    New Password
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder="At least 6 characters"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                    placeholder="Repeat new password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="w-full py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
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
                                <h2 className="font-semibold text-red-600">Delete Account</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Permanently remove your account and all data</p>
                            </div>
                        </div>

                        <div className="px-6 py-5">
                            {!showDeleteConfirm ? (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Once deleted, your account cannot be recovered.
                                    </p>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="ml-4 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shrink-0"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleDeleteAccount} className="space-y-4">
                                    <p className="text-sm text-gray-700 font-medium">
                                        Please enter your password to confirm account deletion.
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
                                        placeholder="Enter your password"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); setDeletePassword(''); }}
                                            className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={deleteLoading}
                                            className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
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
