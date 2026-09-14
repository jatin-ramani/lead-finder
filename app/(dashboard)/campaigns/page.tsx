"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Input,
  App,
  Popconfirm,
  Pagination,
  Progress,
  Row,
  Segmented,
  Select,
  Skeleton,
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
import EmptyState from "@/components/EmptyState";
import PageContainer from "@/components/ui/PageContainer";

const { Text } = Typography;

export default function CampaignsPage() {
  const { message } = App.useApp();
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
        return <Tag color="success" className="lf-status-badge">COMPLETED</Tag>;
      case "running":
        return <Tag color="processing" icon={<SyncOutlined spin />} className="lf-status-badge">RUNNING</Tag>;
      case "scheduled":
        return <Tag color="processing" className="lf-status-badge">SCHEDULED</Tag>;
      case "failed":
        return <Tag color="error" className="lf-status-badge">FAILED</Tag>;
      case "cancelled":
        return <Tag className="lf-status-badge">CANCELLED</Tag>;
      default:
        return <Tag color="warning" className="lf-status-badge">DRAFT</Tag>;
    }
  };

  const renderCampaignActions = (record: EmailCampaign, mobile = false) => (
    <div className={`flex flex-wrap gap-1.5 ${mobile ? "pt-1" : ""}`}>
      <Tooltip title="View campaign stats and recipient history">
        <Button
          aria-label={`View ${record.name}`}
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleOpenDrawer(record.id)}
        >
          {mobile ? "View" : null}
        </Button>
      </Tooltip>
      {(record.status === "draft" || record.status === "scheduled") && (
        <Tooltip title="Start execution now">
          <Popconfirm
            title="Start campaign dispatch now?"
            onConfirm={() => handleStartCampaign(record.id)}
            okText="Start"
          >
            <Button
              aria-label={`Start ${record.name}`}
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
            >
              {mobile ? "Start" : null}
            </Button>
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
            <Button
              aria-label={`Cancel ${record.name}`}
              size="small"
              danger
              icon={<StopOutlined />}
            >
              {mobile ? "Cancel" : null}
            </Button>
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
            <Button
              aria-label={`Delete ${record.name}`}
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              {mobile ? "Delete" : null}
            </Button>
          </Popconfirm>
        </Tooltip>
      )}
    </div>
  );
  const columns: ColumnsType<EmailCampaign> = [
    {
      title: "Campaign Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: EmailCampaign) => (
        <div>
          <Text strong className="text-[var(--lf-text)]">
            {name}
          </Text>
          <div className="text-xs text-[var(--lf-text-muted)]">
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
            <div className="mb-1 flex justify-between text-xs text-[var(--lf-text-muted)]">
              <span>{sent} sent</span>
              {failed > 0 && <span className="text-[var(--lf-error)]">{failed} failed</span>}
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
              <span className="text-[var(--lf-text-muted)]">Sched: </span>
              <span className="font-mono text-[var(--lf-info)]">
                {new Date(sched).toLocaleDateString()} {new Date(sched).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        }
        return (
          <span className="text-xs text-[var(--lf-text-muted)]">
            Created: {new Date(record.created_at).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record: EmailCampaign) => renderCampaignActions(record),

    },
  ];

  return (
    <PageContainer>
      <div className="lf-page-intro">
        <div className="lf-page-intro-copy">
          <h1 className="lf-page-title flex items-center gap-2">
            <SendOutlined className="text-[var(--lf-brand)]" />
            Email Campaigns
          </h1>
          <Text type="secondary" className="lf-page-subtitle">
            Targeted broadcasts, saved recipient filters, and scheduled audience campaigns.
          </Text>
        </div>
        <div className="lf-page-toolbar">
          <Tooltip title="Process due scheduled campaigns and advance active queues">
            <Button
              icon={<SyncOutlined spin={processDueMutation.isPending} />}
              onClick={handleProcessDue}
              loading={processDueMutation.isPending}
            >
              Process due queue
            </Button>
          </Tooltip>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenWizard}>
            New campaign
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="lf-metric-card">
            <Text type="secondary" className="text-xs font-semibold uppercase tracking-wide">
              Total campaigns
            </Text>
            <div className="mt-1 text-2xl font-bold text-[var(--lf-text)]">{totalCount}</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="lf-metric-card">
            <Text type="secondary" className="text-xs font-semibold uppercase tracking-wide">
              Active / running
            </Text>
            <div className="mt-1 text-2xl font-bold text-[var(--lf-info)]">
              {campaignsList.filter((campaign) => campaign.status === "running" || campaign.status === "scheduled").length}
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="lf-metric-card">
            <Text type="secondary" className="text-xs font-semibold uppercase tracking-wide">
              Emails sent
            </Text>
            <div className="mt-1 text-2xl font-bold text-[var(--lf-success)]">{totalSentOverall}</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="lf-metric-card">
            <Text type="secondary" className="text-xs font-semibold uppercase tracking-wide">
              Delivery rate
            </Text>
            <div className="mt-1 text-2xl font-bold text-[var(--lf-brand)]">{deliveryRate}%</div>
          </Card>
        </Col>
      </Row>

      <Card className="lf-workspace-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Search campaigns by name..."
            prefix={<SearchOutlined className="text-[var(--lf-text-muted)]" />}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            allowClear
            className="w-full sm:max-w-md"
          />

          <div className="w-full sm:w-auto">
            <div className="hidden sm:block">
              <Segmented
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value as CampaignStatus | "all");
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
            <Select
              aria-label="Campaign status"
              className="w-full sm:hidden"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as CampaignStatus | "all");
                setPage(1);
              }}
              options={[
                { label: "All campaigns", value: "all" },
                { label: "Scheduled", value: "scheduled" },
                { label: "Running", value: "running" },
                { label: "Completed", value: "completed" },
                { label: "Draft", value: "draft" },
              ]}
            />
          </div>
        </div>

        <div className="hidden md:block">
          <Table
            columns={columns}
            dataSource={campaignsList}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: page,
              pageSize,
              total: totalCount,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              },
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} campaigns`,
            }}
            className="mt-4"
          />
        </div>

        <div className="lf-mobile-data-list mt-4 md:hidden">
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : campaignsList.length === 0 ? (
            <EmptyState
              compact
              title="No campaigns in this view"
              description="Create a campaign or adjust the current search and status filter."
              action={{ label: "New campaign", onClick: handleOpenWizard, icon: <PlusOutlined /> }}
            />
          ) : (
            campaignsList.map((campaign) => {
              const recipientCount = campaign.recipient_count || 0;
              const sentCount = campaign.sent_count || 0;
              const failedCount = campaign.failed_count || 0;
              const progressPercent = recipientCount > 0
                ? Math.round(((sentCount + failedCount) / recipientCount) * 100)
                : campaign.status === "completed" ? 100 : 0;

              return (
                <article key={campaign.id} className="lf-mobile-data-item">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-[var(--lf-text)]">{campaign.name}</div>
                      <div className="truncate text-xs text-[var(--lf-text-muted)]">
                        Template: {campaign.template_name || `ID #${campaign.template_id}`}
                      </div>
                    </div>
                    {getStatusTag(campaign.status)}
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-[var(--lf-text-muted)]">
                      <span>{sentCount} sent</span>
                      <span>{failedCount > 0 ? `${failedCount} failed · ` : ""}{recipientCount} recipients</span>
                    </div>
                    <Progress
                      percent={progressPercent}
                      size="small"
                      status={campaign.status === "failed" ? "exception" : campaign.status === "completed" ? "success" : "active"}
                    />
                  </div>

                  <div className="mt-3 flex flex-col gap-2 text-xs text-[var(--lf-text-muted)]">
                    <span>
                      {campaign.scheduled_at
                        ? `Scheduled ${new Date(campaign.scheduled_at).toLocaleDateString()} ${new Date(campaign.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : `Created ${new Date(campaign.created_at).toLocaleDateString()}`}
                    </span>
                    {renderCampaignActions(campaign, true)}
                  </div>
                </article>
              );
            })
          )}
          {!isLoading && totalCount > pageSize && (
            <div className="flex justify-center pt-1">
              <Pagination
                simple
                size="small"
                current={page}
                pageSize={pageSize}
                total={totalCount}
                onChange={(nextPage) => setPage(nextPage)}
              />
            </div>
          )}
        </div>
      </Card>

      <CampaignWizardModal
        open={wizardOpen}
        onCancel={() => setWizardOpen(false)}
        onSubmit={handleWizardSubmit}
        isSubmitting={createMutation.isPending || startMutation.isPending}
      />

      <CampaignDetailDrawer
        open={drawerOpen}
        campaignId={selectedCampaignId}
        onClose={() => setDrawerOpen(false)}
      />
    </PageContainer>
  );
}