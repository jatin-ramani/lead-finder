import { theme, type ThemeConfig } from "antd";

export type ThemeMode = "light" | "dark";

export const PALETTE = {
  light: {
    page: "#F6F7F9", surface: "#FFFFFF", elevated: "#FFFFFF", border: "#DDE2E8",
    text: "#17202B", textSecondary: "#4B5968", textMuted: "#758293",
    brand: "#2563EB", brandHover: "#1D4ED8", brandActive: "#1E40AF",
    success: "#16803C", warning: "#B45309", error: "#C9362B", info: "#0369A1", focus: "#2563EB",
    subtle: "#F0F3F7", hover: "#F8FAFC",
  },
  dark: {
    page: "#0D1117", surface: "#151B23", elevated: "#1B2430", border: "#303A46",
    text: "#F3F6F9", textSecondary: "#B7C0CB", textMuted: "#8491A1",
    brand: "#60A5FA", brandHover: "#7CB7FC", brandActive: "#3B82F6",
    success: "#4ADE80", warning: "#FBBF24", error: "#F87171", info: "#38BDF8", focus: "#93C5FD",
    subtle: "#202936", hover: "#1B2430",
  },
} as const;

export const PRIMARY_COLOR = PALETTE.light.brand;
export const PRIMARY_HOVER = PALETTE.light.brandHover;
export const PRIMARY_ACTIVE = PALETTE.light.brandActive;
export const SURFACE = {
  light: { page: PALETTE.light.page, card: PALETTE.light.surface, elevated: PALETTE.light.elevated, sidebar: PALETTE.light.surface, border: PALETTE.light.border, borderSubtle: PALETTE.light.border },
  dark: { page: PALETTE.dark.page, card: PALETTE.dark.surface, elevated: PALETTE.dark.elevated, sidebar: PALETTE.dark.surface, border: PALETTE.dark.border, borderSubtle: PALETTE.dark.border },
} as const;
export const CHART_COLORS = { series1: PALETTE.light.brand, series2: PALETTE.light.info, neutral: PALETTE.light.textMuted, grid: PALETTE.dark.border, gridLight: PALETTE.light.border, axis: PALETTE.light.textMuted } as const;
export const DELTA_UP = PALETTE.light.success;
export const DELTA_DOWN = PALETTE.light.error;

const FONT_FAMILY = "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function config(mode: ThemeMode): ThemeConfig {
  const p = PALETTE[mode];
  const dark = mode === "dark";
  return {
    algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: p.brand, colorInfo: p.info, colorSuccess: p.success,
      colorWarning: p.warning, colorError: p.error, colorLink: p.brand,
      colorLinkHover: p.brandHover, colorBgLayout: p.page,
      colorBgContainer: p.surface, colorBgElevated: p.elevated,
      colorBorder: p.border, colorBorderSecondary: p.border,
      colorTextHeading: p.text, colorText: p.text, colorTextSecondary: p.textSecondary,
      colorTextTertiary: p.textMuted, fontFamily: FONT_FAMILY, fontSize: 14,
      borderRadius: 6, borderRadiusSM: 4, borderRadiusLG: 8, controlHeight: 38,
      boxShadow: "0 1px 2px rgba(15,23,42,.06)", boxShadowSecondary: "0 12px 32px rgba(15,23,42,.14)",
      wireframe: false,
    },
    components: {
      Layout: { headerBg: p.surface, headerHeight: 64, headerPadding: "0 32px", bodyBg: p.page, siderBg: p.surface },
      Button: { controlHeight: 38, controlHeightSM: 32, borderRadius: 6, fontWeight: 600 },
      Input: { controlHeight: 38, borderRadius: 6 },
      Select: { controlHeight: 38, borderRadius: 6, optionSelectedBg: p.subtle },
      Table: { headerBg: p.subtle, headerColor: p.textSecondary, headerSplitColor: "transparent", rowHoverBg: p.hover, borderColor: p.border, cellPaddingBlock: 16, cellPaddingInline: 16, fontSize: 13 },
      Card: { headerBg: "transparent", borderRadiusLG: 8 },
      Modal: { contentBg: p.elevated, headerBg: p.elevated, borderRadiusLG: 12, paddingContentHorizontalLG: 24 },
      Drawer: { colorBgElevated: p.elevated },
      Menu: { itemHeight: 40, itemBorderRadius: 6, itemSelectedBg: dark ? "rgba(96,165,250,.14)" : "#EFF6FF", itemSelectedColor: p.brand, itemHoverBg: p.subtle, itemColor: p.textSecondary },
      Tooltip: { colorBgSpotlight: p.text, colorTextLightSolid: p.surface },
      Progress: { defaultColor: p.brand, remainingColor: p.subtle },
    },
  };
}

export function getAntdTheme(mode: ThemeMode): ThemeConfig { return config(mode); }
export const sidebarTheme = config("light");
export const SIDEBAR_BG = PALETTE.light.surface;
export const SIDEBAR_BORDER = PALETTE.light.border;
