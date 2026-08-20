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
    page: "#09090B", surface: "#121214", elevated: "#18181B", border: "#27272A",
    text: "#FFFFFF", textSecondary: "#E2E8F0", textMuted: "#CBD5E1",
    brand: "#2563EB", brandHover: "#3B82F6", brandActive: "#1D4ED8",
    success: "#22C55E", warning: "#F59E0B", error: "#EF4444", info: "#38BDF8", focus: "#3B82F6",
    subtle: "#18181B", hover: "#202025",
  },
} as const;

export const PRIMARY_COLOR = PALETTE.light.brand;
export const PRIMARY_HOVER = PALETTE.light.brandHover;
export const PRIMARY_ACTIVE = PALETTE.light.brandActive;
export const SURFACE = {
  light: { page: PALETTE.light.page, card: PALETTE.light.surface, elevated: PALETTE.light.elevated, sidebar: PALETTE.light.surface, border: PALETTE.light.border, borderSubtle: PALETTE.light.border },
  dark: { page: PALETTE.dark.page, card: PALETTE.dark.surface, elevated: PALETTE.dark.elevated, sidebar: PALETTE.dark.surface, border: PALETTE.dark.border, borderSubtle: PALETTE.dark.border },
} as const;
export const CHART_COLORS = { series1: "var(--lf-brand)", series2: "var(--lf-info)", neutral: "var(--lf-text-muted)", grid: "var(--lf-border)", gridLight: "var(--lf-border-subtle)", axis: "var(--lf-text-muted)" } as const;
export const DELTA_UP = "var(--lf-success)";
export const DELTA_DOWN = "var(--lf-error)";

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
      colorTextTertiary: p.textMuted, colorTextPlaceholder: p.textMuted,
      fontFamily: FONT_FAMILY, fontSize: 14,
      borderRadius: 6, borderRadiusSM: 4, borderRadiusLG: 8, controlHeight: 38,
      boxShadow: "0 1px 2px rgba(15,23,42,.06)", boxShadowSecondary: "0 12px 32px rgba(15,23,42,.14)",
      wireframe: false,
    },
    components: {
      Layout: { headerBg: p.surface, headerHeight: 64, headerPadding: "0 32px", bodyBg: p.page, siderBg: p.surface },
      Button: {
        controlHeight: 38,
        controlHeightSM: 32,
        borderRadius: 6,
        fontWeight: 600,
        primaryColor: "#FFFFFF",
        defaultColor: dark ? "#FFFFFF" : p.text,
        defaultBg: dark ? "#18181B" : p.surface,
        defaultBorderColor: p.border,
      },
      Input: { controlHeight: 38, borderRadius: 6, colorBgContainer: p.surface, colorText: p.text, colorTextPlaceholder: p.textMuted, colorBorder: p.border },
      Select: { controlHeight: 38, borderRadius: 6, colorBgContainer: p.surface, colorText: p.text, colorTextPlaceholder: p.textMuted, colorBorder: p.border, optionSelectedBg: p.subtle },
      Table: { headerBg: p.subtle, headerColor: p.textSecondary, headerSplitColor: "transparent", rowHoverBg: p.hover, borderColor: p.border, colorBgContainer: p.surface, cellPaddingBlock: 16, cellPaddingInline: 16, fontSize: 13 },
      Card: { headerBg: "transparent", colorBgContainer: p.surface, borderRadiusLG: 8 },
      Modal: { contentBg: p.elevated, headerBg: p.elevated, borderRadiusLG: 12, paddingContentHorizontalLG: 24 },
      Drawer: { colorBgElevated: p.elevated },
      Menu: { itemHeight: 40, itemBorderRadius: 6, itemSelectedBg: dark ? "rgba(37,99,235,.16)" : "#EFF6FF", itemSelectedColor: p.brand, itemHoverBg: p.subtle, itemColor: p.textSecondary },
      Tooltip: { colorBgSpotlight: p.text, colorTextLightSolid: p.surface },
      Progress: { defaultColor: p.brand, remainingColor: p.subtle },
      Form: { labelColor: p.text },
      Typography: { colorText: p.text, colorTextHeading: p.text },
    },
  };
}

export function getAntdTheme(mode: ThemeMode): ThemeConfig { return config(mode); }
export const sidebarTheme = config("light");
export const SIDEBAR_BG = PALETTE.light.surface;
export const SIDEBAR_BORDER = PALETTE.light.border;
