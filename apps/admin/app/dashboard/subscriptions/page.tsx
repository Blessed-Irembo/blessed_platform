'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { getCurrentAdmin } from '@/lib/auth';

// Demo subscription data
const DEMO_SUBSCRIPTIONS = [
  {
    id: 1,
    pharmacyName: 'Kigali Central Pharmacy',
    plan: 'Premium Plan',
    status: 'active',
    renewsOn: '2025-12-31',
  },
  {
    id: 2,
    pharmacyName: 'Nyarugenge Health Pharmacy',
    plan: 'Free Trial',
    status: 'trial',
    endsOn: '2025-12-09',
  },
  {
    id: 3,
    pharmacyName: 'Remera Medical Pharmacy',
    plan: 'Premium Plan',
    status: 'active',
    renewsOn: '2026-01-15',
  },
  {
    id: 4,
    pharmacyName: 'Huye District Pharmacy',
    plan: 'Free Trial',
    status: 'trial',
    endsOn: '2028-11-15',
  },
  {
    id: 5,
    pharmacyName: 'Musanze Health Center Pharmacy',
    plan: 'Premium Plan',
    status: 'active',
    renewsOn: '2025-11-30',
  },
];

export default function SubscriptionsPage() {
  const router = useRouter();
  const activeCount = DEMO_SUBSCRIPTIONS.filter(s => s.status === 'active').length;
  const trialCount = DEMO_SUBSCRIPTIONS.filter(s => s.status === 'trial').length;
  const expiredCount = 0;

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Active Subscriptions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-4">Active Subscriptions</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">{activeCount}</div>
              <div className="text-sm text-teal-600 font-medium">Paying customers</div>
            </div>

            {/* Free Trials */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-4">Free Trials</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">{trialCount}</div>
              <div className="text-sm text-blue-600 font-medium">Active trials</div>
            </div>

            {/* Expired */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-4">Expired</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">{expiredCount}</div>
              <div className="text-sm text-red-600 font-medium">Need renewal</div>
            </div>
          </div>

          {/* Subscription Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription Distribution</h2>
            
            <div className="flex items-center justify-center py-8">
              {/* Pie Chart SVG */}
              <svg width="300" height="300" viewBox="0 0 300 300">
                {/* Teal segment (Active - 4) - larger segment */}
                <path
                  d="M 150 150 L 150 0 A 150 150 0 0 1 290 190 Z"
                  fill="#14B8A6"
                  opacity="0.9"
                />
                {/* Blue segment (Trial - 2) */}
                <path
                  d="M 150 150 L 290 190 A 150 150 0 0 1 80 280 Z"
                  fill="#3B82F6"
                  opacity="0.9"
                />
                {/* Red segment (Expired - 0) - tiny segment */}
                <path
                  d="M 150 150 L 80 280 A 150 150 0 0 1 150 0 Z"
                  fill="#EF4444"
                  opacity="0.9"
                />
                
                {/* Labels */}
                <text x="220" y="100" fill="#14B8A6" fontSize="24" fontWeight="bold">4</text>
                <text x="240" y="200" fill="#3B82F6" fontSize="24" fontWeight="bold">2</text>
                <text x="110" y="250" fill="#EF4444" fontSize="24" fontWeight="bold">0</text>
              </svg>
            </div>
          </div>

          {/* Recent Subscriptions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Subscriptions</h2>
            
            <div className="space-y-4">
              {DEMO_SUBSCRIPTIONS.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{subscription.pharmacyName}</h4>
                    <p className="text-sm text-gray-600">{subscription.plan}</p>
                  </div>
                  
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                        subscription.status === 'active'
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {subscription.status}
                    </span>
                    <p className="text-xs text-gray-600">
                      {subscription.status === 'active'
                        ? `Renews ${subscription.renewsOn}`
                        : `Ends ${subscription.endsOn}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
