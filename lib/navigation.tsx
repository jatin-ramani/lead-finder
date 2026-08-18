import {
  ApiOutlined,
  DashboardOutlined,
  GlobalOutlined,
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
      {
        key: "scraping",
        href: "/scraping",
        label: "Scraper",
        icon: <GlobalOutlined />,
        title: "Website Scraper",
        subtitle: "Extract title, description, email addresses and social links",
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

export function activeNavItem(pathname: string): NavItem {
  const match = NAV_ITEMS.filter(
    (item) => item.href !== "/" && pathname.startsWith(item.href),
  ).sort((a, b) => b.href.length - a.href.length)[0];

  return match ?? NAV_ITEMS[0];
}
