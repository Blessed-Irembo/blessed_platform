'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: April 2025</p>

          <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Blessed Irembo, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform. These terms apply to all users, including pharmacies and the general public.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Use of the Platform</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must be at least 18 years old to create an account.</li>
                <li>You are responsible for keeping your account credentials confidential.</li>
                <li>You agree not to misuse the platform for fraudulent or unlawful purposes.</li>
                <li>You must not attempt to access accounts, data, or systems you are not authorized to use.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Pharmacy Listings</h2>
              <p>
                Pharmacies listed on Blessed Irembo must be licensed by the Rwanda Food and Drugs Authority (FDA). We verify registration numbers during signup, but we are not liable for any inaccuracies in the information provided by pharmacies. Users should independently verify important medical information before making decisions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Subscription Services</h2>
              <p>
                Pharmacy subscriptions are subject to a free trial period of 90 days from registration. After the trial, pharmacies must subscribe to maintain full platform access. Subscription payments are processed manually via MoMo and approved by the Blessed Irembo admin team. Refunds are not offered once a subscription is approved.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Intellectual Property</h2>
              <p>
                All content, branding, and technology on this platform are the property of Blessed HealthConnect Ltd. You may not reproduce, copy, or distribute any part of the platform without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
              <p>
                Blessed Irembo is a directory service and does not provide medical advice. We are not liable for any decisions made based on information found on this platform. Always consult a qualified healthcare professional for medical guidance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Termination</h2>
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms, without prior notice. Pharmacies found to have provided false information during registration will be immediately removed from the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Contact</h2>
              <p>
                For questions about these terms, contact us at{' '}
                <a href="mailto:blessedirembo@gmail.com" className="text-teal-600 hover:underline">blessedirembo@gmail.com</a>{' '}
                or call <a href="tel:+250799538220" className="text-teal-600 hover:underline">+250 799 538 220</a>.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
