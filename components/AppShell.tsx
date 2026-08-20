"use client";

import { Drawer, Layout } from "antd";
import { useCallback, useState, type ReactNode } from "react";

import Header from "@/components/Header";
import Sidebar, {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
} from "@/components/Sidebar";
import { usePersistentValue } from "@/hooks/usePersistentState";


const { Content } = Layout;

export const COLLAPSE_STORAGE_KEY = "lead-finder:sidebar-collapsed";

const decodeCollapsed = (raw: string | null) => raw === "true";

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = usePersistentValue(
    COLLAPSE_STORAGE_KEY,
    false,
    decodeCollapsed,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const toggleCollapse = useCallback(
    () => setCollapsed(!collapsed),
    [collapsed, setCollapsed],
  );

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <Layout className="lf-shell" hasSider>
      {/*
        First tab stop on every page. The sidebar is a long list of links, and
        without this a keyboard user tabs through all of them before reaching
        the content — on every navigation.
      */}
      <a href="#main-content" className="lf-skip-link">
        Skip to main content
      </a>

      <Sidebar collapsed={collapsed} />

      <Drawer
        open={mobileNavOpen}
        onClose={closeMobileNav}
        placement="left"
        size={SIDEBAR_WIDTH}
        closable={false}
        rootClassName="lf-mobile-nav"
        styles={{ body: { padding: 0 } }}
      >
        {/* Every link calls onNavigate, so the drawer closes on navigation. */}
        <Sidebar collapsed={false} inDrawer onNavigate={closeMobileNav} />
      </Drawer>

      <Layout className="lf-main">
        <Header
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        {/* `tabIndex={-1}` so the skip link can move focus here, not just
            scroll to it — otherwise the next Tab returns to the sidebar. */}
        <Content id="main-content" tabIndex={-1} className="lf-content">
          {children}
        </Content>
      </Layout>

      {/* Drives the responsive offset without re-rendering on resize. */}
      <style>{`
        .lf-main { margin-inline-start: ${sidebarWidth}px; }
        @media (max-width: 991px) {
          .lf-main { margin-inline-start: 0; }
        }
      `}</style>
    </Layout>
  );
}
