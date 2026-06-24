'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function RequestAdditionPage() {
  const router = useRouter();
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

    if (!formData.pharmacyName.trim()) newErrors.pharmacyName = 'Pharmacy name is required';
    
    if (!formData.npcNumber.trim()) {
      newErrors.npcNumber = 'NPC registration number is required';
    } else if (!formData.npcNumber.trim().match(/^NPC\/A\d{4}$/i)) {
      newErrors.npcNumber = 'NPC format must match NPC/A0000';
    }

    if (!formData.address.trim()) newErrors.address = 'District / Address is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

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
      setErrors({ general: 'Failed to submit request. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Your request to add <strong className="text-gray-900">{formData.pharmacyName}</strong> (NPC: {formData.npcNumber.toUpperCase()}) has been submitted. Our team will verify it against NPC registries and update the database. We will contact you at <strong className="text-gray-900">{formData.email}</strong> once verified.
          </p>
          <Link
            href="/register-pharmacy"
            className="w-full inline-block bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            Back to Registration
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
          <div className="flex items-center h-16">
            <Link href="/register-pharmacy" className="flex items-center text-gray-700 hover:text-teal-600 transition-colors">
              <svg className="w-6 h-6 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-lg font-semibold text-gray-900 mx-auto">Request NPC Addition</span>
          </div>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logo + title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Image src="/logo1.png" alt="Blessed Irembo" width={80} height={80} className="object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Request NPC Addition</h1>
          <p className="text-gray-600">
            If your pharmacy holds a valid Council Registration Number that is not present in our database, request addition below.
          </p>
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
                Pharmacy Name <span className="text-teal-600">*</span>
              </label>
              <input
                type="text"
                id="pharmacyName"
                name="pharmacyName"
                value={formData.pharmacyName}
                onChange={handleChange}
                placeholder="Enter pharmacy name"
                className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.pharmacyName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
              />
              {errors.pharmacyName && <p className="mt-2 text-sm text-red-600 font-medium">{errors.pharmacyName}</p>}
            </div>

            {/* NPC License Number */}
            <div>
              <label htmlFor="npcNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                Council Registration Number (NPC) <span className="text-teal-600">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Format: <code className="bg-gray-100 px-1 rounded">NPC/A0000</code> — as issued by Rwanda NPC
              </p>
              <input
                type="text"
                id="npcNumber"
                name="npcNumber"
                value={formData.npcNumber}
                onChange={handleChange}
                placeholder="NPC/A0000"
                className={`block w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 border uppercase font-mono ${errors.npcNumber ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
              />
              {errors.npcNumber && <p className="mt-2 text-sm text-red-600 font-medium">{errors.npcNumber}</p>}
            </div>

            {/* Address (District) */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                District / Address <span className="text-teal-600">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter district and physical address"
                className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.address ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
              />
              {errors.address && <p className="mt-2 text-sm text-red-600 font-medium">{errors.address}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-teal-600">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="owner@example.com"
                className={`block w-full px-4 py-3 text-base text-gray-900 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
              />
              {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-teal-600">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+250 788 123 456"
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
                  Submitting…
                </span>
              ) : (
                'Submit Request'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
