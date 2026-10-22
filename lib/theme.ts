import { theme, type ThemeConfig } from "antd";

export type ThemeMode = "light" | "dark";

export const PALETTE = {
  light: {
    page: "#F8FAFC",
    surface: "#FFFFFF",
    elevated: "#FFFFFF",
    border: "#E2E8F0",
    borderSubtle: "#F1F5F9",
    text: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
    brand: "#4F46E5", // Vibrant Indigo / Royal Purple
    brandHover: "#4338CA",
    brandActive: "#3730A3",
    onBrand: "#FFFFFF",
    accent: "#EC4899", // Vibrant Pink / Coral
    accentSoft: "#EEF2FF",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    focus: "#6366F1",
    subtle: "#F8FAFC",
    hover: "#F1F5F9",
  },
  dark: {
    page: "#0B0F19",
    surface: "#111827",
    elevated: "#1E293B",
    border: "#1E293B",
    borderSubtle: "#162032",
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    brand: "#6366F1",
    brandHover: "#818CF8",
    brandActive: "#4F46E5",
    onBrand: "#FFFFFF",
    accent: "#F472B6",
    accentSoft: "rgba(99, 102, 241, 0.16)",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",
    focus: "#818CF8",
    subtle: "#162032",
    hover: "#1E293B",
  },
} as const;

export const PRIMARY_COLOR = PALETTE.light.brand;
export const PRIMARY_HOVER = PALETTE.light.brandHover;
export const PRIMARY_ACTIVE = PALETTE.light.brandActive;
export const SURFACE = {
  light: {
    page: PALETTE.light.page,
    card: PALETTE.light.surface,
    elevated: PALETTE.light.elevated,
    sidebar: PALETTE.light.surface,
    border: PALETTE.light.border,
    borderSubtle: PALETTE.light.borderSubtle,
  },
  dark: {
    page: PALETTE.dark.page,
    card: PALETTE.dark.surface,
    elevated: PALETTE.dark.elevated,
    sidebar: PALETTE.dark.surface,
    border: PALETTE.dark.border,
    borderSubtle: PALETTE.dark.borderSubtle,
  },
} as const;

export const CHART_COLORS = {
  series1: "var(--lf-brand)",
  series2: "var(--lf-accent)",
  series3: "var(--lf-info)",
  neutral: "var(--lf-text-muted)",
  grid: "var(--lf-border)",
  gridLight: "var(--lf-border-subtle)",
  axis: "var(--lf-text-muted)",
} as const;

export const DELTA_UP = "var(--lf-success)";
export const DELTA_DOWN = "var(--lf-error)";

const FONT_FAMILY = "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

function config(mode: ThemeMode): ThemeConfig {
  const p = PALETTE[mode];
  const dark = mode === "dark";
  return {
    algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: p.brand,
      colorInfo: p.info,
      colorSuccess: p.success,
      colorWarning: p.warning,
      colorError: p.error,
      colorLink: p.brand,
      colorLinkHover: p.brandHover,
      colorBgLayout: p.page,
      colorBgContainer: p.surface,
      colorBgElevated: p.elevated,
      colorBorder: p.border,
      colorBorderSecondary: p.borderSubtle,
      colorTextHeading: p.text,
      colorText: p.text,
      colorTextSecondary: p.textSecondary,
      colorTextTertiary: p.textMuted,
      colorTextPlaceholder: p.textMuted,
      fontFamily: FONT_FAMILY,
      fontSize: 14,
      borderRadius: 12,
      borderRadiusSM: 8,
      borderRadiusLG: 20,
      controlHeight: 40,
      boxShadow: dark ? "0 2px 8px rgba(0, 0, 0, 0.40)" : "0 2px 8px rgba(16, 24, 40, 0.04)",
      boxShadowSecondary: dark ? "0 16px 36px rgba(0, 0, 0, 0.70)" : "0 16px 36px -4px rgba(16, 24, 40, 0.10)",
      wireframe: false,
    },
    components: {
      Layout: {
        headerBg: "transparent",
        headerHeight: 72,
        headerPadding: "0",
        bodyBg: p.page,
        siderBg: p.surface,
      },
      Button: {
        controlHeight: 40,
        controlHeightSM: 32,
        borderRadius: 9999,
        fontWeight: 600,
        primaryColor: p.onBrand,
        defaultColor: dark ? "#FFFFFF" : p.text,
        defaultBg: dark ? "#16201C" : p.surface,
        defaultBorderColor: p.border,
      },
      Input: {
        controlHeight: 40,
        borderRadius: 12,
        colorBgContainer: p.surface,
        colorText: p.text,
        colorTextPlaceholder: p.textMuted,
        colorBorder: p.border,
      },
      Select: {
        controlHeight: 40,
        borderRadius: 12,
        colorBgContainer: p.surface,
        colorBgElevated: p.elevated,
        colorText: p.text,
        colorTextPlaceholder: p.textMuted,
        colorTextDescription: p.textMuted,
        colorBorder: p.border,
        optionSelectedBg: p.accentSoft,
        optionSelectedColor: p.brand,
        optionActiveBg: p.subtle,
      },
      Table: {
        headerBg: p.subtle,
        headerColor: p.textSecondary,
        headerSplitColor: "transparent",
        rowHoverBg: p.hover,
        borderColor: p.border,
        colorBgContainer: p.surface,
        cellPaddingBlock: 14,
        cellPaddingInline: 16,
        fontSize: 14,
      },
      Card: {
        headerBg: "transparent",
        colorBgContainer: p.surface,
        borderRadiusLG: 20,
      },
      Modal: {
        contentBg: p.elevated,
        headerBg: p.elevated,
        borderRadiusLG: 20,
        paddingContentHorizontalLG: 24,
      },
      Drawer: {
        colorBgElevated: p.elevated,
      },
      Dropdown: {
        colorBgElevated: p.elevated,
        colorText: p.text,
      },
      Popover: {
        colorBgElevated: p.elevated,
        colorText: p.text,
      },
      Menu: {
        itemHeight: 44,
        itemBorderRadius: 12,
        itemSelectedBg: p.accentSoft,
        itemSelectedColor: p.brand,
        itemHoverBg: p.subtle,
        itemColor: p.textSecondary,
      },
      Tooltip: {
        colorBgSpotlight: p.text,
        colorTextLightSolid: p.surface,
      },
      Progress: {
        defaultColor: p.brand,
        remainingColor: p.subtle,
      },
      Form: {
        labelColor: p.text,
      },
      Typography: {
        colorText: p.text,
        colorTextHeading: p.text,
      },
    },
  };
}

export function getAntdTheme(mode: ThemeMode): ThemeConfig {
  return config(mode);
}

export const sidebarTheme = config("light");
export const SIDEBAR_BG = PALETTE.light.surface;
export const SIDEBAR_BORDER = PALETTE.light.border;
