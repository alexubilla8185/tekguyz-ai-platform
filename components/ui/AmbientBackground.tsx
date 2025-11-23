import React, { useEffect, useState } from 'react';

const AmbientBackground: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 1. Pause animations when tab is hidden to save battery/CPU
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
      if (document.hidden) {
        document.body.classList.add('paused');
      } else {
        document.body.classList.remove('paused');
      }
    };

    // 2. Detect mobile to reduce particle count
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', checkMobile);
    
    // Initial check
    checkMobile();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', checkMobile);
      document.body.classList.remove('paused');
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none select-none ${isPaused ? 'paused' : ''}`}>
      {/* Gradient Orb 1 (Top Left - Accent Color) */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-accent/5 blur-[120px] mix-blend-screen opacity-70 animate-pulse-slow" 
      />
      
      {/* Gradient Orb 2 (Bottom Right - Secondary/Blueish) */}
      <div 
        className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/5 blur-[100px] mix-blend-screen opacity-60 animate-pulse-slow" 
        style={{ animationDelay: '5s' }}
      />

      {/* Gradient Orb 3 (Bottom Left - Subtle) - HIDDEN ON MOBILE for performance */}
      {!isMobile && (
        <div 
            className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/5 blur-[150px] mix-blend-screen opacity-50 animate-pulse-slow" 
            style={{ animationDelay: '2s' }}
        />
      )}

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] mix-blend-overlay"
        style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }}
      />
    </div>
  );
};

export default AmbientBackground;