'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.terms.title}</h1>
          <p className="text-sm text-gray-500 mb-8">{t.terms.lastUpdated}</p>

          <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.terms.acceptance.title}</h2>
              <p>
                {t.terms.acceptance.text}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.terms.use.title}</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t.terms.use.item1}</li>
                <li>{t.terms.use.item2}</li>
                <li>{t.terms.use.item3}</li>
                <li>{t.terms.use.item4}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.terms.listings.title}</h2>
              <p>
                {t.terms.listings.text}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.terms.subscriptions.title}</h2>
              <p>
                {t.terms.subscriptions.text}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.terms.ip.title}</h2>
              <p>
                {t.terms.ip.text}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.terms.liability.title}</h2>
              <p>
                {t.terms.liability.text}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.terms.termination.title}</h2>
              <p>
                {t.terms.termination.text}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.terms.contact.title}</h2>
              <p>
                {t.terms.contact.text}
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

