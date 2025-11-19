import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import PharmacyOwnersSection from '@/components/sections/PharmacyOwnersSection';
import CTASection from '@/components/sections/CTASection';

/**
 * Home Page
 * 
 * Main landing page showcasing the Blessed Irembo platform.
 * Combines multiple sections to present the platform's value proposition,
 * features, and calls-to-action for both users and pharmacy owners.
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="grow">
        <HeroSection />
        <FeaturesSection />
        <PharmacyOwnersSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}
