"use client";

import {
  BulbOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  MoonOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Input, Layout, Tooltip } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

import { useAuth } from "@/features/auth/AuthContext";
import { activeNavItem } from "@/lib/navigation";
import { useThemeMode } from "@/providers/ThemeProvider";

const { Header: AntHeader } = Layout;

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export default function Header({ onOpenMobileNav }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggleMode } = useThemeMode();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const page = useMemo(() => activeNavItem(pathname), [pathname]);

  // Keyboard shortcut ⌘K / Ctrl+K focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-lead-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/businesses?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <AntHeader className="lf-header-v2 !h-auto !bg-transparent !p-0 !leading-normal z-30">
      <div className="lf-header-v2__inner flex items-center justify-between gap-3 sm:gap-4 p-3 sm:px-6 bg-[var(--lf-surface)] rounded-2xl sm:rounded-3xl border border-[var(--lf-border)] shadow-[var(--lf-shadow-sm)] mb-6">
        {/* Mobile Hamburger, Page Title & Global Search */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 flex-1 max-w-xl">
          <Button
            type="text"
            aria-label="Open navigation menu"
            icon={<MenuOutlined className="text-base" />}
            onClick={onOpenMobileNav}
            className="lg:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-none bg-[var(--lf-subtle)] text-[var(--lf-text-secondary)]"
          />

          {/* Navigation context only; each route owns the document H1. */}
          <span className="lf-header-v2__page-context min-w-0 truncate text-sm font-semibold text-[var(--lf-text)] sm:text-base">
            {page.title}
          </span>

          {/* Reference-inspired Pill Search Bar with shortcut badge (Desktop/Tablet) */}
          <div className="relative w-full max-w-md hidden md:block">
            <Input
              id="global-lead-search"
              prefix={<SearchOutlined className="mr-1.5 text-[var(--lf-text-muted)]" />}
              placeholder="Search leads, cities, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={(e) => handleSearchSubmit((e.target as HTMLInputElement).value)}
              suffix={
                <kbd className="hidden items-center gap-0.5 rounded-md border border-[var(--lf-border)] bg-[var(--lf-subtle)] px-2 py-0.5 font-mono text-[10px] font-medium text-[var(--lf-text-muted)] sm:inline-flex">
                  Ctrl / ⌘ K
                </kbd>
              }
              className="h-10 w-full rounded-full border-[var(--lf-border)] bg-[var(--lf-subtle)] px-4 text-sm hover:bg-[var(--lf-surface)] focus:bg-[var(--lf-surface)]"
            />
          </div>
        </div>

        {/* Right Actions (Email Automation Quick, Scanner Link, Theme Toggle, User Profile) */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0 flex-nowrap">
          <Tooltip title="Email Automation Center">
            <Button
              type="text"
              onClick={() => router.push("/automations")}
              className="hidden h-10 w-10 items-center justify-center rounded-full border-none bg-[var(--lf-subtle)] text-[var(--lf-text-secondary)] hover:bg-[var(--lf-accent-soft)] hover:text-[var(--lf-brand)] sm:flex"
              aria-label="Email Automations"
            >
              <MailOutlined className="text-base" />
            </Button>
          </Tooltip>

          <Tooltip title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <Button
              type="text"
              onClick={toggleMode}
              className="flex h-11 w-11 items-center justify-center rounded-full border-none bg-[var(--lf-subtle)] text-[var(--lf-text-secondary)] hover:bg-[var(--lf-hover)] sm:h-10 sm:w-10"
              aria-label="Toggle theme"
            >
              {mode === "dark" ? <BulbOutlined className="text-base text-[var(--lf-warning)]" /> : <MoonOutlined className="text-base" />}
            </Button>
          </Tooltip>

          {/* Divider */}
          <div className="my-auto hidden h-6 w-px bg-[var(--lf-border)] sm:block" />

          {/* Reference User Profile Card */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 pl-0.5 sm:pl-1">
            <Avatar
              size={{ xs: 30, sm: 36, md: 38 }}
              className="lf-header-avatar shrink-0 bg-[var(--lf-brand)] text-xs font-bold text-[var(--lf-on-brand)] shadow-[var(--lf-shadow-xs)] sm:text-sm"
            >
              AD
            </Avatar>
            <div className="hidden md:block text-left min-w-0">
              <div className="truncate text-xs font-bold leading-tight text-[var(--lf-text)]">
                Administrator
              </div>
              <div className="truncate text-[11px] font-medium text-[var(--lf-text-muted)]">
                Secure session
              </div>
            </div>
            <Tooltip title="Sign out of admin session">
              <Button
                type="text"
                size="small"
                onClick={() => logout()}
                icon={<LogoutOutlined />}
                className="flex !h-11 !w-11 items-center justify-center rounded-lg p-0 text-[var(--lf-text-muted)] hover:bg-[var(--lf-error-soft)] hover:text-[var(--lf-error)] sm:!h-10 sm:!w-10"
                aria-label="Sign out"
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </AntHeader>
  );
}
