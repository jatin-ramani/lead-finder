"use client";

import React from "react";
import {
  Button,
  Card,
  Popconfirm,
  Progress,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckCircleFilled,
  DisconnectOutlined,
  GoogleOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  WarningFilled,
} from "@ant-design/icons";

import type { GmailStatusResponse } from "@/types/api";

const { Text } = Typography;

interface GmailConnectionBannerProps {
  status: GmailStatusResponse | undefined;
  isLoading: boolean;
  onConnect: () => void;
  isConnecting: boolean;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}

export const GmailConnectionBanner: React.FC<GmailConnectionBannerProps> = ({
  status,
  isLoading,
  onConnect,
  isConnecting,
  onDisconnect,
  isDisconnecting,
}) => {
  const isConnected = status?.is_connected ?? false;
  const emailAddress = status?.email_address;
  const sendCount = status?.daily_send_count ?? 0;
  const quotaLimit = status?.daily_quota_limit ?? 400;
  const quotaRemaining = status?.daily_quota_remaining ?? quotaLimit;
  const usagePercent = Math.min(100, Math.round((sendCount / quotaLimit) * 100));

  return (
    <Card
      loading={isLoading}
      className={`border rounded-xl shadow-sm transition-all ${
        isConnected
          ? "border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/20 dark:from-emerald-950/20 dark:via-gray-900 dark:to-emerald-950/10"
          : "border-amber-200 dark:border-amber-900/50 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/20 dark:from-amber-950/20 dark:via-gray-900 dark:to-amber-950/10"
      }`}
      bodyStyle={{ padding: "16px 20px" }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Connection Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isConnected
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300"
                : "bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300"
            }`}
          >
            <GoogleOutlined className="text-xl" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                Gmail API Delivery
              </span>
              {isConnected ? (
                <Tag
                  icon={<CheckCircleFilled className="text-emerald-500" />}
                  color="success"
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  Connected
                </Tag>
              ) : (
                <Tag
                  icon={<WarningFilled className="text-amber-500" />}
                  color="warning"
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  Disconnected
                </Tag>
              )}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              {isConnected ? (
                <>
                  <span>Sender:</span>
                  <Text strong className="text-gray-800 dark:text-gray-200">
                    {emailAddress || "Authorized Gmail"}
                  </Text>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span>Direct API (No custom domain required)</span>
                </>
              ) : (
                <span>
                  Connect your Google account to send outreach emails directly through Gmail API.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quota & Actions */}
        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap justify-between md:justify-end">
          {isConnected && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100 dark:border-gray-700 px-3.5 py-2 rounded-lg text-xs min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Daily Quota</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {sendCount} / {quotaLimit} sent
                </span>
              </div>
              <Progress
                percent={usagePercent}
                size="small"
                showInfo={false}
                status={quotaRemaining === 0 ? "exception" : usagePercent > 80 ? "active" : "normal"}
                strokeColor={quotaRemaining === 0 ? "#ef4444" : usagePercent > 80 ? "#f59e0b" : "#10b981"}
              />
              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                <span>{quotaRemaining} remaining today</span>
                <Tooltip title="Gmail safety quota resets automatically at 00:00 UTC daily. Maximum 400 emails/day hard limit.">
                  <InfoCircleOutlined className="cursor-pointer hover:text-gray-600" />
                </Tooltip>
              </div>
            </div>
          )}

          <Space size="small">
            {isConnected ? (
              <Popconfirm
                title="Disconnect Gmail?"
                description="Email automations and test sends will be disabled until you reconnect."
                okText="Disconnect"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: isDisconnecting }}
                onConfirm={onDisconnect}
              >
                <Button
                  size="middle"
                  icon={<DisconnectOutlined />}
                  danger
                  className="rounded-lg"
                  loading={isDisconnecting}
                >
                  Disconnect
                </Button>
              </Popconfirm>
            ) : (
              <Button
                type="primary"
                size="middle"
                icon={<LinkOutlined />}
                onClick={onConnect}
                loading={isConnecting}
                className="bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg shadow-sm"
              >
                Connect Gmail
              </Button>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );
};
