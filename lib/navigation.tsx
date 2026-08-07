import {
  ApiOutlined,
  DashboardOutlined,
  RadarChartOutlined,
  ShopOutlined,
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

/**
 * The navigation lists routes that exist and work. Nothing else.
 *
 * Leads and the scraping screens return in the phases that build them. A link
 * to a page that 404s, or to one showing an empty shell, is worse than no
 * link: it teaches people the product is broken.
 */
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
        subtitle: "Where your pipeline stands right now",
      },
      {
        key: "scanner",
        href: "/scanner",
        label: "Scanner",
        icon: <RadarChartOutlined />,
        title: "Scanner",
        subtitle: "Pull businesses from Geoapify for a city and category",
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
        subtitle: "Everything the scanner has discovered so far",
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        key: "system",
        href: "/system",
        label: "System",
        icon: <ApiOutlined />,
        title: "System",
        subtitle: "Connection, version and runtime of the Lead Finder API",
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(
  (section) => section.items,
);

/**
 * Longest-prefix match, so a nested route such as `/businesses/123` still
 * highlights its parent. `/` is excluded from the prefix test because every
 * path starts with it; it is the fallback instead.
 */
export function activeNavItem(pathname: string): NavItem {
  const match = NAV_ITEMS.filter(
    (item) => item.href !== "/" && pathname.startsWith(item.href),
  ).sort((a, b) => b.href.length - a.href.length)[0];

  return match ?? NAV_ITEMS[0];
}
