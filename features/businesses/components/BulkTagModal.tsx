"use client";

import { TagsOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Modal, Radio, Select, Typography } from "antd";
import { useState } from "react";

import { queryKeys, tagsApi } from "@/services";
import type { BulkTagActionResponse, Tag } from "@/types/api";

const { Text } = Typography;

interface BulkTagModalProps {
  open: boolean;
  onClose: () => void;
  selectedIds: number[];
  onComplete?: () => void;
}

export default function BulkTagModal({
  open,
  onClose,
  selectedIds,
  onComplete,
}: BulkTagModalProps) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"add" | "remove">("add");
  const [selectedTagId, setSelectedTagId] = useState<number | undefined>(undefined);
  const [customTagName, setCustomTagName] = useState<string>("");

  const { data: tagsData, isLoading } = useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: () => tagsApi.listTags(),
    enabled: open,
  });

  const tags: Tag[] = tagsData?.data || [];

  const attachMutation = useMutation({
    mutationFn: (params: { tagId?: number; tagName?: string }) =>
      tagsApi.bulkAttachTag({
        businessIds: selectedIds,
        tagId: params.tagId,
        tagName: params.tagName,
      }),
    onSuccess: (res: BulkTagActionResponse) => {
      message.success(
        res.message || `Tag applied to ${res.updated_count} businesses`
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      onComplete?.();
      handleClose();
    },
    onError: (err: unknown) => {
      message.error(err instanceof Error ? err.message : "Failed to bulk apply tag");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (tagId: number) =>
      tagsApi.bulkRemoveTag({
        businessIds: selectedIds,
        tagId,
      }),
    onSuccess: (res: BulkTagActionResponse) => {
      message.success(
        res.message || `Tag removed from ${res.updated_count} businesses`
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      onComplete?.();
      handleClose();
    },
    onError: (err: unknown) => {
      message.error(err instanceof Error ? err.message : "Failed to bulk remove tag");
    },
  });

  const handleClose = () => {
    setSelectedTagId(undefined);
    setCustomTagName("");
    onClose();
  };

  const handleApply = () => {
    if (mode === "add") {
      if (selectedTagId) {
        attachMutation.mutate({ tagId: selectedTagId });
      } else if (customTagName.trim()) {
        attachMutation.mutate({ tagName: customTagName.trim() });
      }
    } else {
      if (selectedTagId) {
        removeMutation.mutate(selectedTagId);
      }
    }
  };

  const isSubmitting = attachMutation.isPending || removeMutation.isPending;
  const canSubmit =
    mode === "add"
      ? Boolean(selectedTagId || customTagName.trim())
      : Boolean(selectedTagId);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <TagsOutlined />
          <span>{mode === "add" ? "Bulk Add Tag" : "Bulk Remove Tag"}</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      onOk={handleApply}
      okText={mode === "add" ? "Apply Tag" : "Remove Tag"}
      okButtonProps={{
        loading: isSubmitting,
        disabled: !canSubmit,
        danger: mode === "remove",
      }}
      destroyOnHidden
      className="lf-modal"
    >
      <div className="flex flex-col gap-4 my-2">
        <Text type="secondary" className="text-xs">
          Targeting{" "}
          <strong className="text-[var(--lf-text)] font-semibold">
            {selectedIds.length}
          </strong>{" "}
          selected {selectedIds.length === 1 ? "business" : "businesses"}.
        </Text>

        <div>
          <label className="text-xs font-semibold text-[var(--lf-text-muted)] mb-1.5 block">
            Action Mode
          </label>
          <Radio.Group
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setSelectedTagId(undefined);
              setCustomTagName("");
            }}
            optionType="button"
            buttonStyle="solid"
            className="w-full"
          >
            <Radio.Button value="add" className="w-1/2 text-center">
              Add Tag
            </Radio.Button>
            <Radio.Button value="remove" className="w-1/2 text-center">
              Remove Tag
            </Radio.Button>
          </Radio.Group>
        </div>

        {mode === "add" ? (
          <div>
            <label className="text-xs font-semibold text-[var(--lf-text-muted)] mb-1.5 block">
              Choose or Type Tag
            </label>
            <Select
              showSearch
              placeholder="Select an existing tag or type to create"
              value={selectedTagId}
              onChange={(val) => {
                setSelectedTagId(val);
                setCustomTagName("");
              }}
              onSearch={(text) => setCustomTagName(text)}
              loading={isLoading}
              className="w-full"
              options={tags.map((t: Tag) => ({
                label: `${t.name} (${t.business_count ?? 0})`,
                value: t.id,
              }))}
              filterOption={(input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-[var(--lf-text-muted)] mb-1.5 block">
              Tag to Remove
            </label>
            <Select
              placeholder="Select tag to detach"
              value={selectedTagId}
              onChange={(val) => setSelectedTagId(val)}
              loading={isLoading}
              className="w-full"
              options={tags.map((t: Tag) => ({
                label: `${t.name} (${t.business_count ?? 0})`,
                value: t.id,
              }))}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
