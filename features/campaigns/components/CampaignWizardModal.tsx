"use client";

import React, { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  FileTextOutlined,
  FilterOutlined,
  RocketOutlined,
  SendOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";

import type {
  CampaignCreateInput,
  CampaignFilterCriteria,
  EmailTemplate,
} from "@/types/api";
import { useTemplates } from "@/features/templates/hooks/useTemplates";
import { usePreviewCampaignRecipients } from "../hooks/useCampaigns";

const { Text, Paragraph } = Typography;
const { Option } = Select;

interface CampaignWizardModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CampaignCreateInput) => void;
  isSubmitting: boolean;
}

interface WizardFormValues {
  name: string;
  description?: string;
  template_id: number;
  city?: string;
  category?: string;
  lead_status?: string;
  lead_grade?: string;
  min_lead_score?: number;
  max_lead_score?: number;
  is_favorite?: boolean;
  has_website?: boolean;
  tags?: string;
  launch_mode: "immediate" | "scheduled";
  scheduled_at?: Dayjs;
}

export const CampaignWizardModal: React.FC<CampaignWizardModalProps> = ({
  open,
  onCancel,
  onSubmit,
  isSubmitting,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<WizardFormValues>();

  const { data: templatesData } = useTemplates({ is_archived: false, page_size: 100 });
  const activeTemplates = templatesData?.items || [];

  const previewMutation = usePreviewCampaignRecipients();

  // Watch key values
  const selectedTemplateId = Form.useWatch("template_id", form);
  const selectedTemplate = activeTemplates.find((t: EmailTemplate) => t.id === selectedTemplateId);
  const launchMode = Form.useWatch("launch_mode", form) ?? "immediate";

  const handleAfterClose = () => {
    setCurrentStep(0);
    form.resetFields();
  };

  const getFilterCriteriaFromForm = (): CampaignFilterCriteria => {
    const vals = form.getFieldsValue();
    const criteria: CampaignFilterCriteria = {};
    if (vals.city) criteria.city = vals.city.trim();
    if (vals.category) criteria.category = vals.category.trim();
    if (vals.lead_status) criteria.lead_status = vals.lead_status;
    if (vals.lead_grade) criteria.lead_grade = vals.lead_grade;
    if (typeof vals.min_lead_score === "number") criteria.min_lead_score = vals.min_lead_score;
    if (typeof vals.max_lead_score === "number") criteria.max_lead_score = vals.max_lead_score;
    if (typeof vals.is_favorite === "boolean") criteria.is_favorite = vals.is_favorite;
    if (typeof vals.has_website === "boolean") criteria.has_website = vals.has_website;
    if (vals.tags) criteria.tags = vals.tags.trim();
    return criteria;
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(["name", "template_id"]);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        // Evaluate recipient preview
        const criteria = getFilterCriteriaFromForm();
        await previewMutation.mutateAsync(criteria);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (launchMode === "scheduled") {
          await form.validateFields(["scheduled_at"]);
        }
        setCurrentStep(3);
      }
    } catch {
      // validation errors handled by Ant Design
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleFinish = () => {
    const values = form.getFieldsValue();
    const filterCriteria = getFilterCriteriaFromForm();
    const scheduledAtStr =
      values.launch_mode === "scheduled" && values.scheduled_at
        ? values.scheduled_at.toISOString()
        : null;

    onSubmit({
      name: (values.name || "").trim(),
      description: values.description ? values.description.trim() : undefined,
      template_id: values.template_id,
      filter_criteria: filterCriteria,
      scheduled_at: scheduledAtStr,
    });
  };

  const steps = [
    { title: "Details & Template", icon: <FileTextOutlined /> },
    { title: "Audience Filters", icon: <FilterOutlined /> },
    { title: "Schedule", icon: <CalendarOutlined /> },
    { title: "Review & Launch", icon: <RocketOutlined /> },
  ];

  return (
    <Modal
      open={open}
      title={
        <Space>
          <SendOutlined className="text-blue-500" />
          <span>New Email Campaign Wizard</span>
        </Space>
      }
      width={820}
      onCancel={onCancel}
      footer={
        <div className="flex justify-between items-center">
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={handleNext}
                loading={previewMutation.isPending}
              >
                Next
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleFinish}
                loading={isSubmitting}
                icon={<RocketOutlined />}
              >
                {launchMode === "immediate" ? "Launch Campaign" : "Schedule Campaign"}
              </Button>
            )}
          </Space>
        </div>
      }
      afterClose={handleAfterClose}
      destroyOnClose
    >
      <div className="py-2">
        <Steps current={currentStep} items={steps} className="mb-6" />

        <Form form={form} layout="vertical">
          {/* STEP 0: Details & Template */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <Form.Item
                name="name"
                label="Campaign Name"
                rules={[
                  { required: true, message: "Please provide a campaign name" },
                  { max: 200, message: "Maximum 200 characters" },
                ]}
              >
                <Input placeholder="e.g. Q4 Healthcare Outreach - California" />
              </Form.Item>

              <Form.Item name="description" label="Description / Objective">
                <Input placeholder="Optional internal campaign context or goals" />
              </Form.Item>

              <Form.Item
                name="template_id"
                label="Select Email Template"
                rules={[{ required: true, message: "Please select an email template" }]}
              >
                <Select placeholder="Choose an active template">
                  {activeTemplates.map((t: EmailTemplate) => (
                    <Option key={t.id} value={t.id}>
                      <Space>
                        <Text strong>{t.name}</Text>
                        <Text type="secondary" className="text-xs">
                          ({t.subject})
                        </Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedTemplate && (
                <Card size="small" className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 mb-1">SELECTED TEMPLATE PREVIEW:</div>
                  <div className="font-semibold text-sm mb-1">{selectedTemplate.subject}</div>
                  <Paragraph
                    ellipsis={{ rows: 3 }}
                    className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-0"
                  >
                    {selectedTemplate.body}
                  </Paragraph>
                </Card>
              )}
            </div>
          )}

          {/* STEP 1: Audience Filters */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Alert
                type="info"
                showIcon
                message="Targeting Criteria (Canonical Filters)"
                description="Leads matching these criteria will be snapshotted when the campaign launches. Only leads with non-empty emails will be contacted."
              />

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="city" label="City Filter">
                    <Input placeholder="e.g. Seattle, Ahmedabad (Exact match)" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="category" label="Business Category">
                    <Input placeholder="e.g. Dentist, Commercial" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="lead_status" label="CRM Pipeline Status">
                    <Select placeholder="All Stages" allowClear>
                      <Option value="new">New</Option>
                      <Option value="contacted">Contacted</Option>
                      <Option value="interested">Interested</Option>
                      <Option value="qualified">Qualified</Option>
                      <Option value="proposal_sent">Proposal Sent</Option>
                      <Option value="negotiation">Negotiation</Option>
                      <Option value="won">Won</Option>
                      <Option value="lost">Lost</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="lead_grade" label="Lead Qualification Grade">
                    <Select placeholder="All Grades" allowClear>
                      <Option value="A">Grade A (High Quality)</Option>
                      <Option value="B">Grade B (Good)</Option>
                      <Option value="C">Grade C (Medium)</Option>
                      <Option value="D">Grade D (Low)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="min_lead_score" label="Minimum Lead Score (0-100)">
                    <InputNumber min={0} max={100} className="w-full" placeholder="e.g. 50" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="tags" label="Tags Filter (Comma-separated)">
                    <Input placeholder="e.g. hot-lead, high-priority" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="is_favorite" valuePropName="checked">
                    <Checkbox>Only Target Favorite Leads ⭐</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="has_website" valuePropName="checked">
                    <Checkbox>Only Leads with Website</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* STEP 2: Audience Preview & Schedule */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Card size="small" className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900">
                <div className="flex items-center justify-between">
                  <Space>
                    <UsergroupAddOutlined className="text-xl text-blue-600" />
                    <div>
                      <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold uppercase">
                        Eligible Recipients Found
                      </div>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {previewMutation.data?.total_eligible_leads ?? 0} leads with verified emails
                      </div>
                    </div>
                  </Space>
                  <Tag color="blue">Deduplicated</Tag>
                </div>
              </Card>

              {/* Sample leads preview table */}
              {previewMutation.data?.sample_leads && previewMutation.data.sample_leads.length > 0 && (
                <div>
                  <Text strong className="text-xs text-gray-500 uppercase">
                    Sample Matching Leads Preview (Top {previewMutation.data.sample_leads.length}):
                  </Text>
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={previewMutation.data.sample_leads}
                    rowKey="id"
                    columns={[
                      { title: "Business Name", dataIndex: "name", key: "name" },
                      { title: "Email", dataIndex: "email", key: "email", render: (e: string) => <span className="font-mono text-xs">{e}</span> },
                      { title: "City", dataIndex: "city", key: "city" },
                      { title: "Grade", dataIndex: "lead_grade", key: "lead_grade", render: (g: string) => <Tag color={g === "A" ? "green" : "blue"}>{g || "N/A"}</Tag> },
                      { title: "Stage", dataIndex: "lead_status", key: "lead_status", render: (s: string) => <Tag color="purple">{s || "new"}</Tag> },
                    ]}
                    className="mt-2"
                  />
                </div>
              )}

              <Divider className="my-3" />

              {/* Launch & Schedule Options */}
              <Form.Item name="launch_mode" label="Dispatch Schedule">
                <Radio.Group className="w-full">
                  <Space direction="vertical" className="w-full">
                    <Radio value="immediate" className="p-2 border rounded-lg w-full">
                      <Space direction="vertical" size={0}>
                        <Text strong>Send Immediately</Text>
                        <Text type="secondary" className="text-xs">
                          Materialize recipient list and start dispatch right away
                        </Text>
                      </Space>
                    </Radio>
                    <Radio value="scheduled" className="p-2 border rounded-lg w-full">
                      <Space direction="vertical" size={0}>
                        <Text strong>Schedule for Future Time</Text>
                        <Text type="secondary" className="text-xs">
                          Queue campaign for automatic dispatch by background worker
                        </Text>
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              {launchMode === "scheduled" && (
                <Form.Item
                  name="scheduled_at"
                  label="Dispatch Date & Time"
                  rules={[{ required: true, message: "Please select scheduled time" }]}
                >
                  <DatePicker
                    showTime
                    className="w-full"
                    disabledDate={(current) => current && current < dayjs().startOf("day")}
                    placeholder="Select future execution timestamp"
                  />
                </Form.Item>
              )}
            </div>
          )}

          {/* STEP 3: Final Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Alert
                type="success"
                showIcon
                message="Ready for Launch"
                description="Please review campaign configuration and audience summary before launching."
              />

              <Card size="small" className="border-gray-200 dark:border-gray-700">
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    <Text type="secondary" className="text-xs">Campaign Name:</Text>
                    <div className="font-semibold text-sm">{form.getFieldValue("name")}</div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" className="text-xs">Selected Template:</Text>
                    <div className="font-semibold text-sm">{selectedTemplate?.name}</div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" className="text-xs">Recipients Snapshot Count:</Text>
                    <div className="font-bold text-sm text-blue-600">
                      {previewMutation.data?.total_eligible_leads ?? 0} leads
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" className="text-xs">Execution Mode:</Text>
                    <div>
                      {launchMode === "immediate" ? (
                        <Tag color="green">Immediate Dispatch</Tag>
                      ) : (
                        <Tag color="blue">
                          Scheduled for {form.getFieldValue("scheduled_at")?.format("YYYY-MM-DD HH:mm")}
                        </Tag>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>

              {selectedTemplate && (
                <Card size="small" title="Outbound Subject Preview" className="border-gray-200 dark:border-gray-700 text-xs">
                  <div className="font-mono text-gray-700 dark:text-gray-300">
                    {selectedTemplate.subject}
                  </div>
                </Card>
              )}
            </div>
          )}
        </Form>
      </div>
    </Modal>
  );
};
