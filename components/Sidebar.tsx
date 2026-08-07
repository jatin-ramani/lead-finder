"use client";

import { ConfigProvider, Layout, Tooltip } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { API_BASE_URL } from "@/lib/api";
import { activeNavItem, NAV_SECTIONS } from "@/lib/navigation";
import { SIDEBAR_BG, SIDEBAR_BORDER, sidebarTheme } from "@/lib/theme";

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

  const content = (
    <div className="lf-sidebar" style={{ background: SIDEBAR_BG }}>
      <Link
        href="/"
        onClick={onNavigate}
        className="lf-brand"
        style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}` }}
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
        style={{ borderTop: `1px solid ${SIDEBAR_BORDER}` }}
      >
        {isCollapsed ? (
          <Tooltip title={`API · ${API_BASE_URL}`} placement="right">
            <div className="lf-user-card lf-user-card--collapsed">
              <span className="lf-user-avatar" aria-hidden>
                LF
                <span className="lf-user-status" />
              </span>
            </div>
          </Tooltip>
        ) : (
          <div className="lf-user-card">
            <span className="lf-user-avatar" aria-hidden>
              LF
              <span className="lf-user-status" />
            </span>
            <span className="lf-user-text">
              <span className="lf-user-name">Lead Finder</span>
              <span className="lf-user-role">Connected</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (inDrawer) {
    return <ConfigProvider theme={sidebarTheme}>{content}</ConfigProvider>;
  }

  return (
    <ConfigProvider theme={sidebarTheme}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        theme="dark"
        className="lf-sider"
        style={{
          background: SIDEBAR_BG,
          borderInlineEnd: `1px solid ${SIDEBAR_BORDER}`,
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
    </ConfigProvider>
  );
}
