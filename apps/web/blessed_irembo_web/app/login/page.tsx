'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useRedirectIfAuth } from '@/lib/authHooks';
import { useLanguage } from '@/lib/LanguageContext';
import Header from '@/components/layout/Header';

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { signIn } = useAuth();
  // Redirect already-logged-in users straight to the app
  useRedirectIfAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic client-side validation
    if (!identifier.trim()) {
      setErrors({ identifier: t.login.errors.identifierRequired });
      return;
    }
    if (!password || password.length < 6) {
      setErrors({ password: t.login.errors.passwordMinLength });
      return;
    }

    setIsLoading(true);

    try {
      const role = await signIn(identifier, password);
      // Role-based redirect: pharmacies go to dashboard, users go to map
      if (role === 'pharmacy') {
        router.replace('/pharmacy/dashboard');
      } else {
        router.replace('/pharmacies');
      }
    } catch (error: any) {
      // Map Firebase error codes to friendly messages
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setErrors({ general: t.login.errors.invalidCredentials });
          break;
        case 'auth/too-many-requests':
          setErrors({ general: t.login.errors.tooManyRequests });
          break;
        case 'auth/user-disabled':
          setErrors({ general: t.login.errors.accountDisabled });
          break;
        default:
          console.error("Login error:", error);
          setErrors({ general: t.login.errors.generic });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Immediately show Splash Screen as soon as Sign In is clicked ──────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24 animate-bounce">
            <Image
              src="/logo1.png"
              alt="Blessed Irembo"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Blessed Irembo</h1>
          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t.login.signingIn}
          </div>
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-gray-400 tracking-widest uppercase">
            {t.common.poweredBy} <span className="text-teal-700 font-bold">Orahcast</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo1.png"
              alt="Blessed Irembo"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t.login.title}
            </h1>
            <p className="text-gray-600">
              {t.login.subtitle}
            </p>
          </div>

        {/* Login Form Card */}
        <div className="bg-white py-8 px-6 shadow-md rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* Email or Phone Address Field */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                {t.login.emailLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.identifier ? 'border-red-300' : 'border-gray-300'
                  } rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  placeholder={t.login.emailPlaceholder}
                />
              </div>
              {errors.identifier && (
                <p className="mt-2 text-sm text-red-600">{errors.identifier}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.login.passwordLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  placeholder={t.login.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link 
                  href="/forgot-password" 
                  className="font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  {t.login.forgotPassword}
                </Link>
              </div>
            </div>

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t.login.signingIn}
                  </span>
                ) : (
                  t.login.signInButton
                )}
              </button>
            </div>


          </form>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t.login.noAccount}{' '}
            <Link 
              href="/get-started" 
              className="font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              {t.login.getStarted}
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
