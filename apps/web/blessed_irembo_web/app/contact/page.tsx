'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/LanguageContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ContactPage() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    senderType: 'user', // defaults to regular user inquiry
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'support_inquiries'), {
        senderName: formData.name.trim(),
        senderEmail: formData.email.trim(),
        senderPhone: formData.phone.trim(),
        senderType: formData.senderType,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        senderType: 'user',
      });
    } catch (error: any) {
      console.error('Error submitting support inquiry:', error);
      setErrors({ general: 'Failed to send message. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t.contact.title}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Panel */}
          <div className="bg-teal-700 text-white rounded-2xl p-8 shadow-md flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-3">{t.contact.infoTitle}</h2>
                <p className="text-teal-100 text-sm leading-relaxed">
                  {t.contact.infoDesc}
                </p>
              </div>

              <div className="space-y-6 text-sm">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-200 uppercase tracking-wider text-xs mb-1">{t.contact.address}</h4>
                    <p className="font-medium text-white">{t.contact.addressValue}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-200 uppercase tracking-wider text-xs mb-1">{t.contact.phone}</h4>
                    <p className="font-medium text-white">{t.contact.phoneValue}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-200 uppercase tracking-wider text-xs mb-1">{t.contact.email}</h4>
                    <a href={`mailto:${t.contact.emailValue}`} className="font-medium text-white hover:underline">{t.contact.emailValue}</a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-200 uppercase tracking-wider text-xs mb-1">{t.contact.hours}</h4>
                    <p className="font-medium text-white">{t.contact.hoursValue}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-teal-600 mt-8 text-xs text-teal-200 text-center lg:text-left">
              © {new Date().getFullYear()} Blessed HealthConnect Ltd.
            </div>
          </div>

          {/* Contact Form Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm lg:col-span-2">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-6">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.contact.successTitle}</h3>
                  <p className="text-gray-600 max-w-sm mx-auto text-sm leading-relaxed">
                    {t.contact.successDesc}
                  </p>
                </div>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {errors.general}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Sender Type (Category) */}
                  <div className="sm:col-span-2">
                    <label htmlFor="senderType" className="block text-sm font-semibold text-gray-700 mb-2">
                      I am a...
                    </label>
                    <select
                      id="senderType"
                      name="senderType"
                      value={formData.senderType}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-medium"
                    >
                      <option value="user">Regular User (Patient / Customer)</option>
                      <option value="pharmacy">Pharmacy Owner / Staff</option>
                    </select>
                  </div>

                  {/* Sender Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.contact.nameLabel} <span className="text-teal-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder={t.contact.namePlaceholder}
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                    />
                    {errors.name && <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.contact.emailLabel} <span className="text-teal-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder={t.contact.emailPlaceholder}
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.contact.phoneLabel} <span className="text-teal-600">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      placeholder={t.contact.phonePlaceholder}
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                    />
                    {errors.phone && <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>}
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.contact.subjectLabel} <span className="text-teal-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      placeholder={t.contact.subjectPlaceholder}
                      value={formData.subject}
                      onChange={handleChange}
                      className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.subject ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                    />
                    {errors.subject && <p className="mt-2 text-sm text-red-600 font-medium">{errors.subject}</p>}
                  </div>

                  {/* Message Body */}
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.contact.messageLabel} <span className="text-teal-600">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      placeholder={t.contact.messagePlaceholder}
                      value={formData.message}
                      onChange={handleChange}
                      className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.message ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white resize-y`}
                    />
                    {errors.message && <p className="mt-2 text-sm text-red-600 font-medium">{errors.message}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      {t.contact.submitting}
                    </span>
                  ) : (
                    t.contact.submitButton
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
