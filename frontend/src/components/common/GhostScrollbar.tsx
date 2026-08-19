'use client';

import React, { useEffect, useRef } from 'react';

export const GhostScrollbar: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable custom scrollbar on mobile & touch viewports for 100% native mobile GPU scroll performance
    if (typeof window === 'undefined' || window.innerWidth < 768 || 'ontouchstart' in window) {
      return;
    }

    let hideTimer: NodeJS.Timeout;
    let rAFId: number;

    const updateScrollbar = () => {
      if (!thumbRef.current || !barRef.current) return;

      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const currentScroll = window.scrollY || document.documentElement.scrollTop;

      if (docHeight <= windowHeight + 10) {
        barRef.current.style.opacity = '0';
        return;
      }

      const calculatedThumbHeight = Math.max(36, (windowHeight / docHeight) * windowHeight);
      const maxScroll = docHeight - windowHeight;
      const maxThumbTop = windowHeight - calculatedThumbHeight - 16;
      const calculatedThumbTop = 8 + (currentScroll / Math.max(1, maxScroll)) * maxThumbTop;

      thumbRef.current.style.height = `${calculatedThumbHeight}px`;
      thumbRef.current.style.transform = `translate3d(0, ${calculatedThumbTop}px, 0)`;
      barRef.current.style.opacity = '1';

      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (barRef.current) barRef.current.style.opacity = '0';
      }, 900);
    };

    const onScroll = () => {
      cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(updateScrollbar);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rAFId);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed right-1 top-0 z-50 pointer-events-none transition-opacity duration-300 opacity-0 hidden md:block"
    >
      <div
        ref={thumbRef}
        className="w-1.5 bg-black/80 rounded-full shadow-xs will-change-transform"
      />
    </div>
  );
};
