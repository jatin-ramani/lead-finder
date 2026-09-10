"use client";

import React from "react";
import { Button, Card, Space, Tag } from "antd";
import {
  EditOutlined,
  FileTextOutlined,
  MailOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import type { MasterTemplateItem } from "@/types/api";

interface MasterTemplateCardProps {
  city: string;
  template: MasterTemplateItem | null;
  onEdit: () => void;
  onReset: () => void;
  isResetting?: boolean;
}

export const MasterTemplateCard: React.FC<MasterTemplateCardProps> = ({
  city,
  template,
  onEdit,
  onReset,
  isResetting,
}) => {
  return (
    <Card
      className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden"
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-2 text-base font-semibold">
            <MailOutlined className="text-blue-600" />
            <span>Step 2: Universal Master Cold Email</span>
          </div>

          <Space>
            <Button
              size="small"
              icon={<ReloadOutlined spin={isResetting} />}
              onClick={onReset}
              disabled={isResetting}
            >
              Reset to Default
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={onEdit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Preview / Edit
            </Button>
          </Space>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileTextOutlined className="text-purple-600" />
                <span>{template?.name || `Universal Master Cold Email — ${city}`}</span>
              </div>
              <p className="text-xs text-gray-500 !mb-0 mt-0.5">
                Every eligible lead across Grades A, B, C, and D receives this high-converting cold email with dynamic personalization.
              </p>
            </div>
            <Tag color="purple" className="font-semibold px-2.5 py-0.5 self-start sm:self-auto m-0">
              Universal Template
            </Tag>
          </div>

          {/* Subject Preview */}
          <div className="p-3 bg-white dark:bg-gray-950 rounded-lg border border-gray-200/80 dark:border-gray-800">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">
              Subject:
            </div>
            <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
              {template?.subject || "Quick idea for {{Business Name}}"}
            </div>
          </div>

          {/* Body Preview */}
          <div className="p-3 bg-white dark:bg-gray-950 rounded-lg border border-gray-200/80 dark:border-gray-800">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
              Email Body Preview:
            </div>
            <div
              className="text-xs text-gray-600 dark:text-gray-300 font-sans leading-relaxed max-h-48 overflow-y-auto [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_strong]:text-gray-900 dark:[&_strong]:text-white"
              dangerouslySetInnerHTML={{
                __html: template?.body || "(No template content)",
              }}
            />
          </div>

          {/* Variables and Delivery Info */}
          <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
            <Space size={6} wrap>
              <span className="font-medium text-gray-600 dark:text-gray-400">Dynamic Variables:</span>
              <Tag className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] m-0 font-mono">
                {"{{Contact Name}}"}
              </Tag>
              <Tag className="bg-purple-50 text-purple-700 border-purple-200 text-[11px] m-0 font-mono">
                {"{{Business Name}}"}
              </Tag>
              <Tag className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] m-0 font-mono">
                {"{{City}}"}
              </Tag>
            </Space>

            <span className="text-gray-400">
              Dispatched at max 20/min throttle with Gmail API
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
