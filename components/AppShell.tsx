"use client";

import { Drawer, Layout } from "antd";
import { useCallback, useState, type ReactNode } from "react";

import Header from "@/components/Header";
import Sidebar, { SIDEBAR_WIDTH } from "@/components/Sidebar";

const { Content } = Layout;

export default function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

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

      <Sidebar />

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
        <Sidebar inDrawer onNavigate={closeMobileNav} />
      </Drawer>

      <Layout className="lf-main">
        <Header
          collapsed={false}
          onToggleCollapse={() => {}}
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
        .lf-main { margin-inline-start: ${SIDEBAR_WIDTH}px; }
        @media (max-width: 991px) {
          .lf-main { margin-inline-start: 0; }
        }
      `}</style>
    </Layout>
  );
}
