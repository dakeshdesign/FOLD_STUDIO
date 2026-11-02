import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  onOpenContactModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenContactModal }) => {
  return (
    <section id="hero" className="relative min-h-screen w-full pt-20 md:pt-24 bg-[#1C1B19] text-[#F5F3EE] flex flex-col justify-between overflow-hidden">
      {/* Top Editorial Sub-bar */}
      <div className="max-w-[1700px] w-full mx-auto px-6 md:px-12 py-4 border-b border-[#333333]/80 flex flex-col sm:flex-row items-baseline justify-between gap-4 font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E54000]" />
          <span>FOLD // INDEPENDENT CREATIVE STUDIO</span>
        </div>
        <div>INDIA / WORKING WORLDWIDE — 2026</div>
      </div>

      {/* Main Split Hero Layout */}
      <div className="max-w-[1700px] w-full mx-auto my-auto px-6 md:px-12 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* LEFT / VISUAL AREA: Large Unframed Illustrated Artwork */}
          <div className="lg:col-span-6 order-1 lg:order-1 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex items-center justify-center py-4 sm:py-6"
            >
              <img
                src="/images/what-people-remember-illustration.png"
                alt="FOLD Creative Team Illustration — What People Remember"
                className="w-full h-auto max-h-[500px] sm:max-h-[560px] object-contain transition-transform duration-700 hover:scale-[1.01]"
              />
            </motion.div>
          </div>

          {/* RIGHT / TYPOGRAPHY AREA */}
          <div className="lg:col-span-6 order-2 lg:order-2 space-y-8 md:space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              {/* Subtle Burnt Orange Micro-Accent Tag */}
              <div className="inline-flex items-center space-x-2 font-sans text-[10px] text-[#E54000] uppercase tracking-widest font-medium mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E54000]" />
                <span>ART DIRECTION & CREATIVE CRAFT</span>
              </div>

              <div className="space-y-1">
                <h1 className="font-serif font-normal text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] xl:text-[6.2rem] leading-[0.94] tracking-tight text-[#F5F3EE]">
                  WE DESIGN
                </h1>
                <h1 className="font-serif font-normal text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] xl:text-[6.2rem] leading-[0.94] tracking-tight text-[#F5F3EE]">
                  WHAT PEOPLE
                </h1>
                <h1 className="font-serif font-normal text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] xl:text-[6.2rem] leading-[0.94] tracking-tight text-[#F5F3EE] italic text-[#F5F3EE]">
                  REMEMBER.
                </h1>
              </div>
            </motion.div>

            {/* Small Studio Description & Minimal CTA */}
            <div className="space-y-8 pt-6 border-t border-[#333333]/80 max-w-xl">
              <p className="font-sans text-sm sm:text-base text-[#AAAAAA] leading-relaxed font-light">
                Independent creative studio for brands, digital experiences and visual content.
              </p>

              <div>
                <button
                  onClick={onOpenContactModal}
                  className="px-8 py-4 border border-[#F5F3EE]/80 text-[#F5F3EE] hover:bg-[#F5F3EE] hover:text-[#202020] font-sans text-xs font-medium uppercase tracking-widest transition-all duration-300 flex items-center space-x-3 group"
                >
                  <span>START A PROJECT</span>
                  <span className="text-[#E54000] group-hover:text-[#202020] transition-colors">→</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Minimal Index Strip */}
      <div className="max-w-[1700px] w-full mx-auto px-6 md:px-12 py-4 border-t border-[#333333]/80 flex flex-col sm:flex-row justify-between items-center gap-4 font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest">
        <span>01 / VISUAL IDENTITY — DIGITAL EXPERIENCES — BRAND CONTENT</span>
        <span className="flex items-center space-x-1.5">
          <span>SCROLL TO EXPLORE</span>
          <span className="text-[#E54000]">↓</span>
        </span>
      </div>
    </section>
  );
};

export default Hero;
