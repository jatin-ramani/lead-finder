"use client";

import { Skeleton } from "antd";

import ErrorState from "@/components/feedback/ErrorState";
import Panel from "@/components/Panel";
import { API_BASE_URL } from "@/services";
import type { HealthResponse } from "@/types/api";

interface ConnectionCardProps {
  health: HealthResponse | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

function StatusPill({
  tone,
  children,
}: {
  tone: "ok" | "bad";
  children: string;
}) {
  return (
    <span className={`lf-status-pill lf-status-pill--${tone}`}>
      <span className="lf-status-dot" aria-hidden />
      {children}
    </span>
  );
}

/**
 * Whether the API is reachable and its database is answering.
 *
 * The status is announced through a polite live region: it changes without any
 * user action, from a 30-second poll, and a screen-reader user would otherwise
 * never learn the backend went down.
 */
export default function ConnectionCard({
  health,
  isLoading,
  error,
  onRetry,
}: ConnectionCardProps) {
  return (
    <Panel
      title="API connection"
      description="Checked every 30 seconds while this page is open"
    >
      {isLoading ? (
        <Skeleton active title={false} paragraph={{ rows: 3, width: ["60%", "45%", "70%"] }} />
      ) : error ? (
        <ErrorState
          error={error}
          onRetry={onRetry}
          variant="inline"
          title="The API is not responding"
        />
      ) : (
        <dl className="lf-detail-grid" aria-live="polite">
          <div>
            <dt>Status</dt>
            <dd>
              {health?.status === "healthy" ? (
                <StatusPill tone="ok">Connected</StatusPill>
              ) : (
                <StatusPill tone="bad">Unhealthy</StatusPill>
              )}
            </dd>
          </div>

          <div>
            <dt>Database</dt>
            <dd>
              {health?.database === "connected" ? (
                <StatusPill tone="ok">Connected</StatusPill>
              ) : (
                <StatusPill tone="bad">Disconnected</StatusPill>
              )}
            </dd>
          </div>

          <div>
            <dt>Base URL</dt>
            {/* The configured host, so a wrong NEXT_PUBLIC_API_BASE_URL is
                visible rather than presenting as an outage. */}
            <dd className="lf-mono lf-truncate" title={API_BASE_URL}>
              {API_BASE_URL}
            </dd>
          </div>
        </dl>
      )}
    </Panel>
  );
}
