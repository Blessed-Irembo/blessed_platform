'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/LanguageContext';

export default function ForPharmaciesPage() {
  const { t } = useLanguage();

  const plans = t.forPharmacies.pricing.plans.map((plan, index) => ({
    ...plan,
    highlight: index === 1, // Highlight the 3-month plan
  }));

  const benefitIcons = [
    (
      <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    (
      <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    (
      <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    (
      <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  ];

  const benefits = [
    { ...t.forPharmacies.benefits.items.visibility, icon: benefitIcons[0] },
    { ...t.forPharmacies.benefits.items.verified, icon: benefitIcons[1] },
    { ...t.forPharmacies.benefits.items.whatsapp, icon: benefitIcons[2] },
    { ...t.forPharmacies.benefits.items.analytics, icon: benefitIcons[3] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              {t.forPharmacies.hero.badge}
            </span>
            <h1 className="text-4xl font-bold mb-4">{t.forPharmacies.hero.title}</h1>
            <p className="text-teal-100 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              {t.forPharmacies.hero.subtitle}
            </p>
            <Link
              href="/register-pharmacy"
              className="inline-block bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors shadow-lg text-base"
            >
              {t.forPharmacies.hero.cta}
            </Link>
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">{t.forPharmacies.benefits.title}</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Free Trial Banner */}
        <section className="bg-blue-50 border-y border-blue-100 py-10 px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">🎉 {t.forPharmacies.freeTrial.title}</h2>
          <p className="text-gray-600 text-sm max-w-xl mx-auto">
            {t.forPharmacies.freeTrial.desc}
          </p>
        </section>

        {/* Pricing */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">{t.forPharmacies.pricing.title}</h2>
          <p className="text-gray-600 text-center text-sm mb-10">{t.forPharmacies.pricing.subtitle}</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 text-center relative ${
                  plan.highlight
                    ? 'bg-teal-600 border-teal-600 text-white shadow-xl scale-105'
                    : 'bg-white border-gray-200 text-gray-900 shadow-sm'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <h3 className={`text-base font-semibold mb-4 ${plan.highlight ? 'text-teal-100' : 'text-gray-600'}`}>{plan.name}</h3>
                <div className={`text-4xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-teal-600'}`}>{plan.price}</div>
                <div className={`text-sm mb-6 ${plan.highlight ? 'text-teal-200' : 'text-gray-400'}`}>{plan.period}</div>
                <Link
                  href="/register-pharmacy"
                  className={`block w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-white text-teal-700 hover:bg-teal-50'
                      : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                  }`}
                >
                  {t.forPharmacies.pricing.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white border-t border-gray-100 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">{t.forPharmacies.howItWorks.title}</h2>
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              {t.forPharmacies.howItWorks.steps.map((s, index) => (
                <div key={index}>
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-teal-600">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.forPharmacies.finalCta.title}</h2>
          <p className="text-gray-600 mb-8">{t.forPharmacies.finalCta.subtitle}</p>
          <Link
            href="/register-pharmacy"
            className="inline-block bg-teal-600 text-white font-bold px-10 py-4 rounded-xl hover:bg-teal-700 transition-colors shadow-md text-base"
          >
            {t.forPharmacies.finalCta.button}
          </Link>
          <p className="text-gray-500 text-xs mt-4">{t.forPharmacies.finalCta.questions} <a href="tel:+250799538220" className="text-teal-600 hover:underline">+250 799 538 220</a></p>
        </section>

      </main>

      <Footer />
    </div>
  );
}

