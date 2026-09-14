"use client";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, Modal, Skeleton, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import EmptyState from "@/components/EmptyState";
import Panel from "@/components/Panel";
import type { ScrapeJob } from "@/types/api";

import { isScrapeRunning, useScrapeJobs } from "../hooks/useScrapeJobs";

interface ScrapeJobHistoryProps {
  activeJobId: number | null;
  onSelectJob: (id: number) => void;
  onDeleteJob: (id: number) => void;
}

function StatusTag({ status }: { status: string }) {
  switch (status) {
    case "Running":
      return <Tag icon={<SyncOutlined spin />} color="processing" className="lf-status-badge">Running</Tag>;
    case "Pending":
      return <Tag icon={<SyncOutlined spin />} color="warning" className="lf-status-badge">Pending</Tag>;
    case "Completed":
      return <Tag icon={<CheckCircleOutlined />} color="success" className="lf-status-badge">Completed</Tag>;
    case "Failed":
      return <Tag icon={<CloseCircleOutlined />} color="error" className="lf-status-badge">Failed</Tag>;
    default:
      return <Tag className="lf-status-badge">{status}</Tag>;
  }
}

export default function ScrapeJobHistory({
  activeJobId,
  onSelectJob,
  onDeleteJob,
}: ScrapeJobHistoryProps) {
  const { jobs, isLoading } = useScrapeJobs();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const columns: ColumnsType<ScrapeJob> = [
    {
      title: "Job #",
      dataIndex: "id",
      key: "id",
      width: 90,
      render: (id: number) => (
        <span className="font-mono text-xs font-semibold text-[var(--lf-text)]">
          #{id}
        </span>
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
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      width: 140,
      render: (progress: number, record: ScrapeJob) => {
        const running = isScrapeRunning(record.status);
        if (running && progress === 0) {
          return (
            <span className="text-xs text-[var(--lf-brand)] font-medium">
              Processing...
            </span>
          );
        }
        return (
          <div className="w-full bg-[var(--lf-track)] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                record.status === "Completed"
                  ? "bg-[var(--lf-success)]"
                  : "bg-[var(--lf-brand)]"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress ?? 0))}%` }}
            />
          </div>
        );
      },
    },
    {
      title: "Websites",
      dataIndex: "total_websites",
      key: "total_websites",
      width: 100,
      align: "right",
      render: (val: number) => (
        <span className="font-mono text-xs text-[var(--lf-text)]">
          {(val ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Completed",
      dataIndex: "completed",
      key: "completed",
      width: 100,
      align: "right",
      render: (val: number) => (
        <span className="font-mono text-xs text-[var(--lf-brand)] font-semibold">
          {(val ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Success",
      dataIndex: "success",
      key: "success",
      width: 90,
      align: "right",
      render: (val: number) => (
        <span className="font-mono text-xs text-[var(--lf-success)] font-semibold">
          {(val ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Failed",
      dataIndex: "failed",
      key: "failed",
      width: 80,
      align: "right",
      render: (val: number) => (
        <span className="font-mono text-xs text-[var(--lf-error)] font-semibold">
          {(val ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Started",
      dataIndex: "started_at",
      key: "started_at",
      width: 160,
      render: (date: string | null) => (
        <span className="text-xs text-[var(--lf-text-muted)] font-mono">
          {date ? new Date(date).toLocaleString() : "—"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      align: "center",
      render: (_, record: ScrapeJob) => {
        const isActive = activeJobId === record.id;
        const running = isScrapeRunning(record.status);

        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              type={isActive ? "primary" : "default"}
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onSelectJob(record.id)}
            >
              View
            </Button>
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={running}
              onClick={() => setDeleteTargetId(record.id)}
              aria-label={`Delete job ${record.id}`}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Panel
      title="Scrape job history"
      description="Every bulk scrape job run on this workspace, newest first."
      flush
    >
      <div className="hidden md:block">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={jobs}
          loading={isLoading}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </div>

      <div className="lf-mobile-data-list md:hidden">
        {isLoading ? (
          <div className="p-4">
            <Skeleton active title={false} paragraph={{ rows: 4 }} />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            compact
            title="No scrape jobs yet"
            description="Choose a scraping action above to begin extracting website details."
          />
        ) : (
          jobs.map((job) => {
            const running = isScrapeRunning(job.status);
            const progress = Math.min(100, Math.max(0, job.progress ?? 0));

            return (
              <article key={job.id} className="lf-mobile-data-item">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="lf-mobile-data-title">Scrape job #{job.id}</p>
                    <p className="lf-mobile-data-meta">
                      {job.started_at ? new Date(job.started_at).toLocaleString() : "Not started"}
                    </p>
                  </div>
                  <StatusTag status={job.status} />
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-[var(--lf-text-muted)]">
                    <span>{running && progress === 0 ? "Preparing targets" : "Progress"}</span>
                    <span className="lf-mobile-data-value">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--lf-track)]">
                    <div
                      className={job.status === "Completed" ? "h-full bg-[var(--lf-success)]" : "h-full bg-[var(--lf-brand)]"}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2">
                  <div>
                    <dt className="lf-mobile-data-label">Targets</dt>
                    <dd className="lf-mobile-data-value">{(job.total_websites ?? 0).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="lf-mobile-data-label">Success</dt>
                    <dd className="lf-mobile-data-value text-[var(--lf-success)]">{(job.success ?? 0).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="lf-mobile-data-label">Failed</dt>
                    <dd className="lf-mobile-data-value text-[var(--lf-error)]">{(job.failed ?? 0).toLocaleString()}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--lf-border-subtle)] pt-3">
                  <Button
                    type={activeJobId === job.id ? "primary" : "default"}
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => onSelectJob(job.id)}
                  >
                    View details
                  </Button>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    disabled={running}
                    onClick={() => setDeleteTargetId(job.id)}
                    aria-label={`Delete job ${job.id}`}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            );
          })
        )}
      </div>
      <Modal
        title={`Delete scrape job #${deleteTargetId}?`}
        open={deleteTargetId !== null}
        onOk={() => {
          if (deleteTargetId !== null) {
            onDeleteJob(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
        okText="Delete job"
        okButtonProps={{ danger: true }}
      >
        <p className="text-sm text-[var(--lf-text-secondary)] py-2">
          This will remove the job record from history. Scraped website data
          already saved to businesses will be preserved.
        </p>
      </Modal>
    </Panel>
  );
}
