"use client";

import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EyeOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Modal, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import Panel from "@/components/Panel";
import type { ScrapeJob } from "@/types/api";

import { isScrapeRunning, useScrapeJobs } from "../hooks/useScrapeJobs";

interface ScrapeJobHistoryProps {
  activeJobId: number | null;
  onSelectJob: (id: number) => void;
  onDeleteJob: (id: number) => void;
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
        <span className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
          #{id}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => {
        switch (status) {
          case "Running":
            return (
              <Tag icon={<SyncOutlined spin />} color="processing">
                Running
              </Tag>
            );
          case "Pending":
            return (
              <Tag icon={<SyncOutlined spin />} color="warning">
                Pending
              </Tag>
            );
          case "Completed":
            return (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Completed
              </Tag>
            );
          case "Failed":
            return (
              <Tag icon={<CloseCircleOutlined />} color="error">
                Failed
              </Tag>
            );
          default:
            return <Tag>{status}</Tag>;
        }
      },
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
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                record.status === "Completed" ? "bg-[var(--lf-success)]" : "bg-[var(--lf-brand)]"
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
        <span className="font-mono text-xs">{(val ?? 0).toLocaleString()}</span>
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
        <span className="text-xs text-gray-500 font-mono">
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
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={jobs}
        loading={isLoading}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: 900 }}
        size="middle"
      />

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
        <p className="text-sm text-gray-600 dark:text-gray-300 py-2">
          This will remove the job record from history. Scraped website data already saved to businesses will be preserved.
        </p>
      </Modal>
    </Panel>
  );
}
