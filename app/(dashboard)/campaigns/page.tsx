"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Input,
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
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  StopOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import type {
  CampaignCreateInput,
  CampaignStatus,
  EmailCampaign,
} from "@/types/api";
import {
  useCampaigns,
  useCancelCampaign,
  useCreateCampaign,
  useDeleteCampaign,
  useProcessDueCampaigns,
  useStartCampaign,
} from "@/features/campaigns/hooks/useCampaigns";
import { CampaignWizardModal } from "@/features/campaigns/components/CampaignWizardModal";
import { CampaignDetailDrawer } from "@/features/campaigns/components/CampaignDetailDrawer";

const { Title, Text } = Typography;

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useCampaigns({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
    page,
    page_size: pageSize,
  });

  const createMutation = useCreateCampaign();
  const startMutation = useStartCampaign();
  const cancelMutation = useCancelCampaign();
  const deleteMutation = useDeleteCampaign();
  const processDueMutation = useProcessDueCampaigns();

  const handleOpenWizard = () => {
    setWizardOpen(true);
  };

  const handleWizardSubmit = async (values: CampaignCreateInput) => {
    try {
      const created = await createMutation.mutateAsync(values);
      message.success("Campaign created successfully");
      setWizardOpen(false);

      // If immediate launch requested, trigger start
      if (!values.scheduled_at && created.data?.id) {
        await startMutation.mutateAsync(created.data.id);
        message.success("Campaign dispatch started!");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create campaign";
      message.error(errorMsg);
    }
  };

  const handleStartCampaign = async (campaignId: number) => {
    try {
      await startMutation.mutateAsync(campaignId);
      message.success("Campaign execution started");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start campaign";
      message.error(errorMsg);
    }
  };

  const handleCancelCampaign = async (campaignId: number) => {
    try {
      await cancelMutation.mutateAsync(campaignId);
      message.success("Campaign cancelled successfully");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to cancel campaign";
      message.error(errorMsg);
    }
  };

  const handleDeleteCampaign = async (campaignId: number) => {
    try {
      await deleteMutation.mutateAsync(campaignId);
      message.success("Campaign deleted successfully");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete campaign";
      message.error(errorMsg);
    }
  };

  const handleProcessDue = async () => {
    try {
      const res = await processDueMutation.mutateAsync();
      message.info(
        `Batch worker executed: ${res.campaigns_processed} due campaigns processed, ${res.recipients_sent} emails dispatched.`
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to run background queue";
      message.error(errorMsg);
    }
  };

  const handleOpenDrawer = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    setDrawerOpen(true);
  };

  const campaignsList = data?.items || [];
  const totalCount = data?.total || 0;

  // Aggregate KPI stats from loaded page
  const totalSentOverall = campaignsList.reduce((acc, c) => acc + (c.sent_count || 0), 0);
  const totalFailedOverall = campaignsList.reduce((acc, c) => acc + (c.failed_count || 0), 0);
  const totalProcessedOverall = totalSentOverall + totalFailedOverall;
  const deliveryRate = totalProcessedOverall > 0 ? Math.round((totalSentOverall / totalProcessedOverall) * 100) : 100;

  const getStatusTag = (status: CampaignStatus) => {
    switch (status) {
      case "completed":
        return <Tag color="green">COMPLETED</Tag>;
      case "running":
        return <Tag color="processing" icon={<SyncOutlined spin />}>RUNNING</Tag>;
      case "scheduled":
        return <Tag color="blue">SCHEDULED</Tag>;
      case "failed":
        return <Tag color="error">FAILED</Tag>;
      case "cancelled":
        return <Tag color="default">CANCELLED</Tag>;
      default:
        return <Tag color="warning">DRAFT</Tag>;
    }
  };

  const columns: ColumnsType<EmailCampaign> = [
    {
      title: "Campaign Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: EmailCampaign) => (
        <div>
          <Text strong className="text-gray-800 dark:text-gray-100">
            {name}
          </Text>
          <div className="text-xs text-gray-500">
            Template: {record.template_name || `ID #${record.template_id}`}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (st: CampaignStatus) => getStatusTag(st),
    },
    {
      title: "Progress / Dispatched",
      key: "progress",
      width: 180,
      render: (_, record: EmailCampaign) => {
        const total = record.recipient_count || 0;
        const sent = record.sent_count || 0;
        const failed = record.failed_count || 0;
        const percent = total > 0 ? Math.round(((sent + failed) / total) * 100) : record.status === "completed" ? 100 : 0;
        return (
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{sent} sent</span>
              {failed > 0 && <span className="text-red-500">{failed} failed</span>}
              <span>of {total}</span>
            </div>
            <Progress
              percent={percent}
              size="small"
              status={record.status === "failed" ? "exception" : record.status === "completed" ? "success" : "active"}
            />
          </div>
        );
      },
    },
    {
      title: "Schedule / Timeline",
      dataIndex: "scheduled_at",
      key: "scheduled_at",
      width: 180,
      render: (sched: string | null, record: EmailCampaign) => {
        if (sched) {
          return (
            <div className="text-xs">
              <span className="text-gray-400">Sched: </span>
              <span className="text-blue-600 font-mono">
                {new Date(sched).toLocaleDateString()} {new Date(sched).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        }
        return (
          <span className="text-xs text-gray-400">
            Created: {new Date(record.created_at).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record: EmailCampaign) => (
        <Space size={6}>
          <Tooltip title="View campaign stats and recipient history">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDrawer(record.id)}
            />
          </Tooltip>
          {(record.status === "draft" || record.status === "scheduled") && (
            <Tooltip title="Start execution now">
              <Popconfirm
                title="Start campaign dispatch now?"
                onConfirm={() => handleStartCampaign(record.id)}
                okText="Start"
              >
                <Button size="small" type="primary" icon={<PlayCircleOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
          {(record.status === "scheduled" || record.status === "running") && (
            <Tooltip title="Cancel campaign">
              <Popconfirm
                title="Cancel this campaign?"
                onConfirm={() => handleCancelCampaign(record.id)}
                okText="Cancel Campaign"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" danger icon={<StopOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
          {record.status !== "running" && (
            <Tooltip title="Delete campaign">
              <Popconfirm
                title="Delete campaign?"
                description="Are you sure you want to delete this campaign and all its recipient history?"
                onConfirm={() => handleDeleteCampaign(record.id)}
                okText="Delete"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={3} className="!mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <SendOutlined className="text-blue-500" /> Email Campaigns
          </Title>
          <Text type="secondary" className="text-sm">
            Targeted email broadcasts, recipient filter snapshotting, and scheduled audience campaigns.
          </Text>
        </div>
        <Space>
          <Tooltip title="Process due scheduled campaigns and advance active queues">
            <Button
              icon={<SyncOutlined spin={processDueMutation.isPending} />}
              onClick={handleProcessDue}
              loading={processDueMutation.isPending}
            >
              Process Due Queue
            </Button>
          </Tooltip>
          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenWizard}
          >
            New Campaign
          </Button>
        </Space>
      </div>

      {/* KPI Stats Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card size="small" className="shadow-sm border-gray-200 dark:border-gray-800">
            <Text type="secondary" className="text-xs uppercase font-semibold">
              Total Campaigns
            </Text>
            <div className="text-2xl font-bold mt-1 text-gray-800 dark:text-gray-100">
              {totalCount}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" className="shadow-sm border-gray-200 dark:border-gray-800">
            <Text type="secondary" className="text-xs uppercase font-semibold">
              Active / Running
            </Text>
            <div className="text-2xl font-bold mt-1 text-blue-600">
              {campaignsList.filter((c) => c.status === "running" || c.status === "scheduled").length}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" className="shadow-sm border-gray-200 dark:border-gray-800">
            <Text type="secondary" className="text-xs uppercase font-semibold">
              Emails Sent
            </Text>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {totalSentOverall}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" className="shadow-sm border-gray-200 dark:border-gray-800">
            <Text type="secondary" className="text-xs uppercase font-semibold">
              Delivery Success Rate
            </Text>
            <div className="text-2xl font-bold mt-1 text-purple-600">
              {deliveryRate}%
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter and Table */}
      <Card className="shadow-sm border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Input
            placeholder="Search campaigns by name..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
            className="sm:max-w-md"
          />

          <Segmented
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v as CampaignStatus | "all");
              setPage(1);
            }}
            options={[
              { label: "All", value: "all" },
              { label: "Scheduled", value: "scheduled" },
              { label: "Running", value: "running" },
              { label: "Completed", value: "completed" },
              { label: "Draft", value: "draft" },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={campaignsList}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total: totalCount,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} campaigns`,
          }}
          className="mt-4"
        />
      </Card>

      {/* Campaign Creation Wizard Modal */}
      <CampaignWizardModal
        open={wizardOpen}
        onCancel={() => setWizardOpen(false)}
        onSubmit={handleWizardSubmit}
        isSubmitting={createMutation.isPending || startMutation.isPending}
      />

      {/* Campaign Detail Drawer */}
      <CampaignDetailDrawer
        open={drawerOpen}
        campaignId={selectedCampaignId}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
