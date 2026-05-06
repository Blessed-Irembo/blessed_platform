'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/LanguageContext';

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.privacy.title}</h1>
          <p className="text-sm text-gray-500 mb-8">{t.privacy.lastUpdated}</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.privacy.intro.title}</h2>
              <p>
                {t.privacy.intro.text}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.privacy.collection.title}</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t.privacy.collection.personal}</li>
                <li>{t.privacy.collection.pharmacy}</li>
                <li>{t.privacy.collection.usage}</li>
                <li>{t.privacy.collection.payment}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.privacy.use.title}</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t.privacy.use.item1}</li>
                <li>{t.privacy.use.item2}</li>
                <li>{t.privacy.use.item3}</li>
                <li>{t.privacy.use.item4}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.privacy.sharing.title}</h2>
              <p>
                {t.privacy.sharing.text}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.privacy.security.title}</h2>
              <p>
                {t.privacy.security.text}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.privacy.rights.title}</h2>
              <p>
                {t.privacy.rights.text}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.privacy.changes.title}</h2>
              <p>
                {t.privacy.changes.text}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t.privacy.contact.title}</h2>
              <p>
                {t.privacy.contact.text}
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

