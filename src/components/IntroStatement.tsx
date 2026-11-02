import React from 'react';
import { motion } from 'framer-motion';

export const IntroStatement: React.FC = () => {
  return (
    <div id="about" className="relative bg-[#F5F3EE] text-[#202020]">
      {/* SECTION 1: ABOUT FOLD */}
      <section className="py-24 md:py-36 px-6 md:px-12 border-b border-[#E5E2DA]">
        <div className="max-w-[1700px] mx-auto space-y-16">
          <div className="border-b border-[#E5E2DA] pb-4 font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest font-medium">
            02 // ABOUT FOLD
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* LEFT: Refined Editorial Copy & Headline */}
            <div className="lg:col-span-6 space-y-8">
              <h2 className="font-serif font-normal text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#202020] leading-[0.95]">
                WE ARE<br />FOLD.
              </h2>

              <div className="space-y-6 max-w-xl">
                <p className="font-sans text-base sm:text-lg text-[#202020] font-light leading-relaxed border-l-2 border-[#202020] pl-6 py-1">
                  FOLD is an independent creative studio built around design, technology and visual storytelling. We create identities, digital experiences, content and visual systems that help businesses communicate with clarity and character.
                </p>
              </div>

              <div>
                <a
                  href="#services-catalogue"
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.querySelector('#services-catalogue');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-block font-sans text-xs font-medium uppercase tracking-widest text-[#202020] border-b border-[#202020] pb-1 hover:opacity-60 transition-opacity"
                >
                  READ OUR STORY →
                </a>
              </div>
            </div>

            {/* RIGHT: Official FOLD Logo Brand Identity Artwork */}
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative aspect-[3/2] w-full border border-[#E5E2DA] overflow-hidden"
              >
                <img
                  src="/images/fold-brand-artwork.png"
                  alt="Official FOLD Creative Studio Brand Identity System"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: STUDIO PHILOSOPHY / MANIFESTO */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-[#202020] text-[#F5F3EE] border-b border-[#333333]">
        <div className="max-w-[1700px] mx-auto space-y-20">
          <div className="border-b border-[#333333] pb-4 font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest">
            03 // STUDIO PHILOSOPHY
          </div>

          <div className="max-w-5xl">
            <h2 className="font-serif font-normal text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] text-[#F5F3EE]">
              WE CARE ABOUT<br />
              THE DETAILS<br />
              PEOPLE <span className="italic text-[#8E8B82]">NOTICE.</span>
            </h2>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pt-12 border-t border-[#333333]">
            <div className="space-y-3">
              <div className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest">01 / PRINCIPLE</div>
              <h3 className="font-serif text-2xl font-normal text-[#F5F3EE]">CLARITY</h3>
              <p className="font-sans text-xs text-[#AAAAAA] leading-relaxed font-light">
                Complex ideas distilled into unyielding visual forms that communicate with precision.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest">02 / PRINCIPLE</div>
              <h3 className="font-serif text-2xl font-normal text-[#F5F3EE]">CRAFT</h3>
              <p className="font-sans text-xs text-[#AAAAAA] leading-relaxed font-light">
                Obsessive attention to spatial rhythm, editorial typography, and micro-interactions.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest">03 / PRINCIPLE</div>
              <h3 className="font-serif text-2xl font-normal text-[#F5F3EE]">CHARACTER</h3>
              <p className="font-sans text-xs text-[#AAAAAA] leading-relaxed font-light">
                Distinct visual identities built with attitude and presence, rejecting corporate tropes.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest">04 / PRINCIPLE</div>
              <h3 className="font-serif text-2xl font-normal text-[#F5F3EE]">INTENTION</h3>
              <p className="font-sans text-xs text-[#AAAAAA] leading-relaxed font-light">
                Every line, layout grid, and transition serves a deliberate aesthetic and business outcome.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


