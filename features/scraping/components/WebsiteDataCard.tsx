"use client";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FacebookOutlined,
  GlobalOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  ThunderboltOutlined,
  TwitterOutlined,
  WhatsAppOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Tag } from "antd";

import Panel from "@/components/Panel";
import { businessesApi, isApiError, queryKeys } from "@/services";

interface WebsiteDataCardProps {
  businessId: number;
  websiteUrl?: string | null;
  onScrapeSingle?: (id: number) => void;
  isScrapingSingle?: boolean;
}

function safeUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("whatsapp:")) {
    return trimmed;
  }
  return null;
}

export default function WebsiteDataCard({
  businessId,
  websiteUrl,
  onScrapeSingle,
  isScrapingSingle = false,
}: WebsiteDataCardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.businesses.website(businessId),
    queryFn: ({ signal }) => businessesApi.getWebsiteData(businessId, signal),
    retry: false,
  });

  const isNeverScraped = isApiError(error) && error.status === 404;
  const hasWebsiteUrl = Boolean(websiteUrl && websiteUrl.trim().length > 0);

  if (isLoading) {
    return (
      <Panel title="Extracted website data">
        <div className="py-6 text-center text-xs text-gray-400">
          Loading website data...
        </div>
      </Panel>
    );
  }

  if (isNeverScraped || !data) {
    return (
      <Panel title="Extracted website data">
        <div className="py-6 px-4 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <GlobalOutlined className="text-2xl text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {hasWebsiteUrl
              ? "Website hasn't been scraped yet."
              : "This business has no website URL to scrape."}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4 max-w-sm mx-auto">
            {hasWebsiteUrl
              ? "Scrape this website to extract page title, meta description, email addresses and social profiles."
              : "Without a website URL, the scraper cannot fetch or analyze content for this business."}
          </p>

          {hasWebsiteUrl && onScrapeSingle && (
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              loading={isScrapingSingle}
              onClick={() => onScrapeSingle(businessId)}
            >
              Scrape website
            </Button>
          )}
        </div>
      </Panel>
    );
  }

  const socials = [
    { label: "Facebook", icon: <FacebookOutlined />, url: safeUrl(data.facebook) },
    { label: "Instagram", icon: <InstagramOutlined />, url: safeUrl(data.instagram) },
    { label: "LinkedIn", icon: <LinkedinOutlined />, url: safeUrl(data.linkedin) },
    { label: "Twitter", icon: <TwitterOutlined />, url: safeUrl(data.twitter) },
    { label: "YouTube", icon: <YoutubeOutlined />, url: safeUrl(data.youtube) },
    { label: "WhatsApp", icon: <WhatsAppOutlined />, url: safeUrl(data.whatsapp) },
  ].filter((s) => s.url !== null);

  return (
    <Panel
      title="Extracted website data"
      description={
        data.scraped_at
          ? `Scraped on ${new Date(data.scraped_at).toLocaleString()}`
          : "Website extraction details"
      }
      extra={
        data.status === "Completed" ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Scraped
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Failed
          </Tag>
        )
      }
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-[var(--lf-text-muted)] uppercase tracking-wider block mb-1">
            Page Title
          </label>
          <p className="text-sm font-medium text-[var(--lf-text)]">
            {data.title ?? <span className="text-[var(--lf-text-muted)] italic">None extracted</span>}
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <label className="text-xs font-semibold text-[var(--lf-text-muted)] uppercase tracking-wider block mb-1">
            Meta Description
          </label>
          <p className="text-xs text-[var(--lf-text-secondary)] leading-relaxed bg-[var(--lf-subtle)] p-2.5 rounded border border-[var(--lf-border-subtle)]">
            {data.meta_description ?? <span className="text-[var(--lf-text-muted)] italic">None extracted</span>}
          </p>
        </div>

        {/* Emails */}
        <div>
          <label className="text-xs font-semibold text-[var(--lf-text-muted)] uppercase tracking-wider block mb-1.5">
            Email Addresses
          </label>
          {data.emails && data.emails.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {data.emails.map((email) => (
                <Tag key={email} icon={<MailOutlined />} color="gold">
                  {email}
                </Tag>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--lf-text-muted)] italic">No email addresses found</p>
          )}
        </div>

        {/* Social Profiles */}
        <div>
          <label className="text-xs font-semibold text-[var(--lf-text-muted)] uppercase tracking-wider block mb-1.5">
            Social Profiles
          </label>
          {socials.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[var(--lf-subtle)] hover:bg-[var(--lf-raised)] text-[var(--lf-text-secondary)] rounded transition-colors border border-[var(--lf-border-subtle)]"
                >
                  {s.icon}
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--lf-text-muted)] italic">No social profiles found</p>
          )}
        </div>

        {/* Action button to re-scrape */}
        {hasWebsiteUrl && onScrapeSingle && (
          <div className="pt-2 border-t border-[var(--lf-border-subtle)] flex justify-end">
            <Button
              size="small"
              icon={<ThunderboltOutlined />}
              loading={isScrapingSingle}
              onClick={() => onScrapeSingle(businessId)}
            >
              Re-scrape website
            </Button>
          </div>
        )}
      </div>
    </Panel>
  );
}
