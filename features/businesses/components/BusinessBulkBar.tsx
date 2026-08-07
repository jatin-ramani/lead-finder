"use client";

import { CloseOutlined, DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

interface BusinessBulkBarProps {
  count: number;
  onClear: () => void;
  onExport: () => void;
  onDelete: () => void;
  isExporting: boolean;
  isDeleting: boolean;
}

/**
 * Actions for the current selection.
 *
 * Appears only when something is selected, and says how many — a bulk delete
 * with no count is how people delete more than they meant to.
 *
 * `role="status"` so its appearance is announced: a screen-reader user ticking
 * checkboxes would otherwise get no signal that a new set of controls exists.
 */
export default function BusinessBulkBar({
  count,
  onClear,
  onExport,
  onDelete,
  isExporting,
  isDeleting,
}: BusinessBulkBarProps) {
  if (count === 0) return null;

  const noun = count === 1 ? "business" : "businesses";

  return (
    <div className="lf-bulk-bar" role="status" aria-live="polite">
      <span className="lf-bulk-count">
        <strong>{count}</strong> {noun} selected
      </span>

      <div className="lf-bulk-actions">
        <Button
          size="small"
          icon={<DownloadOutlined aria-hidden />}
          onClick={onExport}
          loading={isExporting}
          disabled={isExporting || isDeleting}
        >
          Export selected
        </Button>

        <Button
          size="small"
          danger
          icon={<DeleteOutlined aria-hidden />}
          onClick={onDelete}
          loading={isDeleting}
          disabled={isExporting || isDeleting}
        >
          Delete
        </Button>

        <Button
          size="small"
          type="text"
          icon={<CloseOutlined aria-hidden />}
          onClick={onClear}
          disabled={isDeleting}
          aria-label="Clear selection"
        />
      </div>
    </div>
  );
}
