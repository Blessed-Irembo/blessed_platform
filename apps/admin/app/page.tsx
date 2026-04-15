'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
    
    if (adminUser) {
      // Already logged in, go to dashboard
      router.push('/dashboard');
    } else {
      // Not logged in, go to login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="fixed inset-0 min-h-screen bg-white flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-24 h-24 animate-bounce">
          <Image
            src="/logo1.png"
            alt="Blessed Irembo Admin"
            fill
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
        <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading workspace…
        </div>
      </div>
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-gray-400 tracking-widest uppercase">
          Powered by <span className="text-teal-700 font-bold">Orahcast</span>
        </p>
      </div>
    </div>
  );
}
