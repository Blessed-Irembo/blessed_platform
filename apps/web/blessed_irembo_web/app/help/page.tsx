'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HelpPage() {
  const faqs = [
    {
      question: 'How do I find a pharmacy near me?',
      answer: 'Visit the home page and use the search bar or the interactive map to explore pharmacies in your area. You can also filter by district.'
    },
    {
      question: 'Is Blessed Irembo free to use?',
      answer: 'Yes! Blessed Irembo is completely free for users looking for pharmacies. Only pharmacies pay a subscription fee to list their services on the platform.'
    },
    {
      question: 'How do I register my pharmacy?',
      answer: 'Click "For Pharmacies" in the navigation menu, then follow the registration steps. You will need your Rwanda FDA Council Registration Number (NPC/Axxxx) to sign up.'
    },
    {
      question: 'What is the pharmacy free trial?',
      answer: 'Every newly registered pharmacy receives a 90-day free trial. After that, a subscription plan is required to maintain your listing on the platform.'
    },
    {
      question: 'How do I pay for a subscription?',
      answer: 'Go to your pharmacy dashboard and click "Subscription". Choose a plan and dial the USSD code provided using MTN Mobile Money. Then click "I Intend to Pay" and optionally upload a screenshot of your receipt. Our team will review and approve your subscription within 24 hours.'
    },
    {
      question: 'How do I update my pharmacy information?',
      answer: 'Log in to your pharmacy dashboard, go to "Settings" to update your operating hours, location, contact information, and more.'
    },
    {
      question: 'I forgot my password. What do I do?',
      answer: 'On the login page, click "Forgot Password" and enter your email address. You will receive a link to reset your password.'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Help & Support</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Find answers to common questions below. If you still need help, our team is always happy to assist!
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 mb-8">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Contact Card */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h2>
          <p className="text-gray-600 text-sm mb-6">Our support team is available to assist you directly.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="mailto:blessedirembo@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-white border border-teal-300 text-teal-700 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              blessedirembo@gmail.com
            </a>
            <a
              href="tel:+250799538220"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +250 799 538 220
            </a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
