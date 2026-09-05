import React from 'react';

/**
 * Official AVERO Brand Logo Component
 * Matches the official geometric "A" with orbital ring & satellite node.
 */
export function Logo({ 
  size = 'md', 
  isCollapsed = false, 
  showSubtitle = true,
  className = '',
  onClick
}) {
  const emblemSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-sm tracking-wider',
    md: 'text-base tracking-[0.2em]',
    lg: 'text-xl tracking-[0.22em]',
    xl: 'text-2xl tracking-[0.25em]'
  };

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Official Avero Orbit Emblem */}
      <div className={`relative ${emblemSizes[size]} shrink-0 flex items-center justify-center`}>
        {/* Ambient Backlight Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500/30 via-cyan-400/25 to-sky-500/30 blur-[8px] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Vector SVG of Official Avero Mark */}
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full relative z-10 transform group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
        >
          <defs>
            {/* Emerald to Cyan Gradient for A */}
            <linearGradient id="avero-a-grad" x1="15" y1="85" x2="85" y2="15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00e676" />
              <stop offset="35%" stopColor="#00c853" />
              <stop offset="65%" stopColor="#00b0ff" />
              <stop offset="100%" stopColor="#0091ea" />
            </linearGradient>

            {/* Orbit Gradient */}
            <linearGradient id="avero-orbit-grad" x1="10" y1="75" x2="90" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00e676" />
              <stop offset="60%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#00b0ff" />
            </linearGradient>

            {/* Satellite Node Glow */}
            <radialGradient id="avero-node-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e0f7fa" />
              <stop offset="50%" stopColor="#80deea" />
              <stop offset="100%" stopColor="#00b0ff" />
            </radialGradient>

            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
            </filter>
          </defs>

          {/* Background Orbit Arc (Behind 'A') */}
          <path
            d="M 16 68 C 10 58 12 40 28 30 C 44 20 68 18 84 28"
            stroke="url(#avero-orbit-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* Geometric 'A' Body */}
          {/* Left Leg (Emerald) */}
          <path
            d="M 18 80 L 46 16 C 48 12 52 12 54 16 L 82 80 C 83 83 80 86 76 84 L 64 77 C 62 76 60 74 60 71 L 50 42 L 36 68 L 22 84 C 19 86 16 83 18 80 Z"
            fill="url(#avero-a-grad)"
          />

          {/* Foreground Orbit Arc (In Front of 'A') */}
          <path
            d="M 84 28 C 92 34 94 48 82 60 C 66 76 34 84 16 68"
            stroke="url(#avero-orbit-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Orbiting Satellite Sphere */}
          <circle 
            cx="76" 
            cy="30" 
            r="6" 
            fill="url(#avero-node-grad)" 
          />
          <circle 
            cx="76" 
            cy="30" 
            r="8" 
            fill="#00e5ff" 
            opacity="0.3"
            filter="url(#node-glow)" 
          />
        </svg>
      </div>

      {/* Official Avero Wordmark */}
      {!isCollapsed && (
        <div className="min-w-0">
          <div className="flex items-center gap-2 leading-none">
            <span className={`font-extrabold uppercase text-slate-900 dark:text-white ${textSizes[size]} tracking-[0.22em]`}>
              AVERO
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 tracking-wider">
              AI
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight truncate mt-1">
              3-Way Financial Reconciliation
            </p>
          )}
        </div>
      )}
    </div>
  );
}
