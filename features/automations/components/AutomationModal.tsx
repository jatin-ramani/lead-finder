"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { PresetStatusColorType } from "antd/es/_util/colors";
import {
  EyeOutlined,
  FormOutlined,
  InfoCircleOutlined,
  MailOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

import type {
  AutomationCreateInput,
  AutomationTriggerType,
  AutomationUpdateInput,
  EmailAutomation,
  SupportedVariable,
} from "@/types/api";
import { useTemplateVariables } from "../hooks/useAutomations";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface AutomationModalProps {
  open: boolean;
  editingAutomation: EmailAutomation | null;
  onCancel: () => void;
  onSubmit: (values: AutomationCreateInput | AutomationUpdateInput) => void;
  isSubmitting: boolean;
}

interface FormValues {
  name: string;
  description?: string;
  trigger_type: AutomationTriggerType;
  subject_template: string;
  body_template: string;
  delay_minutes: number;
  max_retries: number;
  enabled: boolean;
}

const TRIGGER_OPTIONS: {
  value: AutomationTriggerType;
  label: string;
  desc: string;
  badgeStatus: PresetStatusColorType;
}[] = [
  {
    value: "lead_created",
    label: "Lead Created",
    desc: "Fires when a new business or lead is scanned and discovered.",
    badgeStatus: "processing",
  },
  {
    value: "lead_status_changed",
    label: "Lead Status Changed",
    desc: "Fires when a lead pipeline stage transitions (e.g. to Contacted, Interested).",
    badgeStatus: "purple" as PresetStatusColorType,
  },
  {
    value: "follow_up_due",
    label: "Follow-Up Due",
    desc: "Fires when a scheduled follow-up reminder is due.",
    badgeStatus: "cyan" as PresetStatusColorType,
  },
  {
    value: "follow_up_overdue",
    label: "Follow-Up Overdue",
    desc: "Fires when a pending follow-up passes its due date.",
    badgeStatus: "error",
  },
];

export const AutomationModal: React.FC<AutomationModalProps> = ({
  open,
  editingAutomation,
  onCancel,
  onSubmit,
  isSubmitting,
}) => {
  const [form] = Form.useForm<FormValues>();
  const { data: variables = [] } = useTemplateVariables();
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");

  const subjectVal = Form.useWatch("subject_template", form) ?? "";
  const bodyVal = Form.useWatch("body_template", form) ?? "";

  useEffect(() => {
    if (open) {
      if (editingAutomation) {
        form.setFieldsValue({
          name: editingAutomation.name,
          description: editingAutomation.description ?? undefined,
          trigger_type: editingAutomation.trigger_type,
          subject_template: editingAutomation.subject_template,
          body_template: editingAutomation.body_template,
          delay_minutes: editingAutomation.delay_minutes,
          max_retries: editingAutomation.max_retries,
          enabled: editingAutomation.enabled,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          name: "",
          description: "",
          trigger_type: "lead_created",
          subject_template: "Excited to connect with {{business_name}}!",
          body_template:
            "Hi {{contact_name}},\n\nWe noticed {{business_name}} in {{lead_status}} and would love to assist you with your web presence.\n\nBest regards,\nYour Team",
          delay_minutes: 0,
          max_retries: 3,
          enabled: true,
        });
      }
    }
  }, [open, editingAutomation, form]);

  const handleFinish = (values: FormValues) => {
    onSubmit({
      name: values.name.trim(),
      description: values.description ? values.description.trim() : undefined,
      trigger_type: values.trigger_type,
      subject_template: values.subject_template.trim(),
      body_template: values.body_template.trim(),
      delay_minutes: values.delay_minutes ?? 0,
      max_retries: values.max_retries ?? 3,
      enabled: values.enabled ?? true,
    });
  };

  const insertVariable = (variableKey: string, targetField: "subject_template" | "body_template") => {
    const placeholder = `{{${variableKey}}}`;
    const currentValue = form.getFieldValue(targetField) || "";
    const updatedValue = `${currentValue} ${placeholder}`.trim();
    form.setFieldsValue({ [targetField]: updatedValue });
  };

  // Generate safe client-side sample preview
  const sampleData: Record<string, string> = {
    business_name: "Apex Healthcare & Dental",
    contact_name: "Dr. Sarah Smith",
    email: "sarah@apexhealth.example",
    phone: "+1 (555) 234-5678",
    website: "https://apexhealth.example",
    lead_status: "Interested",
    lead_score: "85",
    follow_up_title: "Send website audit presentation",
    follow_up_due_at: "2026-09-10 14:00 UTC",
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
          <MailOutlined className="text-blue-500" />
          <span>{editingAutomation ? "Edit Email Automation" : "Create Email Automation"}</span>
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
          icon={<ThunderboltOutlined />}
        >
          {editingAutomation ? "Save Changes" : "Create Automation"}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as "compose" | "preview")}
          destroyInactiveTabPane={false}
          items={[
            {
              key: "compose",
              label: (
                <span>
                  <FormOutlined /> Configuration & Templates
                </span>
              ),
              children: (
                <div>
                  <Row gutter={16}>
                  <Col xs={24} sm={16}>
                    <Form.Item
                      name="name"
                      label="Automation Name"
                      rules={[
                        { required: true, message: "Please provide an automation name" },
                        { max: 200, message: "Maximum 200 characters" },
                      ]}
                    >
                      <Input placeholder="e.g. Welcome Email for New Scanned Leads" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="enabled"
                      label="Active State"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Paused"
                        className="bg-gray-400"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="trigger_type"
                      label="Trigger Event"
                      rules={[{ required: true, message: "Please choose a trigger event" }]}
                    >
                      <Select placeholder="Select CRM Event Trigger">
                        {TRIGGER_OPTIONS.map((opt) => (
                          <Option key={opt.value} value={opt.value}>
                            <Space>
                              <Badge status={opt.badgeStatus} />
                              <Text strong>{opt.label}</Text>
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Form.Item
                      name="delay_minutes"
                      label="Delay (Minutes)"
                      tooltip="Wait time after trigger before sending email (0 = immediate)"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber min={0} max={10080} className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Form.Item
                      name="max_retries"
                      label="Max Retries"
                      tooltip="Number of automatic retries on transient errors (rate limits/network timeouts)"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber min={0} max={10} className="w-full" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="description" label="Internal Notes / Description">
                  <Input placeholder="Optional internal context for this campaign or rule" />
                </Form.Item>

                <Divider className="my-3" />

                {/* Variable Selector Pills */}
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <Space size={4}>
                      <InfoCircleOutlined className="text-blue-500" />
                      <Text strong className="text-xs">
                        Insert Dynamic Template Variables:
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
                        onClick={() => insertVariable(v.key, "body_template")}
                      >
                        +{v.key}
                      </Tag>
                    ))}
                  </div>
                </div>

                <Form.Item
                  name="subject_template"
                  label="Subject Template"
                  rules={[
                    { required: true, message: "Subject template is required" },
                    { max: 500, message: "Maximum 500 characters" },
                  ]}
                  extra={
                    <div className="flex justify-end gap-2 mt-1">
                      <Button
                        type="link"
                        size="small"
                        onClick={() => insertVariable("business_name", "subject_template")}
                      >
                        + business_name
                      </Button>
                    </div>
                  }
                >
                  <Input placeholder="e.g. Exciting opportunity for {{business_name}}" />
                </Form.Item>

                <Form.Item
                  name="body_template"
                  label="Email Body Template (Plain Text or HTML)"
                  rules={[{ required: true, message: "Body template is required" }]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Hello {{contact_name}},\n\nWe saw {{business_name}} is listed as {{lead_status}}..."
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
                  message="Live Preview with Sample Lead Context"
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
