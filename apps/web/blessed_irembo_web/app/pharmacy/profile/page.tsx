'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { useRequireAuth } from '@/lib/authHooks';
import { usePharmacyData } from '@/lib/usePharmacyData';

export default function PharmacyProfilePage() {
  const { loading } = useRequireAuth();
  const { currentUser, signOut } = useAuth();
  const { pharmacy, loading: pharmacyLoading } = usePharmacyData();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const pharmacyName = pharmacy?.name || currentUser?.displayName || '—';
  const email = pharmacy?.email || currentUser?.email || '—';
  const phone = pharmacy?.phone || pharmacy?.phoneNumber || '';
  const initials = pharmacyName
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
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Non-clickable logo */}
            <div className="flex items-center gap-12">
              <div className="flex items-center cursor-default">
                <Image src="/logo1.png" alt="Blessed Irembo" width={50} height={50} />
              </div>
              <nav className="flex gap-8">
                <Link href="/pharmacy/dashboard" className="text-teal-600 font-semibold">
                  My Pharmacy
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
                onClick={handleSignOut}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          href="/pharmacy/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="bg-teal-600 px-8 py-8 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-teal-800 flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">{pharmacyName}</h1>
              <p className="text-teal-100 text-sm mt-1">{email}</p>
              {phone && (
                <p className="text-teal-200 text-sm mt-0.5 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {phone}
                </p>
              )}
            </div>
          </div>

          {/* Detail Rows */}
          <div className="px-8 py-8 space-y-6">

            {/* Pharmacy Name */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Pharmacy Name</p>
                <p className="text-gray-900 font-medium">{pharmacyName}</p>
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
                <p className={`font-medium ${phone ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                  {phone || 'Not provided'}
                </p>
              </div>
            </div>

            {pharmacy?.address && (
              <>
                <div className="border-t border-gray-100" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Address</p>
                    <p className="text-gray-900 font-medium">{pharmacy.address}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
            <Link
              href="/pharmacy/settings"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
