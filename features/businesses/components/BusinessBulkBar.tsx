"use client";

import { CloseOutlined, DeleteOutlined, DownloadOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useState } from "react";

interface BusinessBulkBarProps {
  count: number;
  onClear: () => void;
  onExport: () => void;
  onDelete: () => void;
  onScrapeSelected?: () => void;
  onBulkTag?: () => void;
  isExporting: boolean;
  isDeleting: boolean;
  isScrapingSelected?: boolean;
}

export default function BusinessBulkBar({
  count,
  onClear,
  onExport,
  onDelete,
  onScrapeSelected,
  onBulkTag,
  isExporting,
  isDeleting,
  isScrapingSelected = false,
}: BusinessBulkBarProps) {
  const [scrapeConfirmModalOpen, setScrapeConfirmModalOpen] = useState(false);

  if (count === 0) return null;

  const noun = count === 1 ? "business" : "businesses";

  return (
    <div className="lf-bulk-bar" role="status" aria-live="polite">
      <span className="lf-bulk-count">
        <strong>{count}</strong> {noun} selected
      </span>

      <div className="lf-bulk-actions">
        {onBulkTag && (
          <Button
            size="small"
            onClick={onBulkTag}
            disabled={isExporting || isDeleting || isScrapingSelected}
          >
            Tag selected
          </Button>
        )}

        {onScrapeSelected && (
          <Button
            size="small"
            type="primary"
            icon={<ThunderboltOutlined aria-hidden />}
            onClick={() => setScrapeConfirmModalOpen(true)}
            loading={isScrapingSelected}
            disabled={isExporting || isDeleting || isScrapingSelected}
          >
            Scrape selected
          </Button>
        )}

        <Button
          size="small"
          icon={<DownloadOutlined aria-hidden />}
          onClick={onExport}
          loading={isExporting}
          disabled={isExporting || isDeleting || isScrapingSelected}
        >
          Export selected
        </Button>

        <Button
          size="small"
          danger
          icon={<DeleteOutlined aria-hidden />}
          onClick={onDelete}
          loading={isDeleting}
          disabled={isExporting || isDeleting || isScrapingSelected}
        >
          Delete
        </Button>

        <Button
          size="small"
          type="text"
          icon={<CloseOutlined aria-hidden />}
          onClick={onClear}
          disabled={isDeleting || isScrapingSelected}
          aria-label="Clear selection"
        />
      </div>

      <Modal
        title={`Scrape ${count} selected ${noun}?`}
        open={scrapeConfirmModalOpen}
        onOk={() => {
          setScrapeConfirmModalOpen(false);
          onScrapeSelected?.();
        }}
        onCancel={() => setScrapeConfirmModalOpen(false)}
        okText="Start scrape job"
        okButtonProps={{ type: "primary" }}
      >
        <p className="text-sm text-gray-600 dark:text-gray-300 py-2">
          Only businesses in your selection that have a website URL will be scraped.
        </p>
      </Modal>
    </div>
  );
}
