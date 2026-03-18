import Link from 'next/link';
import Image from 'next/image';

/**
 * Get Started Page
 * 
 * Account type selection page where users choose between
 * creating a regular user account or registering a pharmacy.
 * Displays features and benefits for each account type.
 */
export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="shrink-0">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logo1.png"
                  alt="Blessed Irembo"
                  width={80}
                  height={80}
                  priority
                  className="object-contain"
                />
                <span className="text-xl font-bold text-gray-900">Blessed Irembo</span>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-gray-700 font-medium hover:text-teal-600 transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/pharmacies" 
                className="text-gray-700 font-medium hover:text-teal-600 transition-colors"
              >
                Find Pharmacies
              </Link>
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 font-medium hover:text-teal-600 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/get-started" 
                className="bg-teal-600 text-white px-6 py-2 rounded-md font-medium hover:bg-teal-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo1.png"
            alt="Blessed Irembo"
            width={50}
            height={50}
            className="object-contain"
          />
        </div>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Get Started with Blessed Irembo
          </h1>
          <p className="text-sm text-gray-600">
            Choose your account type to begin connecting with Rwanda&apos;s pharmacy network
          </p>
        </div>

        {/* Account Type Cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {/* User Account Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col hover:shadow-lg transition-shadow">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-teal-600" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>

            {/* Title and Description */}
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                I&apos;m a User
              </h2>
              <p className="text-xs text-gray-600">
                Find and connect with pharmacies
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-2.5 mb-6 flex-grow">
              <li className="flex items-start">
                <div className="shrink-0 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Search pharmacies nationwide</span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">View verified pharmacy information</span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Send inquiries directly to pharmacies</span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Access 24/7 pharmacy locations</span>
              </li>
            </ul>

            {/* CTA Button */}
            <Link 
              href="/signup"
              className="w-full bg-teal-600 text-white py-2.5 px-5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center group"
            >
              Continue as User
              <svg 
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Pharmacy Account Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col relative hover:shadow-lg transition-shadow">
            {/* Trial Badge */}
            <div className="absolute top-4 right-4">
              <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                3-Month Free Trial
              </span>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-blue-500"
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>

            {/* Title and Description */}
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                I&apos;m a Pharmacy
              </h2>
              <p className="text-xs text-gray-600">
                Register your pharmacy business
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-2.5 mb-6 flex-grow">
              <li className="flex items-start">
                <div className="shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">3-month free trial (no credit card required)</span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Nationwide visibility on our platform</span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Manage customer inquiries in one dashboard</span>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Verification badge for credibility</span>
              </li>
            </ul>

            {/* CTA Button */}
            <Link 
              href="/register-pharmacy"
              className="w-full bg-blue-500 text-white py-2.5 px-5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center group"
            >
              Continue as Pharmacy
              <svg 
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Already have account link */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-teal-600 font-medium hover:text-teal-700 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
