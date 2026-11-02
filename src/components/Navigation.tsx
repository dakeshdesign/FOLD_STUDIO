import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  onOpenContactModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenContactModal }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'HOME', href: '#hero' },
    { label: 'ABOUT', href: '#about' },
    { label: 'SERVICES', href: '#services' },
    { label: 'WORK', href: '#work' },
    { label: 'TEAM', href: '#team' },
    { label: 'CONTACT', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (href === '#contact') {
      onOpenContactModal();
      return;
    }

    if (href === '#hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#F5F3EE]/95 backdrop-blur-md py-4 border-b border-[#E5E2DA]'
            : 'bg-transparent py-6 md:py-8'
        }`}
      >
        <div className="max-w-[1700px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Mark: Elegant Bodoni Serif FOLD */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center space-x-2 text-left focus:outline-none"
          >
            <span className="font-serif font-normal text-2xl md:text-3xl tracking-tight text-[#202020]">
              FOLD
            </span>
          </a>

          {/* Desktop Nav: Small Minimal Sans-Serif */}
          <nav className="hidden md:flex items-center space-x-8 font-sans text-[11px] font-medium tracking-widest text-[#202020]/80 uppercase">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="relative py-1 transition-colors hover:text-[#202020]"
              >
                <span>{item.label}</span>
              </a>
            ))}

            <button
              onClick={onOpenContactModal}
              className="text-[11px] font-sans font-medium tracking-widest text-[#202020] uppercase border-b border-[#202020] pb-0.5 hover:opacity-60 transition-opacity ml-4"
            >
              START A PROJECT
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#202020] focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Editorial Overlay Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-[#F5F3EE] flex flex-col justify-between p-8 pt-28 md:hidden border-b border-[#E5E2DA]"
          >
            <div className="space-y-8">
              <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest block border-b border-[#E5E2DA] pb-3">
                FOLD // INDEX
              </span>

              <div className="flex flex-col space-y-4">
                {navItems.map((item, idx) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="flex items-baseline justify-between border-b border-[#E5E2DA] pb-3 group"
                  >
                    <span className="font-serif text-3xl font-normal uppercase text-[#202020] transition-colors">
                      {item.label}
                    </span>
                    <span className="font-sans text-[10px] text-[#8E8B82]">0{idx + 1}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-[#E5E2DA] font-sans text-[11px] text-[#8E8B82]">
              <div className="flex justify-between items-center">
                <a
                  href="mailto:enquiryfoldstudio@gmail.com"
                  className="hover:text-[#202020] transition-colors"
                >
                  ENQUIRYFOLDSTUDIO@GMAIL.COM
                </a>
                <span>INDIA / WORLDWIDE</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContactModal();
                }}
                className="w-full py-3.5 bg-[#202020] text-[#F5F3EE] font-sans text-xs font-medium tracking-widest uppercase flex items-center justify-center space-x-2"
              >
                <span>START A PROJECT</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

