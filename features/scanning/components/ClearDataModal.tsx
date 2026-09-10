"use client";

import { ExclamationCircleFilled, DeleteOutlined } from "@ant-design/icons";
import { Alert, Button, Input, Modal, Typography } from "antd";
import { useState } from "react";

const { Text, Paragraph } = Typography;

interface ClearDataModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isClearing: boolean;
}

export default function ClearDataModal({
  open,
  onClose,
  onConfirm,
  isClearing,
}: ClearDataModalProps) {
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() === "clear") {
      await onConfirm();
      setConfirmText("");
      onClose();
    }
  };

  const handleCancel = () => {
    setConfirmText("");
    onClose();
  };

  const isMatch = confirmText.toLowerCase() === "clear";

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={
        <div className="flex items-center gap-2 text-[var(--lf-error)]">
          <ExclamationCircleFilled />
          <span>Clear All Scanned Business Leads</span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isClearing}>
          Cancel
        </Button>,
        <Button
          key="clear"
          type="primary"
          danger
          icon={<DeleteOutlined />}
          loading={isClearing}
          disabled={!isMatch || isClearing}
          onClick={handleConfirm}
        >
          Confirm & Delete Leads
        </Button>,
      ]}
    >
      <div className="flex flex-col gap-3 py-2">
        <Alert
          type="warning"
          showIcon
          message="Destructive Action"
          description="This will delete all discovered business leads and their associated activity logs and follow-ups."
        />

        <Paragraph className="text-sm text-[var(--lf-text-secondary)]">
          <strong>What will be deleted:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>All scanned businesses & website scraping records</li>
            <li>Business notes, tags, and activity history</li>
            <li>CRM follow-ups and email campaign recipient logs</li>
          </ul>
        </Paragraph>

        <Paragraph className="text-sm text-[var(--lf-text-secondary)]">
          <strong>What will be PRESERVED safely:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>Admin user accounts and login sessions</li>
            <li>Cold email templates & automation configurations</li>
            <li>Gmail OAuth credentials and connection settings</li>
          </ul>
        </Paragraph>

        <div className="pt-2">
          <Text className="text-xs text-[var(--lf-text-muted)] block mb-1">
            Type <strong className="text-[var(--lf-error)]">clear</strong> below to confirm deletion:
          </Text>
          <Input
            placeholder="Type 'clear' to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            status={confirmText && !isMatch ? "error" : ""}
            disabled={isClearing}
          />
        </div>
      </div>
    </Modal>
  );
}
