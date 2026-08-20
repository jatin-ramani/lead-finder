"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

import PageContainer from "@/components/ui/PageContainer";
import ConnectionCard from "@/features/system/components/ConnectionCard";
import RuntimeCard from "@/features/system/components/RuntimeCard";
import { useSystemStatus } from "@/features/system/hooks/useSystemStatus";

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
    <PageContainer
      actions={
        <Button
          icon={<ReloadOutlined spin={isFetching} />}
          onClick={refresh}
          disabled={isFetching}
        >
          {isFetching ? "Checking…" : "Check now"}
        </Button>
      }
    >
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
    </PageContainer>
  );
}
