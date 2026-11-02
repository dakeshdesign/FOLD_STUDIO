import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudioSectionProps {
  onOpenContactModal: () => void;
}

export interface TeamMember {
  id: string;
  number: string;
  name: string;
  role: string;
  description: string;
  image: string;
  location?: string;
  tags?: string[];
}

export const StudioSection: React.FC<StudioSectionProps> = ({ onOpenContactModal }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const teamMembers: TeamMember[] = [
    {
      id: 'dakesh',
      number: '01',
      name: 'DAKESH',
      role: 'FOUNDER / DESIGNER & EDITOR',
      description: 'Designing the digital and visual world of FOLD — from websites and apps to products, identities, posters, and everything in between.',
      image: '/images/team/dakesh.jpg',
      location: 'FOUNDER & CREATIVE LEAD',
      tags: ['DIGITAL CRAFT', 'VISUAL SYSTEMS', 'ART DIRECTION']
    },
    {
      id: 'likhitha',
      number: '02',
      name: 'LIKHITHA',
      role: 'ACCOUNT MANAGER / TESTER',
      description: 'Managing client relationships and testing FOLD\'s work across digital experiences to ensure everything is clear, functional, and ready to deliver.',
      image: '/images/team/likhitha.jpg',
      location: 'CLIENT RELATIONS & QA',
      tags: ['CLIENT STRATEGY', 'QUALITY ASSURANCE', 'PROJECT TESTING']
    },
    {
      id: 'ganesh-social',
      number: '03',
      name: 'GANESH',
      role: 'SOCIAL MEDIA MANAGER',
      description: 'Building FOLD’s social presence through content planning, platform strategy, publishing, and audience-focused storytelling.',
      image: '/images/team/ganesh.jpg',
      location: 'SOCIAL MEDIA & STRATEGY',
      tags: ['CONTENT PLANNING', 'PLATFORM STRATEGY', 'STORYTELLING']
    },
    {
      id: 'ganesh-dev',
      number: '04',
      name: 'GANESH',
      role: 'MAIN DEVELOPER',
      description: 'Turning FOLD’s creative ideas into functional digital experiences, building and developing websites, applications, and digital products.',
      image: '/images/team/ganesh-dev.png',
      location: 'WEB & APP ENGINEERING',
      tags: ['FULL-STACK DEV', 'DIGITAL PRODUCTS', 'WEB ARCHITECTURE']
    },
    {
      id: 'manikanta',
      number: '05',
      name: 'MANIKANTA',
      role: 'DEVELOPER',
      description: 'Building reliable digital experiences and supporting FOLD’s development across websites, applications, and interactive products.',
      image: '/images/team/manikanta.png',
      location: 'FRONTEND & WEB SYSTEMS',
      tags: ['WEB DEVELOPMENT', 'APPLICATION BUILD', 'INTERACTIVE TECH']
    }
  ];

  return (
    <section id="team" className="relative py-24 md:py-36 px-6 md:px-12 bg-[#F5F3EE] text-[#202020] border-b border-[#E5E2DA] transition-all duration-700">
      <div className="max-w-[1700px] mx-auto space-y-16">
        
        {/* COLLAPSED / INITIAL TEAM INTRODUCTION WITH ILLUSTRATION */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center border-y border-[#E5E2DA]/80"
          >
            {/* LEFT: Headline, Short Intro & Action Button */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest font-medium">
                  06 // PEOPLE BEHIND FOLD
                </div>
                <h2 className="font-serif font-normal text-5xl sm:text-7xl md:text-8xl tracking-tight text-[#202020] leading-[0.95]">
                  THE PEOPLE<br />
                  BEHIND FOLD
                </h2>
              </div>

              <p className="font-sans text-base sm:text-lg text-[#444444] font-light leading-relaxed max-w-xl border-l-2 border-[#202020] pl-6 py-1">
                "Meet the people behind FOLD — a small creative team bringing design, technology and ideas together."
              </p>

              {/* Mobile-Only Illustration Spot (natural stacking order for mobile) */}
              <div className="block lg:hidden my-6">
                <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-[#F5F3EE] p-4 border border-[#E5E2DA]/60">
                  <img
                    src="/images/team-illustration.png"
                    alt="FOLD Team Illustration"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={() => setIsOpen(true)}
                  className="px-10 py-5 bg-[#202020] text-[#F5F3EE] hover:bg-black font-sans text-xs font-medium uppercase tracking-widest transition-all duration-300 shadow-md flex items-center space-x-3 group"
                >
                  <span>MEET THE TEAM</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </button>
              </div>
            </div>

            {/* RIGHT: Desktop Editorial Team Illustration */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="relative aspect-square w-full max-w-lg mx-auto overflow-hidden rounded-2xl bg-[#F5F3EE] p-6 border border-[#E5E2DA]/60 shadow-sm">
                <img
                  src="/images/team-illustration.png"
                  alt="FOLD Team Visual Storytelling Illustration"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* EXPANDED STATE WITH ANIMATED REVEAL OF ALL 5 MEMBERS */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-20 overflow-hidden"
            >
              {/* EXPANDED SECTION HEADER */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#E5E2DA] pb-8 pt-4">
                <div className="space-y-4">
                  <div className="font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest font-medium">
                    06 // PEOPLE BEHIND FOLD
                  </div>
                  <h2 className="font-serif font-normal text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#202020] leading-[0.95]">
                    THE PEOPLE<br />
                    BEHIND FOLD
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="hidden lg:block max-w-xs font-sans text-xs text-[#666666] uppercase tracking-widest leading-relaxed font-light">
                    AN INDEPENDENT CREATIVE TEAM OPERATING ACROSS DESIGN, DIRECTION & DIGITAL CRAFT.
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-8 py-4 border border-[#202020] bg-[#202020] text-[#F5F3EE] hover:bg-black font-sans text-xs font-medium uppercase tracking-widest transition-all duration-300 flex items-center space-x-2"
                  >
                    <span>CLOSE TEAM</span>
                    <span>↑</span>
                  </button>
                </div>
              </div>

              {/* REVEAL ALL 5 TEAM MEMBERS TOGETHER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {teamMembers.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-8 group bg-white border border-[#E5E2DA] p-6 sm:p-7 md:p-8 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-8">
                      {/* Rectangular Editorial Portrait Frame */}
                      <div className="relative aspect-[4/5] w-full bg-[#181818] border border-[#E5E2DA] overflow-hidden">
                        <img
                          src={member.image}
                          alt={`${member.name} - ${member.role}`}
                          className="w-full h-full object-cover object-top img-zoom opacity-98 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 font-sans text-[10px] text-[#F5F3EE] bg-[#202020] px-3 py-1 uppercase tracking-widest font-medium">
                          {member.number} // {member.name}
                        </div>
                        {member.location && (
                          <div className="absolute bottom-4 left-4 font-sans text-[10px] text-[#F5F3EE] bg-black/70 backdrop-blur-sm px-3 py-1 uppercase tracking-widest font-medium">
                            {member.location}
                          </div>
                        )}
                      </div>

                      {/* Member Meta & Role */}
                      <div className="space-y-3 pt-2 border-t border-[#E5E2DA]">
                        <div className="font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest font-medium">
                          {member.role}
                        </div>
                        <h3 className="font-serif font-normal text-3xl sm:text-4xl text-[#202020]">
                          {member.name}
                        </h3>
                        <p className="font-sans text-xs sm:text-sm text-[#444444] font-light leading-relaxed border-l-2 border-[#202020] pl-3 py-1">
                          "{member.description}"
                        </p>
                      </div>
                    </div>

                    {/* Skill / Capability Tags */}
                    {member.tags && (
                      <div className="pt-6 border-t border-[#E5E2DA]/80 flex flex-wrap items-center gap-2 font-sans text-[9px] text-[#8E8B82] uppercase tracking-widest">
                        {member.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="bg-[#F5F3EE] px-2 py-1 text-[#202020] font-medium border border-[#E5E2DA]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* BOTTOM ACTIONS / COLLABORATION TRIGGER */}
              <div className="pt-8 border-t border-[#E5E2DA] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-[#8E8B82] uppercase tracking-widest">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[#202020] border-b border-[#202020] pb-0.5 hover:opacity-60 transition-opacity font-medium"
                >
                  CLOSE TEAM ↑
                </button>

                <button
                  onClick={onOpenContactModal}
                  className="text-[#202020] border-b border-[#202020] pb-0.5 hover:opacity-60 transition-opacity font-medium"
                >
                  WORK WITH FOLD →
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

export default StudioSection;
