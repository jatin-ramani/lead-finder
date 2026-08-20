"use client";

import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FacebookOutlined,
  GlobalOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  RedoOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined,
  TwitterOutlined,
  YoutubeOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import {
  Button,
  Drawer,
  Empty,
  Input,
  Pagination,
  Segmented,
  Select,
  Skeleton,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import ErrorState from "@/components/feedback/ErrorState";
import type { ScrapeJobResultItem } from "@/types/api";

import { useScrapeJobResults } from "../hooks/useScrapeJobResults";

interface ScrapeJobDetailsProps {
  jobId: number;
  onBack: () => void;
  onRetryFailed: () => void;
  isRetrying: boolean;
}

export default function ScrapeJobDetails({
  jobId,
  onBack,
  onRetryFailed,
  isRetrying,
}: ScrapeJobDetailsProps) {
  const {
    results,
    pagination,
    summary,
    cities,
    query,
    isLoading,
    isRefetching,
    error,
    refetch,
    setPage,
    setStatus,
    setCity,
    setSearch,
  } = useScrapeJobResults(jobId);

  const [selectedResult, setSelectedResult] = useState<ScrapeJobResultItem | null>(null);

  if (error && !isRefetching && results.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          className="self-start"
        >
          Back to Jobs
        </Button>
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          title={`Could not load results for scrape job #${jobId}`}
        />
      </div>
    );
  }

  const columns: ColumnsType<ScrapeJobResultItem> = [
    {
      title: "Business",
      key: "business",
      width: 220,
      render: (_, record) => (
        <div className="min-w-0">
          <div className="font-semibold text-sm text-[var(--lf-text)] truncate" title={record.business_name}>
            {record.business_name}
          </div>
          <div className="text-xs text-[var(--lf-text-muted)] flex items-center gap-2 mt-0.5">
            <span>{record.business_city}</span>
            <span>•</span>
            <span>{record.business_category}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Target Website",
      dataIndex: "website",
      key: "website",
      width: 200,
      render: (val: string | null) => {
        if (!val) return <span className="text-[var(--lf-text-muted)]">—</span>;
        const display = val.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
        return (
          <a
            href={val.startsWith("http") ? val : `https://${val}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--lf-brand)] hover:underline flex items-center gap-1.5 truncate"
            onClick={(e) => e.stopPropagation()}
          >
            <GlobalOutlined className="text-[var(--lf-text-muted)] shrink-0" />
            <span className="truncate">{display}</span>
          </a>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        if (status === "Completed") {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Success
            </Tag>
          );
        }
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Failed
          </Tag>
        );
      },
    },
    {
      title: "Extracted Emails",
      dataIndex: "emails",
      key: "emails",
      width: 220,
      render: (emails: string[]) => {
        if (!emails || emails.length === 0) {
          return <span className="text-xs text-[var(--lf-text-muted)]">None found</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {emails.slice(0, 2).map((email, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 rounded bg-[var(--lf-subtle)] text-[var(--lf-text-secondary)] font-mono truncate max-w-[180px]"
                title={email}
              >
                {email}
              </span>
            ))}
            {emails.length > 2 && (
              <span className="text-xs text-[var(--lf-text-muted)] font-semibold">
                +{emails.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Social Links",
      key: "socials",
      width: 140,
      render: (_, record) => {
        const socials = [
          { link: record.facebook, icon: <FacebookOutlined />, label: "Facebook" },
          { link: record.instagram, icon: <InstagramOutlined />, label: "Instagram" },
          { link: record.linkedin, icon: <LinkedinOutlined />, label: "LinkedIn" },
          { link: record.twitter, icon: <TwitterOutlined />, label: "Twitter" },
          { link: record.youtube, icon: <YoutubeOutlined />, label: "YouTube" },
          { link: record.whatsapp, icon: <WhatsAppOutlined />, label: "WhatsApp" },
        ].filter((s) => Boolean(s.link));

        if (socials.length === 0) {
          return <span className="text-xs text-[var(--lf-text-muted)]">—</span>;
        }

        return (
          <div className="flex items-center gap-2">
            {socials.map((s, idx) => (
              <Tooltip key={idx} title={s.label}>
                <a
                  href={s.link!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--lf-text-secondary)] hover:text-[var(--lf-brand)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {s.icon}
                </a>
              </Tooltip>
            ))}
          </div>
        );
      },
    },
    {
      title: "Scraped Content",
      key: "content",
      render: (_, record) => {
        if (record.status === "Failed") {
          return (
            <span className="text-xs text-[var(--lf-error)]">
              {record.failure_reason || "Connection or extraction failed"}
            </span>
          );
        }
        return (
          <div className="max-w-md truncate">
            <div className="text-xs font-medium text-[var(--lf-text)] truncate">
              {record.title || "No page title"}
            </div>
            <div className="text-[11px] text-[var(--lf-text-muted)] truncate">
              {record.meta_description || "No description metadata"}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="lf-scrape-details">
      {/* Top Header Strip & Breadcrumbs */}
      <div className="lf-scrape-summary-card">
        <div className="lf-scrape-header-strip">
          <div className="flex items-center gap-3">
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
            >
              Back to Jobs
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[var(--lf-text)] m-0">
                  Scrape Job #{jobId}
                </h2>
                {summary && (
                  <Tag
                    color={
                      summary.status === "Completed"
                        ? "success"
                        : summary.status === "Failed"
                          ? "error"
                          : "processing"
                    }
                  >
                    {summary.status}
                  </Tag>
                )}
              </div>
              {summary?.started_at && (
                <p className="text-xs text-[var(--lf-text-muted)] mt-1 mb-0 font-mono">
                  Started: {new Date(summary.started_at).toLocaleString()}{" "}
                  {summary.completed_at &&
                    `• Completed: ${new Date(summary.completed_at).toLocaleString()}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<ReloadOutlined spin={isRefetching} />}
              onClick={() => void refetch()}
              disabled={isRefetching}
            >
              Refresh
            </Button>
            {summary && summary.failed > 0 && (
              <Button
                type="primary"
                icon={<RedoOutlined />}
                onClick={onRetryFailed}
                loading={isRetrying}
              >
                Retry failed ({summary.failed})
              </Button>
            )}
          </div>
        </div>

        {/* KPIs Metrics Strip */}
        <div className="lf-scrape-kpis">
          <div className="lf-scrape-kpi">
            <div className="lf-scrape-kpi-label">Total Targets</div>
            <div className="lf-scrape-kpi-val">
              {(summary?.total_websites ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="lf-scrape-kpi">
            <div className="lf-scrape-kpi-label">Processed</div>
            <div className="lf-scrape-kpi-val text-[var(--lf-brand)]">
              {(summary?.completed ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="lf-scrape-kpi">
            <div className="lf-scrape-kpi-label">Success</div>
            <div className="lf-scrape-kpi-val text-[var(--lf-success)]">
              {(summary?.success ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="lf-scrape-kpi">
            <div className="lf-scrape-kpi-label">Failed</div>
            <div className="lf-scrape-kpi-val text-[var(--lf-error)]">
              {(summary?.failed ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="lf-panel">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              options={[
                { label: "All Results", value: "" },
                { label: "Success", value: "Completed" },
                { label: "Failed", value: "Failed" },
              ]}
              value={query.status ?? ""}
              onChange={(val) => setStatus(val ? String(val) : undefined)}
            />

            {cities.length > 0 && (
              <Select
                placeholder="Filter by city"
                allowClear
                value={query.city}
                onChange={(val) => setCity(val)}
                className="w-44"
                options={[
                  { label: "All Cities", value: "" },
                  ...cities.map((c: { city: string; count: number }) => ({
                    label: `${c.city} (${c.count})`,
                    value: c.city,
                  })),
                ]}
              />
            )}
          </div>

          <Input
            prefix={<SearchOutlined className="text-[var(--lf-text-muted)]" />}
            placeholder="Search business, website, title…"
            allowClear
            value={query.search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
        </div>
      </div>

      {/* Results Table (Desktop) */}
      <div className="lf-table-card">
        {isLoading && results.length === 0 ? (
          <div className="p-6">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center">
            <Empty
              description={
                query.search || query.status || query.city
                  ? "No scrape results match the active filters."
                  : "No website results recorded for this job yet."
              }
            />
          </div>
        ) : (
          <>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={results}
              pagination={false}
              onRow={(record) => ({
                onClick: () => setSelectedResult(record),
                className: "lf-table-row",
              })}
              scroll={{ x: 900 }}
              size="middle"
            />

            {/* Mobile Cards View (Visible at <= 767px) */}
            <div className="lf-mobile-business-list p-3">
              {results.map((item: ScrapeJobResultItem) => (
                <div
                  key={item.id}
                  className="lf-mobile-business-card"
                  onClick={() => setSelectedResult(item)}
                >
                  <div className="lf-mobile-business-head">
                    <button type="button" className="lf-mobile-business-name">
                      {item.business_name}
                    </button>
                    <Tag
                      color={item.status === "Completed" ? "success" : "error"}
                      className="shrink-0"
                    >
                      {item.status === "Completed" ? "Success" : "Failed"}
                    </Tag>
                  </div>
                  <div className="lf-mobile-business-meta">
                    {item.business_city} • {item.business_category}
                  </div>
                  {item.website && (
                    <div className="text-xs text-[var(--lf-brand)] mb-2 truncate">
                      {item.website}
                    </div>
                  )}
                  {item.failure_reason && (
                    <div className="text-xs text-[var(--lf-error)] mb-2 truncate">
                      {item.failure_reason}
                    </div>
                  )}
                  {item.emails.length > 0 && (
                    <div className="lf-mobile-business-contact">
                      {item.emails.map((e: string, idx: number) => (
                        <span key={idx} className="is-available truncate">
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="lf-pagination flex justify-end">
                <Pagination
                  current={pagination.page}
                  pageSize={pagination.pageSize}
                  total={pagination.totalItems}
                  onChange={(page, pageSize) => setPage(page, pageSize)}
                  showSizeChanger
                  pageSizeOptions={[10, 20, 50, 100]}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Scraped Website Data Drawer */}
      <Drawer
        title="Scraped Website Details"
        open={selectedResult !== null}
        onClose={() => setSelectedResult(null)}
        size={520}
        className="lf-drawer"
      >
        {selectedResult && (
          <div className="flex flex-col gap-6">
            <section>
              <h3 className="lf-drawer-section-title">Business Information</h3>
              <dl className="lf-detail-list">
                <div className="lf-detail-row">
                  <dt className="lf-detail-label">Name</dt>
                  <dd className="lf-detail-value font-semibold">
                    {selectedResult.business_name}
                  </dd>
                </div>
                <div className="lf-detail-row">
                  <dt className="lf-detail-label">City</dt>
                  <dd className="lf-detail-value">{selectedResult.business_city}</dd>
                </div>
                <div className="lf-detail-row">
                  <dt className="lf-detail-label">Category</dt>
                  <dd className="lf-detail-value">{selectedResult.business_category}</dd>
                </div>
                {selectedResult.business_phone && (
                  <div className="lf-detail-row">
                    <dt className="lf-detail-label">Phone</dt>
                    <dd className="lf-detail-value">{selectedResult.business_phone}</dd>
                  </div>
                )}
                {selectedResult.website && (
                  <div className="lf-detail-row">
                    <dt className="lf-detail-label">Website</dt>
                    <dd className="lf-detail-value">
                      <a
                        href={selectedResult.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lf-detail-value--link"
                      >
                        {selectedResult.website}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <section>
              <h3 className="lf-drawer-section-title">Extraction Outcome</h3>
              <dl className="lf-detail-list">
                <div className="lf-detail-row">
                  <dt className="lf-detail-label">Scrape Status</dt>
                  <dd className="lf-detail-value">
                    <Tag
                      color={
                        selectedResult.status === "Completed" ? "success" : "error"
                      }
                    >
                      {selectedResult.status}
                    </Tag>
                  </dd>
                </div>
                {selectedResult.scraped_at && (
                  <div className="lf-detail-row">
                    <dt className="lf-detail-label">Scraped At</dt>
                    <dd className="lf-detail-value font-mono text-xs">
                      {new Date(selectedResult.scraped_at).toLocaleString()}
                    </dd>
                  </div>
                )}
                {selectedResult.title && (
                  <div className="lf-detail-row">
                    <dt className="lf-detail-label">Page Title</dt>
                    <dd className="lf-detail-value font-medium">
                      {selectedResult.title}
                    </dd>
                  </div>
                )}
                {selectedResult.meta_description && (
                  <div className="lf-detail-row">
                    <dt className="lf-detail-label">Meta Description</dt>
                    <dd className="lf-detail-value">
                      {selectedResult.meta_description}
                    </dd>
                  </div>
                )}
                <div className="lf-detail-row">
                  <dt className="lf-detail-label">Emails Found</dt>
                  <dd className="lf-detail-value">
                    {selectedResult.emails.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedResult.emails.map((e, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-[var(--lf-subtle)] text-[var(--lf-brand)] font-mono text-xs"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[var(--lf-text-muted)]">
                        No email addresses discovered
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
