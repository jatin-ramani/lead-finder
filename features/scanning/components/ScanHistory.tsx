"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Skeleton, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/feedback/ErrorState";
import Panel from "@/components/Panel";
import type { ScanJob } from "@/types/api";

import { isPaused, isRunning } from "../hooks/useScanJobs";

const { Text } = Typography;

interface ScanHistoryProps {
  jobs: ScanJob[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

function StatusTag({ status }: { status: string }) {
  if (isRunning(status)) {
    return (
      <Tag color="processing" icon={<LoadingOutlined />} className="lf-tag font-medium">
        Scanning
      </Tag>
    );
  }

  if (isPaused(status)) {
    return (
      <Tag color="warning" icon={<PauseCircleOutlined />} className="lf-tag font-medium">
        Paused
      </Tag>
    );
  }

  if (status === "Completed") {
    return (
      <Tag color="success" icon={<CheckCircleFilled />} className="lf-tag font-medium">
        Completed
      </Tag>
    );
  }

  if (status === "Cancelled") {
    return (
      <Tag color="default" icon={<StopOutlined />} className="lf-tag font-medium">
        Cancelled
      </Tag>
    );
  }

  return (
    <Tag color="error" icon={<CloseCircleFilled />} className="lf-tag font-medium">
      {status}
    </Tag>
  );
}

export default function ScanHistory({
  jobs,
  isLoading,
  error,
  onRetry,
}: ScanHistoryProps) {
  const columns = useMemo<ColumnsType<ScanJob>>(
    () => [
      {
        title: "Job",
        dataIndex: "id",
        key: "id",
        width: 80,
        render: (id: number) => <Text className="lf-mono font-medium">#{id}</Text>,
      },
      {
        title: "City",
        dataIndex: "city",
        key: "city",
        ellipsis: true,
        render: (city: string | null) =>
          city ? <strong>{city}</strong> : <Text type="secondary">—</Text>,
      },
      {
        title: "Category Family",
        dataIndex: "category",
        key: "category",
        ellipsis: true,
        render: (category: string | null, record: ScanJob) => (
          <div className="flex flex-col">
            <span className="capitalize font-medium">{record.categoryFamily ?? category ?? "—"}</span>
            {record.scanRadiusKm && (
              <span className="text-[11px] text-[var(--lf-text-muted)]">{record.scanRadiusKm} km radius</span>
            )}
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (status: string) => <StatusTag status={status} />,
      },
      {
        title: "Cells / Progress",
        key: "progress",
        width: 140,
        render: (_, record: ScanJob) => (
          <div className="flex flex-col text-xs">
            <span className="font-mono">{record.progress}%</span>
            {record.totalCells ? (
              <span className="text-[11px] text-[var(--lf-text-muted)]">
                {record.completedCells} / {record.totalCells} cells
              </span>
            ) : null}
          </div>
        ),
      },
      {
        title: "Found",
        key: "found",
        width: 90,
        align: "end",
        render: (_, record: ScanJob) => {
          const val = record.businessesFound ?? record.total_businesses ?? 0;
          return <span className="lf-num">{val.toLocaleString()}</span>;
        },
      },
      {
        title: "Stored Leads",
        key: "stored",
        width: 110,
        align: "end",
        render: (_, record: ScanJob) => {
          const val = record.businessesStored ?? record.new_businesses ?? 0;
          return (
            <span className={`lf-num font-bold ${val > 0 ? "text-[var(--lf-success)]" : ""}`}>
              {val.toLocaleString()}
            </span>
          );
        },
      },
      {
        title: "Skipped",
        key: "skipped",
        width: 90,
        align: "end",
        render: (_, record: ScanJob) => {
          const val = record.businessesSkippedNoContact ?? 0;
          return <span className="lf-num text-[var(--lf-text-muted)]">{val.toLocaleString()}</span>;
        },
      },
    ],
    [],
  );

  return (
    <Panel
      title="Continuous Scan History"
      description="Record of multi-cell geographic continuous scans"
      flush
    >
      {isLoading ? (
        <div className="lf-card-body">
          <Skeleton active title={false} paragraph={{ rows: 6 }} />
        </div>
      ) : error ? (
        <div className="lf-card-body">
          <ErrorState
            error={error}
            onRetry={onRetry}
            variant="inline"
            title="Could not load scan history"
          />
        </div>
      ) : (
        <Table<ScanJob>
          rowKey="id"
          columns={columns}
          dataSource={jobs}
          size="middle"
          className="lf-table"
          rowClassName={() => "lf-table-row lf-table-row--static"}
          scroll={{ x: 800 }}
          pagination={
            jobs.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: false,
                  showTotal: (total) => `${total} scans`,
                }
              : false
          }
          locale={{
            emptyText: (
              <EmptyState
                compact
                title="No scans executed yet"
                description="Run your first scan above to start continuous multi-cell business discovery."
              />
            ),
          }}
        />
      )}
    </Panel>
  );
}

