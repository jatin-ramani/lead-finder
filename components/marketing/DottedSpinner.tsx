import React from 'react';

interface DottedSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

const DOTS = [
  { cx: 40, cy: 24, opacity: 1.0 },
  { cx: 37.86, cy: 32, opacity: 0.88 },
  { cx: 32, cy: 37.86, opacity: 0.77 },
  { cx: 24, cy: 40, opacity: 0.66 },
  { cx: 16, cy: 37.86, opacity: 0.55 },
  { cx: 10.14, cy: 32, opacity: 0.45 },
  { cx: 8, cy: 24, opacity: 0.36 },
  { cx: 10.14, cy: 16, opacity: 0.28 },
  { cx: 16, cy: 10.14, opacity: 0.21 },
  { cx: 24, cy: 8, opacity: 0.15 },
  { cx: 32, cy: 10.14, opacity: 0.10 },
  { cx: 37.86, cy: 16, opacity: 0.06 },
];

const SIZES = {
  sm: 'w-4 h-4',
  md: 'w-7 h-7',
  lg: 'w-11 h-11',
  xl: 'w-16 h-16',
};

export default function DottedSpinner({
  size = 'md',
  className = '',
  color = '#2563EB',
}: DottedSpinnerProps) {
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <svg
      viewBox="0 0 48 48"
      className={`animate-spin ${sizeClass} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      {DOTS.map((dot, index) => (
        <circle
          key={index}
          cx={dot.cx}
          cy={dot.cy}
          r="2.8"
          fill={color}
          opacity={dot.opacity}
        />
      ))}
    </svg>
  );
}
