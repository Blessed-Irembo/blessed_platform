'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useRequireAuth } from '@/lib/authHooks';
import { usePharmacyData } from '@/lib/usePharmacyData';

export default function ProfilePage() {
  const { loading } = useRequireAuth();
  const { currentUser, signOut } = useAuth();
  const { pharmacy, loading: pharmacyLoading } = usePharmacyData();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  // Prefer pharmacy name from Firestore; fall back to Firebase Auth display name
  const displayName = pharmacy?.name || pharmacy?.ownerName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const email = currentUser?.email || 'No email on record';
  // phoneNumber is stored in Firestore 'pharmacies/{uid}' — NOT on Firebase Auth
  const phone = pharmacy?.phoneNumber || 'Not provided';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (loading || pharmacyLoading) {
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
        {/* Back Link */}
        <Link
          href="/pharmacies"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pharmacies
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Card Header — avatar + name */}
          <div className="bg-teal-600 px-8 py-8 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-teal-800 flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold uppercase">{displayName}</h1>
              <p className="text-teal-100 text-sm mt-1">{email}</p>
            </div>
          </div>

          {/* Fields */}
          <div className="px-8 py-8 space-y-6">
            {/* Full Name */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Full Name</p>
                <p className="text-gray-900 font-medium">{displayName}</p>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Email Address</p>
                <p className="text-gray-900 font-medium">{email}</p>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Phone Number</p>
                <p className={`font-medium ${phone === 'Not provided' ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                  {phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
