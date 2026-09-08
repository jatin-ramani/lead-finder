"use client";

import React, { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  message,
  Popconfirm,
  Progress,
  Row,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlayCircleOutlined,
  ReloadOutlined,
  SendOutlined,
  StopOutlined,
} from "@ant-design/icons";

import type {
  CampaignRecipientStatus,
  EmailCampaignRecipient,
} from "@/types/api";
import {
  useCampaign,
  useCampaignRecipients,
  useCancelCampaign,
  useStartCampaign,
} from "../hooks/useCampaigns";

const { Text, Title } = Typography;

interface CampaignDetailDrawerProps {
  open: boolean;
  campaignId: number | null;
  onClose: () => void;
}

export const CampaignDetailDrawer: React.FC<CampaignDetailDrawerProps> = ({
  open,
  campaignId,
  onClose,
}) => {
  const [statusFilter, setStatusFilter] = useState<CampaignRecipientStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: campaignData, refetch: refetchCampaign } = useCampaign(campaignId);
  const campaign = campaignData?.data;

  const {
    data: recipientsData,
    isLoading: isRecipientsLoading,
    isFetching: isRecipientsFetching,
    refetch: refetchRecipients,
  } = useCampaignRecipients(campaignId, {
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    page_size: pageSize,
  });

  const startMutation = useStartCampaign();
  const cancelMutation = useCancelCampaign();

  const handleStartNow = async () => {
    if (!campaignId) return;
    try {
      await startMutation.mutateAsync(campaignId);
      message.success("Campaign execution started");
      refetchCampaign();
      refetchRecipients();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start campaign";
      message.error(errorMsg);
    }
  };

  const handleCancelCampaign = async () => {
    if (!campaignId) return;
    try {
      await cancelMutation.mutateAsync(campaignId);
      message.success("Campaign cancelled");
      refetchCampaign();
      refetchRecipients();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to cancel campaign";
      message.error(errorMsg);
    }
  };

  const recipients = recipientsData?.items || [];
  const totalRecipients = recipientsData?.total || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge status="success" text="Sent" />;
      case "failed":
        return <Badge status="error" text="Failed" />;
      case "processing":
        return <Badge status="processing" text="Processing" />;
      case "cancelled":
        return <Badge status="default" text="Cancelled" />;
      default:
        return <Badge status="warning" text="Pending" />;
    }
  };

  const columns: ColumnsType<EmailCampaignRecipient> = [
    {
      title: "Recipient / Business",
      dataIndex: "recipient_email",
      key: "recipient_email",
      render: (email: string, record: EmailCampaignRecipient) => (
        <div>
          <Text strong className="text-gray-800 dark:text-gray-100">
            {record.business_name || "Lead"}
          </Text>
          <div className="text-xs font-mono text-gray-500">{email}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (st: string) => getStatusBadge(st),
    },
    {
      title: "Message ID / Details",
      dataIndex: "provider_message_id",
      key: "provider_message_id",
      render: (msgId: string | null, record: EmailCampaignRecipient) => {
        if (record.status === "sent") {
          return (
            <span className="text-xs font-mono text-green-600 dark:text-green-400">
              {msgId || "sent"}
            </span>
          );
        }
        if (record.status === "failed") {
          return (
            <Tooltip title={record.error_message || "Delivery failure"}>
              <span className="text-xs text-red-500 cursor-help underline decoration-dotted">
                {record.error_message ? record.error_message.slice(0, 30) + "..." : "Error"}
              </span>
            </Tooltip>
          );
        }
        return <span className="text-xs text-gray-400">Queued</span>;
      },
    },
    {
      title: "Sent / Attempted",
      dataIndex: "sent_at",
      key: "sent_at",
      width: 160,
      render: (sentAt: string | null, record: EmailCampaignRecipient) => {
        const timeVal = sentAt || record.attempted_at || record.created_at;
        return (
          <span className="text-xs text-gray-500">
            {timeVal ? new Date(timeVal).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
          </span>
        );
      },
    },
  ];

  const totalCount = campaign?.recipient_count || 0;
  const sentCount = campaign?.sent_count || 0;
  const failedCount = campaign?.failed_count || 0;
  const percentCompleted = totalCount > 0 ? Math.round(((sentCount + failedCount) / totalCount) * 100) : 0;

  return (
    <Drawer
      open={open}
      title={
        <Space className="w-full justify-between pr-6">
          <Space>
            <SendOutlined className="text-blue-500" />
            <span>Campaign Overview: {campaign?.name || "Loading..."}</span>
          </Space>
          {campaign && (
            <Tag color={campaign.status === "completed" ? "green" : campaign.status === "running" ? "processing" : campaign.status === "cancelled" ? "default" : "blue"}>
              {campaign.status.toUpperCase()}
            </Tag>
          )}
        </Space>
      }
      width={780}
      onClose={onClose}
    >
      {campaign && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <Text type="secondary" className="text-xs">
                Template: <Text strong>{campaign.template_name || `Template #${campaign.template_id}`}</Text>
              </Text>
            </div>
            <Space>
              {(campaign.status === "draft" || campaign.status === "scheduled") && (
                <Popconfirm
                  title="Start campaign execution now?"
                  onConfirm={handleStartNow}
                  okText="Start Now"
                >
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    loading={startMutation.isPending}
                  >
                    Start Execution
                  </Button>
                </Popconfirm>
              )}
              {(campaign.status === "scheduled" || campaign.status === "running") && (
                <Popconfirm
                  title="Cancel campaign?"
                  description="Cancelling will abort dispatch for all remaining pending recipients."
                  onConfirm={handleCancelCampaign}
                  okText="Cancel Campaign"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<StopOutlined />} loading={cancelMutation.isPending}>
                    Cancel
                  </Button>
                </Popconfirm>
              )}
              <Button
                icon={<ReloadOutlined spin={isRecipientsFetching} />}
                onClick={() => {
                  refetchCampaign();
                  refetchRecipients();
                }}
              >
                Refresh
              </Button>
            </Space>
          </div>

          {/* Progress Overview */}
          <Card size="small" className="border-gray-200 dark:border-gray-700">
            <div className="mb-2 flex justify-between text-xs text-gray-500">
              <span>Execution Progress: {percentCompleted}%</span>
              <span>{sentCount + failedCount} of {totalCount} Processed</span>
            </div>
            <Progress
              percent={percentCompleted}
              status={campaign.status === "completed" ? "success" : campaign.status === "failed" ? "exception" : "active"}
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
            />

            <Row gutter={16} className="mt-4 text-center">
              <Col span={6}>
                <Text type="secondary" className="text-xs">Total Audience</Text>
                <div className="font-bold text-base">{totalCount}</div>
              </Col>
              <Col span={6}>
                <Text type="secondary" className="text-xs">Sent Successfully</Text>
                <div className="font-bold text-base text-green-600">{sentCount}</div>
              </Col>
              <Col span={6}>
                <Text type="secondary" className="text-xs">Failed / Bounced</Text>
                <div className="font-bold text-base text-red-500">{failedCount}</div>
              </Col>
              <Col span={6}>
                <Text type="secondary" className="text-xs">Remaining Pending</Text>
                <div className="font-bold text-base text-gray-500">
                  {Math.max(0, totalCount - sentCount - failedCount)}
                </div>
              </Col>
            </Row>
          </Card>

          <Divider className="my-2" />

          {/* Recipient Logs Table */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <Title level={5} className="!mb-0">
                Recipient Dispatch Logs
              </Title>
              <Segmented
                size="small"
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v as CampaignRecipientStatus | "all");
                  setPage(1);
                }}
                options={[
                  { label: "All", value: "all" },
                  { label: "Sent", value: "sent" },
                  { label: "Failed", value: "failed" },
                  { label: "Pending", value: "pending" },
                ]}
              />
            </div>

            <Table
              size="small"
              columns={columns}
              dataSource={recipients}
              rowKey="id"
              loading={isRecipientsLoading}
              pagination={{
                current: page,
                pageSize,
                total: totalRecipients,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                },
                showTotal: (total) => `Total ${total} recipients`,
              }}
            />
          </div>
        </div>
      )}
    </Drawer>
  );
};
