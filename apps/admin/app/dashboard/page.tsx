'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useRequireAdmin } from '@/lib/adminAuthHooks';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ActivityItem {
  id: string;
  type: 'pharmacy' | 'user';
  name: string;
  timestamp: Date;
}

export default function DashboardPage() {
  const { loading: authLoading } = useRequireAdmin();

  const [totalPharmacies, setTotalPharmacies] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch pharmacies
        const pharmaciesSnap = await getDocs(collection(db, 'pharmacies'));
        let pharmsCount = 0;
        let pendingCount = 0;
        const activities: ActivityItem[] = [];

        pharmaciesSnap.forEach((doc) => {
          pharmsCount++;
          const data = doc.data();
          if (!data.isVerified) {
            pendingCount++;
          }
          if (data.createdAt) {
            activities.push({
              id: doc.id,
              type: 'pharmacy',
              name: data.name || 'Unknown Pharmacy',
              timestamp: data.createdAt.toDate(),
            });
          }
        });
        
        setTotalPharmacies(pharmsCount);
        setPendingApprovals(pendingCount);

        // Fetch users
        const usersSnap = await getDocs(collection(db, 'users'));
        let usersCount = 0;
        usersSnap.forEach((doc) => {
          usersCount++;
          const data = doc.data();
          if (data.createdAt) {
             activities.push({
              id: doc.id,
              type: 'user',
              name: data.fullName || data.email || 'Unknown User',
              timestamp: data.createdAt.toDate(),
            });
          }
        });
        
        setTotalUsers(usersCount);

        // Sort and limit activities
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivity(activities.slice(0, 3));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDataLoading(false);
      }
    }

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading]);

  // Format date helper
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  if (authLoading) return null; // handled by global provider spinner

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
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {dataLoading ? '-' : totalPharmacies}
              </div>
              <div className="text-sm text-teal-600 font-medium">{dataLoading ? '-' : `${totalPharmacies} active`}</div>
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
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {dataLoading ? '-' : pendingApprovals}
              </div>
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
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {dataLoading ? '-' : totalUsers}
              </div>
              <div className="text-sm text-teal-600 font-medium">Registered accounts</div>
            </div>

            {/* Revenue - Dashed out as requested */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 opacity-60">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm font-medium">Revenue (MTD)</span>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-400 mb-2">-</div>
              <div className="text-sm text-gray-400 font-medium">Not tracked yet</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Approve Pharmacies */}
              <div className="bg-teal-50 rounded-xl p-6 text-center relative cursor-pointer hover:bg-teal-100 transition-colors">
                <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-teal-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Approve Pharmacies</h3>
                {pendingApprovals > 0 ? (
                   <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                     {pendingApprovals} pending
                   </span>
                ) : (
                  <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                     All approved
                   </span>
                )}
              </div>

              {/* View Inquiries */}
              <div className="bg-blue-50 rounded-xl p-6 text-center cursor-not-allowed opacity-60">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">View Inquiries</h3>
                <span className="inline-block bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Coming soon
                </span>
              </div>

              {/* Manage Subscriptions */}
              <div className="bg-gray-50 rounded-xl p-6 text-center cursor-not-allowed opacity-60">
                <div className="bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Manage Subscriptions</h3>
                <span className="inline-block bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Coming soon
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            
            <div className="space-y-4">
               {dataLoading ? (
                  <p className="text-gray-500 text-sm">Loading activity...</p>
               ) : recentActivity.length === 0 ? (
                 <p className="text-gray-500 text-sm">No recent activity found.</p>
               ) : (
                  recentActivity.map((activity, index) => (
                    <div key={activity.id + index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-lg shrink-0 ${activity.type === 'pharmacy' ? 'bg-teal-100' : 'bg-purple-100'}`}>
                        {activity.type === 'pharmacy' ? (
                          <svg className="w-5 h-5 text-teal-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-purple-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {activity.type === 'pharmacy' ? 'New pharmacy registration' : 'New user registration'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {activity.name} • {formatTimeAgo(activity.timestamp)}
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

