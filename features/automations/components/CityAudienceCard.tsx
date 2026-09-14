"use client";

import React from "react";
import { Alert, Button, Card, Col, Row, Select, Skeleton, Statistic, Tag, Tooltip, Typography } from "antd";
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
    badgeColor: "var(--lf-success)",
    bgClass: "bg-[var(--lf-success-soft)] border-[var(--lf-success)]",
    textClass: "text-[var(--lf-success)]",
    desc: "Strongest personalization & high-conversion VIP offer",
  },
  B: {
    label: "Grade B — Strong Prospects",
    badgeColor: "var(--lf-info)",
    bgClass: "bg-[var(--lf-info-soft)] border-[var(--lf-info)]",
    textClass: "text-[var(--lf-info)]",
    desc: "Professional outreach with moderate personalization",
  },
  C: {
    label: "Grade C — Moderate Potential",
    badgeColor: "var(--lf-warning)",
    bgClass: "bg-[var(--lf-warning-soft)] border-[var(--lf-warning)]",
    textClass: "text-[var(--lf-warning)]",
    desc: "Softer introductory outreach & consultation angle",
  },
  D: {
    label: "Grade D — Basic Discovery",
    badgeColor: "var(--lf-text-muted)",
    bgClass: "bg-[var(--lf-surface-muted)] border-[var(--lf-border)]",
    textClass: "text-[var(--lf-text-secondary)]",
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
      className="lf-workspace-card overflow-hidden"
      title={
        <div className="flex items-center gap-2 py-1 text-base font-semibold">
          <EnvironmentOutlined className="text-[var(--lf-brand)]" />
          <span>Step 1: Select City & Review Lead Audience</span>
        </div>
      }
    >
      <div className="space-y-5">
        {/* City Selector & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex-1 max-w-lg">
            <Text strong className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--lf-text-muted)]">
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
                    <span className="font-medium text-[var(--lf-text)]">{c.city}</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Tag color="processing" className="lf-status-badge text-xs">
                        {c.eligible_leads} eligible
                      </Tag>
                      {c.already_sent_leads ? (
                        <Tag className="lf-status-badge text-xs">
                          {c.already_sent_leads} sent
                        </Tag>
                      ) : null}
                      <span className="text-xs text-[var(--lf-text-muted)]">({c.total_leads} total)</span>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          {selectedCity && (
            <Tooltip title={`Export 3-column XLSX (Business Type, Business Name, Mobile Number) for manual WhatsApp outreach in ${selectedCity}`}>
              <Button
                icon={<WhatsAppOutlined className="text-[var(--lf-success)] text-base" />}
                size="large"
                onClick={handleExportMobileNumbers}
                loading={exportMobileNumbersMutation.isPending}
                className="h-10 w-full shrink-0 border-[var(--lf-success)] bg-[var(--lf-success-soft)] px-4 text-xs font-semibold text-[var(--lf-success)] sm:w-auto sm:text-sm"
              >
                Export Mobile Numbers
              </Button>
            </Tooltip>
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
                      className="lf-metric-card text-center"
                    >
                      <Statistic
                        title={<span className="text-xs font-medium text-[var(--lf-text-muted)]">Total Leads</span>}
                        value={totalLeads}
                        styles={{ content: { color: "var(--lf-text)", fontWeight: 700 } }}
                        prefix={<EnvironmentOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      className="lf-metric-card text-center"
                    >
                      <Statistic
                        title={<span className="text-xs font-medium text-[var(--lf-success)]">Email-Eligible Leads</span>}
                        value={eligibleLeads}
                        styles={{ content: { color: "var(--lf-success)", fontWeight: 700 } }}
                        prefix={<CheckCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      className="lf-metric-card text-center"
                    >
                      <Statistic
                        title={<span className="text-xs font-medium text-[var(--lf-info)]">Already Sent</span>}
                        value={alreadySentLeads}
                        styles={{ content: { color: "var(--lf-info)", fontWeight: 700 } }}
                        prefix={<CheckCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      className="lf-metric-card text-center"
                    >
                      <Statistic
                        title={<span className="text-xs font-medium text-[var(--lf-warning)]">Missing Email / Skipped</span>}
                        value={ineligibleLeads}
                        styles={{ content: { color: "var(--lf-warning)", fontWeight: 700 } }}
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
                    icon={<InfoCircleOutlined />}
                    title={`${alreadySentLeads} leads in ${selectedCity} have already been emailed and are excluded from this automation.`}
                    className="text-xs py-1.5"
                  />
                )}

                {/* Missing Email Safety Notice */}
                {ineligibleLeads > 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    title={`${ineligibleLeads} leads in ${selectedCity} do not have a valid email address and will be safely skipped.`}
                    className="text-xs py-1.5"
                  />
                )}

                {/* Grade Distribution Grid */}
                <div className="pt-2">
                  <div className="mb-2.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <Text strong className="text-xs font-medium uppercase tracking-wider text-[var(--lf-text-muted)]">
                      Lead Grade Qualification Breakdown
                    </Text>
                    <Text type="secondary" className="text-xs font-medium text-[var(--lf-info)]">
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
                            className={`lf-metric-card flex h-full flex-col justify-between ${cfg.bgClass}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-[var(--lf-on-brand)] shadow-sm"
                                style={{ backgroundColor: cfg.badgeColor }}
                              >
                                {grade}
                              </span>
                              <Tag color={gStat.eligible > 0 ? "success" : "default"} className="lf-status-badge m-0 text-xs">
                                {gStat.eligible} eligible
                              </Tag>
                            </div>

                            <div className="space-y-1">
                              <div className={`font-semibold text-sm ${cfg.textClass}`}>
                                Grade {grade} Leads
                              </div>
                              <p className="!mb-0 line-clamp-2 text-xs text-[var(--lf-text-muted)]">
                                {cfg.desc}
                              </p>
                            </div>

                            <div className="mt-3 flex flex-col gap-1 border-t border-[var(--lf-border)] pt-2 text-xs text-[var(--lf-text-muted)]">
                              <div className="flex items-center justify-between">
                                <span>Total in city:</span>
                                <span className="font-semibold text-[var(--lf-text-secondary)]">
                                  {gStat.total}
                                </span>
                              </div>
                              {gStat.already_sent ? (
                                <div className="flex items-center justify-between text-[var(--lf-info)]">
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
