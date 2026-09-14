"use client";

// Error boundaries must be Client Components.

import { useEffect } from "react";

/**
 * The last line of defence: a failure in the root layout itself.
 *
 * This file replaces the root layout when active, which has two consequences
 * the Next 16 docs are explicit about and that shape everything below:
 *
 *  1. `globals.css` is not loaded. No Tailwind, no `lf-*` classes, no design
 *     tokens, no Ant Design. Every style here is inline or in the <style> tag,
 *     and the palette is duplicated deliberately — importing it would defeat
 *     the point of a fallback that survives a broken stylesheet.
 *  2. The app's `data-theme` attribute never reaches this tree, so the OS
 *     colour scheme is the only signal available. Hence `prefers-color-scheme`
 *     rather than the app's own toggle.
 *
 * `metadata` cannot be exported from a Client Component, so the tab title is
 * set with React's <title> element instead.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Root layout failure", error);
  }, [error]);

  return (
    // global-error must render its own <html> and <body>.
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <title>Something went wrong · Lead Finder</title>

        <style>{`
          :root {
            color-scheme: light dark;
            --bg: #F7F9FA;
            --surface: #FFFFFF;
            --fg: #0F172A;
            --muted: #64748B;
            --line: #E8ECEF;
            --accent: #14532D;
            --accent-hover: #166534;
            --on-accent: #FFFFFF;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #090D0B;
              --surface: #111815;
              --fg: #FFFFFF;
              --muted: #94A3B8;
              --line: #1F2D27;
              --accent: #15803D;
              --accent-hover: #166534;
            }
          }
          body { background: var(--bg); color: var(--fg); }
          .ge-card {
            width: min(100%, 30rem);
            padding: 2rem;
            border: 1px solid var(--line);
            border-radius: 1.25rem;
            background: var(--surface);
            box-shadow: 0 16px 36px -4px rgba(16, 24, 40, 0.10);
            text-align: center;
          }
          .ge-title { font-size: 1.5rem; font-weight: 700; margin: 0 0 .5rem; letter-spacing: -0.025em; }
          .ge-text { color: var(--muted); line-height: 1.6; margin: 0 0 1.25rem; }
          .ge-ref { font-size: .8125rem; color: var(--muted); margin: 0 0 1.5rem; }
          .ge-ref code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
          .ge-btn {
            min-height: 2.5rem;
            padding: .625rem 1.25rem;
            border: 1px solid var(--accent);
            border-radius: 9999px;
            background: var(--accent);
            color: var(--on-accent);
            font: inherit;
            font-weight: 650;
            cursor: pointer;
            transition: background-color 150ms ease, border-color 150ms ease;
          }
          .ge-btn:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
          .ge-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
          @media (prefers-reduced-motion: reduce) { .ge-btn { transition: none; } }
        `}</style>

        <div className="ge-card" role="alert">
          <h1 className="ge-title">Something went wrong</h1>
          <p className="ge-text">
            Lead Finder could not start. This is usually temporary — reloading
            often clears it.
          </p>

          {error.digest && (
            <p className="ge-ref">
              Reference: <code>{error.digest}</code>
            </p>
          )}

          <button type="button" className="ge-btn" onClick={retry}>
            Reload the application
          </button>
        </div>
      </body>
    </html>
  );
}
