'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

/**
 * Admin Login Page
 * 
 * Admin authentication page with email/password login.
 */

// Demo admin credentials
const DEMO_ADMIN_CREDENTIALS = [
  { email: 'admin@blessedirembo.rw', password: 'admin123', name: 'Admin User' },
  { email: 'superadmin@blessedirembo.rw', password: 'super123', name: 'Super Admin' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        setErrors({ email: 'Please enter a valid email address' });
        setIsLoading(false);
        return;
      }

      // Validate password
      if (!password || password.length < 6) {
        setErrors({ password: 'Password must be at least 6 characters' });
        setIsLoading(false);
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check against demo credentials
      const matchedAdmin = DEMO_ADMIN_CREDENTIALS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (matchedAdmin) {
        // Store admin session
        const adminSession = {
          email: matchedAdmin.email,
          name: matchedAdmin.name,
          role: 'admin',
          loggedInAt: new Date().toISOString(),
        };
        
        if (rememberMe) {
          localStorage.setItem('adminUser', JSON.stringify(adminSession));
        } else {
          sessionStorage.setItem('adminUser', JSON.stringify(adminSession));
        }

        // Redirect to admin dashboard
        router.push('/dashboard');
      } else {
        // Invalid credentials
        setErrors({ general: 'Invalid email or password. Please use admin credentials.' });
        setIsLoading(false);
      }

    } catch (error: any) {
      setErrors({ general: 'An error occurred. Please try again.' });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo1.png"
                  alt="Blessed Irembo"
                  width={40}
                  height={40}
                  priority
                  className="object-contain"
                />
                <span className="text-lg font-semibold text-gray-900">Blessed Irembo</span>
              </Link>
            </div>

            {/* Admin Badge */}
            <div className="bg-teal-50 text-teal-600 px-4 py-2 rounded-lg font-medium">
              Admin Portal
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo1.png"
              alt="Blessed Irembo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600">
              Sign in to access the admin dashboard
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

            {/* Email Address Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg 
                    className="h-6 w-6 text-gray-400" 
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
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-14 pr-4 py-4 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base`}
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg 
                    className="h-6 w-6 text-gray-400" 
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
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-14 pr-4 py-4 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-md text-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-2">
                Demo credentials for testing:
              </p>
              <div className="space-y-1 text-sm text-gray-600 text-center bg-blue-50 p-4 rounded-lg">
                <p><strong>Admin:</strong> admin@blessedirembo.rw / admin123</p>
              </div>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
