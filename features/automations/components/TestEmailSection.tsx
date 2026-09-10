"use client";

import React, { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  Row,
  Tag,
  Tooltip,
  Typography,
} from "antd";
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

  const handleOpenConfirm = () => {
    if (!validateEmail(recipientEmail)) {
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleExecuteSend = async () => {
    const trimmedEmail = recipientEmail.trim();

    try {
      const response = await onSendTestEmails({
        recipient_email: trimmedEmail,
        template_grades: ["Universal"],
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
              Verify live Gmail API delivery with safe sample variables using the Universal Master Cold Email before launching to real leads.
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
          <Col xs={24} md={14}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Test Destination Email <span className="text-red-500">*</span>
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
                  Real emails will be sent strictly to this address. No CRM leads or campaigns are modified.
                </div>
              )}
            </div>
          </Col>

          {/* Template Info Card */}
          <Col xs={24} md={10}>
            <div className="p-3 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
                  Active Template
                </span>
                <Tag color="purple" className="text-xs m-0">Universal Master</Tag>
              </div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Quick idea for {"{{Business Name}}"}
              </div>
              <div className="text-[11px] text-gray-500">
                Rendered with clean HTML paragraphs & plain-text fallback.
              </div>
            </div>
          </Col>
        </Row>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-200/60 dark:border-gray-800">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <InfoCircleOutlined className="text-blue-500" />
            <span>
              1 test email • Quota remaining today: <strong>{quotaRemaining}</strong>
            </span>
          </div>

          <Button
            type="primary"
            size="middle"
            icon={<SendOutlined />}
            onClick={handleOpenConfirm}
            loading={isSending}
            disabled={!isConnected}
            className="bg-indigo-600 hover:bg-indigo-700 font-semibold px-6 rounded-lg shadow-sm"
          >
            Send Test Email
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
          <div className="grid grid-cols-1 gap-3">
            {lastResponse.results.map((item, idx) => {
              const isSent = item.status === "sent";
              const isFailed = item.status === "failed";
              const isSkipped = item.status === "skipped";

              return (
                <div
                  key={idx}
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
                      <Tag color="purple" className="font-bold text-xs px-2 py-0.5 rounded-md">
                        Universal Master
                      </Tag>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[320px]">
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
                          <span className="truncate max-w-[320px]">ID: {item.message_id}</span>
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
        selectedGrades={["Universal"]}
        quotaRemaining={quotaRemaining}
        quotaLimit={quotaLimit}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={handleExecuteSend}
        isSending={isSending}
      />
    </Card>
  );
};
