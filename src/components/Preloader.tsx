import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const pageLoadedRef = useRef<boolean>(document.readyState === 'complete');
  const rawProgressRef = useRef<number>(0);
  const hasTriggeredExitRef = useRef<boolean>(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Listen for actual window load event
    const handleLoad = () => {
      pageLoadedRef.current = true;
    };

    if (document.readyState !== 'complete') {
      window.addEventListener('load', handleLoad);
    } else {
      pageLoadedRef.current = true;
    }

    // Smooth non-linear 0-100% progression loop
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const targetDuration = 2200; // ~2.2s total smooth duration

      let current = rawProgressRef.current;

      if (current >= 100) {
        clearInterval(interval);
        return;
      }

      // Stage 1: 0 - 25% (Quick start)
      if (current < 25) {
        current += 3.5;
      }
      // Stage 2: 25 - 65% (Steady momentum)
      else if (current < 65) {
        current += 2.6;
      }
      // Stage 3: 65 - 85% (Controlled transition)
      else if (current < 85) {
        current += 1.8;
      }
      // Stage 4: 85 - 96% (Steady final stretch)
      else if (current < 96) {
        current += 1.4;
      }
      // Stage 5: 96 - 100% (Ensure completion based on time & page status)
      else {
        if (pageLoadedRef.current || elapsed >= targetDuration) {
          current += 2.0;
        } else {
          current += 0.8;
        }
      }

      const nextInteger = Math.min(100, Math.floor(current));
      rawProgressRef.current = current;
      setProgress(nextInteger);
    }, 25);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearInterval(interval);
    };
  }, []);

  // Guarantee 100% hold for exactly 200ms, then invoke onComplete without cancellation bugs
  useEffect(() => {
    if (progress >= 100 && !hasTriggeredExitRef.current) {
      hasTriggeredExitRef.current = true;
      const holdTimer = setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }, 200);

      return () => clearTimeout(holdTimer);
    }
  }, [progress]);

  // Format 2-digit percentage output (00%, 01%, ... 99%, 100%)
  const formattedProgress = progress < 10 ? `0${progress}` : `${progress}`;

  return (
    <motion.div
      key="preloader-curtain"
      initial={{ y: 0, opacity: 1 }}
      exit={{
        y: '-100%',
        opacity: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
      }}
      style={{ pointerEvents: progress >= 100 ? 'none' : 'auto' }}
      className="fixed inset-0 z-[10000] flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-[#F5F3EE] text-[#202020] select-none"
    >
      {/* Top Editorial Brand Sub-bar */}
      <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-6 font-sans text-[11px] text-[#8E8B82] uppercase tracking-widest font-medium">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#202020]" />
          <span className="font-serif text-lg text-[#202020] tracking-tight font-normal">FOLD</span>
        </div>
        <div>INDEPENDENT CREATIVE STUDIO</div>
      </div>

      {/* Center Minimal Studio Intro & Percentage Counter */}
      <div className="my-auto max-w-xl mx-auto w-full text-center space-y-8">
        {/* Centered Brand Title */}
        <div className="space-y-2">
          <span className="font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest font-medium block">
            INITIALIZING CREATIVE WORKSPACE
          </span>
          <h1 className="font-serif font-normal text-4xl sm:text-5xl md:text-6xl tracking-tight text-[#202020]">
            FOLD STUDIO
          </h1>
        </div>

        {/* Clean 00% - 100% Counter */}
        <div className="flex items-baseline justify-center space-x-2">
          <span className="font-serif text-7xl sm:text-8xl md:text-9xl font-normal tracking-tight text-[#202020]">
            {formattedProgress}
          </span>
          <span className="font-serif text-3xl sm:text-4xl text-[#8E8B82]">%</span>
        </div>

        {/* Minimal 1px Horizontal Progress Line */}
        <div className="w-full max-w-md mx-auto h-[1px] bg-[#E5E2DA] relative overflow-hidden">
          <motion.div
            className="h-full bg-[#202020]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }}
          />
        </div>
      </div>

      {/* Bottom Editorial Sub-bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E2DA] pt-6 font-sans text-[10px] text-[#8E8B82] uppercase tracking-widest">
        <span>INDIA / WORKING WORLDWIDE — 2026</span>
        <span>WE DESIGN WHAT PEOPLE REMEMBER</span>
      </div>
    </motion.div>
  );
};

export default Preloader;
