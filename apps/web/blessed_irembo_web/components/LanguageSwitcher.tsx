'use client';

import { useLanguage } from '@/lib/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'rw' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-sm font-semibold text-gray-700"
      title={language === 'en' ? 'Hindura ururimi ube mu Kinyarwanda' : 'Switch to English'}
    >
      <span className={language === 'en' ? 'text-teal-600' : 'text-gray-400'}>EN</span>
      <span className="w-px h-3 bg-gray-300" />
      <span className={language === 'rw' ? 'text-teal-600' : 'text-gray-400'}>RW</span>
    </button>
  );
}
