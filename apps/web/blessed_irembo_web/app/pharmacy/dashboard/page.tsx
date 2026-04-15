'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { useRequireAuth } from '@/lib/authHooks';
import { usePharmacyData } from '@/lib/usePharmacyData';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function PharmacyDashboard() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const { currentUser, signOut } = useAuth();
  const { pharmacy, loading: pharmacyLoading } = usePharmacyData();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (authLoading || pharmacyLoading) {
    return <LoadingScreen text="Loading dashboard…" />;
  }

  const displayName = pharmacy?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Pharmacy';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = pharmacy?.createdAt ? new Date(pharmacy.createdAt.toDate()).toLocaleDateString() : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image src="/logo1.png" alt="Blessed Irembo" width={40} height={40} className="shrink-0" />
              <span className="text-teal-600 font-semibold text-sm sm:text-base">My Pharmacy</span>
            </div>

            {/* Avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="pharmacy-menu-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 focus:outline-none group"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-teal-200 group-hover:ring-teal-400 transition-all">
                  {initials}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-900 max-w-[150px] truncate">
                  {displayName}
                </span>
                <svg
                  className={`hidden md:block w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden" role="menu">
                  <div className="bg-teal-600 px-4 py-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-800 flex items-center justify-center text-white text-lg font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{displayName}</p>
                      <p className="text-teal-200 text-xs truncate">{currentUser?.email}</p>
                      <span className="inline-block mt-1 text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full">Pharmacy</span>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link href="/pharmacy/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link href="/pharmacy/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => { setDropdownOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body: sidebar (desktop) + main content ─────────────────── */}
      <div className="flex">

        {/* Sidebar — hidden on mobile, visible on md+ */}
        <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 min-h-screen shrink-0">
          <div className="p-6">
            <nav className="space-y-2">
              <Link href="/pharmacy/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-600 text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
                <span className="font-medium">Overview</span>
              </Link>
              <Link href="/pharmacy/subscription" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
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

        {/* ── Main Content ─────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-4xl">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{pharmacy?.name || 'My Pharmacy'}</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your pharmacy profile and subscriptions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* WhatsApp Clicks */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-600 font-medium text-sm">WhatsApp Clicks</h3>
                  <div className="w-10 h-10 bg-[#dcfce7] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#16a34a]" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M2.004 22l1.352-4.968A9.992 9.992 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.989 9.989 0 01-5.02-1.341L2.004 22zm10-18.3A8.309 8.309 0 003.7 12c0 1.458.375 2.874 1.085 4.108l-.87 3.2 3.275-.86A8.286 8.309 0 0012 20.3c4.586 0 8.3-3.714 8.3-8.3S16.586 3.7 12 3.7zm4.27 11.517c-.234-.117-1.385-.685-1.599-.763-.214-.078-.37-.117-.526.117-.156.234-.606.763-.742.92-.136.156-.273.175-.507.058-.234-.117-.988-.363-1.882-1.026-.694-.515-1.163-1.15-1.3-1.384-.136-.234-.015-.36.102-.477.105-.105.234-.273.351-.409.117-.136.156-.234.234-.39.078-.156.039-.293-.02-.409-.058-.117-.526-1.27-.721-1.74-.191-.46-.386-.398-.526-.405-.136-.007-.292-.007-.448-.007s-.409.058-.624.293c-.214.234-.818.8-.818 1.95s.838 2.264.954 2.42c.117.156 1.652 2.52 3.998 3.513 1.956.826 2.535.79 3.003.738.537-.06 1.385-.566 1.58-1.112.195-.546.195-1.015.136-1.112-.058-.098-.214-.156-.448-.273z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900">{pharmacy?.whatsappClicks || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Platform redirections</p>
              </div>

              {/* Subscription Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-600 font-medium text-sm">Subscription Status</h3>
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <span className="inline-block bg-teal-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-2">active</span>
                <p className="text-lg font-semibold text-gray-700">{pharmacy?.subscriptionPlan ?? 'Free'}</p>
              </div>
            </div>

            {/* Pharmacy Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">Pharmacy Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">Address</p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">{pharmacy?.address || '—'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">Phone</p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">{pharmacy?.phoneNumber || pharmacy?.phone || '—'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">Email</p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base break-all">{pharmacy?.email || currentUser?.email || '—'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">Member Since</p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">{memberSince}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Bottom Navigation Bar — mobile only ────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-4 h-16">
          <Link href="/pharmacy/dashboard" className="flex flex-col items-center justify-center gap-1 text-teal-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
            <span className="text-xs font-medium">Overview</span>
          </Link>
          <Link href="/pharmacy/subscription" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-teal-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xs font-medium">Subscription</span>
          </Link>
          <Link href="/pharmacy/profile" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-teal-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </Link>
          <Link href="/pharmacy/settings" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-teal-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}
