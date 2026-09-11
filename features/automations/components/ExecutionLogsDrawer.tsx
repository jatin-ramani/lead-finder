"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Collapse,
  Drawer,
  Empty,
  Pagination,
  Radio,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  MailOutlined,
  ReloadOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import type { EmailAutomation, EmailAutomationExecution, ExecutionStatus } from "@/types/api";
import ErrorState from "@/components/feedback/ErrorState";
import { useAutomationExecutions, useExecutions } from "../hooks/useAutomations";

const { Text } = Typography;

interface ExecutionLogsDrawerProps {
  open: boolean;
  automation: EmailAutomation | null;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  ExecutionStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  scheduled: {
    label: "Scheduled",
    color: "blue",
    icon: <ClockCircleOutlined />,
  },
  processing: {
    label: "Processing",
    color: "processing",
    icon: <SyncOutlined spin />,
  },
  sent: {
    label: "Sent",
    color: "success",
    icon: <CheckCircleOutlined />,
  },
  failed: {
    label: "Failed",
    color: "error",
    icon: <CloseCircleOutlined />,
  },
  cancelled: {
    label: "Cancelled",
    color: "default",
    icon: <ExclamationCircleOutlined />,
  },
};

export const ExecutionLogsDrawer: React.FC<ExecutionLogsDrawerProps> = ({
  open,
  automation,
  onClose,
}) => {
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const currentStatus = statusFilter === "all" ? undefined : statusFilter;

  // Query either automation-specific executions or global executions
  const specificQuery = useAutomationExecutions(
    automation?.id ?? 0,
    { status: currentStatus, page, page_size: pageSize },
    Boolean(automation && open),
  );

  const globalQuery = useExecutions(
    { status: currentStatus, page, page_size: pageSize },
  );

  const activeQuery = automation ? specificQuery : globalQuery;
  const { data, isLoading, isFetching, isError, error, refetch } = activeQuery;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={680}
      title={
        <div className="flex items-center justify-between w-full pr-4">
          <Space>
            <HistoryOutlined className="text-blue-500 text-lg" />
            <div>
              <div className="font-semibold text-base">
                {automation ? `Execution Logs: ${automation.name}` : "Global Email Automation Logs"}
              </div>
              <div className="text-xs text-gray-500 font-normal">
                {automation ? `Trigger: ${automation.trigger_type}` : "All automated email dispatches and delivery history"}
              </div>
            </div>
          </Space>
          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            size="small"
            onClick={() => void refetch()}
          >
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
          <Radio.Group
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            size="small"
            buttonStyle="solid"
          >
            <Radio.Button value="all">All ({total})</Radio.Button>
            <Radio.Button value="sent">Sent</Radio.Button>
            <Radio.Button value="scheduled">Scheduled</Radio.Button>
            <Radio.Button value="failed">Failed</Radio.Button>
          </Radio.Group>

          <Text type="secondary" className="text-xs">
            Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
          </Text>
        </div>

        {/* Execution Items List */}
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <Spin tip="Loading execution history..." />
          </div>
        ) : isError ? (
          <div className="py-6">
            <ErrorState
              error={error}
              onRetry={() => void refetch()}
              variant="inline"
              title="Could not load execution history"
            />
          </div>
        ) : items.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No automation executions recorded for this filter."
            className="py-12"
          />
        ) : (
          <div className="space-y-3">
            {items.map((exec: EmailAutomationExecution) => {
              const cfg = STATUS_CONFIG[exec.status] || STATUS_CONFIG.scheduled;
              return (
                <Card
                  key={exec.id}
                  size="small"
                  className="border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <Space size={6} wrap>
                        <Tag color={cfg.color} icon={cfg.icon}>
                          {cfg.label}
                        </Tag>
                        <Tag color="cyan">{exec.trigger_event}</Tag>
                        {exec.retry_count > 0 && (
                          <Tag color="orange">Retries: {exec.retry_count}</Tag>
                        )}
                      </Space>
                      <div className="text-sm font-medium mt-1 text-gray-800 dark:text-gray-100">
                        {exec.rendered_subject || "(Subject not recorded)"}
                      </div>
                    </div>

                    <div className="text-right text-xs text-gray-400">
                      <div>Scheduled: {formatDate(exec.scheduled_at)}</div>
                      {exec.sent_at && (
                        <div className="text-green-600 dark:text-green-400">
                          Sent: {formatDate(exec.sent_at)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <MailOutlined />
                    <span>To:</span>
                    <span className="font-mono text-gray-700 dark:text-gray-200">{exec.recipient_email}</span>
                  </div>

                  {exec.error_message && (
                    <div className="p-2 mb-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400 font-mono">
                      <strong>Error:</strong> {exec.error_message}
                    </div>
                  )}

                  {exec.rendered_body && (
                    <Collapse
                      size="small"
                      ghost
                      items={[
                        {
                          key: "body",
                          label: <span className="text-xs text-blue-600 dark:text-blue-400">View Rendered Message</span>,
                          children: (
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">
                              {exec.rendered_body}
                            </div>
                          ),
                        },
                      ]}
                    />
                  )}
                </Card>
              );
            })}

            {total > pageSize && (
              <div className="flex justify-center pt-3">
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={(p) => setPage(p)}
                  size="small"
                  showSizeChanger={false}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};
