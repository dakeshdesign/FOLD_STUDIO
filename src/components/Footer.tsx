import React from 'react';

interface FooterProps {
  onOpenContactModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContactModal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#202020] text-[#F5F3EE] py-16 px-6 md:px-12 border-t border-[#333333]">
      <div className="max-w-[1700px] mx-auto space-y-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 font-sans text-xs">
          
          {/* Studio Brand Mark & Direct Contact */}
          <div className="space-y-1">
            <span className="font-serif font-normal text-4xl text-[#F5F3EE] tracking-tight block">
              FOLD
            </span>
            <span className="text-[#8E8B82] text-[11px] uppercase tracking-widest block font-light">
              Independent creative studio.
            </span>
            <a
              href="mailto:enquiryfoldstudio@gmail.com"
              className="text-[#8E8B82] hover:text-[#F5F3EE] text-[11px] uppercase tracking-widest inline-block pt-1 transition-colors border-b border-transparent hover:border-[#F5F3EE]"
            >
              enquiryfoldstudio@gmail.com
            </a>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center gap-8 text-[#8E8B82] uppercase tracking-widest font-sans text-[11px]">
            <a href="#hero" onClick={scrollToTop} className="hover:text-[#F5F3EE] transition-colors">HOME</a>
            <a href="#about" className="hover:text-[#F5F3EE] transition-colors">ABOUT</a>
            <a href="#services" className="hover:text-[#F5F3EE] transition-colors">SERVICES</a>
            <a href="#work" className="hover:text-[#F5F3EE] transition-colors">WORK</a>
            <a href="#team" className="hover:text-[#F5F3EE] transition-colors">TEAM</a>
            <button onClick={onOpenContactModal} className="hover:text-[#F5F3EE] text-[#F5F3EE] font-medium transition-colors uppercase">
              CONTACT
            </button>
          </div>

          {/* Scroll to Top Action */}
          <button
            onClick={scrollToTop}
            className="text-[11px] font-sans text-[#8E8B82] hover:text-[#F5F3EE] transition-colors uppercase tracking-widest"
          >
            TOP ↑
          </button>
        </div>

        {/* Bottom Rights */}
        <div className="pt-8 border-t border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest font-light">
          <div>© 2026 FOLD</div>
          <div className="flex items-center space-x-6">
            <a href="https://www.instagram.com/foldstudio.in?stkn=MWkzazd4Zm54aDE3cw%3D%3D&utm_source=qr&wa_status_inline=true" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F3EE] transition-colors">INSTAGRAM</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F3EE] transition-colors">TWITTER / X</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F3EE] transition-colors">LINKEDIN</a>
            <a href="https://are.na" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F3EE] transition-colors">ARE.NA</a>
          </div>
        </div>
      </div>
    </footer>
  );
};


