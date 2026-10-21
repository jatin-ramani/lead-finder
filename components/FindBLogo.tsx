import React from 'react';

interface FindBLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FindBLogo({
  variant = 'light',
  className = '',
  size = 'md',
}: FindBLogoProps) {
  const isLight = variant === 'light'; // Light text for dark/gradient backgrounds
  
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9 sm:w-10 sm:h-10';
  const textSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl sm:text-[26px]';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Icon: Modern Search + Radar Business Pin Badge */}
      <div
        className={`${iconSize} rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#06B6D4] flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 text-white`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 sm:w-6 sm:h-6 fill-none stroke-current stroke-[2.5]"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Magnifying search ring */}
          <circle cx="10.5" cy="10.5" r="6.5" />
          {/* Target / Pulse center */}
          <circle cx="10.5" cy="10.5" r="2" fill="currentColor" />
          {/* Search beam handle */}
          <path d="M15.5 15.5L20 20" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className={`font-black tracking-tight ${textSize} leading-none flex items-baseline`}>
        <span className={isLight ? 'text-white' : 'text-slate-900'}>Find</span>
        <span className="text-[#38BDF8] ml-0.5">B</span>
      </div>
    </div>
  );
}
