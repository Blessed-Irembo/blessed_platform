'use client';

import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/LanguageContext';

export default function DownloadAppPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & Store Buttons */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                {language === 'en' ? 'Now Available on Mobile' : 'Ubu yageze kuri Terefone'}
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-none">
                {t.download.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                {t.download.subtitle}
              </p>
            </div>

            {/* App Store / Google Play Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {/* Google Play Store Button */}
              <a
                href="#"
                className="flex items-center gap-3 bg-gray-950 text-white px-5 py-3 rounded-xl hover:bg-teal-950 hover:scale-[1.02] active:scale-100 transition-all shadow-md shadow-gray-200"
              >
                <svg className="w-6 h-6 text-white fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M3 1.814C3 1.157 3.518.59 4.195.59c.28 0 .548.093.774.26L16.488 8.03c.516.335.794.887.794 1.47 0 .584-.278 1.136-.794 1.47L4.97 18.15c-.226.167-.494.26-.775.26-.677 0-1.195-.567-1.195-1.224V1.814z" opacity=".15"/>
                  <path d="M3.609 1.814C3.218 2.215 3 2.83 3 3.595v16.809c0 .766.218 1.38.609 1.781l.069.063L14.86 11.082v-.165L3.678 1.751l-.069.063z" fill="#ea4335"/>
                  <path d="M18.59 14.856l-3.73-3.774v-.165l3.73-3.774.086.049c.435.247.73.71.73 1.282 0 .572-.295 1.034-.73 1.282l-.086.049z" fill="#fbbc04"/>
                  <path d="M14.86 11.082L3.678 22.25l14.912-8.465-3.73-2.703z" fill="#34a853"/>
                  <path d="M14.86 10.917l3.73-2.703L3.678.33l11.182 10.587z" fill="#4285f4"/>
                </svg>
                <div className="text-left leading-none">
                  <p className="text-[10px] uppercase font-bold text-teal-400 tracking-wider mb-0.5">
                    {language === 'en' ? 'Get it on' : 'Yikure kuri'}
                  </p>
                  <p className="text-sm font-bold">Google Play</p>
                </div>
              </a>

              {/* Apple App Store Button */}
              <a
                href="#"
                className="flex items-center gap-3 bg-gray-950 text-white px-5 py-3 rounded-xl hover:bg-teal-950 hover:scale-[1.02] active:scale-100 transition-all shadow-md shadow-gray-200"
              >
                <svg className="w-6 h-6 text-white fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.5-1.31.02-1.72-.78-3.22-.78-1.5 0-1.96.75-3.21.8-1.35.05-2.24-1.19-3.09-2.45C4.41 17 3.1 12.28 4.87 9.21c.88-1.52 2.44-2.48 4.14-2.5 1.3-.02 2.53.88 3.33.88.8 0 2.27-.92 3.81-.76 1.54.06 2.94.61 3.58 1.99-3.29 1.93-2.76 6.01.28 7.26-1.03 2.5-2.1 3.92-3.1 5.42zM15.9 5.29c.67-.81 1.11-1.95.99-3.09-1.07.04-2.37.71-3.14 1.6-.67.76-1.25 1.92-1.13 3.03 1.2.09 2.41-.66 3.28-1.54z" />
                </svg>
                <div className="text-left leading-none">
                  <p className="text-[10px] uppercase font-bold text-teal-400 tracking-wider mb-0.5">
                    {language === 'en' ? 'Download on the' : 'Manura kuri'}
                  </p>
                  <p className="text-sm font-bold">App Store</p>
                </div>
              </a>
            </div>

            {/* Simulated QR Code Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 max-w-lg">
              {/* Styled QR Code SVG representation */}
              <div className="w-28 h-28 bg-teal-50 rounded-xl p-2.5 flex items-center justify-center shrink-0 border border-teal-100">
                <svg className="w-full h-full text-teal-900" viewBox="0 0 100 100" fill="currentColor">
                  {/* Outer corners */}
                  <rect x="5" y="5" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="12" y="12" width="11" height="11" rx="1.5" />
                  
                  <rect x="70" y="5" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="77" y="12" width="11" height="11" rx="1.5" />
                  
                  <rect x="5" y="70" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="12" y="77" width="11" height="11" rx="1.5" />

                  {/* Alignment squares */}
                  <rect x="75" y="75" width="10" height="10" rx="1" />
                  
                  {/* Dotted structure representation */}
                  <rect x="38" y="8" width="8" height="8" rx="1" />
                  <rect x="52" y="15" width="8" height="8" rx="1" />
                  <rect x="38" y="24" width="8" height="8" rx="1" />
                  <rect x="8" y="38" width="8" height="8" rx="1" />
                  <rect x="20" y="50" width="8" height="8" rx="1" />
                  <rect x="38" y="38" width="8" height="8" rx="1" />
                  <rect x="50" y="38" width="8" height="8" rx="1" />
                  <rect x="62" y="38" width="8" height="8" rx="1" />
                  
                  <rect x="38" y="52" width="8" height="8" rx="1" />
                  <rect x="52" y="52" width="8" height="8" rx="1" />
                  <rect x="8" y="52" width="8" height="8" rx="1" />
                  <rect x="52" y="70" width="8" height="8" rx="1" />
                  <rect x="38" y="75" width="8" height="8" rx="1" />
                  <rect x="58" y="84" width="8" height="8" rx="1" />
                  <rect x="75" y="52" width="8" height="8" rx="1" />
                  <rect x="84" y="38" width="8" height="8" rx="1" />
                </svg>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-gray-900 text-base">{t.download.qrTitle}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t.download.qrText}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: App Mockup Screenshot */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative max-w-[340px] w-full drop-shadow-2xl hover:scale-[1.01] transition-transform duration-300">
              <Image
                src="/images/photo-for-download-page.png"
                alt="Blessed Irembo Mobile App Preview"
                width={340}
                height={695}
                priority
                className="w-full h-auto rounded-[3.2rem] object-contain border border-gray-200 bg-white"
              />
            </div>
          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 border-t border-gray-200 pt-16">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-12">
            {t.download.featuresTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-teal-300 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.download.feature1Title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{t.download.feature1Desc}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-teal-300 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.download.feature2Title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{t.download.feature2Desc}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-teal-300 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.download.feature3Title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{t.download.feature3Desc}</p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
