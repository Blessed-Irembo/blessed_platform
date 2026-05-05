'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useRequireAdmin } from '@/lib/adminAuthHooks';
import { collection, getDocs, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DistrictCount { district: string; count: number; }
interface MonthlyCount { month: string; pharmacies: number; users: number; }

// ─── Skeleton ──────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="h-3 w-28 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-16 bg-gray-300 rounded" />
    </div>
  );
}

export default function AnalyticsPage() {
  const { loading: authLoading } = useRequireAdmin();

  const [totalPharmacies, setTotalPharmacies] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [totalWhatsappClicks, setTotalWhatsappClicks] = useState(0);
  const [totalProfileViews, setTotalProfileViews] = useState(0);
  const [districtData, setDistrictData] = useState<DistrictCount[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyCount[]>([]);

  // Split loading into two phases: fast counts + slower document data
  const [countsLoading, setCountsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // ── Phase 1: Fast counts — show instantly ─────────────────────────────
    async function fetchCounts() {
      try {
        const [pharmsCount, verifiedCountSnap, usersCount] = await Promise.all([
          getCountFromServer(collection(db, 'pharmacies')),
          getCountFromServer(query(collection(db, 'pharmacies'), where('isVerified', '==', true))),
          getCountFromServer(collection(db, 'users')),
        ]);
        setTotalPharmacies(pharmsCount.data().count);
        setVerifiedCount(verifiedCountSnap.data().count);
        setTotalUsers(usersCount.data().count);
      } catch (err) {
        console.error('Counts fetch error:', err);
      } finally {
        setCountsLoading(false);
      }
    }

    // ── Phase 2: Full document scan for charts & engagement totals ────────
    async function fetchChartData() {
      try {
        // Fetch both collections in parallel
        const [pharmsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, 'pharmacies')),
          getDocs(collection(db, 'users')),
        ]);

        let waClicks = 0;
        let pViews = 0;
        const districtMap: Record<string, number> = {};
        const pharmByMonth: Record<string, number> = {};
        const userByMonth: Record<string, number> = {};

        pharmsSnap.forEach((doc) => {
          const d = doc.data();
          waClicks += d.whatsappClicks ?? 0;
          pViews += d.profileViews ?? 0;

          // District grouping
          const raw: string = d.district ?? d.address ?? '';
          const district = raw.split(',')[0].trim() || 'Unknown';
          districtMap[district] = (districtMap[district] ?? 0) + 1;

          // Monthly grouping
          if (d.createdAt) {
            const date: Date = d.createdAt.toDate();
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            pharmByMonth[key] = (pharmByMonth[key] ?? 0) + 1;
          }
        });

        usersSnap.forEach((doc) => {
          const d = doc.data();
          if (d.createdAt) {
            const date: Date = d.createdAt.toDate();
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            userByMonth[key] = (userByMonth[key] ?? 0) + 1;
          }
        });

        // ── District bars ───────────────────────────────────────────────
        const districts = Object.entries(districtMap)
          .sort((a, b) => b[1] - a[1])
          .map(([district, count]) => ({ district, count }));

        // ── Monthly chart (last 6 months) ───────────────────────────────
        const months: MonthlyCount[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleString('default', { month: 'short' });
          months.push({ month: label, pharmacies: pharmByMonth[key] ?? 0, users: userByMonth[key] ?? 0 });
        }

        setTotalWhatsappClicks(waClicks);
        setTotalProfileViews(pViews);
        setDistrictData(districts);
        setMonthlyData(months);
      } catch (err) {
        console.error('Chart data fetch error:', err);
      } finally {
        setChartsLoading(false);
      }
    }

    // Kick off both phases at the same time — Phase 1 will resolve first
    fetchCounts();
    fetchChartData();
  }, [authLoading]);

  if (authLoading) return null;

  const maxMonthVal = Math.max(...monthlyData.map(m => Math.max(m.pharmacies, m.users)), 1);
  const maxDistrict = Math.max(...districtData.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 w-full overflow-hidden p-4 sm:p-8 pb-20 sm:pb-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analytics &amp; Reports</h1>
            <p className="text-sm sm:text-base text-gray-600">Live data from the platform database</p>
          </div>

          {/* Summary Stats — Phase 1: fast counts appear first */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {countsLoading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Pharmacies</p>
                  <p className="text-3xl font-bold text-teal-600">{totalPharmacies}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Verified Pharmacies</p>
                  <p className="text-3xl font-bold text-green-600">{verifiedCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-purple-600">{totalUsers}</p>
                </div>
              </>
            )}

            {/* Phase 2: engagement numbers (require full doc scan) */}
            {chartsLoading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">WhatsApp Clicks</p>
                  <p className="text-3xl font-bold text-emerald-600">{totalWhatsappClicks}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Profile Views</p>
                  <p className="text-3xl font-bold text-blue-600">{totalProfileViews}</p>
                </div>
              </>
            )}
          </div>

          {/* Monthly Registrations Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Registrations (Last 6 Months)</h2>
            {chartsLoading ? (
              <div className="h-64 flex flex-col gap-3 animate-pulse">
                <div className="flex items-end gap-6 h-56">
                  {[40, 70, 55, 90, 60, 80].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex items-end gap-1 w-full justify-center" style={{ height: 220 }}>
                        <div className="w-5 bg-gray-200 rounded-t-sm" style={{ height: h }} />
                        <div className="w-5 bg-gray-100 rounded-t-sm" style={{ height: h * 0.6 }} />
                      </div>
                      <div className="h-3 w-6 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Legend */}
                <div className="flex gap-6 mb-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-teal-500 inline-block" />Pharmacies
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-purple-400 inline-block" />Users
                  </span>
                </div>
                <div className="flex items-end gap-6 h-56">
                  {monthlyData.map((m) => {
                    const pharmH = Math.max((m.pharmacies / maxMonthVal) * 200, m.pharmacies > 0 ? 8 : 0);
                    const userH = Math.max((m.users / maxMonthVal) * 200, m.users > 0 ? 8 : 0);
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex items-end gap-1 w-full justify-center" style={{ height: 220 }}>
                          <div
                            className="w-5 bg-teal-500 rounded-t-sm transition-all"
                            style={{ height: pharmH }}
                            title={`${m.pharmacies} pharmacies`}
                          />
                          <div
                            className="w-5 bg-purple-400 rounded-t-sm transition-all"
                            style={{ height: userH }}
                            title={`${m.users} users`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
                {monthlyData.every(m => m.pharmacies === 0 && m.users === 0) && (
                  <p className="text-center text-gray-400 text-sm mt-4">No registrations with timestamps found in the last 6 months.</p>
                )}
              </>
            )}
          </div>

          {/* Pharmacies by District */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pharmacies by District / Area</h2>
            {chartsLoading ? (
              <div className="space-y-4 animate-pulse">
                {[80, 60, 45, 35, 20].map((w, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-32 h-4 bg-gray-200 rounded" />
                    <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden">
                      <div className="h-full bg-gray-200 rounded-lg" style={{ width: `${w}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : districtData.length === 0 ? (
              <p className="text-gray-500 text-sm">No district data found.</p>
            ) : (
              <div className="space-y-4">
                {districtData.map(({ district, count }) => {
                  const pct = Math.max((count / maxDistrict) * 100, 5);
                  return (
                    <div key={district} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-700 truncate">{district}</div>
                      <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-teal-600 flex items-center justify-end pr-3 text-white font-semibold text-sm transition-all"
                          style={{ width: `${pct}%` }}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
