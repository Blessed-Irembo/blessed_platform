import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Hero Section Component
 * 
 * Main landing section with headline, description, call-to-action buttons,
 * and hero image. Introduces the platform's primary value proposition.
 */
export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Content */}
          <div className="space-y-4">
            {/* Ownership Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-2">
              <svg className="w-4 h-4" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              A Blessed HealthConnect Ltd Initiative
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {t.hero.title}
            </h1>
            
            <p className="text-base text-gray-600 leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/login"
                className="inline-flex items-center justify-center bg-teal-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-teal-700 transition-colors"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t.hero.cta_find}
              </Link>

              <Link 
                href="/register-pharmacy"
                className="inline-flex items-center justify-center bg-white text-teal-600 px-5 py-2.5 rounded-md font-medium border-2 border-teal-600 hover:bg-teal-50 transition-colors"
              >
                {t.hero.cta_register}
                <svg 
                  className="w-4 h-4 ml-2" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative h-64 md:h-80">
            <Image
              src="/pharmacist1.jpg"
              alt="Pharmacist at work"
              fill
              className="object-cover rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
