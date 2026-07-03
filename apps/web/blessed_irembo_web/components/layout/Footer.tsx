import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Footer Component
 * 
 * Site-wide footer with branding, quick links, and contact information.
 * Includes copyright notice and company details.
 */
export default function Footer() {
  const { t } = useLanguage();
  const quickLinks = [
    { label: t.footer.links.privacy, href: '/privacy-policy' },
    { label: t.footer.links.terms, href: '/terms' },
    { label: t.footer.links.help, href: '/help' },
    { label: t.footer.links.about, href: '/about' },
    { label: t.footer.links.forPharmacies, href: '/for-pharmacies' },
    { label: t.footer.contact, href: '/contact' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo1.png"
                alt="Blessed Irembo"
                width={80}
                height={80}
                className="object-contain"
              />
              <span className="text-xl font-bold text-gray-900">Blessed Irembo</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t.footer.desc}
            </p>
            <p className="text-gray-500 text-sm mt-3 font-medium">
              {t.footer.solution} <span className="text-teal-600 font-semibold">Blessed HealthConnect Ltd</span>.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-teal-600 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t.footer.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-start text-gray-600 text-sm">
                <svg
                  className="w-5 h-5 mr-2 mt-0.5 shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:support@blessedirembo.rw"
                  className="hover:text-teal-600 transition-colors"
                >
                  blessedirembo@gmail.com
                </a>
              </li>

              <li className="flex items-start text-gray-600 text-sm">
                <svg
                  className="w-5 h-5 mr-2 mt-0.5 shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a
                  href="tel:+250799538220"
                  className="hover:text-teal-600 transition-colors"
                >
                  +250 799 538 220
                </a>
              </li>

              <li className="flex items-start text-gray-600 text-sm">
                <svg
                  className="w-5 h-5 mr-2 mt-0.5 shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Blessed Irembo. {t.footer.rights}
          </p>
          <p className="text-gray-500 text-xs font-medium">
            {t.footer.operatedBy} Blessed HealthConnect Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}

