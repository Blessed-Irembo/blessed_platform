'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { getCurrentAdmin } from '@/lib/auth';

export default function DashboardPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Blessed Irembo Platform Management</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Pharmacies */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm font-medium">Total Pharmacies</span>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">6</div>
              <div className="text-sm text-teal-600 font-medium">5 active</div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm font-medium">Pending Approvals</span>
                <div className="bg-red-50 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1</div>
              <div className="text-sm text-gray-600 font-medium">Require action</div>
            </div>

            {/* Total Users */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm font-medium">Total Users</span>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">150</div>
              <div className="text-sm text-teal-600 font-medium">+12 this week</div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm font-medium">Revenue (MTD)</span>
                <div className="bg-green-50 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">450,000 RWF</div>
              <div className="text-sm text-teal-600 font-medium">+8% vs last month</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Approve Pharmacies */}
              <div className="bg-teal-50 rounded-xl p-6 text-center relative">
                <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-teal-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Approve Pharmacies</h3>
                <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  1 pending
                </span>
              </div>

              {/* View Inquiries */}
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">View Inquiries</h3>
                <span className="inline-block bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  48
                </span>
              </div>

              {/* Manage Subscriptions */}
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Manage Subscriptions</h3>
                <span className="inline-block bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  4 active
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            
            <div className="space-y-4">
              {/* Activity 1 */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-teal-100 p-2 rounded-lg shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">New pharmacy registration</h4>
                  <p className="text-sm text-gray-600">Huye District Pharmacy • 2 hours ago</p>
                </div>
              </div>

              {/* Activity 2 */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Subscription renewed</h4>
                  <p className="text-sm text-gray-600">Kigali Central Pharmacy • 5 hours ago</p>
                </div>
              </div>

              {/* Activity 3 */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-100 p-2 rounded-lg shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Pharmacy verified</h4>
                  <p className="text-sm text-gray-600">Remera Medical Pharmacy • 1 day ago</p>
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
