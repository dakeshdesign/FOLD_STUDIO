import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, Check } from 'lucide-react';

interface ServicesProps {
  onOpenContactModal: (serviceName?: string) => void;
}

export interface ServiceCategory {
  number: string;
  title: string;
  description: string;
  supportingServices: string[];
}

export const Services: React.FC<ServicesProps> = ({ onOpenContactModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const categories: ServiceCategory[] = [
    {
      number: "01",
      title: "BRAND IDENTITY",
      description: "Building distinctive visual identities that give brands clarity, character and consistency.",
      supportingServices: [
        "Logo Design",
        "Visual Identity",
        "Brand Guidelines",
        "Brand Assets"
      ]
    },
    {
      number: "02",
      title: "DIGITAL EXPERIENCES",
      description: "Designing thoughtful digital experiences across websites, interfaces and digital products.",
      supportingServices: [
        "Website Design",
        "UI/UX Design",
        "Landing Pages",
        "Digital Interfaces"
      ]
    },
    {
      number: "03",
      title: "CONTENT CREATION",
      description: "Creating visual content that gives brands a consistent and memorable presence.",
      supportingServices: [
        "Social Media Design",
        "Campaign Creatives",
        "Posters & Digital Graphics",
        "Content Direction"
      ]
    },
    {
      number: "04",
      title: "STRATEGY",
      description: "Shaping the creative direction and strategic foundation behind meaningful brands.",
      supportingServices: [
        "Brand Strategy",
        "Creative Direction",
        "Content Strategy",
        "Visual Direction"
      ]
    }
  ];

  return (
    <section id="services" className="relative py-28 md:py-40 px-6 md:px-12 bg-[#F5F3EE] text-[#202020] border-b border-[#E5E2DA] overflow-hidden select-none">
      {/* Studio Desk Corner Accents */}
      <div className="absolute top-8 left-8 text-[#8E8B82]/30 text-xs font-mono pointer-events-none hidden md:block">
        + FOLD DESK REF. 2026
      </div>
      <div className="absolute top-8 right-8 text-[#8E8B82]/30 text-xs font-mono pointer-events-none hidden md:block">
        + STUDIO CAPABILITIES
      </div>
      <div className="absolute bottom-8 left-8 text-[#8E8B82]/30 text-xs font-mono pointer-events-none hidden md:block">
        + DISCIPLINE ARCHIVE
      </div>
      <div className="absolute bottom-8 right-8 text-[#8E8B82]/30 text-xs font-mono pointer-events-none hidden md:block">
        + CONFIDENTIAL DOCS
      </div>

      <div className="max-w-[1600px] mx-auto space-y-16 md:space-y-24">
        
        {/* SECTION INTRO */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-[#202020]/15 bg-[#FAF8F5] text-[10px] font-sans font-medium text-[#8E8B82] uppercase tracking-widest shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#202020]" />
            <span>THE FOLD SERVICE DESK</span>
          </div>
          
          <h2 className="font-serif font-normal text-5xl sm:text-6xl md:text-7xl tracking-tight text-[#202020]">
            WHAT WE DO
          </h2>
          
          <p className="font-sans text-base sm:text-lg text-[#666666] font-light max-w-xl mx-auto leading-relaxed">
            Four disciplines. One creative studio.
          </p>
        </div>

        {/* THE DESK PAPER COMPOSITION */}
        {/* Desktop: Staggered Overlapping Studio Papers Presentation */}
        {/* Mobile: Clean Vertical Stack of Studio Papers */}
        <div className="relative pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:-space-x-4">
            {categories.map((cat, idx) => {
              // Custom desktop offsets for physical overlapping paper stack feel
              const desktopOverlapStyles = [
                "lg:z-10 lg:translate-y-0",
                "lg:z-20 lg:translate-y-6 lg:rotate-[-0.5deg]",
                "lg:z-30 lg:translate-y-3 lg:rotate-[0.5deg]",
                "lg:z-40 lg:translate-y-8 lg:rotate-[-0.3deg]"
              ];

              return (
                <motion.div
                  key={cat.number}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.7,
                    delay: idx * 0.15,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className={`group relative ${desktopOverlapStyles[idx]} transition-all duration-300 hover:z-50`}
                >
                  <div
                    onClick={() => setSelectedCategory(cat)}
                    className="relative cursor-pointer bg-[#FAF8F5] border border-[#202020]/20 p-6 sm:p-8 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(32,32,32,0.12)] transition-all duration-300 hover:-translate-y-3 flex flex-col justify-between min-h-[460px]"
                  >
                    {/* Top Editorial Document Header */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-4 font-mono text-[9px] sm:text-[10px] text-[#8E8B82] uppercase tracking-widest">
                        <span>FOLD / SERVICES / {cat.number}</span>
                        <span>STUDIO — 2026</span>
                      </div>

                      {/* Paper Number & Title */}
                      <div className="space-y-2">
                        <span className="font-serif text-3xl font-normal text-[#8E8B82] block">
                          {cat.number}
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#202020] tracking-tight group-hover:text-[#000000]">
                          {cat.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="font-sans text-xs sm:text-sm text-[#555555] font-light leading-relaxed pt-2">
                        {cat.description}
                      </p>
                    </div>

                    {/* Middle Supporting Services Bullet List */}
                    <div className="my-8 pt-6 border-t border-[#E5E2DA] space-y-2.5">
                      <span className="font-mono text-[9px] text-[#8E8B82] uppercase tracking-wider block font-medium mb-3">
                        SUB-CAPABILITIES
                      </span>
                      {cat.supportingServices.map((item, sIdx) => (
                        <div key={sIdx} className="flex items-center space-x-2.5 text-xs font-sans text-[#333333]">
                          <span className="w-1 h-1 rounded-full bg-[#202020]/60" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Document Footer Action */}
                    <div className="pt-4 border-t border-[#E5E2DA] flex items-center justify-between font-mono text-[10px] text-[#202020] uppercase tracking-widest group-hover:font-medium">
                      <span>INSPECT SPEC</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* EXPANDED PAPER DOCUMENT MODAL */}
        <AnimatePresence>
          {selectedCategory && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 md:p-10">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCategory(null)}
                className="fixed inset-0 bg-[#202020]/65 backdrop-blur-xs"
              />

              {/* Physical Paper Document Detail Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#202020]/30 shadow-[0_24px_60px_rgba(0,0,0,0.2)] p-6 sm:p-10 md:p-12 space-y-8 z-10 max-h-[90vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="absolute top-6 right-6 p-2 text-[#8E8B82] hover:text-[#202020] hover:bg-[#E5E2DA]/50 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header Metadata */}
                <div className="border-b border-[#E5E2DA] pb-6 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#8E8B82] uppercase tracking-widest">
                    <span>FOLD / SERVICE SPECIFICATION / {selectedCategory.number}</span>
                    <span>STUDIO DOCUMENT</span>
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl text-[#202020] font-normal tracking-tight pt-2">
                    {selectedCategory.title}
                  </h3>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium">
                    OVERVIEW & PURPOSE
                  </span>
                  <p className="font-sans text-base text-[#444444] font-light leading-relaxed">
                    {selectedCategory.description}
                  </p>
                </div>

                {/* Supporting Services Detailed Grid */}
                <div className="space-y-4 pt-2">
                  <span className="font-mono text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium">
                    INCLUDED CAPABILITIES & SCOPE
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCategory.supportingServices.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-[#F5F3EE] border border-[#E5E2DA] p-4 flex items-center space-x-3 text-xs font-sans text-[#202020]"
                      >
                        <Check className="w-4 h-4 text-[#202020] shrink-0" />
                        <span className="font-medium tracking-wide">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Footer & Action */}
                <div className="pt-6 border-t border-[#E5E2DA] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="font-mono text-[10px] text-[#8E8B82] uppercase tracking-widest">
                    READY TO START A {selectedCategory.title} PROJECT?
                  </span>
                  <button
                    onClick={() => {
                      const serviceTitle = selectedCategory.title;
                      setSelectedCategory(null);
                      onOpenContactModal(serviceTitle);
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#202020] text-[#F5F3EE] hover:bg-[#000000] font-sans text-xs font-medium uppercase tracking-widest transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                  >
                    <span>INQUIRE ABOUT THIS DISCIPLINE</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SECTION FOOTER CTA */}
        <div className="text-center pt-8 border-t border-[#E5E2DA]">
          <button
            onClick={() => onOpenContactModal()}
            className="inline-flex items-center space-x-3 px-10 py-4 border border-[#202020] bg-[#202020] text-[#F5F3EE] hover:bg-[#F5F3EE] hover:text-[#202020] font-sans text-xs font-medium uppercase tracking-widest transition-all duration-300 shadow-sm group cursor-pointer"
          >
            <span>START A PROJECT</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Services;
