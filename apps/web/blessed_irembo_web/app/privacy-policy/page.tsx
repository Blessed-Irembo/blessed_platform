'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: April 2025</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                Blessed Irembo (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), operated by Blessed HealthConnect Ltd, is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Personal Information:</strong> Name, phone number, and email address when you create an account.</li>
                <li><strong>Pharmacy Information:</strong> Pharmacy name, physical address, GPS coordinates, operating hours, and council registration number.</li>
                <li><strong>Usage Data:</strong> Pages visited, search queries, and interactions with pharmacy profiles to improve our services.</li>
                <li><strong>Payment Records:</strong> Subscription payment receipts uploaded for admin review. We do not store card or bank details.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To connect users with pharmacies near them.</li>
                <li>To manage pharmacy accounts and subscriptions.</li>
                <li>To improve the platform based on usage analytics.</li>
                <li>To send important account or service-related communications.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Data Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. Pharmacy profile details (name, address, phone, operating hours) are publicly visible to help users find pharmacies. Admin staff have access to subscription and account information for platform management purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Data Security</h2>
              <p>
                We use Firebase (Google Cloud) for secure data storage and authentication. All data is encrypted in transit and at rest. We regularly review our security practices to ensure your data is protected.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal data at any time. To make a request, contact us at <a href="mailto:blessedirembo@gmail.com" className="text-teal-600 hover:underline">blessedirembo@gmail.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify registered users of significant changes. Continued use of the platform constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Contact Us</h2>
              <p>
                If you have questions about this policy, please reach out to us at{' '}
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
