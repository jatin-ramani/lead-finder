"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { App, Avatar, Button, Drawer, Progress, Tag, Tooltip } from "antd";
import type { ReactNode } from "react";

import WebsiteDataCard from "@/features/scraping/components/WebsiteDataCard";
import {
  avatarColor,
  copyText,
  initials,
  isPresent,
  splitPhones,
  toAbsoluteUrl,
  toDisplayUrl,
  toMapsUrl,
  toTelHref,
} from "@/lib/format";
import type { Business } from "@/types/api";

interface BusinessDrawerProps {
  business: Business | null;
  open: boolean;
  onClose: () => void;
  onDelete: (business: Business) => void;
  isDeleting: boolean;
  onScrapeSingle?: (businessId: number) => void;
  isScrapingSingle?: boolean;
}

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  value?: string | null;
  href?: string | null;
  external?: boolean;
  onCopy?: () => void;
}

function DetailRow({
  icon,
  label,
  value,
  href,
  external,
  onCopy,
}: DetailRowProps) {
  const present = isPresent(value);

  return (
    <div className="lf-detail-row">
      <span className="lf-detail-icon" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <span className="lf-detail-label">{label}</span>
        {present && href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="lf-detail-value lf-detail-value--link"
          >
            {value}
            {external && <ExportOutlined className="ms-1 text-[11px]" aria-hidden />}
          </a>
        ) : (
          <span
            className={`lf-detail-value ${present ? "" : "lf-detail-value--muted"}`}
          >
            {present ? value : "Not available"}
          </span>
        )}
      </div>
      {present && onCopy && (
        <Tooltip title={`Copy ${label.toLowerCase()}`}>
          <Button
            type="text"
            size="small"
            aria-label={`Copy ${label}`}
            icon={<CopyOutlined />}
            onClick={onCopy}
          />
        </Tooltip>
      )}
    </div>
  );
}

export default function BusinessDrawer({
  business,
  open,
  onClose,
  onDelete,
  isDeleting,
  onScrapeSingle,
  isScrapingSingle = false,
}: BusinessDrawerProps) {
  const { message } = App.useApp();

  const copy = async (label: string, value?: string | null) => {
    if (!isPresent(value)) return;

    const ok = await copyText(value);
    if (ok) message.success(`${label} copied`);
    else message.error(`Could not copy the ${label.toLowerCase()}.`);
  };

  const websiteHref = toAbsoluteUrl(business?.website);
  const online = Boolean(websiteHref);
  const phoneNumbers = splitPhones(business?.phone);

  const leadScore = business?.lead_score ?? 0;
  const leadGrade = business?.lead_grade || "D";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={480}
      title="Business details"
      className="lf-drawer"
      destroyOnHidden
      extra={
        websiteHref && (
          <Button
            type="primary"
            size="small"
            icon={<ExportOutlined aria-hidden />}
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit site
          </Button>
        )
      }
    >
      {business && (
        <div className="flex flex-col gap-6">
          <header className="flex items-start gap-3">
            <Avatar
              size={52}
              shape="square"
              style={{
                background: avatarColor(business.name),
                color: "var(--lf-surface)",
                fontSize: 18,
                fontWeight: 650,
                flexShrink: 0,
              }}
            >
              {initials(business.name)}
            </Avatar>
            <div className="min-w-0">
              <h2 className="lf-drawer-title">{business.name}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {online ? (
                  <Tag color="success" icon={<CheckCircleFilled />} className="lf-tag">
                    Has Website
                  </Tag>
                ) : (
                  <Tag color="error" icon={<CloseCircleFilled />} className="lf-tag">
                    No Website
                  </Tag>
                )}
                {isPresent(business.category) && (
                  <Tag className="lf-tag">{business.category}</Tag>
                )}
              </div>
            </div>
          </header>

          {/* Lead Score & Opportunity Breakdown */}
          <section className="lf-score-card">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className={`lf-grade-badge lf-grade-badge--${leadGrade}`}>
                  Grade {leadGrade}
                </span>
                <span className="text-sm font-bold text-[var(--lf-text)]">Lead Score</span>
              </div>
              <div className="text-right">
                <span className="lf-num text-lg font-bold text-[var(--lf-text)]">
                  {leadScore}
                </span>
                <span className="text-xs text-[var(--lf-text-muted)] font-medium"> / 100</span>
              </div>
            </div>

            <Progress
              percent={leadScore}
              showInfo={false}
              strokeColor={
                leadScore >= 80
                  ? "#10B981"
                  : leadScore >= 60
                  ? "#3B82F6"
                  : leadScore >= 40
                  ? "#F59E0B"
                  : "#64748B"
              }
              size={["100%", 6]}
            />

            {business.lead_score_reasons && business.lead_score_reasons.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-[var(--lf-border-subtle)]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--lf-text-muted)] mb-2">
                  Why this lead is valuable:
                </p>
                <ul className="lf-score-reasons">
                  {business.lead_score_reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-xs text-[var(--lf-text-secondary)]">
                      <span className="text-[var(--lf-success)] font-semibold text-[11px]">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section>
            <h3 className="lf-drawer-section-title">Contact</h3>
            <div className="lf-detail-list">
              {phoneNumbers.length === 0 ? (
                <DetailRow icon={<PhoneOutlined />} label="Phone" value={null} />
              ) : (
                phoneNumbers.map((number, index) => (
                  <DetailRow
                    key={number}
                    icon={<PhoneOutlined />}
                    label={phoneNumbers.length > 1 ? `Phone ${index + 1}` : "Phone"}
                    value={number}
                    href={toTelHref(number)}
                    onCopy={() => void copy("Phone", number)}
                  />
                ))
              )}
              <DetailRow
                icon={<MailOutlined />}
                label="Email"
                value={business.email}
                href={isPresent(business.email) ? `mailto:${business.email}` : null}
                onCopy={() => void copy("Email", business.email)}
              />
              <DetailRow
                icon={<GlobalOutlined />}
                label="Website"
                value={online ? toDisplayUrl(business.website) : null}
                href={websiteHref}
                external
                onCopy={() => void copy("Website", websiteHref)}
              />
            </div>
          </section>

          {/* Website Scraping Data Card */}
          <section>
            <WebsiteDataCard
              businessId={business.id}
              websiteUrl={business.website}
              onScrapeSingle={onScrapeSingle}
              isScrapingSingle={isScrapingSingle}
            />
          </section>

          <section>
            <h3 className="lf-drawer-section-title">Location</h3>
            <div className="lf-detail-list">
              <DetailRow
                icon={<EnvironmentOutlined />}
                label="Address"
                value={business.address}
                onCopy={() => void copy("Address", business.address)}
              />
              <DetailRow
                icon={<EnvironmentOutlined />}
                label="City"
                value={business.city}
              />
            </div>

            <Button
              block
              className="mt-3"
              icon={<EnvironmentOutlined aria-hidden />}
              href={toMapsUrl(business)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </Button>
          </section>

          <section>
            <h3 className="lf-drawer-section-title">Danger zone</h3>
            <Button
              block
              danger
              icon={<DeleteOutlined aria-hidden />}
              loading={isDeleting}
              disabled={isDeleting}
              onClick={() => onDelete(business)}
            >
              Delete this business
            </Button>
          </section>
        </div>
      )}
    </Drawer>
  );
}
