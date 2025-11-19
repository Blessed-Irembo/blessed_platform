import Link from 'next/link';
import Image from 'next/image';

/**
 * Pharmacy Owners Section Component
 * 
 * Dedicated section targeting pharmacy owners, highlighting benefits
 * of joining the platform with a call-to-action for registration.
 */
export default function PharmacyOwnersSection() {
  const benefits = [
    {
      title: '3-Month Free Trial',
      description: 'Get started with no upfront costs'
    },
    {
      title: 'Increased Visibility',
      description: 'Reach customers across Rwanda'
    },
    {
      title: 'Direct Customer Inquiries',
      description: 'Manage all customer questions in one place'
    }
  ];

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image */}
          <div className="relative h-96 md:h-[500px] order-2 md:order-1">
            <Image
              src="/pharmacist2.jpg"
              alt="Pharmacy owner working"
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Right Column - Content */}
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              For Pharmacy Owners
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Join Rwanda&apos;s leading pharmacy network and connect with customers 
              looking for your services.
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  {/* Checkmark Icon */}
                  <div className="shrink-0 mt-1">
                    <svg 
                      className="w-6 h-6 text-teal-600" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                  
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link 
                href="/register-pharmacy"
                className="inline-flex items-center bg-teal-600 text-white px-6 py-3 rounded-md font-medium hover:bg-teal-700 transition-colors"
              >
                Register Your Pharmacy
                <svg 
                  className="w-5 h-5 ml-2" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
