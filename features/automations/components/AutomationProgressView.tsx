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
  isCancelling: boolean;
  onStartNew: () => void;
  ineligibleLeadsCount?: number;
}

const STATUS_TAG_MAP: Record<string, { color: string; label: string }> = {
  running: { color: "processing", label: "Running" },
  completed: { color: "success", label: "Completed" },
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
  isCancelling,
  onStartNew,
  ineligibleLeadsCount = 0,
}) => {
  const [filterFailedOnly, setFilterFailedOnly] = useState(false);

  const total = report.recipient_count;
  const sent = report.sent_count;
  const failed = report.failed_count;
  const processed = sent + failed;
  const percent = total > 0 ? Math.round((processed / total) * 100) : 100;
  const isRunning = report.status === "running";
  const isScheduled = report.status === "scheduled";
  const statusBadge = STATUS_TAG_MAP[report.status] || {
    color: "default",
    label: report.status,
  };

  const recipientLogs = report.recipient_logs || [];
  const displayedLogs = filterFailedOnly
    ? recipientLogs.filter((r) => r.status === "failed")
    : recipientLogs;

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
      title: "Details / Error",
      key: "details",
      render: (_: unknown, record: RecipientExecutionLogItem) => (
        <div className="text-xs">
          {record.error_message ? (
            <span className="text-red-500 font-mono text-[11px]">
              {record.error_message}
            </span>
          ) : (
            <span className="text-gray-400">Successfully delivered</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
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
            {(isRunning || isScheduled) && (
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
            <span>Progress: {processed} of {total} recipients processed</span>
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
          <Card size="small" className="border border-gray-200 dark:border-gray-800 shadow-sm text-center bg-red-50/40 dark:bg-red-950/20">
            <Statistic
              title={<span className="text-xs text-red-700 dark:text-red-400">Failed</span>}
              value={failed}
              valueStyle={{ fontWeight: 700, color: failed > 0 ? "#ef4444" : "#6b7280" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border border-gray-200 dark:border-gray-800 shadow-sm text-center bg-amber-50/40 dark:bg-amber-950/20">
            <Statistic
              title={<span className="text-xs text-amber-700 dark:text-amber-400">Skipped (No Email)</span>}
              value={ineligibleLeadsCount}
              valueStyle={{ fontWeight: 700, color: "#f59e0b" }}
              prefix={<StopOutlined />}
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
            const g = report.grade_breakdown?.[grade] || { total: 0, sent: 0, failed: 0, pending: 0 };
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
                      <span>Failed:</span>
                      <span className="font-semibold text-red-500">{g.failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-semibold text-gray-500">{g.pending}</span>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Recipient Logs & Failure Inspector */}
      <Card
        className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl"
        title={
          <div className="flex items-center justify-between">
            <span className="font-semibold text-base">Recipient Dispatch Logs</span>
            {failed > 0 && (
              <Button
                size="small"
                type={filterFailedOnly ? "primary" : "default"}
                danger={filterFailedOnly}
                onClick={() => setFilterFailedOnly(!filterFailedOnly)}
              >
                {filterFailedOnly ? "Show All Recipients" : `Inspect ${failed} Failed`}
              </Button>
            )}
          </div>
        }
      >
        <Table
          dataSource={displayedLogs}
          columns={logColumns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};
