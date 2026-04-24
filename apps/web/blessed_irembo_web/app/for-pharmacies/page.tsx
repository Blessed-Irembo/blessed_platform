'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ForPharmaciesPage() {
  const plans = [
    { name: '1 Month', price: '1,000 RWF', period: '/month', highlight: false },
    { name: '3 Months', price: '3,000 RWF', period: '/3 months', highlight: true, badge: 'Most Popular' },
    { name: '12 Months', price: '10,000 RWF', period: '/year', highlight: false },
  ];

  const benefits = [
    {
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Map Visibility',
      description: 'Your pharmacy appears as a pin on our interactive map, helping nearby users find you instantly.'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Verified Badge',
      description: 'Your pharmacy gets a "Verified" badge, building instant trust with users across Rwanda.'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Direct WhatsApp',
      description: 'Users can contact you directly via WhatsApp from your profile, enabling quick customer inquiries.'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Analytics Dashboard',
      description: 'Track your profile views and WhatsApp click-through rate directly from your pharmacy dashboard.'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              For Licensed Pharmacies in Rwanda
            </span>
            <h1 className="text-4xl font-bold mb-4">Grow Your Pharmacy with Blessed Irembo</h1>
            <p className="text-teal-100 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Join Rwanda&apos;s first digital pharmacy directory. Get verified, get found, and connect with thousands of patients looking for pharmacies near them.
            </p>
            <Link
              href="/register-pharmacy"
              className="inline-block bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors shadow-lg text-base"
            >
              Register Your Pharmacy — Free Trial
            </Link>
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Join Blessed Irembo?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Free Trial Banner */}
        <section className="bg-blue-50 border-y border-blue-100 py-10 px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">🎉 Start with a 90-Day Free Trial</h2>
          <p className="text-gray-600 text-sm max-w-xl mx-auto">
            Every new pharmacy gets 3 months of full access completely free. No payment required to get started. After the trial, choose a plan that works for you.
          </p>
        </section>

        {/* Pricing */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">Subscription Plans</h2>
          <p className="text-gray-600 text-center text-sm mb-10">Simple, affordable pricing with no hidden fees. Pay via MTN Mobile Money.</p>
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
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white border-t border-gray-100 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How It Works</h2>
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              {[
                { step: '1', title: 'Register', desc: 'Sign up with your Rwanda FDA Council Registration Number.' },
                { step: '2', title: 'Get Verified', desc: 'Our team verifies your registration and activates your listing.' },
                { step: '3', title: 'Grow', desc: 'Users find your pharmacy on the map and contact you directly.' },
              ].map((s) => (
                <div key={s.step}>
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-teal-600">
                    {s.step}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-8">Join hundreds of pharmacies already listed on Blessed Irembo.</p>
          <Link
            href="/register-pharmacy"
            className="inline-block bg-teal-600 text-white font-bold px-10 py-4 rounded-xl hover:bg-teal-700 transition-colors shadow-md text-base"
          >
            Register Your Pharmacy Today
          </Link>
          <p className="text-gray-500 text-xs mt-4">Have questions? Call us at <a href="tel:+250799538220" className="text-teal-600 hover:underline">+250 799 538 220</a></p>
        </section>

      </main>

      <Footer />
    </div>
  );
}
