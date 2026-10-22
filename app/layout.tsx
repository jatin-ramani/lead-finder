import type { Metadata, Viewport } from "next";

import { themeBootstrapScript } from "@/lib/theme-script";
import AntdRegistry from "@/providers/AntdRegistry";
import ThemeProvider from "@/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/features/auth/AuthContext";

import "./globals.css";

const inter = { variable: "font-sans" };
const jetbrainsMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: {
    default: "FindB · Local Business Lead Finder & B2B Prospecting",
    template: "%s · FindB Lead Finder",
  },
  description:
    "FindB helps agencies and sales teams find local businesses without a website, uncover verified contact emails and phone numbers, and close clients faster.",
  icons: {
    icon: [
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon.ico" },
    ],
    apple: [
      { url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F9FA" },
    { media: "(prefers-color-scheme: dark)", color: "#090D0B" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        {/* Applies the stored theme before first paint to avoid a colour flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-full">
        <AntdRegistry>
          <ThemeProvider><QueryProvider><AuthProvider>{children}</AuthProvider></QueryProvider></ThemeProvider>
        </AntdRegistry>

        {/* Global SVG Goo Filter for Blob Hover Animations */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="6" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                result="goo"
              />
              <feBlend in2="goo" in="SourceGraphic" result="mix" />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  );
}
