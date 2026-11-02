import React from 'react';

interface BookingStripProps {
  text?: string;
}

export const BookingStrip: React.FC<BookingStripProps> = ({
  text = "NOW BOOKING SELECT PROJECTS FOR 2026 — FOLD CREATIVE STUDIO"
}) => {
  return (
    <div className="w-full bg-[#F5F3EE] border-y border-[#E5E2DA] py-3.5 px-6 md:px-12 select-none overflow-hidden">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between font-sans text-[10px] md:text-[11px] tracking-widest text-[#8E8B82] uppercase">
        <div className="flex items-center space-x-3">
          <span className="w-1.5 h-1.5 bg-[#202020] rounded-full animate-pulse" />
          <span className="text-[#202020] font-medium">{text}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-8 text-[#8E8B82]">
          <span>AVAILABILITY: Q3 / Q4</span>
          <span>HYDERABAD / MUMBAI / GLOBAL</span>
        </div>
      </div>
    </div>
  );
};
