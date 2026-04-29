'use client';

/**
 * Admin Access Control Panel
 *
 * Hidden page — not in the main sidebar nav. Access via the footer link
 * at the bottom of the sidebar: "⚙ Access Control"
 *
 * Allows the admin to:
 *  - See ALL pharmacies with their isActive status and subscription status
 *  - Search by name
 *  - Toggle isActive on/off per pharmacy (with confirmation dialog)
 *
 * Designed to be a safe testing and override tool — not for everyday use.
 */

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useRequireAdmin } from '@/lib/adminAuthHooks';
import { collection, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getSubscriptionStatus } from '@/lib/useSubscriptionStatus';

interface PharmacyRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean | undefined;
  statusLabel: string;
  statusColor: string;
  subscriptionEndDate: any;
  createdAt: any;
}

export default function AccessControlPage() {
  const { loading: authLoading } = useRequireAdmin();

  const [pharmacies, setPharmacies] = useState<PharmacyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    pharmacyId: string;
    pharmacyName: string;
    action: 'deactivate' | 'activate';
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const unsub = onSnapshot(collection(db, 'pharmacies'), (snap) => {
      const rows: PharmacyRow[] = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        const mockPharmacy = {
          subscriptionEndDate: data.subscriptionEndDate,
          createdAt: data.createdAt,
        };
        const { status } = getSubscriptionStatus(mockPharmacy);

        const statusMap: Record<string, { label: string; color: string }> = {
          premium: { label: 'Premium', color: 'bg-teal-100 text-teal-800' },
          freeTrial: { label: 'Free Trial', color: 'bg-blue-100 text-blue-800' },
          expired: { label: 'Expired', color: 'bg-red-100 text-red-800' },
          loading: { label: '—', color: 'bg-gray-100 text-gray-500' },
        };

        const { label, color } = statusMap[status] ?? statusMap.loading;

        return {
          id: docSnap.id,
          name: data.name ?? 'Unknown',
          email: data.email ?? '—',
          phone: data.phoneNumber ?? '—',
          isActive: data.isActive,
          statusLabel: label,
          statusColor: color,
          subscriptionEndDate: data.subscriptionEndDate,
          createdAt: data.createdAt,
        };
      });
      rows.sort((a, b) => a.name.localeCompare(b.name));
      setPharmacies(rows);
      setLoading(false);
    });
    return () => unsub();
  }, [authLoading]);

  const handleToggle = async () => {
    if (!confirmDialog) return;
    const { pharmacyId, action } = confirmDialog;
    setActionLoading(pharmacyId);
    setConfirmDialog(null);
    try {
      await updateDoc(doc(db, 'pharmacies', pharmacyId), {
        isActive: action === 'activate',
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update pharmacy status.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = pharmacies.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8">
          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold text-red-800">⚠️ Access Control Panel — Use With Care</p>
              <p className="text-sm text-red-700 mt-1">
                This panel directly controls pharmacy listing visibility across the web and iOS app.
                Toggling a pharmacy off will immediately hide it from all public listings.
                Always confirm before making changes.
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
              <p className="text-gray-500 text-sm mt-1">
                {pharmacies.length} pharmacies total · {pharmacies.filter(p => p.isActive === false).length} deactivated
              </p>
            </div>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toggle Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                          No pharmacies found matching &quot;{search}&quot;
                        </td>
                      </tr>
                    ) : filtered.map((pharm) => (
                      <tr key={pharm.id} className={`hover:bg-gray-50 ${pharm.isActive === false ? 'bg-red-50/40' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 text-sm">{pharm.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5 font-mono">{pharm.id.slice(0, 12)}…</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">{pharm.email}</div>
                          <div className="text-xs text-gray-500">{pharm.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${pharm.statusColor}`}>
                            {pharm.statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {pharm.isActive === false ? (
                            <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                              <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
                              Hidden
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                              <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                              Visible
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {pharm.isActive === false ? (
                            <button
                              disabled={actionLoading === pharm.id}
                              onClick={() => setConfirmDialog({ pharmacyId: pharm.id, pharmacyName: pharm.name, action: 'activate' })}
                              className="text-xs bg-teal-100 text-teal-700 hover:bg-teal-200 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {actionLoading === pharm.id ? (
                                <span className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block" />
                              ) : '✓'} Activate
                            </button>
                          ) : (
                            <button
                              disabled={actionLoading === pharm.id}
                              onClick={() => setConfirmDialog({ pharmacyId: pharm.id, pharmacyName: pharm.name, action: 'deactivate' })}
                              className="text-xs bg-red-100 text-red-700 hover:bg-red-200 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {actionLoading === pharm.id ? (
                                <span className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin inline-block" />
                              ) : '✕'} Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              confirmDialog.action === 'deactivate' ? 'bg-red-100' : 'bg-teal-100'
            }`}>
              {confirmDialog.action === 'deactivate' ? (
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              {confirmDialog.action === 'deactivate' ? 'Deactivate Listing?' : 'Activate Listing?'}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-1">
              <span className="font-semibold">{confirmDialog.pharmacyName}</span>
            </p>
            <p className="text-sm text-gray-500 text-center mb-6">
              {confirmDialog.action === 'deactivate'
                ? 'This will immediately hide this pharmacy from all public listings on the web and iOS app.'
                : 'This will make this pharmacy visible on all public listings again.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggle}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
                  confirmDialog.action === 'deactivate'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {confirmDialog.action === 'deactivate' ? 'Yes, Deactivate' : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
