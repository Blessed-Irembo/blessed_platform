'use client';

/**
 * ExpiredSubscriptionWall
 *
 * Full-page overlay shown when a pharmacy's subscription has expired.
 * Blocks access to the current page's content and directs them to renew.
 *
 * Usage: Render at the top of a protected page, AFTER loading is resolved:
 *   if (subscriptionStatus.isExpired) return <ExpiredSubscriptionWall pharmacy={pharmacy} />;
 */

import Link from 'next/link';
import { SubscriptionStatusResult } from '@/lib/useSubscriptionStatus';

interface Props {
  statusResult: SubscriptionStatusResult;
  pharmacyName?: string;
}

export default function ExpiredSubscriptionWall({ statusResult, pharmacyName }: Props) {
  const expiryText = statusResult.expiresOn
    ? `Your subscription expired on ${statusResult.expiresOn.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}.`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Card */}
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 shadow-lg overflow-hidden">
        {/* Red top accent */}
        <div className="h-2 bg-gradient-to-r from-red-500 to-red-400" />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Subscription Expired
          </h1>

          {pharmacyName && (
            <p className="text-sm text-gray-500 mb-1 font-medium">{pharmacyName}</p>
          )}

          {expiryText && (
            <p className="text-gray-600 text-sm mb-2">{expiryText}</p>
          )}

          <p className="text-gray-500 text-sm mb-8">
            Your pharmacy listing has been paused. Renew your subscription to restore full access and visibility on the platform.
          </p>

          {/* Features list */}
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-2">
            {[
              'Restore your pharmacy listing on the map',
              'Allow users to find and contact you',
              'Regain access to your dashboard & analytics',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/pharmacy/subscription"
            className="block w-full bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-teal-700 transition-colors text-center mb-3"
          >
            Renew Subscription
          </Link>

          <p className="text-xs text-gray-400">
            Need help?{' '}
            <a href="tel:+250799538220" className="text-teal-600 hover:underline">
              Call +250 799 538 220
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
