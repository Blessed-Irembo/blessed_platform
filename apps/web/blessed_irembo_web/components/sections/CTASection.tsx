import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Call-to-Action Section Component
 * 
 * Bottom CTA section encouraging users to search for pharmacies.
 * Features prominent heading and search button on branded background.
 */
export default function CTASection() {
  const { t } = useLanguage();
  return (
    <section className="bg-teal-600 py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t.cta.title}
        </h2>
        
        <p className="text-lg text-teal-50 mb-8">
          {t.cta.subtitle}
        </p>

        <Link 
          href="/login"
          className="inline-flex items-center bg-white text-teal-600 px-8 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors shadow-lg"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {t.cta.button}
        </Link>
      </div>
    </section>
  );
}

