"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
  MailOutlined,
  PlusOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

import type {
  AutomationCreateInput,
  AutomationFilterParams,
  AutomationTriggerType,
  AutomationUpdateInput,
  EmailAutomation,
} from "@/types/api";
import {
  useAutomations,
  useCreateAutomation,
  useDeleteAutomation,
  useExecutions,
  useProcessDueExecutions,
  useToggleAutomation,
  useUpdateAutomation,
} from "@/features/automations/hooks/useAutomations";
import { AutomationModal } from "@/features/automations/components/AutomationModal";
import { ExecutionLogsDrawer } from "@/features/automations/components/ExecutionLogsDrawer";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const TRIGGER_BADGE_MAP: Record<
  AutomationTriggerType,
  { label: string; color: string }
> = {
  lead_created: { label: "Lead Created", color: "blue" },
  lead_status_changed: { label: "Status Changed", color: "purple" },
  follow_up_due: { label: "Follow-Up Due", color: "cyan" },
  follow_up_overdue: { label: "Follow-Up Overdue", color: "volcano" },
};

export default function AutomationsPage() {
  const [triggerFilter, setTriggerFilter] = useState<AutomationTriggerType | undefined>();
  const [enabledFilter, setEnabledFilter] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Modal and Drawer states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<EmailAutomation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedForLogs, setSelectedForLogs] = useState<EmailAutomation | null>(null);

  // Queries
  const filterParams: AutomationFilterParams = {
    trigger_type: triggerFilter,
    enabled: enabledFilter,
    page,
    page_size: pageSize,
  };
  const { data: automationsData, isLoading, isFetching, refetch } = useAutomations(filterParams);
  const { data: globalExecutions } = useExecutions({ page: 1, page_size: 100 });

  // Mutations
  const createMutation = useCreateAutomation();
  const updateMutation = useUpdateAutomation();
  const toggleMutation = useToggleAutomation();
  const deleteMutation = useDeleteAutomation();
  const processDueMutation = useProcessDueExecutions();

  const automations = automationsData?.items ?? [];
  const totalAutomations = automationsData?.total ?? 0;

  // Calculate high-level stats
  const activeCount = automations.filter((a) => a.enabled).length;
  const execItems = globalExecutions?.items ?? [];
  const sentCount = execItems.filter((e) => e.status === "sent").length;
  const scheduledCount = execItems.filter((e) => e.status === "scheduled").length;
  const failedCount = execItems.filter((e) => e.status === "failed").length;

  const handleOpenCreate = () => {
    setEditingAutomation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (auto: EmailAutomation) => {
    setEditingAutomation(auto);
    setIsModalOpen(true);
  };

  const handleOpenLogs = (auto: EmailAutomation | null = null) => {
    setSelectedForLogs(auto);
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = async (
    values: AutomationCreateInput | AutomationUpdateInput,
  ) => {
    if (editingAutomation) {
      await updateMutation.mutateAsync({
        id: editingAutomation.id,
        payload: values,
      });
    } else {
      await createMutation.mutateAsync(values as AutomationCreateInput);
    }
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: "Automation Rule",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: EmailAutomation) => (
        <div className="space-y-1 max-w-xs">
          <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>{name}</span>
            {!record.enabled && <Tag color="default">Paused</Tag>}
          </div>
          {record.description && (
            <div className="text-xs text-gray-500 line-clamp-1">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trigger Event",
      dataIndex: "trigger_type",
      key: "trigger_type",
      render: (trigger: AutomationTriggerType) => {
        const badge = TRIGGER_BADGE_MAP[trigger] || { label: trigger, color: "blue" };
        return <Tag color={badge.color}>{badge.label}</Tag>;
      },
    },
    {
      title: "Subject Template",
      dataIndex: "subject_template",
      key: "subject_template",
      render: (subject: string) => (
        <div className="font-mono text-xs text-gray-700 dark:text-gray-300 max-w-sm truncate" title={subject}>
          {subject}
        </div>
      ),
    },
    {
      title: "Delay",
      dataIndex: "delay_minutes",
      key: "delay_minutes",
      render: (mins: number) => (
        <Space size={4}>
          <ClockCircleOutlined className="text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {mins === 0 ? "Immediate" : `${mins}m delay`}
          </span>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "enabled",
      key: "enabled",
      render: (enabled: boolean, record: EmailAutomation) => (
        <Switch
          checked={enabled}
          loading={toggleMutation.isPending && toggleMutation.variables?.id === record.id}
          onChange={(checked) =>
            toggleMutation.mutate({ id: record.id, enabled: checked })
          }
          checkedChildren="Active"
          unCheckedChildren="Paused"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: EmailAutomation) => (
        <Space size="small">
          <Tooltip title="View execution history">
            <Button
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => handleOpenLogs(record)}
            >
              Logs
            </Button>
          </Tooltip>
          <Tooltip title="Edit automation">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Automation"
            description="Are you sure you want to delete this automation and its scheduled executions?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} aria-label="Delete automation" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={2} className="!mb-1 flex items-center gap-2">
            <MailOutlined className="text-blue-500" />
            Email Automations
          </Title>
          <Paragraph type="secondary" className="!mb-0 text-sm">
            Event-driven email campaigns triggered by lead discovery, follow-ups, and CRM status changes.
          </Paragraph>
        </div>

        <Space wrap>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => handleOpenLogs(null)}
          >
            All Dispatch Logs
          </Button>
          <Button
            icon={<ThunderboltOutlined />}
            loading={processDueMutation.isPending}
            onClick={() => processDueMutation.mutate(50)}
          >
            Process Queue Now
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            New Automation
          </Button>
        </Space>
      </div>

      {/* KPI Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <Statistic
              title={<Text type="secondary">Active Rules</Text>}
              value={activeCount}
              suffix={`/ ${totalAutomations}`}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <Statistic
              title={<Text type="secondary">Emails Sent</Text>}
              value={sentCount}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <Statistic
              title={<Text type="secondary">Scheduled / Due</Text>}
              value={scheduledCount}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <Statistic
              title={<Text type="secondary">Failed / Retries</Text>}
              value={failedCount}
              valueStyle={{ color: failedCount > 0 ? "#ff4d4f" : undefined }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card with Filter Bar */}
      <Card
        className="border border-gray-200 dark:border-gray-800 shadow-sm"
        title={
          <div className="flex flex-wrap items-center justify-between gap-3 py-1">
            <Space wrap>
              <Select
                placeholder="Filter by Trigger"
                allowClear
                style={{ width: 180 }}
                value={triggerFilter}
                onChange={(val) => {
                  setTriggerFilter(val);
                  setPage(1);
                }}
              >
                <Option value="lead_created">Lead Created</Option>
                <Option value="lead_status_changed">Status Changed</Option>
                <Option value="follow_up_due">Follow-Up Due</Option>
                <Option value="follow_up_overdue">Follow-Up Overdue</Option>
              </Select>

              <Select
                placeholder="Filter by State"
                allowClear
                style={{ width: 140 }}
                value={enabledFilter}
                onChange={(val) => {
                  setEnabledFilter(val);
                  setPage(1);
                }}
              >
                <Option value={true}>Active Only</Option>
                <Option value={false}>Paused Only</Option>
              </Select>
            </Space>

            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => void refetch()}
              size="small"
            >
              Refresh
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={automations}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total: totalAutomations,
            onChange: (p) => setPage(p),
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} rules`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No email automations configured yet. Create one to start automated outreach!"
              >
                <Button type="primary" onClick={handleOpenCreate} icon={<PlusOutlined />}>
                  Create First Automation
                </Button>
              </Empty>
            ),
          }}
        />
      </Card>

      {/* Modals & Drawers */}
      <AutomationModal
        open={isModalOpen}
        editingAutomation={editingAutomation}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ExecutionLogsDrawer
        open={isDrawerOpen}
        automation={selectedForLogs}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
