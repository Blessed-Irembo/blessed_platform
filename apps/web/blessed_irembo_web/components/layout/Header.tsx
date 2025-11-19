import Link from 'next/link';
import Image from 'next/image';

/**
 * Header Component
 * 
 * Main navigation header with logo, navigation links, and action buttons.
 * Responsive design with mobile-friendly navigation.
 */
export default function Header() {
  return (
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
              className="text-teal-600 font-medium hover:text-teal-700 transition-colors"
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              type="button"
              className="text-gray-700 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Open menu"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
