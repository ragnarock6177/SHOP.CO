'use client';

import React, { useEffect, useState } from 'react';

export const GhostScrollbar: React.FC = () => {
  const [scrollTop, setScrollTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const currentScroll = window.scrollY || document.documentElement.scrollTop;

      if (docHeight <= windowHeight) {
        setIsVisible(false);
        return;
      }

      // Calculate thumb height proportionally (min 36px)
      const calculatedThumbHeight = Math.max(36, (windowHeight / docHeight) * windowHeight);
      const maxScroll = docHeight - windowHeight;
      const maxThumbTop = windowHeight - calculatedThumbHeight - 16; // 8px top/bottom padding
      const calculatedThumbTop = 8 + (currentScroll / maxScroll) * maxThumbTop;

      setThumbHeight(calculatedThumbHeight);
      setThumbTop(calculatedThumbTop);
      setScrollTop(currentScroll);

      // Show scrollbar while scrolling
      setIsVisible(true);

      // Reset hide timer
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 900);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(hideTimer);
    };
  }, []);

  if (thumbHeight === 0) return null;

  return (
    <div
      className={`fixed right-1 z-50 pointer-events-none transition-opacity duration-500 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        top: `${thumbTop}px`,
        height: `${thumbHeight}px`,
        width: '5px',
      }}
    >
      <div className="w-full h-full bg-black/80 hover:bg-black rounded-full shadow-sm" />
    </div>
  );
};
