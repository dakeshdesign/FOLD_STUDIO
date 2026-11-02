import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PROJECTS_DATA, Project } from '../data/projectsData';
import { CaseStudyModal } from './CaseStudyModal';

interface SelectedWorkProps {
  onOpenContactModal: () => void;
}

export const SelectedWork: React.FC<SelectedWorkProps> = ({ onOpenContactModal }) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const hasProjects = PROJECTS_DATA && PROJECTS_DATA.length > 0;

  return (
    <section id="work" className="relative py-28 md:py-40 px-6 md:px-12 bg-[#F5F3EE] text-[#202020] border-b border-[#E5E2DA]">
      <div className="max-w-[1700px] mx-auto space-y-16 md:space-y-20">
        
        {/* SECTION HEADER (Preserved so nav link #work scrolls directly here) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E2DA] pb-8">
          <div className="space-y-3">
            <div className="font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest font-medium">
              05 // PORTFOLIO
            </div>
            <h2 className="font-serif font-normal text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#202020] leading-[0.95]">
              WORK
            </h2>
          </div>
          <div className="font-sans text-xs text-[#8E8B82] uppercase tracking-widest">
            SHOWCASE 2026 // FOLD STUDIO
          </div>
        </div>

        {/* DYNAMIC CONTENT: EMPTY STATE OR ACTIVE PROJECTS */}
        {!hasProjects ? (
          /* ON-BRAND EDITORIAL EMPTY STATE */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            {/* Primary Editorial Status Banner */}
            <div className="bg-[#202020] text-[#F5F3EE] p-8 sm:p-12 md:p-16 border border-[#333333] shadow-sm">
              <div className="max-w-3xl space-y-6">
                <div className="inline-flex items-center space-x-2 font-mono text-[10px] sm:text-[11px] text-[#E54000] uppercase tracking-widest font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E54000] animate-pulse" />
                  <span>STUDIO ARCHIVE // UPDATE IN PROGRESS</span>
                </div>

                <h3 className="font-serif font-normal text-4xl sm:text-5xl md:text-6xl text-[#F5F3EE] tracking-tight leading-[1.05]">
                  NEW WORK COMING SOON.
                </h3>

                <p className="font-sans text-sm sm:text-base text-[#AAAAAA] font-light leading-relaxed max-w-2xl border-l-2 border-[#F5F3EE] pl-6 py-1">
                  We are currently curating and documenting our recent brand identities, digital experiences, and visual systems. The updated showcase will be published shortly.
                </p>
              </div>
            </div>

            {/* Secondary Private Archive & Inquiry Card */}
            <div className="py-12 px-8 md:px-14 bg-white border border-[#E5E2DA] flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xs">
              <div className="space-y-2 max-w-xl">
                <span className="font-mono text-[10px] text-[#8E8B82] uppercase tracking-widest font-medium block">
                  PRIVATE WORK SAMPLES // ON REQUEST
                </span>
                <h4 className="font-serif font-normal text-2xl sm:text-3xl text-[#202020]">
                  NEED TO SEE RELEVANT CASE STUDIES?
                </h4>
                <p className="font-sans text-xs sm:text-sm text-[#666666] font-light leading-relaxed">
                  We share confidential client work, category-specific decks, and live links privately with prospective partners.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={onOpenContactModal}
                  className="px-8 py-4 border border-[#202020] bg-[#202020] text-[#F5F3EE] hover:bg-black font-sans text-xs font-medium uppercase tracking-widest transition-all duration-300 flex items-center space-x-3 cursor-pointer shadow-xs group"
                >
                  <span>START A PROJECT</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ACTIVE PROJECTS GRID (Renders automatically when items added to PROJECTS_DATA) */
          <div className="space-y-12">
            {PROJECTS_DATA.map((project, idx) => (
              <motion.div
                key={project.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setActiveProject(project)}
                className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#202020] text-[#F5F3EE] border border-[#333333] p-8 sm:p-10 md:p-14 shadow-md"
              >
                <div className="lg:col-span-8 aspect-[16/10] w-full bg-[#181818] overflow-hidden border border-[#333333]">
                  <img
                    src={project.heroImage}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-95 group-hover:scale-102 transition-transform duration-700"
                  />
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="space-y-3">
                    <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium">
                      {project.number} // {project.category}
                    </span>
                    <h3 className="font-serif font-normal text-4xl sm:text-5xl text-[#F5F3EE] group-hover:opacity-80 transition-opacity leading-[1.02]">
                      {project.title}
                    </h3>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-[#AAAAAA] font-light leading-relaxed border-l-2 border-[#F5F3EE] pl-4 py-1">
                    "{project.summary}"
                  </p>

                  <div className="pt-4 flex items-center space-x-3">
                    <span className="inline-block font-sans text-xs font-medium uppercase tracking-widest text-[#F5F3EE] border-b border-[#F5F3EE] pb-1 group-hover:opacity-70 transition-opacity">
                      VIEW CASE STUDY →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Case Study Modal (Safely attached for when projects exist) */}
      {hasProjects && (
        <CaseStudyModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
          onOpenContactModal={onOpenContactModal}
        />
      )}
    </section>
  );
};

export default SelectedWork;
