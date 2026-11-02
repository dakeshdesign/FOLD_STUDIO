import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, CheckCircle2, Layers, Calendar, User, BarChart3 } from 'lucide-react';
import { Project } from '../data/projectsData';

interface CaseStudyModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenContactModal: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ project, onClose, onOpenContactModal }) => {
  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9000] flex items-end justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-0 sm:p-4 md:p-8">
        {/* Backdrop click close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        {/* Main Case Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-6xl bg-[#f9f8f6] border border-[#e5e3dc] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden text-[#111111] max-h-[92vh] flex flex-col"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between p-6 md:p-8 bg-[#f9f8f6]/95 backdrop-blur-md border-b border-[#e5e3dc]">
            <div className="flex items-center space-x-4">
              <span className="font-mono text-xs font-semibold text-[#e54000] bg-white border border-[#e5e3dc] px-3 py-1 rounded-full uppercase">
                PROJECT {project.number}
              </span>
              <span className="font-mono text-xs text-[#888888] hidden sm:inline uppercase">
                {project.category}
              </span>
            </div>

            <button
              onClick={onClose}
              data-cursor="CLOSE"
              className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#111111] hover:text-[#e54000] transition-colors bg-white px-4 py-2 rounded-full border border-[#e5e3dc]"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto p-6 md:p-12 space-y-12">
            {/* Title & Summary */}
            <div className="space-y-4">
              <span className="font-mono text-xs text-[#888888] uppercase tracking-widest block">
                CASE STUDY OVERVIEW
              </span>
              <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#111111]">
                {project.title}
              </h2>
              <p className="font-sans text-lg sm:text-xl text-[#666666] max-w-3xl font-normal leading-relaxed">
                {project.summary}
              </p>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-xl bg-white border border-[#e5e3dc] font-mono text-xs">
              <div>
                <div className="text-[#888888] uppercase mb-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-[#111111]" />
                  <span>CLIENT</span>
                </div>
                <div className="font-semibold text-[#111111]">{project.client}</div>
              </div>
              <div>
                <div className="text-[#888888] uppercase mb-1 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#111111]" />
                  <span>YEAR</span>
                </div>
                <div className="font-semibold text-[#111111]">{project.year}</div>
              </div>
              <div>
                <div className="text-[#888888] uppercase mb-1 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-[#111111]" />
                  <span>CATEGORY</span>
                </div>
                <div className="font-semibold text-[#111111]">{project.category}</div>
              </div>
              <div>
                <div className="text-[#888888] uppercase mb-1 flex items-center space-x-1">
                  <BarChart3 className="w-3.5 h-3.5 text-[#111111]" />
                  <span>METRIC</span>
                </div>
                <div className="font-semibold text-[#e54000]">
                  {project.metrics ? project.metrics[0].value : "Featured"}
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#e5e3dc] bg-[#eeeeee]">
              <img
                src={project.heroImage}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Challenge & Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-xl bg-white border border-[#e5e3dc] space-y-3">
                <span className="font-mono text-xs text-[#e54000] font-semibold uppercase tracking-wider block">
                  01 — THE CHALLENGE
                </span>
                <h3 className="font-display text-2xl font-bold text-[#111111]">
                  Context & Problem
                </h3>
                <p className="font-sans text-sm text-[#666666] leading-relaxed">
                  {project.challenge}
                </p>
              </div>

              <div className="p-8 rounded-xl bg-white border border-[#e5e3dc] space-y-3">
                <span className="font-mono text-xs text-[#e54000] font-semibold uppercase tracking-wider block">
                  02 — THE SOLUTION
                </span>
                <h3 className="font-display text-2xl font-bold text-[#111111]">
                  Design & Execution
                </h3>
                <p className="font-sans text-sm text-[#666666] leading-relaxed">
                  {project.solution}
                </p>
              </div>
            </div>

            {/* Deliverables */}
            {project.deliverables && project.deliverables.length > 0 && (
              <div className="space-y-4">
                <span className="font-mono text-xs text-[#888888] uppercase tracking-widest block">
                  DELIVERABLES SCOPE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {project.deliverables.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-4 rounded-xl bg-white border border-[#e5e3dc]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#e54000] flex-shrink-0" />
                      <span className="font-mono text-xs font-semibold text-[#111111]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Images */}
            {project.galleryImages && project.galleryImages.length > 0 && (
              <div className="space-y-6">
                <span className="font-mono text-xs text-[#888888] uppercase tracking-widest block">
                  VISUAL EXPLORATION
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-[4/3] rounded-xl overflow-hidden border border-[#e5e3dc] bg-[#eeeeee]"
                    >
                      <img
                        src={img}
                        alt={`${project.title} gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-xl bg-[#111111] text-white">
              <div>
                <span className="font-mono text-xs font-semibold text-[#888888] uppercase tracking-wider block">
                  WANT SIMILAR RESULTS?
                </span>
                <h4 className="font-display text-2xl font-bold mt-1">
                  Start a conversation about your project.
                </h4>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenContactModal();
                }}
                className="flex items-center space-x-2 bg-white text-[#111111] hover:bg-[#e54000] hover:text-white px-6 py-3 rounded-full font-mono text-xs font-semibold uppercase tracking-wider transition-colors flex-shrink-0"
              >
                <span>Inquire Now</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
