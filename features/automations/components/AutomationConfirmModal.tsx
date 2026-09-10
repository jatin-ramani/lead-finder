"use client";

import React from "react";
import { Button, Divider, Modal, Space, Tag, Typography } from "antd";
import {
  EnvironmentOutlined,
  RocketOutlined,
  SendOutlined,
} from "@ant-design/icons";

import type { CityGradeStatsResponse, MasterTemplateItem } from "@/types/api";

const { Text, Paragraph } = Typography;

interface AutomationConfirmModalProps {
  open: boolean;
  city: string;
  stats: CityGradeStatsResponse | undefined;
  template: MasterTemplateItem | null;
  onCancel: () => void;
  onConfirm: () => void;
  isStarting: boolean;
}

export const AutomationConfirmModal: React.FC<AutomationConfirmModalProps> = ({
  open,
  city,
  stats,
  template,
  onCancel,
  onConfirm,
  isStarting,
}) => {
  const eligibleLeads = stats?.email_eligible_leads ?? 0;
  const grades = stats?.grades;

  return (
    <Modal
      open={open}
      title={
        <Space>
          <RocketOutlined className="text-blue-600" />
          <span className="text-base font-bold">Review & Start Email Automation</span>
        </Space>
      }
      width={640}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isStarting}>
          Cancel
        </Button>,
        <Button
          key="start"
          type="primary"
          icon={<SendOutlined />}
          loading={isStarting}
          onClick={onConfirm}
          className="bg-emerald-600 hover:bg-emerald-700 border-none px-6"
          size="large"
        >
          Start Automation
        </Button>,
      ]}
      destroyOnClose
    >
      <div className="space-y-4 py-1">
        {/* City & Audience Summary Alert */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Space>
              <EnvironmentOutlined className="text-blue-600 text-lg" />
              <span className="font-bold text-base text-gray-900 dark:text-gray-100">
                {city}
              </span>
            </Space>
            <Tag color="green" className="text-xs px-2 py-0.5 font-semibold">
              {eligibleLeads} Eligible Leads
            </Tag>
          </div>
          <Paragraph type="secondary" className="!mb-0 text-xs text-gray-600 dark:text-gray-400">
            All eligible leads will receive this universal master cold email with dynamic personalization.
          </Paragraph>
        </div>

        {/* Universal Template Preview Box */}
        <div className="space-y-2">
          <Text strong className="text-xs uppercase tracking-wider text-gray-500">
            Assigned Email Template:
          </Text>

          <div className="p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                {template?.name || "Universal Master Cold Email"}
              </span>
              <Tag color="purple" className="text-[11px] m-0 font-semibold">
                Universal (All Grades)
              </Tag>
            </div>

            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              <span className="text-gray-400 font-normal mr-1">Subject:</span>
              {template?.subject || `A free website mockup for {{business_name}}?`}
            </div>
          </div>
        </div>

        {/* Lead Grade Distribution Overview */}
        <div className="space-y-2">
          <Text strong className="text-xs uppercase tracking-wider text-gray-500">
            Audience Breakdown by Lead Grade:
          </Text>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["A", "B", "C", "D"].map((grade) => {
              const gStat = grades?.[grade] || { total: 0, eligible: 0, ineligible: 0 };
              return (
                <div
                  key={grade}
                  className="p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center"
                >
                  <div className="font-bold text-xs text-gray-700 dark:text-gray-300">
                    Grade {grade}
                  </div>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {gStat.eligible} leads
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Divider className="my-2" />

        {/* Dispatch Estimation */}
        <div className="flex items-center justify-between text-sm px-1">
          <span className="font-medium text-gray-600 dark:text-gray-400">Total Emails to Dispatch:</span>
          <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
            {eligibleLeads}
          </span>
        </div>
      </div>
    </Modal>
  );
};
