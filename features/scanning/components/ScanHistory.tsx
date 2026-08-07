"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
} from "@ant-design/icons";
import { Skeleton, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/feedback/ErrorState";
import Panel from "@/components/Panel";
import type { ScanJob } from "@/types/api";

import { isRunning } from "../hooks/useScanJobs";

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
      <Tag color="processing" icon={<LoadingOutlined />} className="lf-tag">
        Running
      </Tag>
    );
  }

  if (status === "Completed") {
    return (
      <Tag color="success" icon={<CheckCircleFilled />} className="lf-tag">
        Completed
      </Tag>
    );
  }

  return (
    <Tag color="error" icon={<CloseCircleFilled />} className="lf-tag">
      {status}
    </Tag>
  );
}

/**
 * Every scan ever run, newest first.
 *
 * **Ordered by id, not by time.** Scan jobs carry no timestamp of any kind, so
 * there is no "3 minutes ago" column and none is invented. Job number is the
 * only ordering the backend actually provides.
 *
 * Paginated in the browser, unusually for this app: `GET /scan/jobs` returns
 * every job in one response and offers no page parameters, so there is nothing
 * to ask the server for.
 */
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
        width: 88,
        render: (id: number) => <Text className="lf-mono">#{id}</Text>,
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
        title: "Category",
        dataIndex: "category",
        key: "category",
        ellipsis: true,
        render: (category: string | null) =>
          category ?? <Text type="secondary">—</Text>,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (status: string) => <StatusTag status={status} />,
      },
      {
        title: "Results",
        dataIndex: "total_businesses",
        key: "total_businesses",
        width: 110,
        align: "end",
        render: (value: number) => (
          <span className="lf-num">{value.toLocaleString()}</span>
        ),
      },
      {
        title: "New",
        dataIndex: "new_businesses",
        key: "new_businesses",
        width: 100,
        align: "end",
        render: (value: number) => (
          <span className={`lf-num ${value > 0 ? "lf-num--accent" : ""}`}>
            {value.toLocaleString()}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <Panel
      title="Scan history"
      description="Every scan run so far, newest first"
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
          scroll={{ x: 720 }}
          pagination={
            jobs.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: false,
                  className: "lf-pagination",
                  showTotal: (total) => `${total} scans`,
                }
              : false
          }
          locale={{
            emptyText: (
              <EmptyState
                compact
                title="No scans yet"
                description="Run your first scan to start discovering businesses."
              />
            ),
          }}
        />
      )}
    </Panel>
  );
}
