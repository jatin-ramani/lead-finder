"use client";

import {
  BellOutlined,
  BulbOutlined,
  DownloadOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { App, Badge, Button, Dropdown, Input, Layout, Tooltip } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

import { activeNavItem } from "@/lib/navigation";
import { useBusinesses } from "@/providers/BusinessProvider";
import { useThemeMode } from "@/providers/ThemeProvider";
import { exportBusinessesCsv } from "@/lib/export";

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileNav: () => void;
}

export default function Header({
  collapsed,
  onToggleCollapse,
  onOpenMobileNav,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { message } = App.useApp();
  const { mode, toggleMode } = useThemeMode();
  const { globalSearch, setGlobalSearch, refresh, refreshing, businesses } =
    useBusinesses();

  const page = useMemo(() => activeNavItem(pathname), [pathname]);

  const handleExport = () => {
    if (businesses.length === 0) {
      message.warning("Nothing to export yet.");
      return;
    }
    exportBusinessesCsv(businesses);
    message.success(`Exported ${businesses.length} businesses.`);
  };

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
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapse}
          className="lf-desktop-only lf-collapse-btn"
        />

        <div className="lf-header-title">
          <h1 className="lf-page-title">{page.title}</h1>
          <p className="lf-page-subtitle">{page.subtitle}</p>
        </div>

        <div className="lf-header-actions">
          <Input
            allowClear
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            placeholder="Search businesses, emails, phones…"
            prefix={<SearchOutlined />}
            className="lf-global-search"
            aria-label="Search businesses"
          />

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            className="lf-export-btn"
          >
            <span className="lf-desktop-only">Export</span>
          </Button>

          <Tooltip title="Refresh data">
            <Button
              type="text"
              shape="circle"
              aria-label="Refresh data"
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={() => void refresh()}
              className="lf-icon-btn"
            />
          </Tooltip>

          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
            <Button
              type="text"
              shape="circle"
              aria-label="Toggle colour theme"
              icon={mode === "dark" ? <BulbOutlined /> : <MoonOutlined />}
              onClick={toggleMode}
              className="lf-icon-btn lf-hide-sm"
            />
          </Tooltip>

          <Tooltip title="Notifications">
            <Badge dot color="#E5B93C" offset={[-5, 6]} className="lf-hide-sm">
              <Button
                type="text"
                shape="circle"
                aria-label="Notifications"
                icon={<BellOutlined />}
                className="lf-icon-btn"
              />
            </Badge>
          </Tooltip>

          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: "profile",
                  icon: <UserOutlined />,
                  label: "Profile",
                  disabled: true,
                },
                { key: "settings", icon: <SettingOutlined />, label: "Settings" },
                { type: "divider" },
                {
                  key: "signout",
                  icon: <LogoutOutlined />,
                  label: "Sign out",
                  danger: true,
                  disabled: true,
                },
              ],
              onClick: ({ key }) => {
                if (key === "settings") router.push("/settings");
              },
            }}
          >
            <button type="button" className="lf-avatar-trigger" aria-label="Account menu">
              LF
            </button>
          </Dropdown>
        </div>
      </div>
    </AntHeader>
  );
}
