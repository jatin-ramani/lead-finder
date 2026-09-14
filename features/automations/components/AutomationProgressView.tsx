"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Popconfirm,
  Pagination,
  Progress,
  Row,
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

function RecipientStatusTag({
  status,
  errorMessage,
}: {
  status: string;
  errorMessage?: string | null;
}) {
  if (status === "processing") {
    return <Tag color="processing" icon={<SyncOutlined spin />} className="lf-status-badge">Processing now</Tag>;
  }
  if (errorMessage?.includes("Retrying")) {
    return <Tag color="warning" icon={<SyncOutlined />} className="lf-status-badge">Retry scheduled</Tag>;
  }
  if (status === "sent") return <Tag color="success" className="lf-status-badge">Delivered</Tag>;
  if (status === "failed") return <Tag color="error" className="lf-status-badge">Failed</Tag>;
  if (status === "cancelled") return <Tag className="lf-status-badge">Cancelled</Tag>;
  return <Tag className="lf-status-badge">Queued</Tag>;
}

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
  const [recipientPage, setRecipientPage] = useState(1);

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
  const visibleRecipients = activeTab === "remaining"
    ? remainingRecipients
    : activeTab === "sent"
      ? sentRecipients
      : displayedLogs;
  const recipientPageSize = 10;
  const mobileRecipients = visibleRecipients.slice(
    (recipientPage - 1) * recipientPageSize,
    recipientPage * recipientPageSize,
  );

  const remainingColumns = [
    {
      title: "Business / Lead",
      key: "business",
      render: (_: unknown, record: RecipientExecutionLogItem) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-xs text-[var(--lf-text)]">
            {record.business_name}
          </div>
          <div className="font-mono text-[11px] text-[var(--lf-text-muted)]">
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
        <Tag color="processing" className="lf-status-badge text-xs font-semibold">
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
        return <RecipientStatusTag status={st} errorMessage={record.error_message} />;
      },
    },
    {
      title: "Status Details",
      key: "details",
      render: (_: unknown, record: RecipientExecutionLogItem) => (
        <div className="text-xs text-[var(--lf-text-muted)]">
          {record.error_message ? (
            <span className="text-[var(--lf-warning)] font-mono text-[11px]">
              {record.error_message}
            </span>
          ) : record.status === "processing" ? (
            <span className="text-[var(--lf-info)]">Currently generating & dispatching...</span>
          ) : (
            <span className="text-[var(--lf-text-muted)]">Awaiting queue dispatch at 20/min</span>
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
          <div className="font-semibold text-xs text-[var(--lf-text)]">
            {record.business_name}
          </div>
          <div className="font-mono text-[11px] text-[var(--lf-text-muted)]">
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
        <Tag color="processing" className="lf-status-badge text-xs font-semibold">
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
        return <RecipientStatusTag status={st} />;
      },
    },
    {
      title: "Details / Delivery Info",
      key: "details",
      render: (_: unknown, record: RecipientExecutionLogItem) => (
        <div className="text-xs">
          {record.error_message ? (
            <span className="text-[var(--lf-error)] font-mono text-[11px]">
              {record.error_message}
            </span>
          ) : record.sent_at ? (
            <span className="text-[var(--lf-success)]">
              Delivered at {new Date(record.sent_at).toLocaleTimeString()}
            </span>
          ) : (
            <span className="text-[var(--lf-text-muted)]">In queue / processing</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Paused Alert Banner */}
      {isPaused && (
        <Card className="lf-workspace-card border-[var(--lf-warning)] bg-[var(--lf-warning-soft)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-bold text-[var(--lf-text)] text-sm">
                Automation Paused
              </div>
              <div className="text-xs text-[var(--lf-text-secondary)] mt-0.5">
                {report.paused_reason || "Sending was paused. Pending items are safely preserved in queue."}
              </div>
            </div>
            {onResumeRun && (
              <Button
                type="primary"
                loading={isResuming}
                onClick={() => onResumeRun(report.id)}
                className="!border-[var(--lf-warning)] !bg-[var(--lf-warning)] font-semibold"
              >
                Resume Automation
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Header Banner */}
      <Card className="lf-workspace-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <EnvironmentOutlined className="text-[var(--lf-brand)] text-lg" />
              <Title level={3} className="!mb-0">
                {report.city ? `${report.city} Email Automation` : report.name}
              </Title>
              <Tag color={statusBadge.color} className="lf-status-badge text-xs px-2 py-0.5 ml-2 font-semibold">
                {isRunning && <SyncOutlined spin className="mr-1" />}
                {statusBadge.label}
              </Tag>
            </div>
            <Paragraph type="secondary" className="!mb-0 text-xs">
              Created on {new Date(report.created_at).toLocaleString()}
              {report.completed_at && ` • Finished at ${new Date(report.completed_at).toLocaleTimeString()}`}
            </Paragraph>
          </div>

          <div className="lf-page-toolbar flex flex-wrap gap-2">
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
              className="font-semibold"
            >
              Start New City Run
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between gap-3 text-xs font-semibold text-[var(--lf-text-secondary)]">
            <span>
              Progress: {sent} of {total} sent • {remaining} remaining unsent
              {failed > 0 ? ` • ${failed} failed` : ""}
            </span>
            <span>{percent}%</span>
          </div>
          <Progress
            percent={percent}
            status={isRunning ? "active" : failed > 0 ? "normal" : "success"}
            strokeColor="var(--lf-brand)"
            size={["100%", 10]}
          />
        </div>
      </Card>

      {/* KPI Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="lf-metric-card text-center">
            <Statistic
              title={<span className="text-xs text-[var(--lf-text-muted)]">Total Audience</span>}
              value={total}
              styles={{ content: { fontWeight: 700, color: "var(--lf-text)" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="lf-metric-card text-center">
            <Statistic
              title={<span className="text-xs text-[var(--lf-success)]">Emails Sent</span>}
              value={sent}
              styles={{ content: { fontWeight: 700, color: "var(--lf-success)" } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="lf-metric-card text-center">
            <Statistic
              title={<span className="text-xs text-[var(--lf-info)]">Remaining Unsent</span>}
              value={remaining}
              styles={{ content: { fontWeight: 700, color: "var(--lf-info)" } }}
              prefix={<SyncOutlined spin={isRunning} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="lf-metric-card text-center">
            <Statistic
              title={<span className="text-xs text-[var(--lf-error)]">Failed</span>}
              value={failed}
              styles={{ content: { fontWeight: 700, color: failed > 0 ? "var(--lf-error)" : "var(--lf-text-muted)" } }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Grade Breakdown Cards */}
      <Card
        className="lf-workspace-card"
        title={<span className="font-semibold text-base">Grade-Wise Performance</span>}
      >
        <Row gutter={[16, 16]}>
          {["A", "B", "C", "D"].map((grade) => {
            const g = report.grade_breakdown?.[grade] || { total: 0, sent: 0, failed: 0, pending: 0, processing: 0 };
            return (
              <Col xs={24} sm={12} md={6} key={grade}>
                <div className="lf-metric-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--lf-text)]">
                      Grade {grade}
                    </span>
                    <Tag color="blue" className="lf-status-badge text-xs m-0">
                      {g.total} Total
                    </Tag>
                  </div>

                  <div className="space-y-1 border-t border-[var(--lf-border)] pt-1 text-xs text-[var(--lf-text-secondary)]">
                    <div className="flex justify-between">
                      <span>Sent:</span>
                      <span className="font-semibold text-[var(--lf-success)]">{g.sent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span className="font-semibold text-[var(--lf-info)]">{g.pending + (g.processing || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-semibold text-[var(--lf-error)]">{g.failed}</span>
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
        className="lf-workspace-card"
        title={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold text-base">Recipient Dispatch Logs</span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="small"
                type={activeTab === "remaining" ? "primary" : "default"}
                onClick={() => {
                  setActiveTab("remaining");
                  setFilterFailedOnly(false);
                  setRecipientPage(1);
                }}
              >
                Remaining unsent ({remaining})
              </Button>
              <Button
                size="small"
                type={activeTab === "sent" ? "primary" : "default"}
                onClick={() => {
                  setActiveTab("sent");
                  setFilterFailedOnly(false);
                  setRecipientPage(1);
                }}
              >
                Delivered ({sent})
              </Button>
              <Button
                size="small"
                type={activeTab === "all" && !filterFailedOnly ? "primary" : "default"}
                onClick={() => {
                  setActiveTab("all");
                  setFilterFailedOnly(false);
                  setRecipientPage(1);
                }}
              >
                All logs ({recipientLogs.length})
              </Button>
              {failed > 0 && (
                <Button
                  size="small"
                  type={filterFailedOnly ? "primary" : "default"}
                  danger={filterFailedOnly}
                  onClick={() => {
                    setActiveTab("all");
                    setFilterFailedOnly(!filterFailedOnly);
                    setRecipientPage(1);
                  }}
                >
                  {filterFailedOnly ? "Show all" : `Inspect ${failed} failed`}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="hidden md:block">
          {activeTab === "remaining" ? (
            <Table
              dataSource={remainingRecipients}
              columns={remainingColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: recipientPageSize }}
              locale={{
                emptyText: (
                  <div className="py-8 text-center">
                    <CheckCircleOutlined className="mb-2 text-3xl text-[var(--lf-success)]" />
                    <div className="font-semibold text-[var(--lf-text)]">
                      No remaining unsent leads in queue
                    </div>
                    <div className="mt-1 text-xs text-[var(--lf-text-muted)]">
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
              pagination={{ pageSize: recipientPageSize }}
              locale={{
                emptyText: (
                  <div className="py-8 text-center text-[var(--lf-text-muted)]">
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
              pagination={{ pageSize: recipientPageSize }}
            />
          )}
        </div>

        <div className="lf-mobile-data-list md:hidden">
          {mobileRecipients.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--lf-text-muted)]">
              {activeTab === "remaining"
                ? "No remaining unsent leads in queue."
                : activeTab === "sent"
                  ? "No emails have been delivered yet."
                  : "No recipient activity matches this view."}
            </div>
          ) : (
            mobileRecipients.map((record) => (
              <article key={record.id} className="lf-mobile-data-item">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[var(--lf-text)]">
                      {record.business_name}
                    </div>
                    <div className="truncate font-mono text-xs text-[var(--lf-text-muted)]">
                      {record.recipient_email}
                    </div>
                  </div>
                  <RecipientStatusTag status={record.status} errorMessage={record.error_message} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <Tag color="processing" className="lf-status-badge">Grade {record.lead_grade || "D"}</Tag>
                  {record.sent_at && (
                    <span className="text-[var(--lf-success)]">
                      Delivered {new Date(record.sent_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                {record.error_message && (
                  <p className="mt-2 break-words font-mono text-xs text-[var(--lf-error)]">
                    {record.error_message}
                  </p>
                )}
              </article>
            ))
          )}
          {visibleRecipients.length > recipientPageSize && (
            <div className="flex justify-center pt-1">
              <Pagination
                simple
                size="small"
                current={recipientPage}
                pageSize={recipientPageSize}
                total={visibleRecipients.length}
                onChange={setRecipientPage}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
