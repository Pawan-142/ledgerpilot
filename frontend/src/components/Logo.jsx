import React from 'react';

/**
 * Unique Futuristic LedgerPilot Brand Logo
 * Features:
 * - The "Quantum Pilot Wing & 3-Way Tri-Facet Shield" (Interlocking Orders ➔ Gateway ➔ Settlement)
 * - 4-Point AI Spark Core Node
 * - Ultra-sleek Typography with gradient clip & interactive hover glow
 */
export function Logo({ 
  title = 'Avero',
  variant = 'aero', 
  size = 'md', 
  isCollapsed = false, 
  showSubtitle = true,
  className = '',
  onClick
}) {
  const COLOR_THEMES = {
    aero: {
      glow: 'from-cyan-500/40 via-sky-400/35 to-blue-500/35',
      border: 'border-cyan-500/50 hover:border-sky-400',
      wingLeft: ['#0284c7', '#0ea5e9', '#38bdf8'],
      wingRight: ['#0891b2', '#06b6d4', '#67e8f9'],
      wingBottom: ['#0369a1', '#0ea5e9'],
      coreFlare: '#ffffff',
      coreGlow: '#a5f3fc',
      textGrad: 'from-cyan-400 via-sky-300 to-blue-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
      badgeText: 'Aero Pilot'
    },
    emerald: {
      glow: 'from-emerald-500/40 via-teal-400/30 to-cyan-500/35',
      border: 'border-emerald-500/50 hover:border-emerald-400',
      wingLeft: ['#059669', '#10b981', '#34d399'],
      wingRight: ['#0d9488', '#06b6d4', '#38bdf8'],
      wingBottom: ['#047857', '#10b981'],
      coreFlare: '#ffffff',
      coreGlow: '#6ee7b7',
      textGrad: 'from-emerald-400 via-teal-300 to-cyan-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      badgeText: 'AI 3-Way'
    },
    razorpay: {
      glow: 'from-blue-600/40 via-cyan-400/30 to-indigo-500/35',
      border: 'border-blue-500/50 hover:border-cyan-400',
      wingLeft: ['#1d4ed8', '#2563eb', '#60a5fa'],
      wingRight: ['#0284c7', '#06b6d4', '#38bdf8'],
      wingBottom: ['#1e40af', '#3b82f6'],
      coreFlare: '#ffffff',
      coreGlow: '#93c5fd',
      textGrad: 'from-blue-400 via-cyan-300 to-sky-400',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
      badgeText: 'Track 04'
    },
    indigo: {
      glow: 'from-indigo-600/40 via-purple-500/30 to-pink-500/35',
      border: 'border-indigo-500/50 hover:border-purple-400',
      wingLeft: ['#4338ca', '#6366f1', '#a5b4fc'],
      wingRight: ['#7e22ce', '#a855f7', '#f472b6'],
      wingBottom: ['#3730a3', '#6366f1'],
      coreFlare: '#ffffff',
      coreGlow: '#c084fc',
      textGrad: 'from-indigo-400 via-purple-300 to-pink-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
      badgeText: 'Groq'
    },
    gold: {
      glow: 'from-amber-500/40 via-yellow-400/30 to-orange-500/35',
      border: 'border-amber-500/50 hover:border-yellow-400',
      wingLeft: ['#b45309', '#f59e0b', '#fcd34d'],
      wingRight: ['#c2410c', '#f97316', '#fdba74'],
      wingBottom: ['#92400e', '#d97706'],
      coreFlare: '#ffffff',
      coreGlow: '#fde047',
      textGrad: 'from-amber-400 via-yellow-300 to-orange-400',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
      badgeText: 'FinOps'
    }
  };

  const theme = COLOR_THEMES[variant] || COLOR_THEMES.emerald;

  const emblemSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl'
  };

  const idLeft = `lp-unique-left-${variant}`;
  const idRight = `lp-unique-right-${variant}`;
  const idBase = `lp-unique-base-${variant}`;

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Brand Icon Shield */}
      <div className={`relative ${emblemSizes[size]} shrink-0 flex items-center justify-center`}>
        {/* Dynamic Multi-Color Ambient Flare */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-tr ${theme.glow} blur-[8px] opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`} />
        
        {/* Glassmorphic Cyber Frame */}
        <div className={`relative w-full h-full rounded-xl bg-gradient-to-b from-[#0f172a] via-[#090e1a] to-[#040711] border ${theme.border} p-1.5 shadow-xl flex items-center justify-center overflow-hidden transition-all group-hover:shadow-2xl`}>
          
          {/* Subtle Grid / Scanline Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.15),transparent_70%)]" />

          {/* Precision 3-Way Vector Glyph */}
          <svg 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-full transform group-hover:scale-105 transition-transform duration-300"
          >
            {/* Left Pilot Wing (Orders Facet) */}
            <path 
              d="M16 3L5 15L16 21L16 3Z" 
              fill={`url(#${idLeft})`} 
              opacity="0.95"
            />
            {/* Right Pilot Wing (Gateway Facet) */}
            <path 
              d="M16 3L27 15L16 21L16 3Z" 
              fill={`url(#${idRight})`} 
              opacity="0.95"
            />
            {/* Bottom Keel (Bank Settlement Facet) */}
            <path 
              d="M16 21L7 16.5L16 29L25 16.5L16 21Z" 
              fill={`url(#${idBase})`} 
              opacity="0.9"
            />

            {/* Inner Precision Interlocking Contours */}
            <path 
              d="M16 3L5 15L16 21L27 15L16 3Z" 
              stroke="#ffffff" 
              strokeWidth="0.75" 
              strokeOpacity="0.4"
              strokeLinejoin="round" 
            />
            <path 
              d="M16 21L16 29" 
              stroke="#ffffff" 
              strokeWidth="0.75" 
              strokeOpacity="0.5"
            />

            {/* Radiant 4-Point AI Spark Core (✦) */}
            <g transform="translate(16, 15)">
              <circle r="2.5" fill={theme.coreGlow} opacity="0.4" filter="blur(1px)" />
              <path 
                d="M0 -3.5L0.8 -0.8L3.5 0L0.8 0.8L0 3.5L-0.8 0.8L-3.5 0L-0.8 -0.8Z" 
                fill={theme.coreFlare} 
              />
            </g>

            {/* Gradients */}
            <defs>
              <linearGradient id={idLeft} x1="5" y1="3" x2="16" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor={theme.wingLeft[0]} />
                <stop offset="0.5" stopColor={theme.wingLeft[1]} />
                <stop offset="1" stopColor={theme.wingLeft[2]} />
              </linearGradient>

              <linearGradient id={idRight} x1="27" y1="3" x2="16" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor={theme.wingRight[0]} />
                <stop offset="0.5" stopColor={theme.wingRight[1]} />
                <stop offset="1" stopColor={theme.wingRight[2]} />
              </linearGradient>

              <linearGradient id={idBase} x1="16" y1="16.5" x2="16" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor={theme.wingBottom[0]} />
                <stop offset="1" stopColor={theme.wingBottom[1]} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typography & Micro Pill */}
      {!isCollapsed && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-slate-900 dark:text-slate-100 ${textSizes[size]}`}>
              {title === 'Avero' ? (
                <>
                  Av<span className={`bg-gradient-to-r ${theme.textGrad} bg-clip-text text-transparent font-extrabold`}>ero</span>
                </>
              ) : title === 'LedgerPilot' ? (
                <>
                  Ledger<span className={`bg-gradient-to-r ${theme.textGrad} bg-clip-text text-transparent font-extrabold`}>Pilot</span>
                </>
              ) : (
                <span className={`bg-gradient-to-r ${theme.textGrad} bg-clip-text text-transparent font-extrabold`}>{title}</span>
              )}
            </span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border shrink-0 tracking-wider ${theme.badgeBg}`}>
              {theme.badgeText}
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight truncate mt-1">
              AI 3-Way Reconciliation
            </p>
          )}
        </div>
      )}
    </div>
  );
}
