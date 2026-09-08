"use client";

import React from "react";
import { Button, Divider, Modal, Space, Tag, Typography } from "antd";
import {
  EnvironmentOutlined,
  RocketOutlined,
  SendOutlined,
} from "@ant-design/icons";

import type { AIGradeTemplateItem, CityGradeStatsResponse } from "@/types/api";

const { Text, Paragraph } = Typography;

interface AutomationConfirmModalProps {
  open: boolean;
  city: string;
  stats: CityGradeStatsResponse | undefined;
  templates: Record<string, AIGradeTemplateItem>;
  onCancel: () => void;
  onConfirm: () => void;
  isStarting: boolean;
}

export const AutomationConfirmModal: React.FC<AutomationConfirmModalProps> = ({
  open,
  city,
  stats,
  templates,
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
            Emails will be automatically personalized and dispatched with grade-specific templates.
          </Paragraph>
        </div>

        {/* Grade Breakdown with Templates */}
        <div className="space-y-2">
          <Text strong className="text-xs uppercase tracking-wider text-gray-500">
            Grade Routing & Assigned Templates:
          </Text>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {["A", "B", "C", "D"].map((grade) => {
              const gStat = grades?.[grade] || { total: 0, eligible: 0, ineligible: 0 };
              const tpl = templates[grade];

              return (
                <div
                  key={grade}
                  className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Space size={6}>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-700 text-white font-bold text-[10px]">
                        {grade}
                      </span>
                      <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                        Grade {grade}
                      </span>
                    </Space>
                    <Tag color={gStat.eligible > 0 ? "blue" : "default"} className="text-xs m-0">
                      {gStat.eligible} recipient{gStat.eligible === 1 ? "" : "s"}
                    </Tag>
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Subject:</span>
                    <span className="truncate text-gray-700 dark:text-gray-300">
                      {tpl?.subject || "(Default template)"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Divider className="my-2" />

        {/* Dispatch Estimation */}
        <div className="flex items-center justify-between text-sm px-1">
          <span className="font-medium text-gray-600 dark:text-gray-400">Estimated Total Emails:</span>
          <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
            {eligibleLeads}
          </span>
        </div>
      </div>
    </Modal>
  );
};
