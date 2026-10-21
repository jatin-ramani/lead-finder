/**
 * FindB Design System Tokens
 * Source of truth for styling, spacing, typography, and color palette.
 */

export const findBTokens = {
  brand: {
    name: 'FindB',
    tagline: 'Find Local Business Leads in Seconds',
    description:
      'Discover high-converting local businesses with verified phone numbers, websites, addresses, and ratings across any city.',
  },
  colors: {
    primary: '#4F46E5', // Indigo 600
    primaryHover: '#4338CA', // Indigo 700
    primaryLight: '#EEF2FF', // Indigo 50
    secondary: '#0EA5E9', // Sky 500
    accentCyan: '#06B6D4', // Cyan 500
    accentEmerald: '#10B981', // Emerald 500
    accentAmber: '#F59E0B', // Amber 500
    heroGradient:
      'linear-gradient(135deg, #1E1B4B 0%, #312E81 28%, #4338CA 58%, #2563EB 82%, #0EA5E9 100%)',
    bgPage: '#F8FAFC',
    bgCardDark: '#0F172A',
    bgCardNavy: '#0B1120',
    bgCardLight: '#FFFFFF',
    textHeading: '#0F172A',
    textBody: '#334155',
    textMuted: '#64748B',
    textOnDark: '#FFFFFF',
    borderLight: '#E2E8F0',
    borderGlass: 'rgba(255, 255, 255, 0.16)',
    glassBg: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    h1: 'text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.08]',
    h2: 'text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-[1.15]',
    h3: 'text-xl sm:text-2xl font-bold tracking-tight',
    bodyLg: 'text-base sm:text-lg font-medium leading-relaxed',
    bodyBase: 'text-sm sm:text-base font-normal leading-relaxed',
    bodySm: 'text-xs sm:text-sm font-normal leading-relaxed',
    micro: 'text-xs font-semibold',
  },
  radii: {
    pill: 'rounded-full',
    cardLg: 'rounded-[28px] sm:rounded-[36px]',
    cardMd: 'rounded-2xl sm:rounded-3xl',
    cardSm: 'rounded-xl',
    button: 'rounded-xl',
  },
  spacing: {
    container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12',
    sectionGap: 'mt-24 sm:mt-32 lg:mt-36',
  },
  transitions: {
    default: 'transition-all duration-200 ease-out',
    smooth: 'transition-all duration-300 ease-out',
    tap: 'active:scale-95 transition-transform duration-150',
  },
} as const;
