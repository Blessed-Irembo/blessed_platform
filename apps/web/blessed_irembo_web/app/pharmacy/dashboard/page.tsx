'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRequireAuth } from '@/lib/authHooks';
import { usePharmacyData } from '@/lib/usePharmacyData';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ExpiredSubscriptionWall from '@/components/ui/ExpiredSubscriptionWall';
import { getSubscriptionStatus } from '@/lib/useSubscriptionStatus';
import { useLanguage } from '@/lib/LanguageContext';

export default function PharmacyDashboard() {
  const { loading: authLoading } = useRequireAuth();
  const { currentUser } = useAuth();
  const { pharmacy, loading: pharmacyLoading } = usePharmacyData();
  const { t } = useLanguage();

  if (authLoading || pharmacyLoading) {
    return <LoadingScreen text="Loading dashboard…" />;
  }

  const subscriptionStatus = getSubscriptionStatus(pharmacy);
  if (subscriptionStatus.isExpired) {
    return <ExpiredSubscriptionWall statusResult={subscriptionStatus} pharmacyName={pharmacy?.name} />;
  }

  const memberSince = pharmacy?.createdAt ? new Date(pharmacy.createdAt.toDate()).toLocaleDateString() : 'N/A';

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {pharmacy?.name || t.pharmacyDashboard.nav.myPharmacy}
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {t.pharmacyDashboard.overview.subtitle}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* WhatsApp Clicks */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 font-medium text-sm">{t.pharmacyDashboard.overview.stats.whatsappClicks}</h3>
              <div className="w-10 h-10 bg-[#dcfce7] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#16a34a]" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M2.004 22l1.352-4.968A9.992 9.992 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.989 9.989 0 01-5.02-1.341L2.004 22zm10-18.3A8.309 8.309 0 003.7 12c0 1.458.375 2.874 1.085 4.108l-.87 3.2 3.275-.86A8.286 8.309 0 0012 20.3c4.586 0 8.3-3.714 8.3-8.3S16.586 3.7 12 3.7zm4.27 11.517c-.234-.117-1.385-.685-1.599-.763-.214-.078-.37-.117-.526.117-.156.234-.606.763-.742.92-.136.156-.273.175-.507.058-.234-.117-.988-.363-1.882-1.026-.694-.515-1.163-1.15-1.3-1.384-.136-.234-.015-.36.102-.477.105-.105.234-.273.351-.409.117-.136.156-.234.234-.39.078-.156.039-.293-.02-.409-.058-.117-.526-1.27-.721-1.74-.191-.46-.386-.398-.526-.405-.136-.007-.292-.007-.448-.007s-.409.058-.624.293c-.214.234-.818.8-.818 1.95s.838 2.264.954 2.42c.117.156 1.652 2.52 3.998 3.513 1.956.826 2.535.79 3.003.738.537-.06 1.385-.566 1.58-1.112.195-.546.195-1.015.136-1.112-.058-.098-.214-.156-.448-.273z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{pharmacy?.whatsappClicks || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{t.pharmacyDashboard.overview.stats.whatsappClicksSubtitle}</p>
          </div>

          {/* Profile Views */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 font-medium text-sm">{t.pharmacyDashboard.overview.stats.profileViews}</h3>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{pharmacy?.profileViews || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{t.pharmacyDashboard.overview.stats.profileViewsSubtitle}</p>
          </div>

          {/* Subscription Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 font-medium text-sm">{t.pharmacyDashboard.overview.stats.subscriptionStatus}</h3>
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <span className="inline-block bg-teal-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-2">
              {t.pharmacyDashboard.overview.stats.active}
            </span>
            <p className="text-lg font-semibold text-gray-700">{pharmacy?.subscriptionPlan ?? 'Free'}</p>
          </div>
        </div>

        {/* Pharmacy Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">{t.pharmacyDashboard.overview.info.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">{t.pharmacyDashboard.overview.info.address}</p>
                <p className="text-gray-900 font-medium text-sm sm:text-base">{pharmacy?.address || '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">{t.pharmacyDashboard.overview.info.phone}</p>
                <p className="text-gray-900 font-medium text-sm sm:text-base">{pharmacy?.phoneNumber || pharmacy?.phone || '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">{t.pharmacyDashboard.overview.info.email}</p>
                <p className="text-gray-900 font-medium text-sm sm:text-base break-all">{pharmacy?.email || currentUser?.email || '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">{t.pharmacyDashboard.overview.info.memberSince}</p>
                <p className="text-gray-900 font-medium text-sm sm:text-base">{memberSince}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
