import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES_CATALOGUE, SERVICE_PACKAGES, ServiceCategory, ServiceItem } from '../data/servicesCatalogueData';

interface ServicesCatalogueProps {
  onSelectService: (serviceName: string) => void;
}

export const ServicesCatalogue: React.FC<ServicesCatalogueProps> = ({ onSelectService }) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const activeCategory: ServiceCategory = SERVICES_CATALOGUE[activeCategoryIndex];

  return (
    <section id="services-catalogue" className="relative py-28 md:py-40 px-6 md:px-12 bg-[#F5F3EE] text-[#202020] border-b border-[#E5E2DA]">
      <div className="max-w-[1700px] mx-auto space-y-24">
        
        {/* 4. SERVICES PAGE HEADER */}
        <div className="space-y-6 text-center max-w-4xl mx-auto">
          <div className="font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest font-medium">
            04 // SERVICE CATALOGUE & PRICING
          </div>

          <h2 className="font-serif font-normal text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] tracking-tight text-[#202020] leading-[0.95]">
            THE SERVICES
          </h2>

          <p className="font-sans text-xs sm:text-sm text-[#666666] uppercase tracking-widest font-light max-w-2xl mx-auto leading-relaxed pt-2">
            DESIGN, DIGITAL & VISUAL CONTENT FOR BRANDS WITH SOMETHING TO SAY.
          </p>

          <div className="pt-2 font-sans text-[11px] text-[#8E8B82] uppercase tracking-wider flex items-center justify-center space-x-6">
            <span>PRICING PHILOSOPHY: CRAFT + STRATEGY</span>
            <span>•</span>
            <span>TRANSPARENT STARTING RATES</span>
          </div>
        </div>

        {/* CATEGORY NUMBERED NAVIGATION TABS */}
        <div className="border-y border-[#E5E2DA] py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {SERVICES_CATALOGUE.map((cat, idx) => {
              const isActive = activeCategoryIndex === idx;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryIndex(idx);
                    setSelectedService(null);
                  }}
                  className={`font-sans text-xs uppercase tracking-widest py-2 px-3 transition-all ${
                    isActive
                      ? 'bg-[#202020] text-[#F5F3EE] font-medium'
                      : 'text-[#666666] hover:text-[#202020]'
                  }`}
                >
                  <span className="opacity-60 mr-2">{cat.number}</span>
                  <span>{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE CATEGORY HEADER & DESCRIPTION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-baseline border-b border-[#E5E2DA] pb-8">
          <div className="md:col-span-5 space-y-2">
            <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest block">
              CATEGORY {activeCategory.number}
            </span>
            <h3 className="font-serif font-normal text-4xl sm:text-5xl text-[#202020]">
              {activeCategory.title}
            </h3>
          </div>

          <div className="md:col-span-7 font-sans text-xs sm:text-sm text-[#666666] font-light leading-relaxed">
            {activeCategory.description}
          </div>
        </div>

        {/* 5. SERVICE ITEM LISTING GRID */}
        <div className="space-y-4">
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest border-b border-[#E5E2DA]">
            <div className="col-span-1">NO.</div>
            <div className="col-span-4">SERVICE</div>
            <div className="col-span-4">DESCRIPTION</div>
            <div className="col-span-2 text-right">STARTING RATE</div>
            <div className="col-span-1 text-right">DETAILS</div>
          </div>

          <div className="divide-y divide-[#E5E2DA]">
            {activeCategory.services.map((service) => {
              const isExpanded = selectedService?.id === service.id;

              return (
                <div key={service.id} className="py-6 transition-colors hover:bg-white/50 px-2">
                  {/* Summary Row */}
                  <div
                    onClick={() => setSelectedService(isExpanded ? null : service)}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline cursor-pointer group"
                  >
                    <div className="sm:col-span-1 font-sans text-xs text-[#8E8B82]">
                      {service.number}
                    </div>

                    <div className="sm:col-span-4 space-y-1">
                      <h4 className="font-serif text-2xl font-normal text-[#202020] group-hover:opacity-70 transition-opacity">
                        {service.name}
                      </h4>
                    </div>

                    <div className="sm:col-span-4 font-sans text-xs text-[#666666] font-light leading-relaxed">
                      {service.shortDescription}
                    </div>

                    <div className="sm:col-span-2 text-left sm:text-right font-sans text-xs font-medium text-[#202020] tracking-wider uppercase">
                      {service.startingPrice}
                    </div>

                    <div className="sm:col-span-1 text-left sm:text-right font-sans text-xs text-[#202020] font-medium uppercase tracking-widest group-hover:opacity-70">
                      {isExpanded ? 'CLOSE —' : 'VIEW →'}
                    </div>
                  </div>

                  {/* 7. SERVICE DETAIL EXPANDABLE PANEL */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden mt-6 pt-6 border-t border-[#202020] bg-[#202020] text-[#F5F3EE] p-8 md:p-12 space-y-8"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#333333] pb-6">
                          <div className="space-y-2">
                            <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest block">
                              SERVICE SPECIFICATION // {service.number}
                            </span>
                            <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#F5F3EE]">
                              {service.name}
                            </h3>
                          </div>

                          <div className="space-y-1 text-left md:text-right">
                            <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest block">RATE STAGING</span>
                            <div className="font-sans text-sm font-medium text-[#F5F3EE] uppercase tracking-widest">
                              {service.startingPrice}
                            </div>
                            {service.priceNote && (
                              <span className="font-sans text-[10px] text-[#AAAAAA] uppercase tracking-wider block">
                                {service.priceNote}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* What's Included & Deliverables & Timeline Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Included */}
                          <div className="space-y-3">
                            <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium">
                              WHAT'S INCLUDED
                            </span>
                            <ul className="space-y-2 font-sans text-xs text-[#AAAAAA] font-light leading-relaxed">
                              {service.included.map((inc, i) => (
                                <li key={i}>{inc}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Deliverables */}
                          <div className="space-y-3">
                            <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium">
                              DELIVERABLES
                            </span>
                            <ul className="space-y-1.5 font-sans text-xs text-[#F5F3EE] uppercase tracking-wider font-medium">
                              {service.deliverables.map((del, i) => (
                                <li key={i} className="flex items-center space-x-2">
                                  <span className="w-1 h-1 bg-[#F5F3EE] rounded-full" />
                                  <span>{del}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Timeline & Process */}
                          <div className="space-y-4">
                            {service.timeline && (
                              <div className="space-y-1">
                                <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium">ESTIMATED TIMELINE</span>
                                <span className="font-sans text-xs text-[#F5F3EE] font-medium uppercase tracking-wider">{service.timeline}</span>
                              </div>
                            )}

                            <div className="space-y-2 pt-2">
                              <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium">PRODUCTION PROCESS</span>
                              <ul className="space-y-1 font-sans text-[11px] text-[#AAAAAA] font-light">
                                {service.process.map((pr, i) => (
                                  <li key={i}>{pr}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Request CTA */}
                        <div className="pt-6 border-t border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-4">
                          <span className="font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest">
                            READY TO INITIATE SCOPE?
                          </span>
                          <button
                            onClick={() => onSelectService(service.name)}
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#F5F3EE] text-[#202020] hover:bg-white font-sans text-xs font-medium uppercase tracking-widest transition-colors"
                          >
                            REQUEST THIS SERVICE →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* 8. CURATED PACKAGE OPTIONS */}
        <div className="space-y-12 border-t border-[#E5E2DA] pt-16">
          <div className="space-y-3">
            <span className="font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest font-medium block">
              BUNDLED SCOPES
            </span>
            <h3 className="font-serif font-normal text-4xl sm:text-5xl text-[#202020]">
              CURATED PACKAGES
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICE_PACKAGES.map((pkg) => (
              <div key={pkg.id} className="bg-white border border-[#E5E2DA] p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-3">
                    <span className="font-serif text-2xl font-normal text-[#202020]">{pkg.title}</span>
                    <span className="font-sans text-[10px] font-medium uppercase tracking-widest bg-[#202020] text-[#F5F3EE] px-2.5 py-1">
                      {pkg.priceTag}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-[#666666] font-light leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#E5E2DA]/60">
                    <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest block font-medium">INCLUDES</span>
                    <ul className="space-y-1.5 font-sans text-[11px] text-[#202020] uppercase tracking-wider font-medium">
                      {pkg.includes.map((inc, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <span className="w-1 h-1 bg-[#202020] rounded-full" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => onSelectService(pkg.title)}
                  className="w-full py-3 border border-[#202020] text-[#202020] hover:bg-[#202020] hover:text-[#F5F3EE] font-sans text-xs font-medium uppercase tracking-widest transition-colors"
                >
                  REQUEST PACKAGE QUOTE →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 9. CUSTOM PROJECT OPTION */}
        <div className="bg-[#202020] text-[#F5F3EE] p-10 md:p-16 border border-[#333333] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest block">
              BESPOKE SCOPE
            </span>
            <h3 className="font-serif font-normal text-3xl sm:text-5xl text-[#F5F3EE]">
              DON'T SEE WHAT YOU'RE LOOKING FOR?
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#AAAAAA] font-light max-w-xl leading-relaxed">
              WE ALSO TAKE ON CUSTOM CREATIVE PROJECTS, MULTI-SEASON CAMPAIGNS, AND TAILORED RETAINERS.
            </p>
          </div>

          <div className="lg:col-span-4 text-left lg:text-right">
            <button
              onClick={() => onSelectService("Custom Project")}
              className="px-8 py-4 bg-[#F5F3EE] text-[#202020] hover:bg-white font-sans text-xs font-medium uppercase tracking-widest transition-colors"
            >
              START A CONVERSATION →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
