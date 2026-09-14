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
      <Tag color="processing" icon={<LoadingOutlined />} className="lf-tag lf-status-badge font-medium">
        Scanning
      </Tag>
    );
  }

  if (isPaused(status)) {
    return (
      <Tag color="warning" icon={<PauseCircleOutlined />} className="lf-tag lf-status-badge font-medium">
        Paused
      </Tag>
    );
  }

  if (status === "Completed") {
    return (
      <Tag color="success" icon={<CheckCircleFilled />} className="lf-tag lf-status-badge font-medium">
        Completed
      </Tag>
    );
  }

  if (status === "Cancelled") {
    return (
      <Tag color="default" icon={<StopOutlined />} className="lf-tag lf-status-badge font-medium">
        Cancelled
      </Tag>
    );
  }

  return (
    <Tag color="error" icon={<CloseCircleFilled />} className="lf-tag lf-status-badge font-medium">
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
        <>
          <div className="hidden md:block">
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
          </div>

          <div className="lf-mobile-data-list md:hidden">
            {jobs.length === 0 ? (
              <EmptyState
                compact
                title="No scans executed yet"
                description="Run your first scan above to start continuous multi-cell business discovery."
              />
            ) : (
              jobs.map((job) => {
                const found = job.businessesFound ?? job.total_businesses ?? job.totalBusinesses ?? 0;
                const stored = job.businessesStored ?? job.new_businesses ?? job.newBusinesses ?? 0;
                const cells = job.totalCells ?? job.total_cells ?? 0;
                const completedCells = job.completedCells ?? job.completed_cells ?? 0;

                return (
                  <article key={job.id} className="lf-mobile-data-item">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="lf-mobile-data-title">Scan #{job.id}</p>
                        <p className="lf-mobile-data-meta">
                          {job.city ?? "Unknown city"} · {job.categoryFamily ?? job.category ?? "No category"}
                        </p>
                      </div>
                      <StatusTag status={job.status} />
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-2">
                      <div>
                        <dt className="lf-mobile-data-label">Progress</dt>
                        <dd className="lf-mobile-data-value">{job.progress}%</dd>
                      </div>
                      <div>
                        <dt className="lf-mobile-data-label">Found</dt>
                        <dd className="lf-mobile-data-value">{found.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="lf-mobile-data-label">Stored</dt>
                        <dd className="lf-mobile-data-value">{stored.toLocaleString()}</dd>
                      </div>
                    </dl>
                    {cells > 0 && (
                      <p className="mt-2 text-xs text-[var(--lf-text-muted)]">
                        {completedCells} of {cells} geographic cells completed
                      </p>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

