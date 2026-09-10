"use client";

import React from "react";
import { Alert, Button, Card, Col, Row, Select, Skeleton, Space, Statistic, Tag, Tooltip, Typography } from "antd";
import {
  CheckCircleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  StopOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";

import type { CityGradeStatsResponse, CityStatItem } from "@/types/api";
import { useExportCityMobileNumbers } from "../hooks/useCityAutomations";

const { Text } = Typography;
const { Option } = Select;

interface CityAudienceCardProps {
  cities: CityStatItem[];
  isLoadingCities: boolean;
  selectedCity: string | undefined;
  onSelectCity: (city: string) => void;
  stats: CityGradeStatsResponse | undefined;
  isLoadingStats: boolean;
}

const GRADE_CONFIG: Record<
  string,
  { label: string; badgeColor: string; bgClass: string; textClass: string; desc: string }
> = {
  A: {
    label: "Grade A — VIP & High-Value",
    badgeColor: "#10b981",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    textClass: "text-emerald-700 dark:text-emerald-300",
    desc: "Strongest personalization & high-conversion VIP offer",
  },
  B: {
    label: "Grade B — Strong Prospects",
    badgeColor: "#3b82f6",
    bgClass: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    textClass: "text-blue-700 dark:text-blue-300",
    desc: "Professional outreach with moderate personalization",
  },
  C: {
    label: "Grade C — Moderate Potential",
    badgeColor: "#f59e0b",
    bgClass: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    textClass: "text-amber-700 dark:text-amber-300",
    desc: "Softer introductory outreach & consultation angle",
  },
  D: {
    label: "Grade D — Basic Discovery",
    badgeColor: "#8b5cf6",
    bgClass: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
    textClass: "text-purple-700 dark:text-purple-300",
    desc: "Simple low-pressure inquiry & discovery message",
  },
};

export const CityAudienceCard: React.FC<CityAudienceCardProps> = ({
  cities,
  isLoadingCities,
  selectedCity,
  onSelectCity,
  stats,
  isLoadingStats,
}) => {
  const totalLeads = stats?.total_leads ?? 0;
  const eligibleLeads = stats?.email_eligible_leads ?? 0;
  const ineligibleLeads = stats?.ineligible_leads ?? 0;
  const alreadySentLeads = stats?.already_sent_leads ?? 0;
  const grades = stats?.grades;

  const exportMobileNumbersMutation = useExportCityMobileNumbers();

  const handleExportMobileNumbers = () => {
    if (!selectedCity) return;
    exportMobileNumbersMutation.mutate(selectedCity);
  };

  return (
    <Card
      className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden"
      title={
        <div className="flex items-center gap-2 text-base font-semibold py-1">
          <EnvironmentOutlined className="text-blue-600" />
          <span>Step 1: Select City & Review Lead Audience</span>
        </div>
      }
      extra={
        selectedCity ? (
          <Tooltip title={`Export 3-column XLSX (Business Type, Business Name, Mobile Number) for manual WhatsApp outreach in ${selectedCity}`}>
            <Button
              icon={<WhatsAppOutlined className="text-emerald-500" />}
              onClick={handleExportMobileNumbers}
              loading={exportMobileNumbersMutation.isPending}
              className="font-medium text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 hover:!border-emerald-500"
            >
              Export Mobile Numbers
            </Button>
          </Tooltip>
        ) : null
      }
    >
      <div className="space-y-5">
        {/* City Selector & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex-1 max-w-lg">
            <Text strong className="block mb-1.5 text-xs uppercase tracking-wider text-gray-500">
              Target City
            </Text>
            <Select
              showSearch
              placeholder="Select a city from discovered CRM leads..."
              value={selectedCity}
              onChange={onSelectCity}
              loading={isLoadingCities}
              style={{ width: "100%" }}
              size="large"
              optionFilterProp="children"
              className="shadow-sm"
            >
              {cities.map((c) => (
                <Option key={c.city} value={c.city}>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{c.city}</span>
                    <Space size="small">
                      <Tag color="blue" className="text-xs">
                        {c.eligible_leads} eligible
                      </Tag>
                      {c.already_sent_leads ? (
                        <Tag color="purple" className="text-xs">
                          {c.already_sent_leads} sent
                        </Tag>
                      ) : null}
                      <span className="text-xs text-gray-400">({c.total_leads} total)</span>
                    </Space>
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          {selectedCity && (
            <Button
              icon={<WhatsAppOutlined className="text-emerald-500 text-base" />}
              size="large"
              onClick={handleExportMobileNumbers}
              loading={exportMobileNumbersMutation.isPending}
              className="font-semibold text-xs sm:text-sm border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 hover:!border-emerald-500 h-10 px-4 shrink-0 shadow-sm"
            >
              Export Mobile Numbers
            </Button>
          )}
        </div>

        {selectedCity && (
          <>
            {isLoadingStats ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <div className="space-y-4 pt-2">
                {/* Metrics Row (4 Metrics) */}
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center"
                    >
                      <Statistic
                        title={<span className="text-xs text-gray-500 font-medium">Total Leads</span>}
                        value={totalLeads}
                        valueStyle={{ color: "#374151", fontWeight: 700 }}
                        prefix={<EnvironmentOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-center"
                    >
                      <Statistic
                        title={<span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Email-Eligible Leads</span>}
                        value={eligibleLeads}
                        valueStyle={{ color: "#10b981", fontWeight: 700 }}
                        prefix={<CheckCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      className="bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg text-center"
                    >
                      <Statistic
                        title={<span className="text-xs text-purple-700 dark:text-purple-400 font-medium">Already Sent</span>}
                        value={alreadySentLeads}
                        valueStyle={{ color: "#8b5cf6", fontWeight: 700 }}
                        prefix={<CheckCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-center"
                    >
                      <Statistic
                        title={<span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Missing Email / Skipped</span>}
                        value={ineligibleLeads}
                        valueStyle={{ color: "#f59e0b", fontWeight: 700 }}
                        prefix={<StopOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Already Sent Informational Alert */}
                {alreadySentLeads > 0 && (
                  <Alert
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined className="text-purple-600" />}
                    message={`${alreadySentLeads} leads in ${selectedCity} have already been emailed and are excluded from this automation.`}
                    className="text-xs py-1.5 bg-purple-50/50 border-purple-200 text-purple-900 dark:bg-purple-950/20 dark:border-purple-900 dark:text-purple-200"
                  />
                )}

                {/* Missing Email Safety Notice */}
                {ineligibleLeads > 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    message={`${ineligibleLeads} leads in ${selectedCity} do not have a valid email address and will be safely skipped.`}
                    className="text-xs py-1.5"
                  />
                )}

                {/* Grade Distribution Grid */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2.5">
                    <Text strong className="text-xs uppercase tracking-wider text-gray-500">
                      Lead Grade Qualification Breakdown
                    </Text>
                    <Text type="secondary" className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      All eligible leads receive the Universal Master Cold Email
                    </Text>
                  </div>

                  <Row gutter={[12, 12]}>
                    {["A", "B", "C", "D"].map((grade) => {
                      const cfg = GRADE_CONFIG[grade];
                      const gStat = grades?.[grade] || { total: 0, eligible: 0, ineligible: 0, already_sent: 0 };
                      return (
                        <Col xs={24} sm={12} md={6} key={grade}>
                          <div
                            className={`p-3.5 rounded-xl border transition-all ${cfg.bgClass} flex flex-col justify-between h-full`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white font-bold text-xs shadow-sm"
                                style={{ backgroundColor: cfg.badgeColor }}
                              >
                                {grade}
                              </span>
                              <Tag color={gStat.eligible > 0 ? "success" : "default"} className="m-0 text-xs">
                                {gStat.eligible} eligible
                              </Tag>
                            </div>

                            <div className="space-y-1">
                              <div className={`font-semibold text-sm ${cfg.textClass}`}>
                                Grade {grade} Leads
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 !mb-0">
                                {cfg.desc}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-col gap-1 text-xs text-gray-500">
                              <div className="flex items-center justify-between">
                                <span>Total in city:</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  {gStat.total}
                                </span>
                              </div>
                              {gStat.already_sent ? (
                                <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
                                  <span>Already sent:</span>
                                  <span className="font-semibold">
                                    {gStat.already_sent}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
