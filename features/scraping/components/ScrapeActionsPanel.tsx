"use client";

import { AlertOutlined, GlobalOutlined, RedoOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useState } from "react";

import Panel from "@/components/Panel";

interface ScrapeActionsPanelProps {
  onScrapeMissing: () => void;
  onScrapeAll: () => void;
  onRetryFailed: () => void;
  disabled?: boolean;
}

export default function ScrapeActionsPanel({
  onScrapeMissing,
  onScrapeAll,
  onRetryFailed,
  disabled = false,
}: ScrapeActionsPanelProps) {
  const [confirmAllModalOpen, setConfirmAllModalOpen] = useState(false);

  return (
    <Panel
      title="Scraping actions"
      description="Launch background scrape jobs to extract website title, meta description, email addresses and social links."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scrape Missing */}
        <div className="p-4 bg-[var(--lf-subtle)] border border-[var(--lf-border-subtle)] rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold text-[var(--lf-text)] mb-1">
              <GlobalOutlined className="text-[var(--lf-brand)]" />
              <span>Scrape missing</span>
            </div>
            <p className="text-xs text-[var(--lf-text-muted)] mb-4">
              Scrape businesses that have a website URL but have never been scraped yet.
            </p>
          </div>
          <Button
            type="primary"
            onClick={onScrapeMissing}
            disabled={disabled}
            block
          >
            Scrape missing
          </Button>
        </div>

        {/* Retry Failed */}
        <div className="p-4 bg-[var(--lf-subtle)] border border-[var(--lf-border-subtle)] rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold text-[var(--lf-text)] mb-1">
              <RedoOutlined className="text-[var(--lf-warning)]" />
              <span>Retry failed</span>
            </div>
            <p className="text-xs text-[var(--lf-text-muted)] mb-4">
              Re-scrape businesses whose most recent scrape attempt ended in failure.
            </p>
          </div>
          <Button
            onClick={onRetryFailed}
            disabled={disabled}
            block
          >
            Retry failed
          </Button>
        </div>

        {/* Scrape All */}
        <div className="p-4 bg-[var(--lf-subtle)] border border-[var(--lf-border-subtle)] rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold text-[var(--lf-text)] mb-1">
              <AlertOutlined className="text-[var(--lf-brand)]" />
              <span>Scrape all</span>
            </div>
            <p className="text-xs text-[var(--lf-text-muted)] mb-4">
              Re-scrape every business website stored in the database.
            </p>
          </div>
          <Button
            danger
            onClick={() => setConfirmAllModalOpen(true)}
            disabled={disabled}
            block
          >
            Scrape all
          </Button>
        </div>
      </div>

      {/* Confirmation Modal for Scrape All */}
      <Modal
        title="Scrape all businesses?"
        open={confirmAllModalOpen}
        onOk={() => {
          setConfirmAllModalOpen(false);
          onScrapeAll();
        }}
        onCancel={() => setConfirmAllModalOpen(false)}
        okText="Yes, scrape all"
        okButtonProps={{ danger: true }}
      >
        <p className="text-sm text-[var(--lf-text-secondary)] py-2">
          All eligible businesses with a website URL will be queued for processing in a background job.
        </p>
      </Modal>
    </Panel>
  );
}
