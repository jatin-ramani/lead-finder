"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Popconfirm,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import type {
  CityAutomationReportData,
  RecipientExecutionLogItem,
} from "@/types/api";

const { Title, Paragraph } = Typography;

interface AutomationProgressViewProps {
  report: CityAutomationReportData;
  isLoading: boolean;
  onRefresh: () => void;
  onCancelRun: (id: number) => void;
  onResumeRun?: (id: number) => void;
  isCancelling: boolean;
  isResuming?: boolean;
  onStartNew: () => void;
}

const STATUS_TAG_MAP: Record<string, { color: string; label: string }> = {
  running: { color: "processing", label: "Running" },
  paused: { color: "warning", label: "Paused" },
  completed: { color: "success", label: "Completed" },
  completed_with_errors: { color: "warning", label: "Completed with Errors" },
  cancelled: { color: "default", label: "Cancelled" },
  failed: { color: "error", label: "Failed" },
  scheduled: { color: "warning", label: "Scheduled" },
  draft: { color: "default", label: "Draft" },
};

export const AutomationProgressView: React.FC<AutomationProgressViewProps> = ({
  report,
  isLoading,
  onRefresh,
  onCancelRun,
  onResumeRun,
  isCancelling,
  isResuming = false,
  onStartNew,
}) => {
  const [filterFailedOnly, setFilterFailedOnly] = useState(false);

  const total = report.recipient_count;
  const sent = report.sent_count;
  const failed = report.failed_count;
  const pending = report.pending_count;
  const processing = report.processing_count || 0;
  const remaining = report.remaining_count ?? (pending + processing);
  const processed = sent + failed + report.cancelled_count + (report.skipped_count || 0);
  const percent = report.percentage ?? (total > 0 ? Math.round((processed / total) * 100) : 100);
  const isRunning = report.status === "running";
  const isPaused = report.status === "paused";
  const isScheduled = report.status === "scheduled";
  const isFinished = report.status === "completed" || report.status === "completed_with_errors" || report.status === "cancelled";
  const statusBadge = STATUS_TAG_MAP[report.status] || {
    color: "default",
    label: report.status,
  };

  const recipientLogs = report.recipient_logs || [];
  const remainingRecipients = report.remaining_recipients || recipientLogs.filter((r) => r.status === "pending" || r.status === "processing");
  const sentRecipients = recipientLogs.filter((r) => r.status === "sent");
  const displayedLogs = filterFailedOnly
    ? recipientLogs.filter((r) => r.status === "failed")
    : recipientLogs;

  const [activeTab, setActiveTab] = useState<string>(isFinished && remaining === 0 ? "sent" : "remaining");

  const remainingColumns = [
    {
      title: "Business / Lead",
      key: "business",
      render: (_: unknown, record: RecipientExecutionLogItem) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-xs text-gray-900 dark:text-gray-100">
            {record.business_name}
          </div>
          <div className="font-mono text-[11px] text-gray-500">
            {record.recipient_email}
          </div>
        </div>
      ),
    },
    {
      title: "Grade",
      dataIndex: "lead_grade",
      key: "lead_grade",
      width: 90,
      render: (g: string) => (
        <Tag color="blue" className="text-xs font-semibold">
          Grade {g || "D"}
        </Tag>
      ),
    },
    {
      title: "Queue Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (st: string, record: RecipientExecutionLogItem) => {
        if (st === "processing") {
          return (
            <Tag color="processing" icon={<SyncOutlined spin />}>
              Processing Now
            </Tag>
          );
        }
        if (record.error_message && record.error_message.includes("Retrying")) {
          return (
            <Tag color="warning" icon={<SyncOutlined />}>
              Retry Scheduled
            </Tag>
          );
        }
        return <Tag color="default">Queued Pending</Tag>;
      },
    },
    {
      title: "Status Details",
      key: "details",
      render: (_: unknown, record: RecipientExecutionLogItem) => (
        <div className="text-xs text-gray-500">
          {record.error_message ? (
            <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px]">
              {record.error_message}
            </span>
          ) : record.status === "processing" ? (
            <span className="text-blue-600 dark:text-blue-400">Currently generating & dispatching...</span>
          ) : (
            <span className="text-gray-400">Awaiting queue dispatch at 20/min</span>
          )}
        </div>
      ),
    },
  ];

  const logColumns = [
    {
      title: "Recipient",
      key: "recipient",
      render: (_: unknown, record: RecipientExecutionLogItem) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-xs text-gray-900 dark:text-gray-100">
            {record.business_name}
          </div>
          <div className="font-mono text-[11px] text-gray-500">
            {record.recipient_email}
          </div>
        </div>
      ),
    },
    {
      title: "Grade",
      dataIndex: "lead_grade",
      key: "lead_grade",
      width: 80,
      render: (g: string) => (
        <Tag color="blue" className="text-xs font-semibold">
          Grade {g || "D"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (st: string) => {
        if (st === "sent") return <Tag color="success">Sent</Tag>;
        if (st === "failed") return <Tag color="error">Failed</Tag>;
        if (st === "cancelled") return <Tag color="default">Cancelled</Tag>;
        return <Tag color="processing">{st}</Tag>;
      },
    },
    {
      title: "Details / Delivery Info",
      key: "details",
      render: (_: unknown, record: RecipientExecutionLogItem) => (
        <div className="text-xs">
          {record.error_message ? (
            <span className="text-red-500 font-mono text-[11px]">
              {record.error_message}
            </span>
          ) : record.sent_at ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              Delivered at {new Date(record.sent_at).toLocaleTimeString()}
            </span>
          ) : (
            <span className="text-gray-400">In queue / processing</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Paused Alert Banner */}
      {isPaused && (
        <Card className="border border-amber-300 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Automation Paused
              </div>
              <div className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                {report.paused_reason || "Sending was paused. Pending items are safely preserved in queue."}
              </div>
            </div>
            {onResumeRun && (
              <Button
                type="primary"
                loading={isResuming}
                onClick={() => onResumeRun(report.id)}
                className="bg-amber-600 hover:bg-amber-700 font-semibold"
              >
                Resume Automation
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Header Banner */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <EnvironmentOutlined className="text-blue-600 text-lg" />
              <Title level={3} className="!mb-0">
                {report.city ? `${report.city} Email Automation` : report.name}
              </Title>
              <Tag color={statusBadge.color} className="text-xs px-2 py-0.5 ml-2 font-semibold">
                {isRunning && <SyncOutlined spin className="mr-1" />}
                {statusBadge.label}
              </Tag>
            </div>
            <Paragraph type="secondary" className="!mb-0 text-xs">
              Created on {new Date(report.created_at).toLocaleString()}
              {report.completed_at && ` • Finished at ${new Date(report.completed_at).toLocaleTimeString()}`}
            </Paragraph>
          </div>

          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={isLoading}>
              Refresh
            </Button>
            {(isRunning || isScheduled || isPaused) && (
              <Popconfirm
                title="Cancel Automation"
                description="Stop all pending emails for this automation run?"
                onConfirm={() => onCancelRun(report.id)}
                okText="Yes, Cancel"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<StopOutlined />} loading={isCancelling}>
                  Cancel Automation
                </Button>
              </Popconfirm>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onStartNew}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start New City Run
            </Button>
          </Space>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span>
              Progress: {sent} of {total} sent • {remaining} remaining unsent
              {failed > 0 ? ` • ${failed} failed` : ""}
            </span>
            <span>{percent}%</span>
          </div>
          <Progress
            percent={percent}
            status={isRunning ? "active" : failed > 0 ? "normal" : "success"}
            strokeColor={{
              from: "#108ee9",
              to: "#87d068",
            }}
            size={["100%", 10]}
          />
        </div>
      </Card>

      {/* KPI Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="border border-gray-200 dark:border-gray-800 shadow-sm text-center">
            <Statistic
              title={<span className="text-xs text-gray-500">Total Audience</span>}
              value={total}
              valueStyle={{ fontWeight: 700, color: "#1f2937" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border border-gray-200 dark:border-gray-800 shadow-sm text-center bg-emerald-50/40 dark:bg-emerald-950/20">
            <Statistic
              title={<span className="text-xs text-emerald-700 dark:text-emerald-400">Emails Sent</span>}
              value={sent}
              valueStyle={{ fontWeight: 700, color: "#10b981" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border border-gray-200 dark:border-gray-800 shadow-sm text-center bg-blue-50/40 dark:bg-blue-950/20">
            <Statistic
              title={<span className="text-xs text-blue-700 dark:text-blue-400">Remaining Unsent</span>}
              value={remaining}
              valueStyle={{ fontWeight: 700, color: "#2563eb" }}
              prefix={<SyncOutlined spin={isRunning} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border border-gray-200 dark:border-gray-800 shadow-sm text-center bg-red-50/40 dark:bg-red-950/20">
            <Statistic
              title={<span className="text-xs text-red-700 dark:text-red-400">Failed</span>}
              value={failed}
              valueStyle={{ fontWeight: 700, color: failed > 0 ? "#ef4444" : "#6b7280" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Grade Breakdown Cards */}
      <Card
        className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl"
        title={<span className="font-semibold text-base">Grade-Wise Performance</span>}
      >
        <Row gutter={[16, 16]}>
          {["A", "B", "C", "D"].map((grade) => {
            const g = report.grade_breakdown?.[grade] || { total: 0, sent: 0, failed: 0, pending: 0, processing: 0 };
            return (
              <Col xs={24} sm={12} md={6} key={grade}>
                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      Grade {grade}
                    </span>
                    <Tag color="blue" className="text-xs m-0">
                      {g.total} Total
                    </Tag>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between">
                      <span>Sent:</span>
                      <span className="font-semibold text-emerald-600">{g.sent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span className="font-semibold text-blue-600">{g.pending + (g.processing || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-semibold text-red-500">{g.failed}</span>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Live Recipient Views & History Inspector */}
      <Card
        className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl"
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-semibold text-base">Recipient Dispatch Logs</span>
            <div className="flex items-center gap-2">
              <Space size="small">
                <Button
                  size="small"
                  type={activeTab === "remaining" ? "primary" : "default"}
                  onClick={() => {
                    setActiveTab("remaining");
                    setFilterFailedOnly(false);
                  }}
                  className={activeTab === "remaining" ? "bg-blue-600" : ""}
                >
                  Remaining Unsent ({remaining})
                </Button>
                <Button
                  size="small"
                  type={activeTab === "sent" ? "primary" : "default"}
                  onClick={() => {
                    setActiveTab("sent");
                    setFilterFailedOnly(false);
                  }}
                  className={activeTab === "sent" ? "bg-emerald-600" : ""}
                >
                  Delivered ({sent})
                </Button>
                <Button
                  size="small"
                  type={activeTab === "all" && !filterFailedOnly ? "primary" : "default"}
                  onClick={() => {
                    setActiveTab("all");
                    setFilterFailedOnly(false);
                  }}
                >
                  All Logs ({recipientLogs.length})
                </Button>
                {failed > 0 && (
                  <Button
                    size="small"
                    type={filterFailedOnly ? "primary" : "default"}
                    danger={filterFailedOnly}
                    onClick={() => {
                      setActiveTab("all");
                      setFilterFailedOnly(!filterFailedOnly);
                    }}
                  >
                    {filterFailedOnly ? "Show All" : `Inspect ${failed} Failed`}
                  </Button>
                )}
              </Space>
            </div>
          </div>
        }
      >
        {activeTab === "remaining" ? (
          <Table
            dataSource={remainingRecipients}
            columns={remainingColumns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: (
                <div className="py-8 text-center">
                  <CheckCircleOutlined className="text-emerald-500 text-3xl mb-2" />
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    No remaining unsent leads in queue
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    All eligible prospects have been processed or delivered. Check &quot;Delivered&quot; or &quot;All Logs&quot; to review history.
                  </div>
                </div>
              ),
            }}
          />
        ) : activeTab === "sent" ? (
          <Table
            dataSource={sentRecipients}
            columns={logColumns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: (
                <div className="py-8 text-center text-gray-400">
                  No emails have been delivered yet.
                </div>
              ),
            }}
          />
        ) : (
          <Table
            dataSource={displayedLogs}
            columns={logColumns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
};
