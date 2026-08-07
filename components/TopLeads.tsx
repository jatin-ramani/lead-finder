"use client";

import { MailOutlined, PhoneOutlined, RightOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";

import {
  avatarColor,
  initials,
  isPresent,
  primaryPhone,
} from "@/lib/format";
import type { Business } from "@/types/business";

interface TopLeadsProps {
  leads: Business[];
  loading?: boolean;
  onSelect: (business: Business) => void;
  limit?: number;
}

/**
 * The activity-feed slot from the reference layout, filled with real rows:
 * the most recently ingested businesses that have no website but can be reached.
 */
export default function TopLeads({
  leads,
  loading = false,
  onSelect,
  limit = 6,
}: TopLeadsProps) {
  if (loading && leads.length === 0) {
    return (
      <div className="lf-feed">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="lf-feed-row">
            <Skeleton active avatar={{ size: 34 }} title={false} paragraph={{ rows: 2 }} />
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <p className="lf-panel-empty">
        No qualified leads yet. A lead is a business with no website that still
        has a phone number or email.
      </p>
    );
  }

  return (
    <ul className="lf-feed">
      {leads.slice(0, limit).map((lead) => {
        const phone = primaryPhone(lead.phone);

        return (
          <li key={lead.id}>
            <button
              type="button"
              className="lf-feed-row"
              onClick={() => onSelect(lead)}
            >
              <span
                className="lf-feed-avatar"
                style={{ background: avatarColor(lead.name) }}
                aria-hidden
              >
                {initials(lead.name)}
              </span>

              <span className="lf-feed-body">
                <span className="lf-feed-name">{lead.name}</span>
                <span className="lf-feed-meta">
                  {phone && (
                    <span className="lf-feed-chip">
                      <PhoneOutlined />
                      {phone}
                    </span>
                  )}
                  {isPresent(lead.email) && (
                    <span className="lf-feed-chip">
                      <MailOutlined />
                      {lead.email}
                    </span>
                  )}
                </span>
              </span>

              <RightOutlined className="lf-feed-chevron" aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
