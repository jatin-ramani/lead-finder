"use client";

import {
  LogoutOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Layout } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useAuth } from "@/features/auth/AuthContext";
import { useApiHealth } from "@/features/system/hooks/useApiHealth";
import { activeNavItem, NAV_SECTIONS } from "@/lib/navigation";

const { Sider } = Layout;

export const SIDEBAR_WIDTH = 250;
export const SIDEBAR_COLLAPSED_WIDTH = 80;

interface SidebarProps {
  collapsed?: boolean;
  inDrawer?: boolean;
  onNavigate?: () => void;
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-3 px-2 py-1">
      <div className="lf-sidebar-v2__logo-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--lf-brand)] text-[var(--lf-on-brand)] shadow-[var(--lf-shadow-sm)]">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="11" cy="11" r="6" />
          <path d="M15.5 15.5 L20 20" strokeLinecap="round" />
          <path d="M11 8v6M8 11h6" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-base font-bold leading-tight tracking-tight text-[var(--lf-text)]">
          <span>Lead Finder</span>
          <span className="rounded-full border border-[var(--lf-border)] bg-[var(--lf-accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--lf-brand)]">
            PRO
          </span>
        </div>
        <div className="truncate text-[11px] font-medium text-[var(--lf-text-muted)]">
          Sales Intelligence CRM
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({
  inDrawer = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const activeKey = useMemo(() => activeNavItem(pathname).key, [pathname]);
  const health = useApiHealth();
  const { logout } = useAuth();
  const healthToneClass =
    health.connection === "online"
      ? "bg-[var(--lf-success)]"
      : health.connection === "offline"
        ? "bg-[var(--lf-error)]"
        : "bg-[var(--lf-warning)]";

  const content = (
    <div className="lf-sidebar-v2 flex h-full min-h-0 flex-col border-r border-[var(--lf-border)] bg-[var(--lf-surface)] select-none">
      {/* Top Brand Header */}
      <div className="flex min-h-0 flex-1 flex-col p-4 pb-0">
        <Link
          href="/"
          onClick={onNavigate}
          className="block hover:opacity-95 transition-opacity"
          aria-label="Lead Finder Home"
        >
          <BrandLogo />
        </Link>

        {/* Grouped Navigations (MENU & GENERAL) */}
        <nav className="lf-sidebar-nav mt-6 min-h-0 flex-1 space-y-6 overflow-y-auto pb-4" aria-label="Main navigation">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-1.5">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--lf-text-muted)]">
                {section.label}
              </div>
              <ul className="space-y-1 list-none p-0 m-0">
                {section.items.map((item) => {
                  const active = item.key === activeKey;
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
                          active
                            ? "bg-[var(--lf-accent-soft)] text-[var(--lf-brand)] font-semibold"
                            : "text-[var(--lf-text-secondary)] hover:bg-[var(--lf-hover)] hover:text-[var(--lf-text)]"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        {/* Active vertical bar indicator matching reference */}
                        {active && (
                          <span
                            className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[var(--lf-brand)]"
                            aria-hidden
                          />
                        )}

                        <span
                          className={`text-base shrink-0 transition-colors ${
                            active
                              ? "text-[var(--lf-brand)]"
                              : "text-[var(--lf-text-muted)] group-hover:text-[var(--lf-text-secondary)]"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate flex-1">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Quick Logout Link under GENERAL */}
          <div className="space-y-1">
            <button
              type="button"
              aria-label="Disconnect workspace"
              onClick={() => logout()}
              className="group flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-[var(--lf-error)] transition-colors duration-150 hover:bg-[var(--lf-error-soft)]"
            >
              <LogoutOutlined className="shrink-0 text-base text-[var(--lf-error)]" />
              <span className="truncate">Disconnect workspace</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Scanner workspace and real API health */}
      <div className="lf-sidebar-status shrink-0 space-y-3 p-4 pt-3">
        <div className="lf-sidebar-status-card relative overflow-hidden rounded-2xl p-4 text-[var(--lf-on-brand)] shadow-[var(--lf-shadow-md)]">
          <div className="lf-sidebar-status-card__orb pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-xl" />
          <div className="mb-1.5 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${healthToneClass}`} aria-hidden />
            <span className="lf-sidebar-status-card__eyebrow text-[11px] font-bold uppercase tracking-wider">
              Scanner workspace
            </span>
          </div>
          <div className="lf-sidebar-status-card__title mb-1 text-sm font-bold leading-tight">
            Geoapify Scanner
          </div>
          <p className="lf-sidebar-status-card__copy mb-3 text-[11px] leading-relaxed">
            Plan geographic scans and monitor lead coverage from one workspace.
          </p>
          <Link
            href="/scanner"
            onClick={onNavigate}
            className="lf-sidebar-status-card__link inline-flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-colors"
          >
            <span>Open Scanner</span>
            <RightOutlined className="text-[10px]" />
          </Link>
        </div>

        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-[var(--lf-text-muted)]" role="status" aria-live="polite">
          <span className="font-medium">Workspace status</span>
          <span className="flex items-center gap-1.5 font-medium text-[var(--lf-text-secondary)]">
            <span className={`h-1.5 w-1.5 rounded-full ${healthToneClass}`} aria-hidden />
            <span>{health.label}</span>
          </span>
        </div>
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
      breakpoint="lg"
      collapsedWidth={0}
      className="lf-sider-v2 hidden lg:block"
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
