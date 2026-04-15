'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/AdminAuthContext';

export default function Header() {
  const router = useRouter();
  const { signOut } = useAdminAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo1.png"
                alt="Blessed Irembo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-lg font-semibold text-gray-900">Blessed Irembo</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-teal-600 font-medium">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden sm:flex bg-teal-50 text-teal-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium items-center gap-2 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Admin
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-700 font-medium hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
