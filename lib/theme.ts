import { theme, type ThemeConfig } from "antd";

export type ThemeMode = "light" | "dark";

/**
 * UI accent. Governed by text/icon contrast (9.9:1 on the dark card), not by the
 * chart lightness band — chart marks use the stepped values in CHART_COLORS.
 */
export const PRIMARY_COLOR = "#E5B93C";
export const PRIMARY_HOVER = "#F0C95E";
export const PRIMARY_ACTIVE = "#C99F2A";

/** Surfaces the palette validator was run against. */
export const SURFACE = {
  dark: {
    page: "#0A0A0B",
    card: "#141416",
    elevated: "#1C1C21",
    sidebar: "#0E0E10",
    border: "#26262C",
    borderSubtle: "#1E1E23",
  },
  light: {
    page: "#F7F7F5",
    card: "#FFFFFF",
    elevated: "#FFFFFF",
    sidebar: "#0E0E10",
    border: "#E3E3DE",
    borderSubtle: "#EDEDE8",
  },
} as const;

/**
 * Chart series colours — validated with the dataviz palette checker against the
 * dark card surface (#141416): lightness band, chroma floor, all-pairs CVD
 * separation (ΔE 27.3 deutan), normal-vision floor (27.7) and 3:1 contrast.
 * Do not brighten these to match the UI accent; they would leave the band.
 */
export const CHART_COLORS = {
  /** Slot 1 — the emphasis hue: businesses worth contacting. */
  series1: "#B48C23",
  /** Slot 2 — no website but unreachable. */
  series2: "#9078E8",
  /** De-emphasis: already has a website, i.e. context, not a lead. */
  neutral: "#6B6B76",
  grid: "#26262C",
  gridLight: "#E3E3DE",
  axis: "#71717A",
} as const;

export const DELTA_UP = "#4ADE80";
export const DELTA_DOWN = "#F87171";

const FONT_FAMILY =
  "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const sharedToken: ThemeConfig["token"] = {
  colorPrimary: PRIMARY_COLOR,
  colorInfo: PRIMARY_COLOR,
  colorSuccess: "#22C55E",
  colorError: "#EF4444",
  colorWarning: "#F59E0B",
  colorLink: PRIMARY_COLOR,
  colorLinkHover: PRIMARY_HOVER,
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  borderRadius: 10,
  borderRadiusLG: 14,
  borderRadiusSM: 8,
  controlHeight: 38,
  wireframe: false,
};

const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...sharedToken,
    colorBgLayout: SURFACE.dark.page,
    colorBgContainer: SURFACE.dark.card,
    colorBgElevated: SURFACE.dark.elevated,
    colorBorder: SURFACE.dark.border,
    colorBorderSecondary: SURFACE.dark.borderSubtle,
    colorTextHeading: "#F4F4F5",
    colorText: "#E4E4E7",
    colorTextSecondary: "#A1A1AA",
    colorTextTertiary: "#71717A",
    colorTextQuaternary: "#52525B",
  },
  components: {
    Layout: {
      headerBg: SURFACE.dark.page,
      headerHeight: 76,
      headerPadding: "0 28px",
      bodyBg: SURFACE.dark.page,
    },
    Table: {
      headerBg: "transparent",
      headerColor: "#71717A",
      headerSplitColor: "transparent",
      rowHoverBg: "#1A1A1E",
      borderColor: SURFACE.dark.borderSubtle,
      cellPaddingBlock: 15,
      footerBg: "transparent",
    },
    Card: { headerBg: "transparent" },
    Segmented: {
      itemSelectedBg: "#2A2A31",
      itemSelectedColor: "#F4F4F5",
      trackBg: "#161619",
    },
    Select: { optionSelectedBg: "#2A2A31" },
    Modal: { contentBg: SURFACE.dark.elevated, headerBg: SURFACE.dark.elevated },
    Drawer: { colorBgElevated: SURFACE.dark.card },
    Tooltip: { colorBgSpotlight: "#2A2A31", colorTextLightSolid: "#F4F4F5" },
  },
};

const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...sharedToken,
    colorBgLayout: SURFACE.light.page,
    colorBgContainer: SURFACE.light.card,
    colorBorder: SURFACE.light.border,
    colorBorderSecondary: SURFACE.light.borderSubtle,
    colorTextHeading: "#0B0B0B",
    colorText: "#27272A",
    colorTextSecondary: "#52514E",
    colorTextTertiary: "#898781",
  },
  components: {
    Layout: {
      headerBg: SURFACE.light.page,
      headerHeight: 76,
      headerPadding: "0 28px",
      bodyBg: SURFACE.light.page,
    },
    Table: {
      headerBg: "transparent",
      headerColor: "#898781",
      headerSplitColor: "transparent",
      rowHoverBg: "#FAFAF8",
      borderColor: SURFACE.light.borderSubtle,
      cellPaddingBlock: 15,
    },
    Card: { headerBg: "transparent" },
  },
};

export function getAntdTheme(mode: ThemeMode): ThemeConfig {
  return mode === "dark" ? darkTheme : lightTheme;
}

/** The sidebar is dark in both modes, so it carries its own nested theme. */
export const sidebarTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...sharedToken,
    colorBgContainer: "transparent",
    colorText: "#A1A1AA",
    colorTextSecondary: "#71717A",
  },
  components: {
    Menu: {
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
      darkItemSelectedBg: "rgba(229, 185, 60, 0.10)",
      darkItemSelectedColor: PRIMARY_COLOR,
      darkItemHoverBg: "rgba(255, 255, 255, 0.04)",
      darkItemHoverColor: "#F4F4F5",
      darkItemColor: "#8E8E99",
      itemHeight: 40,
      itemMarginInline: 0,
      itemMarginBlock: 2,
      itemBorderRadius: 9,
      iconSize: 17,
      collapsedIconSize: 19,
    },
  },
};

export const SIDEBAR_BG = SURFACE.dark.sidebar;
export const SIDEBAR_BORDER = "rgba(255, 255, 255, 0.06)";
