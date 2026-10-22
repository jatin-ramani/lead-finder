/**
 * Marketing Design System Tokens
 * Extracted from reference site audit (Tracelo)
 */

export const marketingTokens = {
  colors: {
    brandPrimary: '#2563EB',
    brandPrimaryHover: '#1D4ED8',
    gradientHero: 'linear-gradient(118deg, #3C42F5 0%, #6A2FEA 26%, #A21DE3 52%, #DD2C99 78%, #FA4F74 100%)',
    bgDarkNavy: '#0B1B2F',
    bgCardDark: '#111827',
    bgCardLight: '#F1F5F9',
    bgPage: '#F8FAFC',
    textMain: '#0F172A',
    textMuted: '#64748B',
    borderLight: 'rgba(255, 255, 255, 0.1)',
    borderCard: 'rgba(226, 232, 240, 0.8)',
    pastelBadges: {
      cyan: 'from-cyan-100 to-sky-200 text-sky-600',
      emerald: 'from-emerald-100 to-green-200 text-emerald-600',
      amber: 'from-amber-100 to-orange-200 text-amber-600',
      teal: 'from-teal-100 to-cyan-200 text-teal-600',
    },
  },
  radii: {
    pill: '9999px',
    cardLg: '32px',
    cardMd: '24px',
    cardSm: '16px',
    button: '12px',
    badge: '16px',
  },
  typeScale: {
    h1: 'text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.08]',
    h2: 'text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]',
    h3: 'text-lg sm:text-xl font-bold tracking-tight',
    bodyLg: 'text-base sm:text-lg font-medium leading-relaxed',
    bodyBase: 'text-sm sm:text-base font-normal leading-relaxed',
    bodySm: 'text-xs sm:text-sm font-normal leading-relaxed',
    micro: 'text-xs font-medium',
  },
  spacing: {
    container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12',
    sectionGap: 'mt-24 sm:mt-32 lg:mt-36',
  },
  transitions: {
    default: 'transition-all duration-300 ease-out',
    tap: 'active:scale-95 transition-transform duration-150',
    accordion: 'transition-all duration-200 ease-in-out',
  },
} as const;
