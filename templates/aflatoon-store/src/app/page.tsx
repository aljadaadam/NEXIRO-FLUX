'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import CategoriesSection from '@/components/CategoriesSection';
import StarlinkSection from '@/components/StarlinkSection';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Header onLoginClick={() => setShowLogin(true)} />
      <main>
        <HeroSection onLoginClick={() => setShowLogin(true)} />
        <FeaturesSection />
        <CategoriesSection />
        <StarlinkSection />
      </main>
      <Footer />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
