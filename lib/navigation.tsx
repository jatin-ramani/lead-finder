import {
  DashboardOutlined,
  RadarChartOutlined,
  SettingOutlined,
  ShopOutlined,
  StarOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

export interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  /** Shown as the page title in the top bar. */
  title: string;
  subtitle: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        key: "dashboard",
        href: "/",
        label: "Dashboard",
        icon: <DashboardOutlined />,
        title: "Dashboard",
        subtitle: "Here's what your scanner has found so far",
      },
      {
        key: "scanner",
        href: "/scanner",
        label: "Scanner",
        icon: <RadarChartOutlined />,
        title: "Scanner",
        subtitle: "Pull businesses for a city and category",
      },
    ],
  },
  {
    label: "Pipeline",
    items: [
      {
        key: "businesses",
        href: "/businesses",
        label: "Businesses",
        icon: <ShopOutlined />,
        title: "Businesses",
        subtitle: "The full directory of everything discovered",
      },
      {
        key: "leads",
        href: "/leads",
        label: "Leads",
        icon: <StarOutlined />,
        title: "Leads",
        subtitle: "No website, and reachable — your best prospects",
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        key: "settings",
        href: "/settings",
        label: "Settings",
        icon: <SettingOutlined />,
        title: "Settings",
        subtitle: "Preferences and API connection",
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(
  (section) => section.items,
);

/** Longest-prefix match so `/businesses/123` still highlights "Businesses". */
export function activeNavItem(pathname: string): NavItem {
  const match = NAV_ITEMS.filter(
    (item) => item.href !== "/" && pathname.startsWith(item.href),
  ).sort((a, b) => b.href.length - a.href.length)[0];

  return match ?? NAV_ITEMS[0];
}
