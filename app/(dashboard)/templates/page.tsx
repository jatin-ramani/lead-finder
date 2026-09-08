"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Popconfirm,
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
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import type { EmailTemplate, TemplateCreateInput, TemplateUpdateInput } from "@/types/api";
import {
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
  useToggleTemplateArchive,
  useUpdateTemplate,
} from "@/features/templates/hooks/useTemplates";
import { TemplateModal } from "@/features/templates/components/TemplateModal";
import { TemplatePreviewModal } from "@/features/templates/components/TemplatePreviewModal";

const { Title, Text, Paragraph } = Typography;

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [filterArchived, setFilterArchived] = useState<"active" | "all" | "archived">("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const isArchivedQuery =
    filterArchived === "active" ? false : filterArchived === "archived" ? true : undefined;

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useTemplates({
    search: search || undefined,
    is_archived: isArchivedQuery,
    page,
    page_size: pageSize,
  });

  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const archiveMutation = useToggleTemplateArchive();
  const deleteMutation = useDeleteTemplate();

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setModalOpen(true);
  };

  const handleOpenPreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleModalSubmit = async (values: TemplateCreateInput | TemplateUpdateInput) => {
    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({
          id: editingTemplate.id,
          payload: values as TemplateUpdateInput,
        });
        message.success("Template updated successfully");
      } else {
        await createMutation.mutateAsync(values as TemplateCreateInput);
        message.success("Template created successfully");
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Operation failed";
      message.error(errorMsg);
    }
  };

  const handleToggleArchive = async (template: EmailTemplate) => {
    try {
      await archiveMutation.mutateAsync({
        id: template.id,
        is_archived: !template.is_archived,
      });
      message.success(
        `Template ${template.is_archived ? "restored to active" : "archived"} successfully`
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to toggle archive state";
      message.error(errorMsg);
    }
  };

  const handleDelete = async (templateId: number) => {
    try {
      await deleteMutation.mutateAsync(templateId);
      message.success("Template deleted successfully");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete template";
      message.error(errorMsg);
    }
  };

  const templatesList = data?.items || [];
  const totalCount = data?.total || 0;

  const columns: ColumnsType<EmailTemplate> = [
    {
      title: "Template Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: EmailTemplate) => (
        <div>
          <Space>
            <Text strong className="text-gray-800 dark:text-gray-100">
              {name}
            </Text>
            {record.is_archived && <Tag color="default">Archived</Tag>}
          </Space>
          {record.description && (
            <div className="text-xs text-gray-400 mt-0.5">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: "Email Subject",
      dataIndex: "subject",
      key: "subject",
      render: (subj: string) => (
        <Paragraph
          ellipsis={{ rows: 2 }}
          className="text-xs text-gray-600 dark:text-gray-300 font-mono mb-0"
        >
          {subj}
        </Paragraph>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 170,
      render: (d: string) => (
        <span className="text-xs text-gray-500">
          {new Date(d).toLocaleDateString()} {new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record: EmailTemplate) => (
        <Space size={6}>
          <Tooltip title="Preview template with sample context">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleOpenPreview(record)}
            />
          </Tooltip>
          <Tooltip title="Edit template">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.is_archived ? "Restore to active" : "Archive template"}>
            <Button
              size="small"
              icon={<InboxOutlined />}
              onClick={() => handleToggleArchive(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete template?"
            description="Are you sure you want to delete this template? Active or historical campaigns referencing it will prevent deletion."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
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
            <FileTextOutlined className="text-blue-500" /> Email Templates
          </Title>
          <Text type="secondary" className="text-sm">
            Create and maintain reusable email templates with allowlisted dynamic variables for automated outreach.
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            New Template
          </Button>
        </Space>
      </div>

      {/* KPI Stats Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card size="small" className="shadow-sm border-gray-200 dark:border-gray-800">
            <Text type="secondary" className="text-xs uppercase font-semibold">
              Total Templates
            </Text>
            <div className="text-2xl font-bold mt-1 text-gray-800 dark:text-gray-100">
              {totalCount}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="shadow-sm border-gray-200 dark:border-gray-800">
            <Text type="secondary" className="text-xs uppercase font-semibold">
              Filter View
            </Text>
            <div className="text-xl font-semibold mt-1 text-blue-600 capitalize">
              {filterArchived} Templates
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="shadow-sm border-gray-200 dark:border-gray-800">
            <Text type="secondary" className="text-xs uppercase font-semibold">
              Supported Placeholders
            </Text>
            <div className="text-sm font-medium mt-1 text-gray-600 dark:text-gray-300">
              9 Dynamic Variables (XSS Escaped)
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter and Search Bar */}
      <Card className="shadow-sm border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Input
            placeholder="Search templates by name or subject..."
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
            value={filterArchived}
            onChange={(v) => {
              setFilterArchived(v as "active" | "all" | "archived");
              setPage(1);
            }}
            options={[
              { label: "Active", value: "active" },
              { label: "All Templates", value: "all" },
              { label: "Archived", value: "archived" },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={templatesList}
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
            showTotal: (total) => `Total ${total} templates`,
          }}
          className="mt-4"
        />
      </Card>

      {/* Modals */}
      <TemplateModal
        open={modalOpen}
        editingTemplate={editingTemplate}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <TemplatePreviewModal
        open={previewOpen}
        template={previewTemplate}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
