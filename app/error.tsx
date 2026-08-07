"use client";

// Error boundaries must be Client Components.

import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";
import { useEffect } from "react";

import { isApiError } from "@/services";

/**
 * Catches render errors anywhere below the root layout.
 *
 * `retry` — not `reset` — is the prop in Next 16.3: it re-fetches and re-renders
 * this boundary's children, where `reset` only clears the error state without
 * re-fetching, which for a data-driven page just fails again immediately.
 */
export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // No error-reporting service is wired up yet, so this is the only record.
    // Deliberately `console.error`: it is the browser's own channel, and the
    // digest is what correlates this with a server-side stack trace.
    console.error("Unhandled render error", error);
  }, [error]);

  // An ApiError that reached a render boundary already has a good sentence and
  // a request id; anything else is a bug in our own code and must not leak.
  const description = isApiError(error)
    ? error.message
    : "Something went wrong while rendering this page.";

  const reference = isApiError(error) ? error.requestId : error.digest;

  return (
    <div className="lf-boundary" role="alert">
      <div className="lf-boundary-card">
        <h1 className="lf-boundary-title">Something went wrong</h1>
        <p className="lf-boundary-text">{description}</p>

        {reference && (
          <p className="lf-boundary-ref">
            Reference: <code>{reference}</code>
          </p>
        )}

        <div className="lf-boundary-actions">
          <Button type="primary" icon={<ReloadOutlined />} onClick={retry}>
            Try again
          </Button>
          <Link href="/">
            <Button icon={<HomeOutlined />}>Go to overview</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
