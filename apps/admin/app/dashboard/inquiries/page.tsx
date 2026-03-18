'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useRequireAdmin } from '@/lib/adminAuthHooks';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SupportMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderType: string;
  subject: string;
  message: string;
  date: Date;
  status: 'new' | 'resolved';
}

export default function InquiriesPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAdmin();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInquiries() {
      try {
        const q = query(collection(db, 'support_inquiries'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fetched: SupportMessage[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          fetched.push({
            id: doc.id,
            senderName: data.senderName || 'Unknown',
            senderEmail: data.senderEmail || 'N/A',
            senderPhone: data.senderPhone || 'N/A',
            senderType: data.senderType || 'user',
            subject: data.subject || 'No Subject',
            message: data.message || '',
            date: data.createdAt ? data.createdAt.toDate() : new Date(),
            status: data.status || 'new',
          });
        });
        setMessages(fetched);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchInquiries();
    }
  }, [authLoading]);

  const totalMessages = messages.length;
  const pendingMessages = messages.filter(m => m.status === 'new').length;
  const resolvedMessages = messages.filter(m => m.status === 'resolved').length;

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

  if (authLoading) return null;

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
              <div className="text-3xl font-bold text-gray-900">{loading ? '-' : totalMessages}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Pending</h3>
              <div className="text-3xl font-bold text-red-600">{loading ? '-' : pendingMessages}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Resolved</h3>
              <div className="text-3xl font-bold text-teal-600">{loading ? '-' : resolvedMessages}</div>
            </div>
          </div>

          {/* Support Messages List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Support Messages</h2>
            
            <div className="space-y-4">
              {loading ? (
                 <p className="text-gray-500 text-sm">Loading messages...</p>
              ) : messages.length === 0 ? (
                 <p className="text-gray-500 text-sm">No support messages found.</p>
              ) : (
                messages.map((message) => (
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
                        <div className="text-xs text-gray-500">{formatTimeAgo(message.date)}</div>
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
