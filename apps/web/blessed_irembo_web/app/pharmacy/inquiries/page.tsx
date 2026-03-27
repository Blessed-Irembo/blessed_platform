'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useRequireAuth } from '@/lib/authHooks';

// Demo data — messages the user sent to pharmacies
const DEMO_MESSAGES = [
  {
    id: '1',
    pharmacyName: 'City Central Pharmacy',
    pharmacyAddress: 'KN 4 Ave, Kigali',
    message: 'Do you have insulin in stock? I need to refill my prescription.',
    date: 'March 9, 2025, 12:30 PM',
    status: 'replied',
    reply: 'Yes, we have insulin in stock. Please come in anytime between 8AM and 8PM.',
  },
  {
    id: '2',
    pharmacyName: 'Health Plus Pharmacy',
    pharmacyAddress: 'KG 11 Ave, Kigali',
    message: 'What are your opening hours on Sunday?',
    date: 'March 8, 2025, 4:15 PM',
    status: 'pending',
    reply: null,
  },
  {
    id: '3',
    pharmacyName: 'MediCare Pharmacy',
    pharmacyAddress: 'KN 3 Rd, Kigali',
    message: 'Do you sell blood pressure monitors?',
    date: 'March 5, 2025, 10:00 AM',
    status: 'replied',
    reply: 'Yes, we carry several models. Prices range from 15,000 to 45,000 RWF.',
  },
];

export default function InquiriesPage() {
  const { loading } = useRequireAuth();
  const { currentUser, signOut } = useAuth();
  const router = useRouter();
  const [messages] = useState(DEMO_MESSAGES);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo1.png" alt="Blessed Irembo" width={40} height={40} className="object-contain" />
              <span className="text-lg font-semibold text-gray-900">Blessed Irembo</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/pharmacies" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
                Find Pharmacies
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          href="/pharmacies"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pharmacies
        </Link>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Inquiries</h1>
          <p className="text-gray-500 mt-1 text-sm">Messages you sent to pharmacies</p>
        </div>

        {/* Messages List */}
        {messages.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <svg className="w-14 h-14 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-gray-500 font-medium">No inquiries yet</p>
            <p className="text-sm text-gray-400 mt-1">You have not contacted any pharmacy yet.</p>
            <Link
              href="/pharmacies"
              className="inline-block mt-6 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              Find a Pharmacy
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Pharmacy info bar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">{msg.pharmacyName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{msg.pharmacyAddress}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{msg.date}</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${msg.status === 'replied'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                      {msg.status === 'replied' ? 'Replied' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* User's message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                      {initials}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl rounded-tl-none px-4 py-3">
                      <p className="text-sm text-gray-800">{msg.message}</p>
                    </div>
                  </div>

                  {/* Pharmacy reply */}
                  {msg.reply && (
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1 bg-teal-50 rounded-xl rounded-tr-none px-4 py-3">
                        <p className="text-sm text-teal-900">{msg.reply}</p>
                      </div>
                    </div>
                  )}

                  {/* No reply yet */}
                  {!msg.reply && (
                    <p className="text-xs text-gray-400 text-center py-2">Waiting for pharmacy to reply...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
