import { Button } from "antd";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * Rendered for an unmatched URL and wherever `notFound()` is called.
 *
 * A Server Component: nothing here is interactive beyond a link, so there is no
 * reason to ship it to the client. It renders inside the root layout, which is
 * why it inherits the app's fonts and theme — unlike `global-error`.
 *
 * `global-not-found.js` would be the alternative, but it is experimental in
 * this version and exists for apps with several root layouts or a top-level
 * dynamic segment. This app has one root layout, so it buys nothing.
 */
export default function NotFound() {
  return (
    <div className="lf-boundary">
      <div className="lf-boundary-card">
        <p className="lf-boundary-code" aria-hidden>
          404
        </p>
        <h1 className="lf-boundary-title">Page not found</h1>
        <p className="lf-boundary-text">
          That page does not exist. It may have been moved, or the link may be
          out of date.
        </p>

        <div className="lf-boundary-actions">
          <Link href="/">
            <Button type="primary">Back to Lead Finder</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
