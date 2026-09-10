"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  EyeOutlined,
  FormOutlined,
  InfoCircleOutlined,
  MailOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import type { MasterTemplateItem, SupportedVariable } from "@/types/api";
import { useTemplateVariables } from "./../hooks/useAutomations";

const { Text } = Typography;
const { TextArea } = Input;

interface TemplateEditorModalProps {
  open: boolean;
  cityName: string;
  template: MasterTemplateItem | null;
  onCancel: () => void;
  onSave: (updated: MasterTemplateItem) => void;
  grade?: string | null;
}

interface FormValues {
  subject: string;
  body: string;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  open,
  cityName,
  template,
  onCancel,
  onSave,
  grade,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");
  const { data: variables = [] } = useTemplateVariables();

  const subjectVal = Form.useWatch("subject", form) ?? "";
  const bodyVal = Form.useWatch("body", form) ?? "";

  useEffect(() => {
    if (open && template) {
      form.setFieldsValue({
        subject: template.subject,
        body: template.body,
      });
    }
  }, [open, template, form]);

  const handleFinish = (values: FormValues) => {
    onSave({
      subject: values.subject.trim(),
      body: values.body.trim(),
      rationale: template?.rationale,
      name: template?.name || `Universal Master Cold Email — ${cityName}`,
    });
    onCancel();
  };

  const insertVariable = (variableKey: string, targetField: "subject" | "body") => {
    const placeholder = `{{${variableKey}}}`;
    const currentValue = form.getFieldValue(targetField) || "";
    const updatedValue = `${currentValue} ${placeholder}`.trim();
    form.setFieldsValue({ [targetField]: updatedValue });
  };

  // Sample data preview
  const sampleData: Record<string, string> = {
    business_name: `${cityName} Health & Dental Group`,
    contact_name: "Dr. Sarah Patel",
    email: "contact@healthpatel.example",
    phone: "+91 98765 43210",
    website: "https://healthpatel.example",
    lead_status: "New",
    lead_score: "95",
    follow_up_title: "Initial Outreach",
    follow_up_due_at: "2026-09-12 10:00 UTC",
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
          <MailOutlined className="text-blue-600" />
          <span>Edit Cold Email Template — {cityName}</span>
        </Space>
      }
      width={780}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => form.submit()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Template
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as "compose" | "preview")}
          items={[
            {
              key: "compose",
              label: (
                <span>
                  <FormOutlined /> Template Content
                </span>
              ),
              children: (
                <div className="space-y-4 pt-1">
                  {/* Dynamic Variable Chips */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <Space size={4}>
                        <InfoCircleOutlined className="text-blue-500" />
                        <Text strong className="text-xs">
                          Allowlisted Template Variables:
                        </Text>
                      </Space>
                      <Text type="secondary" className="text-xs">
                        Click variable to insert into body
                      </Text>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {variables.map((v: SupportedVariable) => (
                        <Tag
                          key={v.key}
                          color="blue"
                          className="cursor-pointer hover:opacity-80 transition-opacity text-xs py-0.5"
                          onClick={() => insertVariable(v.key, "body")}
                        >
                          +{v.key}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  <Form.Item
                    name="subject"
                    label="Email Subject"
                    rules={[
                      { required: true, message: "Subject is required" },
                      { max: 500, message: "Max 500 characters" },
                    ]}
                    extra={
                      <div className="flex justify-end gap-2 mt-1">
                        <Button
                          type="link"
                          size="small"
                          onClick={() => insertVariable("business_name", "subject")}
                        >
                          + business_name
                        </Button>
                      </div>
                    }
                  >
                    <Input placeholder="e.g. Partnership opportunity for {{business_name}}" />
                  </Form.Item>

                  <Form.Item
                    name="body"
                    label="Email Body"
                    rules={[{ required: true, message: "Email body is required" }]}
                  >
                    <TextArea
                      rows={8}
                      placeholder="Hi {{contact_name}},\n\nConnecting from {{city}}..."
                      className="font-sans text-sm"
                    />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: "preview",
              label: (
                <span>
                  <EyeOutlined /> Live Sample Preview
                </span>
              ),
              children: (
                <div className="space-y-4 py-2">
                  <Alert
                    type="info"
                    showIcon
                    message={`Sample Preview for Grade ${grade} Prospect`}
                    description="Variables {{...}} are dynamically populated with the prospect's CRM data upon sending."
                    className="text-xs"
                  />

                  <Card
                    title={
                      <Space direction="vertical" size={2} className="w-full">
                        <Text type="secondary" className="text-xs">
                          SUBJECT:
                        </Text>
                        <Text strong className="text-base text-gray-800 dark:text-gray-100">
                          {renderPreviewText(subjectVal || "(Empty subject)")}
                        </Text>
                      </Space>
                    }
                    className="border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <div className="mb-3 text-xs text-gray-400 border-b pb-2">
                      To: <span className="font-mono text-gray-600 dark:text-gray-300">{sampleData.email}</span>
                    </div>
                    <div className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-200 leading-relaxed min-h-[140px]">
                      {renderPreviewText(bodyVal || "(Empty body)")}
                    </div>
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};
