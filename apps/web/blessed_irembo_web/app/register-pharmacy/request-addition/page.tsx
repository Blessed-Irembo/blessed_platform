'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const content = {
  en: {
    title: "Request NPC Addition",
    subtitle: "If your pharmacy holds a valid Council Registration Number that is not present in our database, request addition below.",
    nameLabel: "Pharmacy Name",
    namePlaceholder: "Enter pharmacy name",
    nameRequired: "Pharmacy name is required",
    npcLabel: "Council Registration Number (NPC)",
    npcPlaceholder: "NPC/A0000",
    npcHint: "Format: NPC/A0000 — as issued by Rwanda NPC",
    npcRequired: "NPC registration number is required",
    npcFormatInvalid: "NPC format must match NPC/A0000",
    addressLabel: "District / Address",
    addressPlaceholder: "Enter district and physical address",
    addressRequired: "District / Address is required",
    emailLabel: "Email Address",
    emailPlaceholder: "owner@example.com",
    emailRequired: "Email address is required",
    emailInvalid: "Email address is invalid",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+250 788 123 456",
    phoneRequired: "Phone number is required",
    submitButton: "Submit Request",
    submitting: "Submitting…",
    backButton: "Back to Registration",
    successTitle: "Request Submitted!",
    successMessage: "Your request to add {pharmacyName} (NPC: {npcNumber}) has been submitted. Our team will verify it against NPC registries and update the database. We will contact you at {email} once verified.",
    generalError: "Failed to submit request. Please try again later.",
  },
  rw: {
    title: "Saba Kwongeramo NPC",
    subtitle: "Niba farumasi yawe ifite nimero y'ibyangombwa ya NPC yemewe ariko itari mu rutonde rwacu, saba ko yongerwamo hano hasi.",
    nameLabel: "Izina rya Farumasi",
    namePlaceholder: "Andika izina rya farumasi",
    nameRequired: "Izina rya farumasi rirakenewe",
    npcLabel: "Nimero ya NPC ya Farumasi",
    npcPlaceholder: "NPC/A0000",
    npcHint: "Uburyo bwanditsemo: NPC/A0000 — nk'uko yatanzwe na Rwanda NPC",
    npcRequired: "Nimero ya NPC irakenewe",
    npcFormatInvalid: "Uburyo bwa NPC bugomba kuba busa na NPC/A0000",
    addressLabel: "Akarere / Aho Iherereye",
    addressPlaceholder: "Andika akarere n'aho iherereye neza",
    addressRequired: "Akarere cyangwa aho iherereye rirakenewe",
    emailLabel: "Imeri",
    emailPlaceholder: "nyirayo@urugero.com",
    emailRequired: "Imeri irakenewe",
    emailInvalid: "Imeri ntabwo ari yo",
    phoneLabel: "Nimero ya Terefone",
    phonePlaceholder: "+250 788 123 456",
    phoneRequired: "Nimero ya terefone irakenewe",
    submitButton: "Ohereza Ubusabe",
    submitting: "Biroherezwa...",
    backButton: "Subira Kuri Kwiyandikisha",
    successTitle: "Ubusabe Bwoherejwe!",
    successMessage: "Ubusabe bwo kwongeramo farumasi {pharmacyName} (NPC: {npcNumber}) bwoherejwe. Itsinda ryacu rirasuzuma ibyangombwa bya NPC hanyuma riyishyire mu rutonde. Tuzakumenyesha kuri {email} bimaze kwemezwa.",
    generalError: "Gusaba byanze. Nyamuneka ongera ugerageze nyuma.",
  }
};

export default function RequestAdditionPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = content[language === 'rw' ? 'rw' : 'en'];

  const [formData, setFormData] = useState({
    pharmacyName: '',
    npcNumber: '',
    address: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pharmacyName.trim()) newErrors.pharmacyName = t.nameRequired;
    
    if (!formData.npcNumber.trim()) {
      newErrors.npcNumber = t.npcRequired;
    } else if (!formData.npcNumber.trim().match(/^NPC\/A\d{4}$/i)) {
      newErrors.npcNumber = t.npcFormatInvalid;
    }

    if (!formData.address.trim()) newErrors.address = t.addressRequired;
    
    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    if (!formData.phone.trim()) newErrors.phone = t.phoneRequired;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'pharmacy_addition_requests'), {
        pharmacyName: formData.pharmacyName.trim(),
        npcNumber: formData.npcNumber.toUpperCase().trim(),
        address: formData.address.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        createdAt: serverTimestamp(),
        status: 'pending',
      });
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting pharmacy request:', error);
      setErrors({ general: t.generalError });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    const successMsg = t.successMessage
      .replace('{pharmacyName}', formData.pharmacyName)
      .replace('{npcNumber}', formData.npcNumber.toUpperCase())
      .replace('{email}', formData.email);

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.successTitle}</h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            {successMsg}
          </p>
          <Link
            href="/register-pharmacy"
            className="w-full inline-block bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            {t.backButton}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/register-pharmacy" className="flex items-center text-gray-700 hover:text-teal-600 transition-colors">
                <svg className="w-6 h-6 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <span className="text-lg font-semibold text-gray-900">{t.title}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logo + title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Image src="/logo1.png" alt="Blessed Irembo" width={80} height={80} className="object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Pharmacy Name */}
            <div>
              <label htmlFor="pharmacyName" className="block text-sm font-semibold text-gray-700 mb-2">
                {t.nameLabel} <span className="text-teal-600">*</span>
              </label>
              <input
                type="text"
                id="pharmacyName"
                name="pharmacyName"
                value={formData.pharmacyName}
                onChange={handleChange}
                placeholder={t.namePlaceholder}
                className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.pharmacyName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
              />
              {errors.pharmacyName && <p className="mt-2 text-sm text-red-600 font-medium">{errors.pharmacyName}</p>}
            </div>

            {/* NPC License Number */}
            <div>
              <label htmlFor="npcNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                {t.npcLabel} <span className="text-teal-600">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">{t.npcHint}</p>
              <input
                type="text"
                id="npcNumber"
                name="npcNumber"
                value={formData.npcNumber}
                onChange={handleChange}
                placeholder={t.npcPlaceholder}
                className={`block w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 border uppercase font-mono ${errors.npcNumber ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
              />
              {errors.npcNumber && <p className="mt-2 text-sm text-red-600 font-medium">{errors.npcNumber}</p>}
            </div>

            {/* Address (District) */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                {t.addressLabel} <span className="text-teal-600">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={t.addressPlaceholder}
                className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.address ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
              />
              {errors.address && <p className="mt-2 text-sm text-red-600 font-medium">{errors.address}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                {t.emailLabel} <span className="text-teal-600">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t.emailPlaceholder}
                className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
              />
              {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                {t.phoneLabel} <span className="text-teal-600">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t.phonePlaceholder}
                className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
              />
              {errors.phone && <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  {t.submitting}
                </span>
              ) : (
                t.submitButton
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
