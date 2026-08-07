"use client";

import { Skeleton } from "antd";

import ErrorState from "@/components/feedback/ErrorState";
import Panel from "@/components/Panel";
import type { SystemInfoResponse, VersionResponse } from "@/types/api";

interface RuntimeCardProps {
  version: VersionResponse | undefined;
  info: SystemInfoResponse | undefined;
  isLoading: boolean;
  versionError: unknown;
  infoError: unknown;
  onRetry: () => void;
}

function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={value ? "" : "lf-detail-muted"}>{value ?? "Unavailable"}</dd>
    </div>
  );
}

/**
 * What is actually running on the other end: version, interpreter, host and
 * database engine.
 *
 * The database is reported by dialect, never by URL — a connection string
 * carries credentials, so the backend deliberately never sends one.
 *
 * Version and runtime fail independently. If one call fails the other still
 * renders, because a partial answer is more useful than an empty card.
 */
export default function RuntimeCard({
  version,
  info,
  isLoading,
  versionError,
  infoError,
  onRetry,
}: RuntimeCardProps) {
  const bothFailed = Boolean(versionError) && Boolean(infoError);

  return (
    <Panel title="Runtime" description="Details of the API process serving this app">
      {isLoading ? (
        <Skeleton
          active
          title={false}
          paragraph={{ rows: 5, width: ["55%", "40%", "62%", "48%", "58%"] }}
        />
      ) : bothFailed ? (
        <ErrorState
          error={versionError}
          onRetry={onRetry}
          variant="inline"
          title="Could not read runtime details"
        />
      ) : (
        <dl className="lf-detail-grid">
          <Row label="API" value={version?.name} />
          <Row label="Version" value={version?.version} />
          <Row label="Python" value={info?.pythonVersion} />
          <Row label="Platform" value={info?.platform} />
          <Row label="Database" value={info?.database} />
        </dl>
      )}
    </Panel>
  );
}
