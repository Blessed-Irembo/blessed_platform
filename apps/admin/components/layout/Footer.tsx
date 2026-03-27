import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Logo and Description */}
          <div>
            <Image
              src="/logo1.png"
              alt="Blessed Irembo"
              width={40}
              height={40}
              className="mb-4"
            />
            <p className="text-gray-600 text-sm">
              Connecting Rwandans with trusted pharmacies nationwide. Find medication quickly and easily.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-teal-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-teal-600">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/for-pharmacies" className="hover:text-teal-600">
                  For Pharmacies
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-teal-600">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          © 2025 Blessed Irembo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
