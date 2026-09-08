"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  FormOutlined,
  InfoCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import type {
  EmailTemplate,
  SupportedVariable,
  TemplateCreateInput,
  TemplateUpdateInput,
} from "@/types/api";
import { useTemplateVariables } from "../hooks/useTemplates";

const { Text } = Typography;
const { TextArea } = Input;

interface TemplateModalProps {
  open: boolean;
  editingTemplate: EmailTemplate | null;
  onCancel: () => void;
  onSubmit: (values: TemplateCreateInput | TemplateUpdateInput) => void;
  isSubmitting: boolean;
}

interface FormValues {
  name: string;
  description?: string;
  subject: string;
  body: string;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  open,
  editingTemplate,
  onCancel,
  onSubmit,
  isSubmitting,
}) => {
  const [form] = Form.useForm<FormValues>();
  const { data: variables = [] } = useTemplateVariables();
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");

  const subjectVal = Form.useWatch("subject", form) ?? "";
  const bodyVal = Form.useWatch("body", form) ?? "";

  useEffect(() => {
    if (open) {
      if (editingTemplate) {
        form.setFieldsValue({
          name: editingTemplate.name,
          description: editingTemplate.description ?? undefined,
          subject: editingTemplate.subject,
          body: editingTemplate.body,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          name: "",
          description: "",
          subject: "Exclusive growth opportunity for {{business_name}}",
          body: "Hi {{contact_name}},\n\nWe noticed {{business_name}} is expanding in your area! We'd love to share how our specialized digital solutions can elevate your pipeline.\n\nBest regards,\nYour Outreach Team",
        });
      }
    }
  }, [open, editingTemplate, form]);

  const handleFinish = (values: FormValues) => {
    onSubmit({
      name: values.name.trim(),
      description: values.description ? values.description.trim() : undefined,
      subject: values.subject.trim(),
      body: values.body.trim(),
    });
  };

  const insertVariable = (variableKey: string, targetField: "subject" | "body") => {
    const placeholder = `{{${variableKey}}}`;
    const currentValue = form.getFieldValue(targetField) || "";
    const updatedValue = `${currentValue} ${placeholder}`.trim();
    form.setFieldsValue({ [targetField]: updatedValue });
  };

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

  const renderPreviewText = (template: string) => {
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      return sampleData[key.toLowerCase()] ?? `[${key}]`;
    });
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <FileTextOutlined className="text-blue-500" />
          <span>{editingTemplate ? "Edit Email Template" : "Create Email Template"}</span>
        </Space>
      }
      width={780}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isSubmitting}
          onClick={() => form.submit()}
          icon={<SaveOutlined />}
        >
          {editingTemplate ? "Save Template" : "Create Template"}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as "compose" | "preview")}
          destroyInactiveTabPane={false}
          items={[
            {
              key: "compose",
              label: (
                <span>
                  <FormOutlined /> Compose & Variables
                </span>
              ),
              children: (
                <div>
                  <Row gutter={16}>
                    <Col xs={24} sm={16}>
                      <Form.Item
                        name="name"
                        label="Template Name"
                        rules={[
                          { required: true, message: "Please enter template name" },
                          { max: 200, message: "Maximum 200 characters" },
                        ]}
                      >
                        <Input placeholder="e.g. Dental Outreach - Cold Introduction" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item name="description" label="Description / Category">
                        <Input placeholder="Optional internal tag or context" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider className="my-2" />

                  {/* Variable helper pills */}
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <Space size={4}>
                        <InfoCircleOutlined className="text-blue-500" />
                        <Text strong className="text-xs">
                          Allowlisted Dynamic Variables:
                        </Text>
                      </Space>
                      <Text type="secondary" className="text-xs">
                        Click variable pill to append to Subject or Body
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
                      { required: true, message: "Email subject is required" },
                      { max: 500, message: "Maximum 500 characters" },
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
                    label="Email Body (Plain Text or HTML)"
                    rules={[{ required: true, message: "Email body is required" }]}
                  >
                    <TextArea
                      rows={7}
                      placeholder="Hi {{contact_name}},\n\nWe saw {{business_name}} is expanding..."
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
                    message="Live Sample Context Preview"
                    description="Variables {{...}} are dynamically replaced using sample business attributes."
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
                    <div className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-200 leading-relaxed min-h-[120px]">
                      {renderPreviewText(bodyVal || "(Empty body)")}
                    </div>
                  </Card>

                  <Card size="small" title="Interpolated Sample Data" className="bg-gray-50 dark:bg-gray-800 text-xs">
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
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};
