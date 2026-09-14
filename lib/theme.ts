import { theme, type ThemeConfig } from "antd";

export type ThemeMode = "light" | "dark";

export const PALETTE = {
  light: {
    page: "#F7F9FA",
    surface: "#FFFFFF",
    elevated: "#FFFFFF",
    border: "#E8ECEF",
    borderSubtle: "#F0F3F5",
    text: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
    brand: "#14532D", // Sophisticated dark forest green
    brandHover: "#166534",
    brandActive: "#0F3F22",
    onBrand: "#FFFFFF",
    accent: "#15803D",
    accentSoft: "#EAF5EE",
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    info: "#0284C7",
    focus: "#14532D",
    subtle: "#F1F5F4",
    hover: "#F8FAF9",
  },
  dark: {
    page: "#090D0B",
    surface: "#111815",
    elevated: "#16201C",
    border: "#1F2D27",
    borderSubtle: "#18241F",
    text: "#FFFFFF",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    brand: "#15803D",
    brandHover: "#166534",
    brandActive: "#14532D",
    onBrand: "#FFFFFF",
    accent: "#4ADE80",
    accentSoft: "rgba(74, 222, 128, 0.16)",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#38BDF8",
    focus: "#4ADE80",
    subtle: "#16221D",
    hover: "#1C2C25",
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
