"use client";

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import { queryKeys, tagsApi } from "@/services";
import type { Tag } from "@/types/api";

const { Text } = Typography;

interface TagManagementModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TagManagementModal({
  open,
  onClose,
}: TagManagementModalProps) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState("");

  const { data: tagsData, isLoading } = useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: () => tagsApi.listTags(),
    enabled: open,
  });

  const tags: Tag[] = tagsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (name: string) => tagsApi.createTag({ name }),
    onSuccess: (created: Tag) => {
      message.success(`Tag "${created.name}" created`);
      setNewTagName("");
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
    },
    onError: (err: unknown) => {
      message.error(err instanceof Error ? err.message : "Failed to create tag");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      tagsApi.updateTag(id, { name }),
    onSuccess: (updated: Tag) => {
      message.success(`Tag renamed to "${updated.name}"`);
      setEditingTag(null);
      setEditName("");
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
    },
    onError: (err: unknown) => {
      message.error(err instanceof Error ? err.message : "Failed to rename tag");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tagsApi.deleteTag(id),
    onSuccess: () => {
      message.success("Tag deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
    },
    onError: (err: unknown) => {
      message.error(err instanceof Error ? err.message : "Failed to delete tag");
    },
  });

  const handleCreate = () => {
    if (!newTagName.trim()) return;
    createMutation.mutate(newTagName.trim());
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
  };

  const handleSaveEdit = () => {
    if (!editingTag || !editName.trim()) return;
    updateMutation.mutate({ id: editingTag.id, name: editName.trim() });
  };

  const columns: ColumnsType<Tag> = [
    {
      title: "Tag Name",
      key: "name",
      render: (_value, record) =>
        editingTag?.id === record.id ? (
          <Space>
            <Input
              size="small"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onPressEnter={handleSaveEdit}
              autoFocus
              className="w-40"
            />
            <Button
              size="small"
              type="primary"
              onClick={handleSaveEdit}
              loading={updateMutation.isPending}
            >
              Save
            </Button>
            <Button size="small" onClick={() => setEditingTag(null)}>
              Cancel
            </Button>
          </Space>
        ) : (
          <div className="flex items-center gap-2">
            <span className="lf-custom-tag-pill">{record.name}</span>
            <Text type="secondary" className="text-xs">
              ({record.slug})
            </Text>
          </div>
        ),
    },
    {
      title: "Used By",
      dataIndex: "business_count",
      key: "business_count",
      width: 130,
      render: (count: number) => (
        <span className="lf-num text-xs font-semibold text-[var(--lf-text)]">
          {count ?? 0} {count === 1 ? "business" : "businesses"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center",
      render: (_value, record) => (
        <Space size="small">
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            aria-label={`Rename ${record.name}`}
            onClick={() => handleStartEdit(record)}
          />
          <Popconfirm
            title="Delete tag"
            description={`Are you sure you want to delete "${record.name}"? This removes the tag from ${record.business_count ?? 0} businesses. Businesses will NOT be deleted.`}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${record.name}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <TagsOutlined />
          <span>Manage Custom Tags</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Done
        </Button>,
      ]}
      width={560}
      destroyOnHidden
      className="lf-modal"
    >
      <div className="flex flex-col gap-4 my-2">
        <div className="flex gap-2">
          <Input
            placeholder="New tag name (e.g. Hot Lead, Gujarati, Follow Up)"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onPressEnter={handleCreate}
            maxLength={50}
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            loading={createMutation.isPending}
            disabled={!newTagName.trim()}
          >
            Create Tag
          </Button>
        </div>

        <Table<Tag>
          rowKey="id"
          columns={columns}
          dataSource={tags}
          loading={isLoading}
          pagination={false}
          size="small"
          scroll={{ y: 320 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No custom tags created yet."
              />
            ),
          }}
        />
      </div>
    </Modal>
  );
}
