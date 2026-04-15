'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useRequireAdmin } from '@/lib/adminAuthHooks';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SubscriptionData {
  id: string;
  pharmacyName: string;
  plan: string;
  status: 'active' | 'trial' | 'expired';
  renewsOn?: string;
  endsOn?: string;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAdmin();
  
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const trialCount = subscriptions.filter(s => s.status === 'trial').length;
  const expiredCount = subscriptions.filter(s => s.status === 'expired').length;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const q = query(collection(db, 'subscriptions'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fetched: SubscriptionData[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          fetched.push({
            id: doc.id,
            pharmacyName: data.pharmacyName || 'Unknown Pharmacy',
            plan: data.plan || 'Unknown Plan',
            status: data.status || 'active',
            renewsOn: data.renewsOn || undefined,
            endsOn: data.endsOn || undefined,
          });
        });
        setSubscriptions(fetched);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchSubscriptions();
    }
  }, [authLoading]);

  // Safely define total for pie chart math
  const totalSubCount = subscriptions.length;

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 w-full overflow-hidden p-4 sm:p-8 pb-20 sm:pb-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Active Subscriptions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-4">Active Subscriptions</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">{loading ? '-' : activeCount}</div>
              <div className="text-sm text-teal-600 font-medium">Paying customers</div>
            </div>

            {/* Free Trials */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-4">Free Trials</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">{loading ? '-' : trialCount}</div>
              <div className="text-sm text-blue-600 font-medium">Active trials</div>
            </div>

            {/* Expired */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-4">Expired</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">{loading ? '-' : expiredCount}</div>
              <div className="text-sm text-red-600 font-medium">Need renewal</div>
            </div>
          </div>

          {/* Subscription Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription Distribution</h2>
            
            <div className="flex items-center justify-center py-8">
              {loading ? (
                <p className="text-gray-500">Loading distribution...</p>
              ) : totalSubCount === 0 ? (
                <p className="text-gray-500">No subscription data available.</p>
              ) : (
                /* Static visualization for now until proper SVG generation logic based on percentages is built */
                <svg width="300" height="300" viewBox="0 0 300 300">
                  <path
                    d="M 150 150 L 150 0 A 150 150 0 0 1 290 190 Z"
                    fill="#14B8A6"
                    opacity="0.9"
                  />
                  <path
                    d="M 150 150 L 290 190 A 150 150 0 0 1 80 280 Z"
                    fill="#3B82F6"
                    opacity="0.9"
                  />
                  <path
                    d="M 150 150 L 80 280 A 150 150 0 0 1 150 0 Z"
                    fill="#EF4444"
                    opacity="0.9"
                  />
                  <text x="220" y="100" fill="#14B8A6" fontSize="24" fontWeight="bold">{activeCount}</text>
                  <text x="240" y="200" fill="#3B82F6" fontSize="24" fontWeight="bold">{trialCount}</text>
                  <text x="110" y="250" fill="#EF4444" fontSize="24" fontWeight="bold">{expiredCount}</text>
                </svg>
              )}
            </div>
          </div>

          {/* Recent Subscriptions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Subscriptions</h2>
            
            <div className="space-y-4">
              {loading ? (
                 <p className="text-gray-500 text-sm">Loading subscriptions...</p>
              ) : subscriptions.length === 0 ? (
                 <p className="text-gray-500 text-sm">No recent subscriptions found.</p>
              ) : (
                subscriptions.map((subscription) => (
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
                            : subscription.status === 'trial'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
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
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
