import React from 'react';
import { motion } from 'framer-motion';

interface ContactSectionProps {
  onOpenContactModal: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenContactModal }) => {
  return (
    <section id="contact" className="relative py-28 md:py-40 px-6 md:px-12 bg-[#202020] text-[#F5F3EE] border-t border-[#333333] overflow-hidden">
      <div className="max-w-[1700px] mx-auto space-y-20 relative z-10">

        {/* Section Header */}
        <div className="border-b border-[#333333] pb-4 font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest flex items-center justify-between">
          <span>07 // INQUIRY & CONTACT</span>
          <span>INDIA / WORLDWIDE</span>
        </div>

        {/* Dramatic Minimal High-Contrast Serif Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
          
          <div className="lg:col-span-8 space-y-6">
            <h2 className="font-serif font-normal text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] tracking-tight leading-[0.95] text-[#F5F3EE]">
              HAVE A PROJECT<br />
              IN MIND?
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#AAAAAA] font-light max-w-xl leading-relaxed">
              LET'S MAKE SOMETHING WORTH SEEING. WE PARTNER WITH SELECTED BRANDS AND FOUNDERS GLOBALLY.
            </p>
          </div>

          <div className="lg:col-span-4 space-y-8 flex flex-col justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenContactModal}
              className="w-full py-4 border border-[#F5F3EE] text-[#F5F3EE] hover:bg-[#F5F3EE] hover:text-[#202020] font-sans text-xs font-medium uppercase tracking-widest transition-all duration-300"
            >
              START A CONVERSATION →
            </motion.button>
          </div>

        </div>

        {/* Minimal Contact Details in Tiny Sans-Serif */}
        <div className="pt-12 border-t border-[#333333] grid grid-cols-1 sm:grid-cols-3 gap-8 font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest">
          <div className="space-y-1">
            <span className="text-[#F5F3EE] block font-medium">EMAIL</span>
            <a href="mailto:enquiryfoldstudio@gmail.com" className="hover:text-[#F5F3EE] transition-colors">
              enquiryfoldstudio@gmail.com
            </a>
          </div>

          <div className="space-y-1">
            <span className="text-[#F5F3EE] block font-medium">INSTAGRAM</span>
            <a href="https://www.instagram.com/foldstudio.in?stkn=MWkzazd4Zm54aDE3cw%3D%3D&utm_source=qr&wa_status_inline=true" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F3EE] transition-colors">
              @foldstudio.in
            </a>
          </div>

          <div className="space-y-1">
            <span className="text-[#F5F3EE] block font-medium">LOCATION</span>
            <span>HYDERABAD / MUMBAI / WORLDWIDE</span>
          </div>
        </div>

      </div>
    </section>
  );
};


