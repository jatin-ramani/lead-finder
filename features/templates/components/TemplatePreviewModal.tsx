"use client";

import React from "react";
import { Alert, Card, Col, Divider, Modal, Row, Space, Tag, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { EmailTemplate } from "@/types/api";

const { Text } = Typography;

interface TemplatePreviewModalProps {
  open: boolean;
  template: EmailTemplate | null;
  onClose: () => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  open,
  template,
  onClose,
}) => {
  if (!template) return null;

  const sampleData: Record<string, string> = {
    business_name: "Apex Healthcare Clinic",
    contact_name: "Dr. Sarah Smith",
    email: "sarah@apexhealth.example",
    phone: "+1 (555) 234-5678",
    website: "https://apexhealth.example",
    lead_status: "Interested",
    lead_score: "85",
    follow_up_title: "Send website redesign proposal",
    follow_up_due_at: "2026-09-15 14:00 UTC",
  };

  const renderPreviewText = (text: string) => {
    return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      return sampleData[key.toLowerCase()] ?? `[${key}]`;
    });
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <EyeOutlined className="text-blue-500" />
          <span>Template Preview: {template.name}</span>
          {template.is_archived && <Tag color="default">Archived</Tag>}
        </Space>
      }
      width={720}
      onCancel={onClose}
      footer={null}
    >
      <div className="space-y-4 py-2">
        <Alert
          type="info"
          showIcon
          message="Rendered with sample lead attributes"
          description="Variables are dynamically populated using real lead data at dispatch time."
        />

        <Card
          title={
            <Space direction="vertical" size={2} className="w-full">
              <Text type="secondary" className="text-xs">
                SUBJECT:
              </Text>
              <Text strong className="text-base text-gray-800 dark:text-gray-100">
                {renderPreviewText(template.subject)}
              </Text>
            </Space>
          }
          className="border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="mb-3 text-xs text-gray-400 border-b pb-2">
            To: <span className="font-mono text-gray-600 dark:text-gray-300">{sampleData.email}</span>
          </div>
          <div className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-200 leading-relaxed min-h-[140px]">
            {renderPreviewText(template.body)}
          </div>
        </Card>

        <Divider className="my-2" />

        <Card size="small" title="Mock Sample Context" className="bg-gray-50 dark:bg-gray-800 text-xs">
          <Row gutter={[8, 8]}>
            {Object.entries(sampleData).map(([k, v]) => (
              <Col xs={12} sm={8} key={k}>
                <Text type="secondary">{k}: </Text>
                <Text code>{v}</Text>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </Modal>
  );
};
