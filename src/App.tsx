import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Preloader } from './components/Preloader';
import { CustomCursor } from './components/CustomCursor';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { BookingStrip } from './components/BookingStrip';
import { IntroStatement } from './components/IntroStatement';
import { Services } from './components/Services';
import { SelectedWork } from './components/SelectedWork';
import { StudioSection } from './components/StudioSection';
import { ContactSection } from './components/ContactSection';
import { ProjectModal } from './components/ProjectModal';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const handlePreloaderComplete = useCallback(() => {
    setLoading(false);
  }, []);

  // Lock body scroll while loading overlay is active
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [loading]);

  const handleOpenContact = (serviceName?: string) => {
    if (serviceName) {
      setSelectedService(serviceName);
    }
    setIsContactModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#F5F3EE] text-[#202020] selection:bg-[#202020] selection:text-[#F5F3EE] font-sans antialiased overflow-x-hidden">
      {/* Custom Follower Cursor */}
      <CustomCursor />

      {/* Full-Screen Loading Overlay with Curtain Exit */}
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={handlePreloaderComplete} />}
      </AnimatePresence>

      {/* Official FOLD Studio Website (Mounted underneath loader) */}
      <div className="relative w-full min-h-screen">
        {/* Navigation */}
        <Navigation onOpenContactModal={() => handleOpenContact()} />

        {/* 4. Editorial Split Hero */}
        <Hero onOpenContactModal={() => handleOpenContact()} />

        {/* 6. Booking / Availability Strip */}
        <BookingStrip text="NOW BOOKING SELECT PROJECTS FOR 2026 — FOLD CREATIVE STUDIO" />

        {/* 7 & 8. About FOLD & Studio Philosophy */}
        <IntroStatement />

        {/* 5. Single Studio Services Section */}
        <Services onOpenContactModal={() => handleOpenContact()} />

        {/* 10 & 11. Selected Work & Featured Project */}
        <SelectedWork onOpenContactModal={() => handleOpenContact()} />

        {/* 9. Team Section */}
        <StudioSection onOpenContactModal={() => handleOpenContact()} />

        {/* 12 & 13. Final CTA & Contact */}
        <ContactSection onOpenContactModal={() => handleOpenContact()} />

        {/* 14. Footer */}
        <Footer onOpenContactModal={() => handleOpenContact()} />

        {/* Project Inquiry Modal */}
        <ProjectModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          initialService={selectedService}
        />
      </div>
    </div>
  );
};

export default App;

