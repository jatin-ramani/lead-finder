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

interface CoverageSummary {
  radiusKm: number;
  requestedCells: number;
  completedCells: number;
  coveredCells: number;
  alreadyCoveredCells: number;
  newCellsQueued: number;
  pendingCells: number;
  failedCells: number;
  hasCumulativeMetrics: boolean;
}

function coverageFor(job: ScanJob): CoverageSummary {
  const requestedCells = job.requestedCells ?? job.requested_cells ?? job.totalCells ?? job.total_cells ?? 0;
  const completedCells = job.completedCells ?? job.completed_cells ?? 0;
  const alreadyCoveredCells = job.alreadyCoveredCells ?? job.already_covered_cells ?? 0;
  const newCellsQueued = job.newCellsQueued ?? job.new_cells_queued ?? 0;
  const pendingCells = job.pendingCells ?? job.pending_cells ?? 0;
  const failedCells = job.failedCells ?? job.failed_cells ?? 0;
  const coveredCells = requestedCells > 0 ? Math.min(requestedCells, completedCells + alreadyCoveredCells) : 0;

  return {
    radiusKm: job.scanRadiusKm ?? job.scan_radius_km ?? 25,
    requestedCells,
    completedCells,
    coveredCells,
    alreadyCoveredCells,
    newCellsQueued,
    pendingCells,
    failedCells,
    hasCumulativeMetrics: [
      job.requestedCells,
      job.requested_cells,
      job.alreadyCoveredCells,
      job.already_covered_cells,
      job.newCellsQueued,
      job.new_cells_queued,
      job.pendingCells,
      job.pending_cells,
      job.failedCells,
      job.failed_cells,
    ].some((value) => value != null),
  };
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
        title: "Requested Coverage",
        key: "coverage",
        width: 185,
        render: (_, record: ScanJob) => {
          const coverage = coverageFor(record);
          return (
            <div className="flex flex-col">
              <span className="font-medium">{coverage.radiusKm} km radius</span>
              {coverage.hasCumulativeMetrics && (
                <span className="text-[11px] text-[var(--lf-text-muted)]">
                  {coverage.alreadyCoveredCells} already covered · {coverage.newCellsQueued} newly queued
                </span>
              )}
            </div>
          );
        },
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
        width: 165,
        render: (_, record: ScanJob) => {
          const coverage = coverageFor(record);
          return (
            <div className="flex flex-col text-xs">
              <span className="font-mono">{record.progress}%</span>
              {coverage.requestedCells > 0 && (
                <span className="text-[11px] text-[var(--lf-text-muted)]">
                  {coverage.coveredCells} / {coverage.requestedCells} cells covered
                </span>
              )}
              {(coverage.pendingCells > 0 || coverage.failedCells > 0) && (
                <span className="text-[11px] text-[var(--lf-warning)]">
                  {coverage.pendingCells} pending · {coverage.failedCells} failed
                </span>
              )}
            </div>
          );
        },
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
      description="Record of multi-cell geographic coverage scans"
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
              scroll={{ x: 900 }}
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
                    description="Run your first city coverage scan to start business discovery."
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
                description="Run your first city coverage scan to start business discovery."
              />
            ) : (
              jobs.map((job) => {
                const found = job.businessesFound ?? job.total_businesses ?? job.totalBusinesses ?? 0;
                const stored = job.businessesStored ?? job.new_businesses ?? job.newBusinesses ?? 0;
                const coverage = coverageFor(job);

                return (
                  <article key={job.id} className="lf-mobile-data-item">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="lf-mobile-data-title">Scan #{job.id}</p>
                        <p className="lf-mobile-data-meta">
                          {job.city ?? "Unknown city"} · {coverage.radiusKm} km requested
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
                    {coverage.requestedCells > 0 && (
                      <p className="mt-2 text-xs text-[var(--lf-text-muted)]">
                        {coverage.coveredCells} of {coverage.requestedCells} geographic cells covered
                        {coverage.hasCumulativeMetrics && ` · ${coverage.alreadyCoveredCells} already covered`}
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
