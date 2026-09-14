import {
  DashboardOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  GlobalOutlined,
  MailOutlined,
  RadarChartOutlined,
  SendOutlined,
  SettingOutlined,
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
    label: "MENU",
    items: [
      {
        key: "dashboard",
        href: "/",
        label: "Dashboard",
        icon: <DashboardOutlined />,
        title: "Dashboard",
        subtitle: "Find, manage and convert better business leads.",
      },
      {
        key: "businesses",
        href: "/businesses",
        label: "Leads",
        icon: <ShopOutlined />,
        title: "Leads & Businesses",
        subtitle: "Qualified business database and pipeline management.",
      },
      {
        key: "scanner",
        href: "/scanner",
        label: "Scanner",
        icon: <RadarChartOutlined />,
        title: "Continuous Scanner",
        subtitle: "Pull businesses from Geoapify for a city and category.",
      },
      {
        key: "automations",
        href: "/automations",
        label: "Automations",
        icon: <MailOutlined />,
        title: "Email Automations",
        subtitle: "City-wide cold outreach campaigns with Gmail API delivery.",
      },
      {
        key: "map",
        href: "/map",
        label: "Map",
        icon: <EnvironmentOutlined />,
        title: "Lead Geography Map",
        subtitle: "Interactive spatial discovery and multi-city geographic analysis.",
      },
      {
        key: "campaigns",
        href: "/campaigns",
        label: "Campaigns",
        icon: <SendOutlined />,
        title: "Email Campaigns",
        subtitle: "Targeted audience broadcasts and scheduled sequences.",
      },
      {
        key: "templates",
        href: "/templates",
        label: "Templates",
        icon: <FileTextOutlined />,
        title: "Email Templates",
        subtitle: "Reusable cold email templates and variable personalization.",
      },
      {
        key: "scraping",
        href: "/scraping",
        label: "Scraper",
        icon: <GlobalOutlined />,
        title: "Website Scraper",
        subtitle: "Extract contact info, social links, and metadata from company websites.",
      },
    ],
  },
  {
    label: "GENERAL",
    items: [
      {
        key: "system",
        href: "/system",
        label: "Settings",
        icon: <SettingOutlined />,
        title: "System Settings",
        subtitle: "API connection health, system runtime, and environment configuration.",
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(
  (section) => section.items,
);

export function activeNavItem(pathname: string): NavItem {
  const match = NAV_ITEMS.filter(
    (item) => item.href !== "/" && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  ).sort((a, b) => b.href.length - a.href.length)[0];

  return match ?? NAV_ITEMS[0];
}
