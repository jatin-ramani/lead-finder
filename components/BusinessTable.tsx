"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  ExportOutlined,
  EyeOutlined,
  MailOutlined,
  MoreOutlined,
  PhoneOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Dropdown,
  Skeleton,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

import EmptyState from "@/components/EmptyState";
import {
  avatarColor,
  copyText,
  hasWebsite,
  initials,
  isPresent,
  primaryPhone,
  splitPhones,
  toAbsoluteUrl,
  toDisplayUrl,
  toTelHref,
  uniqueValues,
} from "@/lib/format";
import type { Business } from "@/types/business";

const { Text } = Typography;

interface BusinessTableProps {
  data: Business[];
  loading?: boolean;
  onView: (business: Business) => void;
  onAnalyze: (business: Business) => void;
  /** Rendered when there is no data and no request in flight. */
  emptyAction?: { label: string; onClick: () => void };
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

const SKELETON_ROWS = Array.from({ length: 8 }, (_, index) => ({
  id: -(index + 1),
  name: "",
}));

export default function BusinessTable({
  data,
  loading = false,
  onView,
  onAnalyze,
  emptyAction,
  onResetFilters,
  hasActiveFilters = false,
}: BusinessTableProps) {
  const { message } = App.useApp();

  const copy = async (label: string, value?: string | null) => {
    if (!isPresent(value)) {
      message.warning(`No ${label.toLowerCase()} on this business.`);
      return;
    }
    const ok = await copyText(value);
    if (ok) message.success(`${label} copied`);
    else message.error(`Could not copy the ${label.toLowerCase()}.`);
  };

  const cityFilters = useMemo(
    () => uniqueValues(data, "city").map((city) => ({ text: city, value: city })),
    [data],
  );

  const columns = useMemo<ColumnsType<Business>>(
    () => [
      {
        title: "Business Name",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        width: 280,
        ellipsis: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (_value, record) => (
          <button
            type="button"
            className="lf-cell-business"
            onClick={() => onView(record)}
          >
            <Avatar
              size={34}
              shape="square"
              style={{
                background: avatarColor(record.name),
                color: "#0b0b0b",
                fontSize: 13,
                fontWeight: 650,
                flexShrink: 0,
              }}
            >
              {initials(record.name)}
            </Avatar>
            <span className="min-w-0 text-start">
              <span className="lf-cell-business-name">{record.name}</span>
              {isPresent(record.category) && (
                <span className="lf-cell-business-sub">{record.category}</span>
              )}
            </span>
          </button>
        ),
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
        width: 190,
        sorter: (a, b) => (a.phone ?? "").localeCompare(b.phone ?? ""),
        render: (value: string | null) => {
          const numbers = splitPhones(value);
          if (numbers.length === 0) return <Text type="secondary">—</Text>;

          return (
            <Tooltip title={numbers.length > 1 ? numbers.join(" · ") : undefined}>
              <a href={toTelHref(value as string)} className="lf-cell-contact">
                <PhoneOutlined className="lf-cell-contact-icon" />
                <span className="truncate">{numbers[0]}</span>
                {numbers.length > 1 && (
                  <span className="lf-cell-more">+{numbers.length - 1}</span>
                )}
              </a>
            </Tooltip>
          );
        },
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 240,
        ellipsis: true,
        sorter: (a, b) => (a.email ?? "").localeCompare(b.email ?? ""),
        render: (value: string | null) =>
          isPresent(value) ? (
            <a href={`mailto:${value}`} className="lf-cell-contact">
              <MailOutlined className="lf-cell-contact-icon" />
              <span className="truncate">{value}</span>
            </a>
          ) : (
            <Text type="secondary">—</Text>
          ),
      },
      {
        title: "Website",
        dataIndex: "website",
        key: "website",
        width: 230,
        ellipsis: true,
        render: (value: string | null) => {
          const href = toAbsoluteUrl(value);
          if (!href) return <Text type="secondary">—</Text>;
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="lf-cell-link"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="truncate">{toDisplayUrl(value)}</span>
              <ExportOutlined className="lf-cell-link-icon" />
            </a>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "website",
        key: "status",
        width: 150,
        filters: [
          { text: "Has Website", value: "has-website" },
          { text: "No Website", value: "no-website" },
        ],
        onFilter: (value, record) =>
          value === "has-website" ? hasWebsite(record) : !hasWebsite(record),
        sorter: (a, b) => Number(hasWebsite(a)) - Number(hasWebsite(b)),
        render: (_value, record) =>
          hasWebsite(record) ? (
            <Tag color="success" icon={<CheckCircleFilled />} className="lf-tag">
              Has Website
            </Tag>
          ) : (
            <Tag color="error" icon={<CloseCircleFilled />} className="lf-tag">
              No Website
            </Tag>
          ),
      },
      {
        title: "City",
        dataIndex: "city",
        key: "city",
        width: 160,
        ellipsis: true,
        filters: cityFilters,
        filterSearch: cityFilters.length > 8,
        onFilter: (value, record) => record.city === value,
        sorter: (a, b) => (a.city ?? "").localeCompare(b.city ?? ""),
        render: (value: string | null) =>
          isPresent(value) ? value : <Text type="secondary">—</Text>,
      },
      {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 110,
        align: "center",
        render: (_value, record) => {
          const websiteHref = toAbsoluteUrl(record.website);

          return (
            <div
              className="flex items-center justify-center gap-1"
              onClick={(event) => event.stopPropagation()}
            >
              <Tooltip title="View details">
                <Button
                  type="text"
                  size="small"
                  aria-label={`View ${record.name}`}
                  icon={<EyeOutlined />}
                  onClick={() => onView(record)}
                />
              </Tooltip>

              <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                menu={{
                  items: [
                    { key: "view", icon: <EyeOutlined />, label: "View Details" },
                    {
                      key: "analyze",
                      icon: <ThunderboltOutlined />,
                      label: "Analyze Website",
                    },
                    { type: "divider" },
                    {
                      key: "copy-phone",
                      icon: <CopyOutlined />,
                      label: "Copy Phone",
                      disabled: !isPresent(record.phone),
                    },
                    {
                      key: "copy-email",
                      icon: <CopyOutlined />,
                      label: "Copy Email",
                      disabled: !isPresent(record.email),
                    },
                    {
                      key: "open-website",
                      icon: <ExportOutlined />,
                      label: "Open Website",
                      disabled: !websiteHref,
                    },
                  ],
                  onClick: ({ key, domEvent }) => {
                    domEvent.stopPropagation();
                    if (key === "view") onView(record);
                    if (key === "analyze") onAnalyze(record);
                    if (key === "copy-phone") {
                      void copy("Phone", primaryPhone(record.phone));
                    }
                    if (key === "copy-email") void copy("Email", record.email);
                    if (key === "open-website" && websiteHref) {
                      window.open(websiteHref, "_blank", "noopener,noreferrer");
                    }
                  },
                }}
              >
                <Button
                  type="text"
                  size="small"
                  aria-label={`More actions for ${record.name}`}
                  icon={<MoreOutlined />}
                />
              </Dropdown>
            </div>
          );
        },
      },
    ],
    // `copy` is stable enough for this table; message comes from a context ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cityFilters, onView, onAnalyze],
  );

  const skeletonColumns = useMemo<ColumnsType<Business>>(
    () =>
      columns.map((column, index) => ({
        ...column,
        sorter: undefined,
        filters: undefined,
        render: () => (
          <Skeleton.Input
            active
            size="small"
            style={{ width: index === 0 ? 180 : "70%", minWidth: 60, height: 18 }}
          />
        ),
      })),
    [columns],
  );

  const showSkeleton = loading && data.length === 0;

  return (
    <div className="lf-table-card">
      <Table<Business>
        rowKey="id"
        columns={showSkeleton ? skeletonColumns : columns}
        dataSource={showSkeleton ? (SKELETON_ROWS as Business[]) : data}
        loading={loading && data.length > 0}
        sticky={{ offsetHeader: 0 }}
        scroll={{ x: 1180 }}
        size="middle"
        className="lf-table"
        rowClassName={() => "lf-table-row"}
        onRow={(record) =>
          showSkeleton
            ? {}
            : {
                onClick: () => onView(record),
                style: { cursor: "pointer" },
              }
        }
        pagination={
          showSkeleton
            ? false
            : {
                defaultPageSize: 10,
                pageSizeOptions: [10, 20, 50, 100],
                showSizeChanger: true,
                showQuickJumper: data.length > 100,
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} of ${total} businesses`,
                className: "lf-pagination",
              }
        }
        locale={{
          emptyText: showSkeleton ? null : (
            <EmptyState
              compact
              title={
                hasActiveFilters ? "No matching businesses" : "No Businesses Found"
              }
              description={
                hasActiveFilters
                  ? "No business matches the current filters. Try widening your search."
                  : "Your workspace is empty. Run a scan to pull businesses from the Geoapify source into Lead Finder."
              }
              action={
                hasActiveFilters && onResetFilters
                  ? { label: "Reset filters", onClick: onResetFilters }
                  : emptyAction
              }
            />
          ),
        }}
      />
    </div>
  );
}
