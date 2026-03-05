'use client';

import { useState } from 'react';
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
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SettingsPage() {
    const { loading } = useRequireAuth();
    const { currentUser, signOut } = useAuth();
    const router = useRouter();

    // Change password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Delete account state
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.replace('/login');
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
            // Re-authenticate before changing password (Firebase security requirement)
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
            // Re-authenticate before deleting (Firebase security requirement)
            const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
            await reauthenticateWithCredential(currentUser, credential);
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
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo1.png" alt="Blessed Irembo" width={40} height={40} className="object-contain" />
                            <span className="text-lg font-semibold text-gray-900">Blessed Irembo</span>
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link href="/pharmacies" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
                                Find Pharmacies
                            </Link>
                            <Link href="/pharmacy/inquiries" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
                                Inquiries
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
                                <div
                                    className={`px-4 py-3 rounded-lg text-sm ${passwordMessage.type === 'success'
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}
                                >
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

                    {/* ── Notifications (placeholder) ─────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">Notifications</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Email notifications for inquiry replies</p>
                            </div>
                        </div>
                        <div className="px-6 py-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Email me when a pharmacy replies</p>
                                <p className="text-xs text-gray-500 mt-0.5">Get notified directly to your email</p>
                            </div>
                            <span className="text-xs text-gray-400 italic">Coming soon</span>
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
