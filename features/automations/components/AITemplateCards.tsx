"use client";

import React from "react";
import { Button, Card, Col, Empty, Row, Space, Tag, Tooltip } from "antd";
import {
  EditOutlined,
  RedoOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

import type { AIGradeTemplateItem } from "@/types/api";

interface AITemplateCardsProps {
  city: string;
  templates: Record<string, AIGradeTemplateItem> | null;
  isGeneratingAll: boolean;
  generatingGrade: string | null;
  onGenerateAll: () => void;
  onRegenerateGrade: (grade: string) => void;
  onEditGrade: (grade: string) => void;
}

const GRADE_META: Record<
  string,
  { name: string; target: string; tone: string; color: string; badgeBg: string }
> = {
  A: {
    name: "VIP / High Conversion",
    target: "Grade A prospects (Scores 85-100)",
    tone: "Strong personalization, high-value opportunity",
    color: "#10b981",
    badgeBg: "bg-emerald-500",
  },
  B: {
    name: "Professional B2B",
    target: "Grade B prospects (Scores 70-84)",
    tone: "Professional outreach, moderate personalization",
    color: "#3b82f6",
    badgeBg: "bg-blue-500",
  },
  C: {
    name: "Consultative / Audit",
    target: "Grade C prospects (Scores 50-69)",
    tone: "Softer introductory outreach, low-pressure angle",
    color: "#f59e0b",
    badgeBg: "bg-amber-500",
  },
  D: {
    name: "Simple Discovery",
    target: "Grade D prospects (Scores < 50)",
    tone: "Basic introductory outreach, efficient discovery",
    color: "#8b5cf6",
    badgeBg: "bg-purple-500",
  },
};

export const AITemplateCards: React.FC<AITemplateCardsProps> = ({
  city,
  templates,
  isGeneratingAll,
  generatingGrade,
  onGenerateAll,
  onRegenerateGrade,
  onEditGrade,
}) => {
  const hasTemplates = Boolean(templates && Object.keys(templates).length > 0);

  return (
    <Card
      className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden"
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-2 text-base font-semibold">
            <RobotOutlined className="text-purple-600" />
            <span>Step 2: AI Email Templates by Lead Grade</span>
          </div>

          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={isGeneratingAll}
            onClick={onGenerateAll}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none shadow-sm"
          >
            {hasTemplates ? "Regenerate All with AI" : "Generate with AI"}
          </Button>
        </div>
      }
    >
      {!hasTemplates ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="space-y-1">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                No email templates generated yet for {city}
              </span>
              <p className="text-xs text-gray-500 !mb-0">
                Click &quot;Generate with AI&quot; to automatically draft customized email templates tailored to each lead grade.
              </p>
            </div>
          }
        >
          <Button
            type="primary"
            icon={<RobotOutlined />}
            loading={isGeneratingAll}
            onClick={onGenerateAll}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Generate AI Email Templates
          </Button>
        </Empty>
      ) : (
        <div className="space-y-4">
          <Row gutter={[16, 16]}>
            {["A", "B", "C", "D"].map((grade) => {
              const meta = GRADE_META[grade];
              const tpl = templates?.[grade];
              const isRegenerating = generatingGrade === grade;

              return (
                <Col xs={24} lg={12} key={grade}>
                  <Card
                    size="small"
                    className="border border-gray-200 dark:border-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all rounded-xl h-full flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-2">
                        <Space size={8}>
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white font-bold text-xs shadow-sm ${meta.badgeBg}`}
                          >
                            {grade}
                          </span>
                          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                            Grade {grade}: {meta.name}
                          </span>
                        </Space>

                        <Space size={4}>
                          <Tooltip title="Regenerate this grade with AI">
                            <Button
                              size="small"
                              type="text"
                              icon={<RedoOutlined spin={isRegenerating} />}
                              disabled={isGeneratingAll || isRegenerating}
                              onClick={() => onRegenerateGrade(grade)}
                            />
                          </Tooltip>
                          <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => onEditGrade(grade)}
                          >
                            Preview / Edit
                          </Button>
                        </Space>
                      </div>

                      {/* Tone and Target Subtitle */}
                      <div className="text-xs text-gray-500 mb-3">
                        <span>{meta.target}</span> • <span>{meta.tone}</span>
                      </div>

                      {/* Subject Preview */}
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200/80 dark:border-gray-800 mb-2.5">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">
                          Subject:
                        </div>
                        <div className="font-medium text-xs text-gray-800 dark:text-gray-200 truncate">
                          {tpl?.subject || "(Empty Subject)"}
                        </div>
                      </div>

                      {/* Body Snippet */}
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-sans line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {tpl?.body || "(No template body generated)"}
                      </div>
                    </div>

                    {/* Footer Variable Tag */}
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                      <span>Dynamic Tags Enabled</span>
                      <Tag color="purple" className="m-0 text-[11px]">
                        AI Optimized
                      </Tag>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </Card>
  );
};
