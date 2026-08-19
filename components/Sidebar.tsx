"use client";

import { Layout, Tooltip } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useApiHealth } from "@/features/system/hooks/useApiHealth";
import { activeNavItem, NAV_SECTIONS } from "@/lib/navigation";
import { API_BASE_URL } from "@/services";


const { Sider } = Layout;

export const SIDEBAR_WIDTH = 236;
export const SIDEBAR_COLLAPSED_WIDTH = 72;

interface SidebarProps {
  collapsed: boolean;
  /** Renders inside the mobile Drawer, where fixed positioning is unwanted. */
  inDrawer?: boolean;
  onNavigate?: () => void;
}

function LogoMark() {
  return (
    <span className="lf-logo-mark" aria-hidden>
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
        <circle cx="10.5" cy="10.5" r="6.25" stroke="currentColor" strokeWidth="2.1" />
        <path
          d="M15.4 15.4 L20 20"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default function Sidebar({
  collapsed,
  inDrawer = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const activeKey = useMemo(() => activeNavItem(pathname).key, [pathname]);
  const isCollapsed = collapsed && !inDrawer;
  const health = useApiHealth();

  const content = (
    <div className="lf-sidebar">
      <Link
        href="/"
        onClick={onNavigate}
        className="lf-brand"

      >
        <LogoMark />
        {!isCollapsed && (
          <span className="lf-brand-text">
            <span className="lf-brand-name">Lead Finder</span>
            <span className="lf-brand-sub">Admin Console</span>
          </span>
        )}
      </Link>

      <nav className="lf-nav" aria-label="Main">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="lf-nav-section">
            {!isCollapsed && (
              <p className="lf-nav-section-label">{section.label}</p>
            )}
            <ul className="lf-nav-list">
              {section.items.map((item) => {
                const active = item.key === activeKey;
                const link = (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`lf-nav-item ${active ? "is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="lf-nav-icon">{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="lf-nav-label">{item.label}</span>
                        {active && <span className="lf-nav-dot" aria-hidden />}
                      </>
                    )}
                  </Link>
                );

                return (
                  <li key={item.key}>
                    {isCollapsed ? (
                      <Tooltip title={item.label} placement="right">
                        {link}
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className="lf-sidebar-footer"

      >
        {/*
          This used to be a hardcoded green dot and the word "Connected",
          shown whether or not the API was reachable — a status indicator that
          could only ever report good news. It now reflects the real health
          probe, sharing its cache entry with the System page so the two never
          disagree and only one request is ever in flight.
        */}
        {isCollapsed ? (
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
        ) : (
          <div className="lf-user-card">
            <span className="lf-user-avatar" aria-hidden>
              LF
              <span
                className={`lf-user-status lf-user-status--${health.connection}`}
              />
            </span>
            <span className="lf-user-text">
              <span className="lf-user-name">Lead Finder</span>
              {/* Polite: it changes on a background poll, with no user action. */}
              <span className="lf-user-role" aria-live="polite">
                {health.label}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (inDrawer) {
    return content;
  }

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        theme="dark"
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
    </>
  );
}
