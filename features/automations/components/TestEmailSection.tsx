"use client";

import React, { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  Row,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  ExperimentOutlined,
  InfoCircleOutlined,
  MailOutlined,
  SendOutlined,
  UndoOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import type {
  GmailStatusResponse,
  GmailTestSendRequest,
  GmailTestSendResponse,
} from "@/types/api";
import { TestEmailConfirmModal } from "./TestEmailConfirmModal";

const { Text, Title } = Typography;

const ALL_GRADES = ["A", "B", "C", "D"];

const GRADE_COLORS: Record<string, string> = {
  A: "#10b981",
  B: "#3b82f6",
  C: "#f59e0b",
  D: "#8b5cf6",
};

interface TestEmailSectionProps {
  gmailStatus: GmailStatusResponse | undefined;
  isLoadingStatus: boolean;
  onConnectGmail: () => void;
  isConnectingGmail: boolean;
  onSendTestEmails: (payload: GmailTestSendRequest) => Promise<GmailTestSendResponse>;
  isSending: boolean;
}

export const TestEmailSection: React.FC<TestEmailSectionProps> = ({
  gmailStatus,
  isLoadingStatus,
  onConnectGmail,
  isConnectingGmail,
  onSendTestEmails,
  isSending,
}) => {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(ALL_GRADES);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [lastResponse, setLastResponse] = useState<GmailTestSendResponse | null>(null);

  const isConnected = gmailStatus?.is_connected ?? false;
  const quotaRemaining = gmailStatus?.daily_quota_remaining ?? 400;
  const quotaLimit = gmailStatus?.daily_quota_limit ?? 400;

  const validateEmail = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) {
      setEmailError("Recipient email address is required");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Please enter a valid email address (e.g. name@example.com)");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleGradeToggle = (grade: string, checked: boolean) => {
    setSelectedGrades((prev) =>
      checked ? [...prev, grade].sort() : prev.filter((g) => g !== grade)
    );
  };

  const handleSelectAll = (e: CheckboxChangeEvent) => {
    setSelectedGrades(e.target.checked ? ALL_GRADES : []);
  };

  const handleOpenConfirm = () => {
    if (!validateEmail(recipientEmail)) {
      return;
    }
    if (selectedGrades.length === 0) {
      setEmailError("Please select at least one template grade to test");
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleExecuteSend = async () => {
    const trimmedEmail = recipientEmail.trim();

    try {
      const response = await onSendTestEmails({
        recipient_email: trimmedEmail,
        template_grades: selectedGrades,
      });
      setLastResponse(response);
      setConfirmModalOpen(false);
    } catch {
      // Error handled by hook toast
    }
  };

  const handleClearResults = () => {
    setLastResponse(null);
  };

  return (
    <Card
      loading={isLoadingStatus}
      className="border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden"
      bodyStyle={{ padding: "20px 24px" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <ExperimentOutlined className="text-base" />
          </div>
          <div>
            <Title level={4} className="!mb-0 text-base font-bold text-gray-900 dark:text-gray-100">
              Test Email Sending
            </Title>
            <Text type="secondary" className="text-xs">
              Verify live Gmail API delivery with safe sample variables before launching campaigns to real leads.
            </Text>
          </div>
        </div>

        {lastResponse && (
          <Button
            size="small"
            icon={<UndoOutlined />}
            onClick={handleClearResults}
            className="text-xs self-start sm:self-auto"
          >
            Clear Results
          </Button>
        )}
      </div>

      {/* Gmail Disconnected Warning */}
      {!isConnected && (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message="Gmail Not Connected"
          description={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-1">
              <span>
                You must connect an authorized Gmail account before testing or running email automations.
              </span>
              <Button
                type="primary"
                size="small"
                onClick={onConnectGmail}
                loading={isConnectingGmail}
                className="bg-amber-600 hover:bg-amber-700 font-semibold shrink-0"
              >
                Connect Gmail First
              </Button>
            </div>
          }
          className="mb-5 rounded-lg border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20"
        />
      )}

      {/* Test Sending Input Form */}
      <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-5">
        <Row gutter={[16, 16]} align="top">
          {/* Recipient Input */}
          <Col xs={24} md={12}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Test Recipient Email <span className="text-red-500">*</span>
              </label>
              <Input
                prefix={<MailOutlined className="text-gray-400 mr-1" />}
                placeholder="e.g. yourname@example.com"
                size="middle"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                disabled={!isConnected || isSending}
                status={emailError ? "error" : undefined}
                className="rounded-lg"
              />
              {emailError ? (
                <div className="text-xs text-red-500 mt-1 font-medium">{emailError}</div>
              ) : (
                <div className="text-[11px] text-gray-400 mt-1">
                  Real emails will be sent strictly to this address. No database leads are contacted.
                </div>
              )}
            </div>
          </Col>

          {/* Grade Template Checkboxes */}
          <Col xs={24} md={12}>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Templates to Test <span className="text-red-500">*</span>
                </label>
                <Checkbox
                  indeterminate={
                    selectedGrades.length > 0 && selectedGrades.length < ALL_GRADES.length
                  }
                  checked={selectedGrades.length === ALL_GRADES.length}
                  onChange={handleSelectAll}
                  disabled={!isConnected || isSending}
                  className="text-xs text-gray-500"
                >
                  Select All
                </Checkbox>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALL_GRADES.map((grade) => {
                  const isChecked = selectedGrades.includes(grade);
                  return (
                    <label
                      key={grade}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-white dark:bg-gray-800 border-blue-400 dark:border-blue-600 shadow-xs font-medium text-gray-900 dark:text-gray-100"
                          : "bg-transparent border-gray-200 dark:border-gray-700 text-gray-400"
                      } ${!isConnected || isSending ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => handleGradeToggle(grade, e.target.checked)}
                        disabled={!isConnected || isSending}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: GRADE_COLORS[grade] }}
                      />
                      <span>Grade {grade}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </Col>
        </Row>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-200/60 dark:border-gray-800">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <InfoCircleOutlined className="text-blue-500" />
            <span>
              Selected: <strong>{selectedGrades.length}</strong> template(s) • Quota remaining today:{" "}
              <strong>{quotaRemaining}</strong>
            </span>
          </div>

          <Button
            type="primary"
            size="middle"
            icon={<SendOutlined />}
            onClick={handleOpenConfirm}
            loading={isSending}
            disabled={!isConnected || selectedGrades.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 font-semibold px-6 rounded-lg shadow-sm"
          >
            Send Test Emails
          </Button>
        </div>
      </div>

      {/* Results View */}
      {lastResponse && (
        <div className="space-y-4 pt-1 animate-fadeIn">
          {/* Summary Row */}
          <div className="bg-white dark:bg-gray-800/80 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Test Summary:
              </span>
              <Tag color="default" className="text-xs font-bold rounded-md">
                Total: {lastResponse.total}
              </Tag>
              <Tag color="success" className="text-xs font-bold rounded-md">
                Sent: {lastResponse.sent}
              </Tag>
              {lastResponse.failed > 0 && (
                <Tag color="error" className="text-xs font-bold rounded-md">
                  Failed: {lastResponse.failed}
                </Tag>
              )}
              {lastResponse.skipped > 0 && (
                <Tag color="warning" className="text-xs font-bold rounded-md">
                  Skipped (Limit): {lastResponse.skipped}
                </Tag>
              )}
            </div>

            <div className="text-xs text-gray-500 font-mono">
              Sent to: <strong>{lastResponse.recipient_email}</strong>
            </div>
          </div>

          {/* Per-Template Status List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lastResponse.results.map((item) => {
              const isSent = item.status === "sent";
              const isFailed = item.status === "failed";
              const isSkipped = item.status === "skipped";

              return (
                <div
                  key={item.grade}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSent
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                      : isFailed
                      ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60"
                      : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Tag
                        style={{
                          backgroundColor: `${GRADE_COLORS[item.grade]}15`,
                          borderColor: GRADE_COLORS[item.grade],
                          color: GRADE_COLORS[item.grade],
                        }}
                        className="font-bold text-xs px-2 py-0.5 rounded-md"
                      >
                        Grade {item.grade}
                      </Tag>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                        {item.subject}
                      </span>
                    </div>

                    {isSent && (
                      <Tag
                        icon={<CheckCircleFilled />}
                        color="success"
                        className="font-semibold text-xs rounded-full px-2"
                      >
                        Sent
                      </Tag>
                    )}
                    {isFailed && (
                      <Tag
                        icon={<CloseCircleFilled />}
                        color="error"
                        className="font-semibold text-xs rounded-full px-2"
                      >
                        Failed
                      </Tag>
                    )}
                    {isSkipped && (
                      <Tag
                        icon={<ClockCircleFilled />}
                        color="warning"
                        className="font-semibold text-xs rounded-full px-2"
                      >
                        Limit Reached
                      </Tag>
                    )}
                  </div>

                  {isSent && (
                    <div className="space-y-1 text-[11px] text-gray-500 font-mono mt-1">
                      {item.message_id && (
                        <div className="flex items-center justify-between bg-white/70 dark:bg-gray-900/50 px-2 py-1 rounded border border-gray-100 dark:border-gray-800">
                          <span className="truncate max-w-[240px]">ID: {item.message_id}</span>
                          <Tooltip title="Provider Message ID generated by Gmail API">
                            <InfoCircleOutlined className="text-gray-400" />
                          </Tooltip>
                        </div>
                      )}
                      {item.sent_at && (
                        <div className="text-gray-400 text-[10px]">
                          Delivered: {new Date(item.sent_at).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  )}

                  {(isFailed || isSkipped) && item.error && (
                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-950/40 p-2 rounded border border-red-200 dark:border-red-900/40 mt-1">
                      {item.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <TestEmailConfirmModal
        open={confirmModalOpen}
        recipientEmail={recipientEmail.trim()}
        selectedGrades={selectedGrades}
        quotaRemaining={quotaRemaining}
        quotaLimit={quotaLimit}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={handleExecuteSend}
        isSending={isSending}
      />
    </Card>
  );
};
