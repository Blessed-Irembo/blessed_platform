'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">

        {/* Hero Section */}
        <section className="bg-teal-600 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">About Blessed Irembo</h1>
            <p className="text-teal-100 text-lg max-w-2xl mx-auto leading-relaxed">
              A digital healthcare bridge connecting Rwandans to trusted, licensed pharmacies across the country — quickly, easily, and reliably.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At Blessed Irembo, we believe that finding medication and healthcare services should never be a challenge. Our mission is to make pharmacy discovery effortless for every Rwandan citizen, while empowering local pharmacies to grow their visibility and serve their communities better.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We are passionate about bridging the gap between healthcare providers and the people who need them most — starting with pharmacies and expanding into a full healthcare digital ecosystem.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: '725+', label: 'Licensed Pharmacies' },
                { number: '100%', label: 'FDA Verified' },
                { number: '30', label: 'Districts Covered' },
                { number: '24/7', label: 'Platform Access' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
                  <div className="text-3xl font-bold text-teal-600 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="bg-white border-t border-gray-100 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <div className="prose prose-gray max-w-none text-gray-600 text-base leading-relaxed space-y-4">
              <p>
                Blessed Irembo was born out of a simple but powerful observation: in Rwanda, finding a pharmacy — especially one that has the specific medication you need — can be a time-consuming and frustrating experience. People often visit multiple pharmacies only to find that what they need is out of stock or unavailable.
              </p>
              <p>
                Our founders, driven by a commitment to improving healthcare access in Rwanda, set out to build a platform that would serve as a comprehensive directory of all licensed pharmacies, verified against the Rwanda FDA&apos;s official records, and presented in an easy-to-use digital format accessible from any smartphone or computer.
              </p>
              <p>
                Today, Blessed Irembo is operated by <strong>Blessed HealthConnect Ltd</strong>, a Rwandan company dedicated to leveraging technology for better healthcare outcomes across the country.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Growing Community</h2>
          <p className="text-gray-600 mb-8">Whether you are a patient looking for a pharmacy or a pharmacy owner wanting to grow — Blessed Irembo is for you.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/" className="bg-teal-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors">
              Find a Pharmacy
            </Link>
            <Link href="/for-pharmacies" className="bg-white border border-teal-300 text-teal-700 font-semibold px-8 py-3 rounded-xl hover:bg-teal-50 transition-colors">
              Register Your Pharmacy
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
