'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
