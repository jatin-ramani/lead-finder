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
import EmptyState from "@/components/EmptyState";
import PageContainer from "@/components/ui/PageContainer";

const { Text, Paragraph } = Typography;

export default function TemplatesPage() {
  const { message } = App.useApp();
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

  const getGradeTag = (name: string, desc?: string | null) => {
    const text = `${name} ${desc || ""}`.toUpperCase();
    if (text.includes("GRADE A")) return <Tag color="success" className="lf-status-badge font-semibold">Grade A</Tag>;
    if (text.includes("GRADE B")) return <Tag color="processing" className="lf-status-badge font-semibold">Grade B</Tag>;
    if (text.includes("GRADE C")) return <Tag color="warning" className="lf-status-badge font-semibold">Grade C</Tag>;
    if (text.includes("GRADE D")) return <Tag className="lf-status-badge font-semibold">Grade D</Tag>;
    return null;
  };

  const renderTemplateActions = (template: EmailTemplate, mobile = false) => (
    <div className={`flex flex-wrap gap-1.5 ${mobile ? "pt-1" : ""}`}>
      <Tooltip title="Preview template with sample context">
        <Button
          aria-label={`Preview ${template.name}`}
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleOpenPreview(template)}
        >
          {mobile ? "Preview" : null}
        </Button>
      </Tooltip>
      <Tooltip title="Edit template">
        <Button
          aria-label={`Edit ${template.name}`}
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleOpenEdit(template)}
        >
          {mobile ? "Edit" : null}
        </Button>
      </Tooltip>
      <Tooltip title={template.is_archived ? "Restore to active" : "Archive template"}>
        <Button
          aria-label={`${template.is_archived ? "Restore" : "Archive"} ${template.name}`}
          size="small"
          icon={<InboxOutlined />}
          onClick={() => handleToggleArchive(template)}
        >
          {mobile ? (template.is_archived ? "Restore" : "Archive") : null}
        </Button>
      </Tooltip>
      <Popconfirm
        title="Delete template?"
        description="Are you sure you want to delete this template? Active or historical campaigns referencing it will prevent deletion."
        onConfirm={() => handleDelete(template.id)}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <Button
          aria-label={`Delete ${template.name}`}
          size="small"
          danger
          icon={<DeleteOutlined />}
        >
          {mobile ? "Delete" : null}
        </Button>
      </Popconfirm>
    </div>
  );
  const columns: ColumnsType<EmailTemplate> = [
    {
      title: "Template Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: EmailTemplate) => (
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Text strong className="text-[var(--lf-text)]">
              {name}
            </Text>
            {getGradeTag(record.name, record.description)}
            {record.is_archived && <Tag className="lf-status-badge">Archived</Tag>}
          </div>
          {record.description && (
            <div className="mt-0.5 text-xs text-[var(--lf-text-muted)]">{record.description}</div>
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
          className="mb-0 font-mono text-xs text-[var(--lf-text-secondary)]"
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
        <span className="text-xs text-[var(--lf-text-muted)]">
          {new Date(d).toLocaleDateString()} {new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record: EmailTemplate) => renderTemplateActions(record),
    },
  ];

  return (
    <PageContainer>
      <div className="lf-page-intro">
        <div className="lf-page-intro-copy">
          <h1 className="lf-page-title flex items-center gap-2">
            <FileTextOutlined className="text-[var(--lf-brand)]" />
            Email Templates
          </h1>
          <Text type="secondary" className="lf-page-subtitle">
            Create and maintain reusable, safe templates for automated outreach.
          </Text>
        </div>
        <div className="lf-page-toolbar">
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            New template
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8}>
          <Card size="small" className="lf-metric-card">
            <Text type="secondary" className="text-xs font-semibold uppercase tracking-wide">
              Total templates
            </Text>
            <div className="mt-1 text-2xl font-bold text-[var(--lf-text)]">{totalCount}</div>
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small" className="lf-metric-card">
            <Text type="secondary" className="text-xs font-semibold uppercase tracking-wide">
              Current view
            </Text>
            <div className="mt-1 text-xl font-semibold capitalize text-[var(--lf-brand)]">
              {filterArchived} templates
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="lf-metric-card">
            <Text type="secondary" className="text-xs font-semibold uppercase tracking-wide">
              Supported placeholders
            </Text>
            <div className="mt-1 text-sm font-medium text-[var(--lf-text-secondary)]">
              9 dynamic variables (XSS escaped)
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="lf-workspace-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Search templates by name or subject..."
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
                value={filterArchived}
                onChange={(value) => {
                  setFilterArchived(value as "active" | "all" | "archived");
                  setPage(1);
                }}
                options={[
                  { label: "Active", value: "active" },
                  { label: "All templates", value: "all" },
                  { label: "Archived", value: "archived" },
                ]}
              />
            </div>
            <Select
              aria-label="Template status"
              className="w-full sm:hidden"
              value={filterArchived}
              onChange={(value) => {
                setFilterArchived(value as "active" | "all" | "archived");
                setPage(1);
              }}
              options={[
                { label: "Active templates", value: "active" },
                { label: "All templates", value: "all" },
                { label: "Archived templates", value: "archived" },
              ]}
            />
          </div>
        </div>

        <div className="hidden md:block">
          <Table
            columns={columns}
            dataSource={templatesList}
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
              showTotal: (total) => `Total ${total} templates`,
            }}
            className="mt-4"
          />
        </div>

        <div className="lf-mobile-data-list mt-4 md:hidden">
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : templatesList.length === 0 ? (
            <EmptyState
              compact
              title="No templates in this view"
              description="Create a template or adjust the current search and archive filter."
              action={{ label: "New template", onClick: handleOpenCreate, icon: <PlusOutlined /> }}
            />
          ) : (
            templatesList.map((template) => (
              <article key={template.id} className="lf-mobile-data-item">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[var(--lf-text)]">{template.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {getGradeTag(template.name, template.description)}
                      {template.is_archived && <Tag className="lf-status-badge">Archived</Tag>}
                    </div>
                  </div>

                </div>

                {template.description && (
                  <p className="mt-3 line-clamp-2 text-xs text-[var(--lf-text-muted)]">
                    {template.description}
                  </p>
                )}
                <div className="mt-3">{renderTemplateActions(template, true)}</div>
                  <div className="mt-3 border-t border-[var(--lf-border)] pt-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-[var(--lf-text-muted)]">Subject</div>
                  <div className="mt-1 line-clamp-2 font-mono text-xs text-[var(--lf-text-secondary)]">
                    {template.subject}
                  </div>
                  <div className="mt-2 text-xs text-[var(--lf-text-muted)]">
                    Created {new Date(template.created_at).toLocaleDateString()} {new Date(template.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </article>
            ))
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
    </PageContainer>
  );
}