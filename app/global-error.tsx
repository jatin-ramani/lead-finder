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
          :root { color-scheme: light dark; --bg:#F6F7F9; --fg:#17202B; --muted:#758293; --line:#DDE2E8; --accent:#2563EB; }
          @media (prefers-color-scheme: dark) {
            :root { --bg:#0D1117; --fg:#F3F6F9; --muted:#8491A1; --line:#303A46; }
          }
          body { background: var(--bg); color: var(--fg); }
          .ge-card { max-width: 30rem; text-align: center; }
          .ge-title { font-size: 1.375rem; font-weight: 650; margin: 0 0 .5rem; letter-spacing: -0.01em; }
          .ge-text { color: var(--muted); line-height: 1.6; margin: 0 0 1.25rem; }
          .ge-ref { font-size: .8125rem; color: var(--muted); margin: 0 0 1.5rem; }
          .ge-ref code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
          .ge-btn {
            font: inherit; font-weight: 600; cursor: pointer;
            background: var(--accent); color: #FFFFFF; border: 0;
            border-radius: 8px; padding: .625rem 1.25rem;
            transition: filter 150ms ease;
          }
          .ge-btn:hover { filter: brightness(1.06); }
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
