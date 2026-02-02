'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { getCurrentAdmin } from '@/lib/auth';

// Demo support messages from users and pharmacies
const DEMO_SUPPORT_MESSAGES = [
  {
    id: 1,
    senderName: 'John Doe',
    senderEmail: 'john@example.com',
    senderPhone: '+250 788 111 222',
    senderType: 'user',
    subject: 'Unable to create account',
    message: 'I am trying to sign up but keep getting an error message when I submit the form. Can you please help?',
    date: '2 hours ago',
    status: 'new',
  },
  {
    id: 2,
    senderName: 'Kigali Central Pharmacy',
    senderEmail: 'info@kigalicentral.rw',
    senderPhone: '+250 788 123 456',
    senderType: 'pharmacy',
    subject: 'Subscription payment issue',
    message: 'We tried to renew our subscription but the payment is not going through. Please assist us urgently.',
    date: '3 hours ago',
    status: 'new',
  },
  {
    id: 3,
    senderName: 'Marie Uwase',
    senderEmail: 'marie@example.com',
    senderPhone: '+250 788 222 333',
    senderType: 'user',
    subject: 'How to search for pharmacies',
    message: 'I cannot find the search feature on the website. How do I search for pharmacies near me?',
    date: '5 hours ago',
    status: 'new',
  },
  {
    id: 4,
    senderName: 'Remera Medical Pharmacy',
    senderEmail: 'info@remera.rw',
    senderPhone: '+250 788 345 678',
    senderType: 'pharmacy',
    subject: 'Profile update not saving',
    message: 'We are trying to update our business hours but the changes are not being saved. Can you investigate?',
    date: '1 day ago',
    status: 'resolved',
  },
  {
    id: 5,
    senderName: 'Peter Habimana',
    senderEmail: 'peter@example.com',
    senderPhone: '+250 788 333 444',
    senderType: 'user',
    subject: 'Feature request',
    message: 'It would be great to have a mobile app for easier access to pharmacy information.',
    date: '2 days ago',
    status: 'resolved',
  },
];

export default function InquiriesPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Messages</h1>
            <p className="text-gray-600">Support requests from users and pharmacies</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Messages</h3>
              <div className="text-3xl font-bold text-gray-900">48</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Pending</h3>
              <div className="text-3xl font-bold text-red-600">15</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Resolved</h3>
              <div className="text-3xl font-bold text-teal-600">33</div>
            </div>
          </div>

          {/* Support Messages List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Support Messages</h2>
            
            <div className="space-y-4">
              {DEMO_SUPPORT_MESSAGES.map((message) => (
                <div
                  key={message.id}
                  className="border border-gray-200 rounded-xl p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{message.senderName}</h3>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            message.senderType === 'pharmacy'
                              ? 'bg-teal-100 text-teal-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {message.senderType}
                        </span>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            message.status === 'new'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {message.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {message.senderEmail} • {message.senderPhone}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        Subject: {message.subject}
                      </div>
                      <div className="text-xs text-gray-500">{message.date}</div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-700">{message.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
                      Reply
                    </button>
                    {message.status === 'new' && (
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        Mark as Resolved
                      </button>
                    )}
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
