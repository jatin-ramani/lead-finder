"use client";

import React from "react";
import { Alert, Button, Modal, Tag, Typography } from "antd";
import {
  ExclamationCircleOutlined,
  MailOutlined,
  SendOutlined,
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;

interface TestEmailConfirmModalProps {
  open: boolean;
  recipientEmail: string;
  selectedGrades?: string[];
  quotaRemaining: number;
  quotaLimit: number;
  onCancel: () => void;
  onConfirm: () => void;
  isSending: boolean;
}

export const TestEmailConfirmModal: React.FC<TestEmailConfirmModalProps> = ({
  open,
  recipientEmail,
  quotaRemaining,
  quotaLimit,
  onCancel,
  onConfirm,
  isSending,
}) => {
  return (
    <Modal
      open={open}
      onCancel={isSending ? undefined : onCancel}
      title={
        <div className="flex items-center gap-2 text-base font-semibold">
          <MailOutlined className="text-blue-600" />
          <span>Confirm Test Email Send</span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isSending}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          icon={<SendOutlined />}
          loading={isSending}
          onClick={onConfirm}
          className="bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          Send Test Email
        </Button>,
      ]}
      className="rounded-xl"
      centered
      destroyOnClose
    >
      <div className="space-y-4 py-2">
        <Paragraph className="!mb-2">
          You are about to dispatch a real test cold email to:
        </Paragraph>

        <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3 rounded-lg flex items-center justify-between">
          <Text strong className="text-blue-700 dark:text-blue-400 text-sm font-mono break-all">
            {recipientEmail}
          </Text>
          <Tag color="cyan" className="rounded-full font-medium ml-2 shrink-0">
            Destination
          </Tag>
        </div>

        <div>
          <Text type="secondary" className="text-xs block mb-2 font-medium">
            Active Template:
          </Text>
          <Tag color="purple" className="font-semibold text-xs px-2.5 py-0.5">
            Universal Master Cold Email
          </Tag>
        </div>

        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="Daily Safety Quota Notice"
          description={
            <div className="text-xs space-y-1">
              <p className="!mb-0">
                This test email will be delivered via your connected Gmail API account and
                <strong> counts toward the daily {quotaLimit}-email safety quota</strong>.
              </p>
              <p className="!mb-0 text-gray-500">
                Remaining quota today: <strong>{quotaRemaining}</strong> sends.
              </p>
            </div>
          }
          className="border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20"
        />

        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
          🔒 <strong>Safe Mock Lead Data:</strong> Template variables will be populated with realistic sample data. No CRM leads or campaign records will be written to the database.
        </div>
      </div>
    </Modal>
  );
};
