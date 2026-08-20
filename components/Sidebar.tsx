"use client";

import { Layout, Tooltip } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useApiHealth } from "@/features/system/hooks/useApiHealth";
import { activeNavItem, NAV_SECTIONS } from "@/lib/navigation";
import { API_BASE_URL } from "@/services";


const { Sider } = Layout;

export const SIDEBAR_WIDTH = 76;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

interface SidebarProps {
  collapsed?: boolean;
  inDrawer?: boolean;
  onNavigate?: () => void;
}

function LogoMark() {
  return (
    <span className="lf-logo-mark" aria-hidden>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        <circle cx="10.5" cy="10.5" r="6.25" stroke="currentColor" strokeWidth="2.2" />
        <path
          d="M15.4 15.4 L20 20"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default function Sidebar({
  inDrawer = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const activeKey = useMemo(() => activeNavItem(pathname).key, [pathname]);
  const health = useApiHealth();

  const content = (
    <div className="lf-sidebar">
      <Link
        href="/"
        onClick={onNavigate}
        className="lf-brand"
        aria-label="Lead Finder Home"
      >
        <LogoMark />
      </Link>

      <nav className="lf-nav" aria-label="Main navigation">
        <ul className="lf-nav-list">
          {NAV_SECTIONS.flatMap((s) => s.items).map((item) => {
            const active = item.key === activeKey;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`lf-nav-item ${active ? "is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="lf-nav-icon">{item.icon}</span>
                  <span className="lf-nav-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="lf-sidebar-footer">
        <Tooltip
          title={`${health.label} · ${API_BASE_URL}`}
          placement="right"
        >
          <div className="lf-user-card lf-user-card--collapsed">
            <span className="lf-user-avatar" aria-hidden>
              LF
              <span
                className={`lf-user-status lf-user-status--${health.connection}`}
              />
            </span>
            <span className="lf-visually-hidden">
              API status: {health.label}
            </span>
          </div>
        </Tooltip>
      </div>
    </div>
  );

  if (inDrawer) {
    return content;
  }

  return (
    <Sider
      collapsible={false}
      trigger={null}
      width={SIDEBAR_WIDTH}
      className="lf-sider"
      style={{
        background: "var(--lf-surface)",
        borderInlineEnd: "1px solid var(--lf-border)",
        position: "fixed",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        height: "100vh",
        zIndex: 40,
      }}
    >
      {content}
    </Sider>
  );
}
