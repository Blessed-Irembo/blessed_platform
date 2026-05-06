'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

/**
 * Pharmacy Registration Page
 *
 * Verifies the pharmacy's Rwanda FDA council registration number (NPC/Axxxx)
 * against the licensed_pharmacies Firestore collection seeded from the
 * official December 2025 list. Only verified pharmacies may sign up.
 */
export default function RegisterPharmacyPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { signUpPharmacy, verifyLicenseNumber } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [formData, setFormData] = useState({
    pharmacyName: '',
    ownerName: '',
    email: '',
    phone: '',
    registrationNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    is24Hours: false,
    operatingDays: 'Everyday',
    openTime: '08:00',
    closeTime: '20:00',
  });

  // ── GPS location state ───────────────────────────────────────────────────
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState('');
  const [locationTab, setLocationTab] = useState<'gps' | 'coordinates' | 'description'>('gps');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationStatus('locating');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('success');
      },
      (err) => {
        setLocationStatus('error');
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError(t.pharmacies.locationDenied);
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError(t.pharmacies.locationUnavailable);
            break;
          default:
            setLocationError(t.pharmacies.locationUnable);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── License verification state ──────────────────────────────────────────
  const [licenseStatus, setLicenseStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid' | 'already_taken'
  >('idle');
  const [licensedName, setLicensedName] = useState(''); // name from the official list
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time license number check (debounced 600ms)
  useEffect(() => {
    const raw = formData.registrationNumber.trim();
    if (!raw) {
      setLicenseStatus('idle');
      setLicensedName('');
      return;
    }

    // Only call Firestore when format looks right
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLicenseStatus('checking');
      setLicensedName('');
      const result = await verifyLicenseNumber(raw);
      if (!result.valid) {
        setLicenseStatus('invalid');
      } else if (result.alreadyRegistered) {
        setLicenseStatus('already_taken');
        setLicensedName(result.name ?? '');
      } else {
        setLicenseStatus('valid');
        setLicensedName(result.name ?? '');
      }
    }, 600);
  }, [formData.registrationNumber, verifyLicenseNumber]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    // @ts-ignore
    const value = type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pharmacyName.trim()) newErrors.pharmacyName = t.registerPharmacy.errors.pharmacyNameRequired;
    if (!formData.ownerName.trim()) newErrors.ownerName = t.registerPharmacy.errors.ownerNameRequired;
    if (!formData.email.trim()) newErrors.email = t.registerPharmacy.errors.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t.registerPharmacy.errors.emailInvalid;
    if (!formData.phone.trim()) newErrors.phone = t.registerPharmacy.errors.phoneRequired;
    if (!formData.address.trim()) newErrors.address = t.registerPharmacy.errors.addressRequired;
    
    if (!formData.is24Hours) {
      if (!formData.openTime) newErrors.openTime = t.registerPharmacy.errors.openTimeRequired;
      if (!formData.closeTime) newErrors.closeTime = t.registerPharmacy.errors.closeTimeRequired;
    }

    if (!location && locationTab !== 'description') {
      newErrors.location = locationTab === 'gps'
        ? t.registerPharmacy.errors.locationRequired
        : t.registerPharmacy.errors.locationRequiredManual;
    }

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = t.registerPharmacy.errors.registrationNumberRequired;
    } else if (licenseStatus === 'invalid') {
      newErrors.registrationNumber = t.registerPharmacy.errors.registrationNumberNotFound;
    } else if (licenseStatus === 'already_taken') {
      newErrors.registrationNumber = t.registerPharmacy.errors.registrationNumberTaken;
    } else if (licenseStatus === 'checking') {
      newErrors.registrationNumber = t.registerPharmacy.errors.registrationNumberChecking;
    }

    if (!formData.password) newErrors.password = t.registerPharmacy.errors.passwordRequired;
    else if (formData.password.length < 6) newErrors.password = t.registerPharmacy.errors.passwordMinLength;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t.registerPharmacy.errors.passwordsMismatch;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signUpPharmacy(formData.email, formData.password, {
        pharmacyName: formData.pharmacyName,
        ownerName: formData.ownerName,
        phone: formData.phone,
        address: formData.address,
        registrationNumber: formData.registrationNumber,
        latitude: location?.lat ?? 0,
        longitude: location?.lng ?? 0,
        operatingHours: {
          is24Hours: formData.is24Hours,
          days: formData.operatingDays,
          openTime: formData.openTime,
          closeTime: formData.closeTime,
        }
      });
      // signUpPharmacy() creates the Firebase Auth session automatically.
      // Redirect straight to the pharmacy dashboard — no need to log in again.
      router.replace('/pharmacy/dashboard');
    } catch (error: any) {
      const msg: string = error.message ?? '';
      if (msg.includes('INVALID_LICENSE')) {
        setErrors({ registrationNumber: t.registerPharmacy.errors.registrationNumberNotFound });
      } else if (msg.includes('ALREADY_REGISTERED')) {
        setErrors({ registrationNumber: t.registerPharmacy.errors.registrationNumberTaken });
      } else if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: t.signup.errors.emailInUse });
      } else if (error.code === 'auth/weak-password') {
        setErrors({ password: t.signup.errors.weakPassword });
      } else {
        setErrors({ general: t.registerPharmacy.errors.generic });
      }
      setIsSubmitting(false);
    }
  };



  // ── License badge helper ─────────────────────────────────────────────────
  const LicenseBadge = () => {
    if (licenseStatus === 'idle') return null;
    if (licenseStatus === 'checking') {
      return (
        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
          {t.registerPharmacy.status.checking}
        </p>
      );
    }
    if (licenseStatus === 'valid') {
      return (
        <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {t.registerPharmacy.status.verified}: <span className="ml-1 font-semibold">{licensedName}</span>
        </p>
      );
    }
    if (licenseStatus === 'already_taken') {
      return (
        <p className="mt-2 text-sm text-amber-600 font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {t.registerPharmacy.status.alreadyRegistered} — <Link href="/login" className="underline">{t.registerPharmacy.signIn}</Link>
        </p>
      );
    }
    return (
      <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {t.registerPharmacy.status.notFound}
      </p>
    );
  };

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/get-started" className="flex items-center text-gray-700 hover:text-teal-600 transition-colors">
                <svg className="w-6 h-6 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <span className="text-lg font-semibold text-gray-900">{t.registerPharmacy.title}</span>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{t.registerPharmacy.title}</h1>
          <p className="text-gray-600">
            {t.registerPharmacy.subtitle}{' '}
            <span className="font-medium text-teal-700">{t.registerPharmacy.fdaList}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">

            {(errors as any).general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {(errors as any).general}
              </div>
            )}

            {/* ── Council Registration Number (most important — put first) ── */}
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                {t.registerPharmacy.labels.registrationNumber} <span className="text-teal-600">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {t.registerPharmacy.labels.registrationNumberHint}
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder={t.registerPharmacy.labels.registrationNumberPlaceholder}
                  className={`block w-full pl-14 pr-4 py-4 text-base text-gray-900 placeholder-gray-400 border uppercase font-mono ${licenseStatus === 'valid'
                      ? 'border-green-400 bg-green-50'
                      : licenseStatus === 'invalid' || licenseStatus === 'already_taken'
                        ? 'border-red-300'
                        : errors.registrationNumber
                          ? 'border-red-300'
                          : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                />
              </div>
              <LicenseBadge />
              {errors.registrationNumber && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.registrationNumber}</p>
              )}
            </div>

            {/* ── Pharmacy Name ── */}
            <div>
              <label htmlFor="pharmacyName" className="block text-sm font-semibold text-gray-700 mb-2">{t.registerPharmacy.labels.pharmacyName}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <input
                  type="text" id="pharmacyName" name="pharmacyName"
                  value={formData.pharmacyName} onChange={handleChange}
                  placeholder={t.registerPharmacy.labels.pharmacyNamePlaceholder}
                  className={`block w-full pl-14 pr-4 py-4 text-base text-gray-900 placeholder-gray-400 border ${errors.pharmacyName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                />
              </div>
              {errors.pharmacyName && <p className="mt-2 text-sm text-red-600 font-medium">{errors.pharmacyName}</p>}
            </div>

            {/* ── Owner Name ── */}
            <div>
              <label htmlFor="ownerName" className="block text-sm font-semibold text-gray-700 mb-2">{t.registerPharmacy.labels.ownerName}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text" id="ownerName" name="ownerName"
                  value={formData.ownerName} onChange={handleChange}
                  placeholder={t.registerPharmacy.labels.ownerNamePlaceholder}
                  className={`block w-full pl-14 pr-4 py-4 text-base text-gray-900 placeholder-gray-400 border ${errors.ownerName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                />
              </div>
              {errors.ownerName && <p className="mt-2 text-sm text-red-600 font-medium">{errors.ownerName}</p>}
            </div>

            {/* ── Phone ── */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">{t.registerPharmacy.labels.phone}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel" id="phone" name="phone"
                  value={formData.phone} onChange={handleChange}
                  placeholder={t.registerPharmacy.labels.phonePlaceholder}
                  className={`block w-full pl-14 pr-4 py-4 text-base text-gray-900 placeholder-gray-400 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                />
              </div>
              {errors.phone && <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>}
            </div>

            {/* ── Email ── */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">{t.registerPharmacy.labels.email}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email" id="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder={t.registerPharmacy.labels.emailPlaceholder}
                  className={`block w-full pl-14 pr-4 py-4 text-base text-gray-900 placeholder-gray-400 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
            </div>

            {/* ── Address ── */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">{t.registerPharmacy.labels.address}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text" id="address" name="address"
                  value={formData.address} onChange={handleChange}
                  placeholder={t.registerPharmacy.labels.addressPlaceholder}
                  className={`block w-full pl-14 pr-4 py-4 text-base text-gray-900 placeholder-gray-400 border ${errors.address ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                />
              </div>
              {errors.address && <p className="mt-2 text-sm text-red-600 font-medium">{errors.address}</p>}
            </div>

            {/* ── Operating Hours ── */}
            <div className="border-t border-gray-100 pt-6 mt-6 mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">{t.registerPharmacy.labels.operatingHours} <span className="text-teal-600">*</span></label>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="is24Hours"
                  name="is24Hours"
                  checked={formData.is24Hours}
                  onChange={handleChange as any}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="is24Hours" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                  {t.registerPharmacy.labels.is24Hours}
                </label>
              </div>

              {!formData.is24Hours && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t.registerPharmacy.labels.daysOpen}</label>
                    <select
                      name="operatingDays"
                      value={formData.operatingDays}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="Everyday">{t.pharmacyDetail.days.monday}-{t.pharmacyDetail.days.sunday}</option>
                      <option value="Monday - Friday">{t.pharmacyDetail.days.monday} - {t.pharmacyDetail.days.friday}</option>
                      <option value="Monday - Saturday">{t.pharmacyDetail.days.monday} - {t.pharmacyDetail.days.saturday}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t.registerPharmacy.labels.openingTime}</label>
                    <input
                      type="time"
                      name="openTime"
                      value={formData.openTime}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${errors.openTime ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm bg-white focus:ring-teal-500 focus:border-teal-500`}
                    />
                    {errors.openTime && <p className="mt-1 text-xs text-red-600">{errors.openTime}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t.registerPharmacy.labels.closingTime}</label>
                    <input
                      type="time"
                      name="closeTime"
                      value={formData.closeTime}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${errors.closeTime ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm bg-white focus:ring-teal-500 focus:border-teal-500`}
                    />
                    {errors.closeTime && <p className="mt-1 text-xs text-red-600">{errors.closeTime}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Location (3-way picker) ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.registerPharmacy.labels.location} <span className="text-teal-600">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                {t.registerPharmacy.labels.locationHint}
              </p>

              {/* Tab switcher */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4 text-sm font-medium">
                {(['gps', 'coordinates', 'description'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setLocationTab(tab)}
                    className={`flex-1 py-2.5 transition-colors ${locationTab === tab
                        ? 'bg-teal-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {tab === 'gps' && `📍 ${t.registerPharmacy.labels.gpsTab}`}
                    {tab === 'coordinates' && `🗺️ ${t.registerPharmacy.labels.manualTab}`}
                    {tab === 'description' && `✏️ ${t.registerPharmacy.labels.descriptionTab}`}
                  </button>
                ))}
              </div>

              {/* Tab 1 — GPS */}
              {locationTab === 'gps' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    {t.registerPharmacy.labels.gpsHint}
                  </p>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationStatus === 'locating'}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all ${locationStatus === 'success'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : locationStatus === 'error'
                          ? 'border-red-300 bg-red-50 text-red-700'
                          : 'border-teal-400 bg-teal-50 text-teal-700 hover:bg-teal-100'
                      } disabled:opacity-60`}
                  >
                    {locationStatus === 'locating' ? (
                      <><span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />{t.registerPharmacy.labels.gpsLocating}</>
                    ) : locationStatus === 'success' ? (
                      <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{t.registerPharmacy.labels.gpsSuccess}</>
                    ) : (
                      <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{t.registerPharmacy.labels.gpsButton}</>
                    )}
                  </button>
                  {locationStatus === 'success' && location && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <div>
                        <p className="text-sm font-semibold text-green-800">{t.registerPharmacy.labels.gpsCaptured}</p>
                        <p className="text-xs text-green-600 font-mono">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                      </div>
                    </div>
                  )}
                  {locationStatus === 'error' && (
                    <p className="text-sm text-red-600 font-medium">{locationError}</p>
                  )}
                </div>
              )}

              {/* Tab 2 — Manual coordinates */}
              {locationTab === 'coordinates' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    {t.registerPharmacy.labels.manualHint}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t.registerPharmacy.labels.latitude}</label>
                      <input
                        type="number"
                        step="any"
                        id="manualLat"
                        placeholder="-2.087528"
                        value={manualLat}
                        onChange={(e) => {
                          setManualLat(e.target.value);
                          const lat = parseFloat(e.target.value);
                          const lng = parseFloat(manualLng);
                          if (!isNaN(lat) && !isNaN(lng)) setLocation({ lat, lng });
                        }}
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t.registerPharmacy.labels.longitude}</label>
                      <input
                        type="number"
                        step="any"
                        id="manualLng"
                        placeholder="29.754750"
                        value={manualLng}
                        onChange={(e) => {
                          setManualLng(e.target.value);
                          const lat = parseFloat(manualLat);
                          const lng = parseFloat(e.target.value);
                          if (!isNaN(lat) && !isNaN(lng)) setLocation({ lat, lng });
                        }}
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  {location && locationTab === 'coordinates' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <p className="text-sm font-semibold text-green-800">{t.registerPharmacy.labels.coordinatesSet}: <span className="font-mono font-normal">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span></p>
                    </div>
                  )}
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    {t.registerPharmacy.labels.openMaps}
                  </a>
                </div>
              )}

              {/* Tab 3 — Description only */}
              {locationTab === 'description' && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-amber-800">
                      {t.registerPharmacy.labels.descriptionHint}
                    </p>
                  </div>
                </div>
              )}

              {/* Shared validation error */}
              {errors.location && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.location}</p>
              )}
            </div>

            {/* ── Password ── */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">{t.registerPharmacy.labels.password}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password" name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder={t.registerPharmacy.labels.passwordPlaceholder}
                  className={`block w-full pl-14 pr-14 py-4 text-base text-gray-900 placeholder-gray-400 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword
                      ? <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    }
                  </svg>
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>}
            </div>

            {/* ── Confirm Password ── */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">{t.registerPharmacy.labels.confirmPassword}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword" name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder={t.registerPharmacy.labels.confirmPasswordPlaceholder}
                  className={`block w-full pl-14 pr-14 py-4 text-base text-gray-900 placeholder-gray-400 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    {showConfirmPassword
                      ? <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    }
                  </svg>
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>}
            </div>

            {/* ── FDA verification notice ── */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-sm text-teal-800">
                  {t.registerPharmacy.labels.fdaNotice}
                </p>
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={isSubmitting || licenseStatus === 'checking' || licenseStatus === 'invalid' || licenseStatus === 'already_taken'}
              className="w-full bg-teal-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  {t.registerPharmacy.registering}
                </span>
              ) : (
                t.registerPharmacy.submitButton
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-base text-gray-600">
            {t.registerPharmacy.alreadyAccount}{' '}
            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">{t.registerPharmacy.signIn}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
