"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

import ConnectionCard from "@/features/system/components/ConnectionCard";
import RuntimeCard from "@/features/system/components/RuntimeCard";
import { useSystemStatus } from "@/features/system/hooks/useSystemStatus";

/**
 * System — the only route in Phase 1.
 *
 * It reports the state of the backend this app talks to: reachable or not,
 * which version, which database engine. That makes it the honest landing page
 * while the feature routes are rebuilt, and it stays useful afterwards — it is
 * the first place to look when something is behaving oddly.
 *
 * It is also the proof that the foundation works: it exercises the typed API
 * client, the query cache, polling, the shared error state with its request id,
 * and the loading and offline paths, against three real endpoints.
 */
export default function SystemPage() {
  const {
    health,
    version,
    info,
    isLoading,
    isFetching,
    healthError,
    versionError,
    infoError,
    refresh,
  } = useSystemStatus();

  return (
    <div className="flex flex-col gap-5">
      <div className="lf-page-actions">
        <Button
          icon={<ReloadOutlined spin={isFetching} />}
          onClick={refresh}
          disabled={isFetching}
        >
          {isFetching ? "Checking…" : "Check now"}
        </Button>
      </div>

      <div className="lf-grid-2">
        <ConnectionCard
          health={health}
          isLoading={isLoading}
          error={healthError}
          onRetry={refresh}
        />

        <RuntimeCard
          version={version}
          info={info}
          isLoading={isLoading}
          versionError={versionError}
          infoError={infoError}
          onRetry={refresh}
        />
      </div>
    </div>
  );
}
