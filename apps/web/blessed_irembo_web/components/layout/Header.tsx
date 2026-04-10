'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

/**
 * Header Component
 *
 * Shows Login + Get Started buttons for guests.
 * Shows a user avatar with a profile dropdown for authenticated users.
 * Find Pharmacies link goes to /pharmacies when logged in, /login when not.
 */
export default function Header() {
  const { currentUser, signOut } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    router.replace('/');
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const email = currentUser?.email || '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Where "Find Pharmacies" links to depends on auth state
  const pharmaciesHref = currentUser ? '/pharmacies' : '/login';

  return (
    <header className="bg-white border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo1.png"
                alt="Blessed Irembo"
                width={80}
                height={80}
                priority
                className="object-contain"
              />
              <span className="text-xl font-bold text-gray-900">Blessed Irembo</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
              Home
            </Link>
            <Link
              href={pharmaciesHref}
              className="text-gray-700 font-medium hover:text-teal-600 transition-colors"
            >
              Find Pharmacies
            </Link>
          </div>

          {/* Right side — auth-aware */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              /* ── Logged-in: show avatar + dropdown ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  id="header-user-menu"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 focus:outline-none group"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-teal-200 group-hover:ring-teal-400 transition-all">
                    {currentUser.photoURL ? (
                      <Image
                        src={currentUser.photoURL}
                        alt={displayName}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  {/* Name */}
                  <span className="text-sm font-medium text-gray-900 max-w-[120px] truncate">
                    {displayName}
                  </span>
                  {/* Chevron */}
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {/* User info header */}
                    <div className="bg-teal-600 px-4 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-800 flex items-center justify-center text-white text-lg font-bold shrink-0">
                        {currentUser.photoURL ? (
                          <Image
                            src={currentUser.photoURL}
                            alt={displayName}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate uppercase">{displayName}</p>
                        <p className="text-teal-100 text-xs truncate">{email}</p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <Link
                        href="/pharmacies"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Find Pharmacies
                      </Link>

                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Guest: show Login + Get Started ── */
              <>
                <Link
                  href="/login"
                  className="text-gray-700 font-medium hover:text-teal-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/get-started"
                  className="bg-teal-600 text-white px-6 py-2 rounded-md font-medium hover:bg-teal-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
