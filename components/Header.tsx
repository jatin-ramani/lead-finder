"use client";

import {
  BulbOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Button, Layout, Tooltip } from "antd";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { activeNavItem } from "@/lib/navigation";
import { useThemeMode } from "@/providers/ThemeProvider";
import { useAuth } from "@/features/auth/AuthContext";

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileNav: () => void;
}

/**
 * The top bar: navigation controls, page title, theme toggle.
 *
 * Deliberately holds no data. It used to read the whole business list from a
 * context so it could run a global search, a refresh and a client-side CSV
 * export — three features that each belong to the page that owns them now that
 * lists are paginated server-side. Search returns with the businesses page as a
 * URL parameter; export returns as a call to the backend's CSV endpoint.
 *
 * Also gone: a notification bell that opened nothing, and a Profile / Sign out
 * menu for an authentication system that does not exist. Controls that do
 * nothing are not neutral — they erode trust in the ones that do.
 */
export default function Header({
  collapsed,
  onToggleCollapse,
  onOpenMobileNav,
}: HeaderProps) {
  const pathname = usePathname();
  const { mode, toggleMode } = useThemeMode();
  const { logout } = useAuth();

  const page = useMemo(() => activeNavItem(pathname), [pathname]);

  return (
    <AntHeader className="lf-header">
      <div className="lf-header-inner">
        <Button
          type="text"
          aria-label="Open navigation"
          icon={<MenuOutlined />}
          onClick={onOpenMobileNav}
          className="lf-mobile-only"
        />
        <Button
          type="text"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapse}
          className="lf-desktop-only lf-collapse-btn"
        />

        <div className="lf-header-title">
          {/* The one <h1> on the page; the sidebar brand is a link, not a heading. */}
          <h1 className="lf-page-title">{page.title}</h1>
          <p className="lf-page-subtitle">{page.subtitle}</p>
        </div>

        <div className="lf-header-actions">
          <Tooltip title="Sign out of admin session">
            <Button
              type="text"
              shape="circle"
              aria-label="Sign out"
              icon={<LogoutOutlined />}
              onClick={() => logout()}
              className="lf-icon-btn text-slate-400 hover:text-red-400"
            />
          </Tooltip>
          <Tooltip title={mode === "dark" ? "Switch to light" : "Switch to dark"}>
            <Button
              type="text"
              shape="circle"
              aria-label={
                mode === "dark" ? "Switch to light theme" : "Switch to dark theme"
              }
              aria-pressed={mode === "dark"}
              icon={mode === "dark" ? <BulbOutlined /> : <MoonOutlined />}
              onClick={toggleMode}
              className="lf-icon-btn"
            />
          </Tooltip>
        </div>
      </div>
    </AntHeader>
  );
}
