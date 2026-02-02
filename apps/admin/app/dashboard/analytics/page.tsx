'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { getCurrentAdmin } from '@/lib/auth';

export default function AnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    const admin = getCurrentAdmin();
    if (!admin) {
      router.push('/login');
    }
  }, [router]);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
          </div>

          {/* Platform Growth Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Growth</h2>
            
            <div className="h-96">
              <svg width="100%" height="100%" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                <line x1="100" y1="50" x2="100" y2="350" stroke="#E5E7EB" strokeWidth="2"/>
                <line x1="100" y1="350" x2="950" y2="350" stroke="#E5E7EB" strokeWidth="2"/>
                
                {/* Horizontal grid lines */}
                <line x1="100" y1="50" x2="950" y2="50" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5" opacity="0.3"/>
                <line x1="100" y1="125" x2="950" y2="125" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5" opacity="0.3"/>
                <line x1="100" y1="200" x2="950" y2="200" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5" opacity="0.3"/>
                <line x1="100" y1="275" x2="950" y2="275" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5" opacity="0.3"/>
                
                {/* Y-axis labels */}
                <text x="60" y="55" fill="#6B7280" fontSize="14">160</text>
                <text x="60" y="130" fill="#6B7280" fontSize="14">120</text>
                <text x="70" y="205" fill="#6B7280" fontSize="14">80</text>
                <text x="70" y="280" fill="#6B7280" fontSize="14">40</text>
                <text x="80" y="355" fill="#6B7280" fontSize="14">0</text>
                
                {/* Months */}
                {/* Jun */}
                <rect x="150" y="290" width="80" height="60" fill="#14B8A6" opacity="0.8"/>
                <rect x="150" y="330" width="80" height="20" fill="#3B82F6" opacity="0.8"/>
                <text x="175" y="375" fill="#6B7280" fontSize="16" fontWeight="500">Jun</text>
                
                {/* Jul */}
                <rect x="280" y="215" width="80" height="135" fill="#14B8A6" opacity="0.8"/>
                <rect x="280" y="330" width="80" height="20" fill="#3B82F6" opacity="0.8"/>
                <text x="305" y="375" fill="#6B7280" fontSize="16" fontWeight="500">Jul</text>
                
                {/* Aug */}
                <rect x="410" y="175" width="80" height="175" fill="#14B8A6" opacity="0.8"/>
                <rect x="410" y="330" width="80" height="20" fill="#3B82F6" opacity="0.8"/>
                <text x="435" y="375" fill="#6B7280" fontSize="16" fontWeight="500">Aug</text>
                
                {/* Sep */}
                <rect x="540" y="125" width="80" height="225" fill="#14B8A6" opacity="0.8"/>
                <rect x="540" y="330" width="80" height="20" fill="#3B82F6" opacity="0.8"/>
                <text x="565" y="375" fill="#6B7280" fontSize="16" fontWeight="500">Sep</text>
                
                {/* Oct */}
                <rect x="670" y="75" width="80" height="275" fill="#14B8A6" opacity="0.8"/>
                <rect x="670" y="330" width="80" height="20" fill="#3B82F6" opacity="0.8"/>
                <text x="695" y="375" fill="#6B7280" fontSize="16" fontWeight="500">Oct</text>
              </svg>
            </div>
          </div>

          {/* Pharmacies by City */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pharmacies by City</h2>
            
            <div className="space-y-4">
              {/* Kigali - 4 pharmacies */}
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-700">Kigali:</div>
                <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-teal-600 flex items-center justify-end pr-4 text-white font-semibold" style={{ width: '80%' }}>
                    4
                  </div>
                </div>
              </div>
              
              {/* Huye - 1 pharmacy */}
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-700">Huye:</div>
                <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-teal-600 flex items-center justify-end pr-4 text-white font-semibold" style={{ width: '20%' }}>
                    1
                  </div>
                </div>
              </div>
              
              {/* Musanze - 1 pharmacy */}
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-700">Musanze:</div>
                <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-teal-600 flex items-center justify-end pr-4 text-white font-semibold" style={{ width: '20%' }}>
                    1
                  </div>
                </div>
              </div>
              
              {/* Rubavu - 1 pharmacy */}
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-700">Rubavu:</div>
                <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-teal-600 flex items-center justify-end pr-4 text-white font-semibold" style={{ width: '20%' }}>
                    1
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
