"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  GlobalOutlined,
  MailOutlined,
  MobileOutlined,
  PhoneOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { App, Avatar, Button, Drawer, Tag, Tooltip } from "antd";
import type { ReactNode } from "react";

import {
  avatarColor,
  copyText,
  hasWebsite,
  initials,
  isPresent,
  splitPhones,
  toAbsoluteUrl,
  toDisplayUrl,
  toMapsUrl,
  toTelHref,
} from "@/lib/format";
import type { Business } from "@/types/business";

interface BusinessDrawerProps {
  business: Business | null;
  open: boolean;
  onClose: () => void;
  /** Scrolls to and highlights the website-analysis panel. */
  highlightAnalysis?: boolean;
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
            {external && <ExportOutlined className="ms-1 text-[11px]" />}
          </a>
        ) : (
          <span className={`lf-detail-value ${present ? "" : "lf-detail-value--muted"}`}>
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

const FUTURE_METRICS = [
  {
    key: "seo",
    label: "SEO Score",
    icon: <SafetyCertificateOutlined />,
    accent: "#8b5cf6",
  },
  {
    key: "performance",
    label: "Performance",
    icon: <RocketOutlined />,
    accent: "#f59e0b",
  },
  {
    key: "mobile",
    label: "Mobile Friendly",
    icon: <MobileOutlined />,
    accent: "#0ea5e9",
  },
];

export default function BusinessDrawer({
  business,
  open,
  onClose,
  highlightAnalysis = false,
}: BusinessDrawerProps) {
  const { message } = App.useApp();

  const copy = async (label: string, value?: string | null) => {
    if (!isPresent(value)) return;
    const ok = await copyText(value);
    if (ok) message.success(`${label} copied`);
    else message.error(`Could not copy the ${label.toLowerCase()}.`);
  };

  const websiteHref = toAbsoluteUrl(business?.website);
  const online = business ? hasWebsite(business) : false;
  const phoneNumbers = splitPhones(business?.phone);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={460}
      title="Business details"
      className="lf-drawer"
      destroyOnHidden
      extra={
        websiteHref && (
          <Button
            type="primary"
            size="small"
            icon={<ExportOutlined />}
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
                color: "#0b0b0b",
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
                {isPresent(business.status) && (
                  <Tag className="lf-tag">{business.status}</Tag>
                )}
                {isPresent(business.category) && (
                  <Tag className="lf-tag">{business.category}</Tag>
                )}
              </div>
            </div>
          </header>

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
                    label={
                      phoneNumbers.length > 1 ? `Phone ${index + 1}` : "Phone"
                    }
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
              icon={<EnvironmentOutlined />}
              href={toMapsUrl(business)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </Button>
          </section>

          <section
            className={`lf-analysis ${highlightAnalysis ? "lf-analysis--highlight" : ""}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="lf-drawer-section-title mb-0">Website analysis</h3>
              <Tag color="processing" className="lf-tag">
                Coming soon
              </Tag>
            </div>

            <div className="flex flex-col gap-2">
              {FUTURE_METRICS.map((metric) => (
                <div key={metric.key} className="lf-metric-row">
                  <span
                    className="lf-metric-icon"
                    style={{ color: metric.accent }}
                    aria-hidden
                  >
                    {metric.icon}
                  </span>
                  <span className="lf-metric-label">{metric.label}</span>
                  <span className="lf-metric-value">—</span>
                </div>
              ))}
            </div>

            <p className="lf-analysis-note">
              <ThunderboltOutlined className="me-1.5" />
              {online
                ? "Audit scores will appear here once the analysis service is connected."
                : "This business has no website — a prime opportunity to pitch one."}
            </p>
          </section>
        </div>
      )}
    </Drawer>
  );
}
