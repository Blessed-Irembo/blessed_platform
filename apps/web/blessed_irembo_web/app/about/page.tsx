'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">

        {/* Hero Section */}
        <section className="bg-teal-600 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">{t.about.title}</h1>
            <p className="text-teal-100 text-lg max-w-2xl mx-auto leading-relaxed">
              {t.about.subtitle}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.about.mission.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {t.about.mission.p1}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {t.about.mission.p2}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: '725+', label: t.about.stats.licensed },
                { number: '100%', label: t.about.stats.verified },
                { number: '30', label: t.about.stats.districts },
                { number: '24/7', label: t.about.stats.access },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
                  <div className="text-3xl font-bold text-teal-600 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="bg-white border-t border-gray-100 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t.about.story.title}</h2>
            <div className="prose prose-gray max-w-none text-gray-600 text-base leading-relaxed space-y-4">
              <p>
                {t.about.story.p1}
              </p>
              <p>
                {t.about.story.p2}
              </p>
              <p>
                {t.about.story.p3}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.about.cta.title}</h2>
          <p className="text-gray-600 mb-8">{t.about.cta.subtitle}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/" className="bg-teal-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors">
              {t.about.cta.find}
            </Link>
            <Link href="/for-pharmacies" className="bg-white border border-teal-300 text-teal-700 font-semibold px-8 py-3 rounded-xl hover:bg-teal-50 transition-colors">
              {t.about.cta.register}
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

