"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  DeleteOutlined,
  ExportOutlined,
  EyeOutlined,
  MailOutlined,
  MoreOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Checkbox,
  Dropdown,
  Pagination,
  Skeleton,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useMemo } from "react";

import EmptyState from "@/components/EmptyState";
import { PAGE_SIZE_OPTIONS, type UrlFilters } from "@/hooks/useUrlFilters";
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
} from "@/lib/format";
import type {
  Business,
  BusinessSortField,
  PaginationResponse,
  SortOrder,
} from "@/types/api";

const { Text } = Typography;

interface BusinessTableProps {
  businesses: Business[];
  pagination: PaginationResponse | undefined;
  filters: UrlFilters;

  isLoading: boolean;
  isRefetching: boolean;

  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;

  onView: (business: Business) => void;
  onDelete: (business: Business) => void;
  isDeleting: boolean;
}

/** Placeholder rows carry negative ids so they cannot collide with real ones. */
const SKELETON_ROWS = Array.from({ length: 8 }, (_, index) => ({
  id: -(index + 1),
  name: "",
})) as Business[];

export default function BusinessTable({
  businesses,
  pagination,
  filters,
  isLoading,
  isRefetching,
  selectedIds,
  onSelectionChange,
  onView,
  onDelete,
  isDeleting,
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

  const columns = useMemo<ColumnsType<Business>>(
    () => [
      {
        title: "Business Name",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        width: 280,
        ellipsis: true,
        // The server sorts. `sorter: true` asks Ant Design for the control
        // without letting it reorder the page it happens to be holding.
        sorter: true,
        sortOrder:
          filters.sortBy === "name"
            ? filters.sortOrder === "asc"
              ? "ascend"
              : "descend"
            : null,
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
                color: "var(--lf-surface)",
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
        render: (value: string | null) => {
          const numbers = splitPhones(value);
          if (numbers.length === 0) return <Text type="secondary">—</Text>;

          return (
            <Tooltip title={numbers.length > 1 ? numbers.join(" Â· ") : undefined}>
              <a href={toTelHref(value as string)} className="lf-cell-contact">
                <PhoneOutlined className="lf-cell-contact-icon" aria-hidden />
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
        render: (value: string | null) =>
          isPresent(value) ? (
            <a href={`mailto:${value}`} className="lf-cell-contact">
              <MailOutlined className="lf-cell-contact-icon" aria-hidden />
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
              <ExportOutlined className="lf-cell-link-icon" aria-hidden />
            </a>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 150,
        sorter: true,
        sortOrder:
          filters.sortBy === "status"
            ? filters.sortOrder === "asc"
              ? "ascend"
              : "descend"
            : null,
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
        sorter: true,
        sortOrder:
          filters.sortBy === "city"
            ? filters.sortOrder === "asc"
              ? "ascend"
              : "descend"
            : null,
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
                    { key: "view", icon: <EyeOutlined />, label: "View details" },
                    { type: "divider" },
                    {
                      key: "copy-phone",
                      icon: <CopyOutlined />,
                      label: "Copy phone",
                      disabled: !isPresent(record.phone),
                    },
                    {
                      key: "copy-email",
                      icon: <CopyOutlined />,
                      label: "Copy email",
                      disabled: !isPresent(record.email),
                    },
                    {
                      key: "open-website",
                      icon: <ExportOutlined />,
                      label: "Open website",
                      disabled: !websiteHref,
                    },
                    { type: "divider" },
                    {
                      key: "delete",
                      icon: <DeleteOutlined />,
                      label: "Delete",
                      danger: true,
                    },
                  ],
                  onClick: ({ key, domEvent }) => {
                    domEvent.stopPropagation();

                    if (key === "view") onView(record);
                    if (key === "copy-phone") {
                      void copy("Phone", primaryPhone(record.phone));
                    }
                    if (key === "copy-email") void copy("Email", record.email);
                    if (key === "open-website" && websiteHref) {
                      window.open(websiteHref, "_blank", "noopener,noreferrer");
                    }
                    // Deletion is confirmed in the page, which owns the dialog
                    // — a Popconfirm inside a menu that closes on click cannot
                    // stay open long enough to be confirmed.
                    if (key === "delete") onDelete(record);
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
    // `copy` closes over a stable message instance from context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.sortBy, filters.sortOrder, onView, onDelete],
  );

  /** The same columns with every cell replaced by a bar of the right width. */
  const skeletonColumns = useMemo<ColumnsType<Business>>(
    () =>
      columns.map((column, index) => ({
        ...column,
        sorter: undefined,
        sortOrder: null,
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

  const showSkeleton = isLoading;

  /**
   * Ant Design reports sorting and paging through one callback. Both are
   * translated into URL changes; nothing is stored here.
   */
  const handleTableChange = (
    nextPagination: TablePaginationConfig,
    _tableFilters: unknown,
    sorter: SorterResult<Business> | SorterResult<Business>[],
  ) => {
    const single = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = single?.columnKey as BusinessSortField | undefined;

    if (field && single?.order) {
      const order: SortOrder = single.order === "ascend" ? "asc" : "desc";

      if (field !== filters.sortBy || order !== filters.sortOrder) {
        filters.setSort(field, order);
        return;
      }
    } else if (field && !single?.order && filters.sortBy === field) {
      // Third click clears the sort; fall back to the default ordering.
      filters.setSort("id", "desc");
      return;
    }

    const nextPage = nextPagination.current ?? 1;
    const nextPageSize = nextPagination.pageSize ?? filters.pageSize;

    if (nextPage !== filters.page || nextPageSize !== filters.pageSize) {
      filters.setPage(nextPage, nextPageSize);
    }
  };

  return (
    <div
      className={`lf-table-card ${isRefetching ? "is-refetching" : ""}`}
      aria-busy={isRefetching || isLoading}
    >
      <div className="lf-mobile-business-list" aria-label="Businesses">
        {businesses.map((business) => (
          <article key={business.id} className="lf-mobile-business-card">
            <div className="lf-mobile-business-head">
              <Checkbox checked={selectedIds.includes(business.id)} aria-label={`Select ${business.name}`} onChange={(event) => onSelectionChange(event.target.checked ? [...selectedIds, business.id] : selectedIds.filter((id) => id !== business.id))} />
              <button type="button" className="lf-mobile-business-name" onClick={() => onView(business)}>{business.name}</button>
              <Button type="text" icon={<EyeOutlined />} aria-label={`View ${business.name}`} onClick={() => onView(business)} />
            </div>
            <p className="lf-mobile-business-meta">{[business.city, business.category].filter(Boolean).join(" Â· ") || "Location not available"}</p>
            <div className="lf-mobile-business-contact">
              <span className={isPresent(business.website) ? "is-available" : ""}>Website {isPresent(business.website) ? "available" : "missing"}</span>
              <span className={isPresent(business.email) ? "is-available" : ""}>Email {isPresent(business.email) ? "available" : "missing"}</span>
              <span className={isPresent(business.phone) ? "is-available" : ""}>Phone {isPresent(business.phone) ? "available" : "missing"}</span>
            </div>
          </article>
        ))}
        {pagination && <Pagination current={pagination.page} pageSize={pagination.pageSize} total={pagination.totalItems} showSizeChanger={false} onChange={(page) => filters.setPage(page)} />}
      </div>

      <Table<Business>
        rowKey="id"
        columns={showSkeleton ? skeletonColumns : columns}
        dataSource={showSkeleton ? SKELETON_ROWS : businesses}
        size="middle"
        className="lf-table"
        rowClassName={() => "lf-table-row"}
        sticky={{ offsetHeader: 0 }}
        scroll={{ x: 1180 }}
        onChange={handleTableChange}
        rowSelection={
          showSkeleton
            ? undefined
            : {
                selectedRowKeys: selectedIds,
                onChange: (keys) => onSelectionChange(keys as number[]),
                // Selection is per page: the ids of rows the user cannot see
                // are not theirs to act on.
                preserveSelectedRowKeys: false,
                getCheckboxProps: (record) => ({
                  disabled: isDeleting,
                  name: `Select ${record.name}`,
                }),
              }
        }
        onRow={(record) =>
          showSkeleton
            ? {}
            : {
                onClick: () => onView(record),
                // A clickable row must also be reachable and operable by
                // keyboard, or the primary action of the page is mouse-only.
                tabIndex: 0,
                "aria-label": `View ${record.name}`,
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    // Space scrolls the page unless prevented.
                    event.preventDefault();
                    onView(record);
                  }
                },
                style: { cursor: "pointer" },
              }
        }
        pagination={
          showSkeleton || !pagination
            ? false
            : {
                current: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.totalItems,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                showSizeChanger: true,
                showQuickJumper: pagination.totalPages > 10,
                className: "lf-pagination",
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} of ${total.toLocaleString()} businesses`,
              }
        }
        locale={{
          emptyText: showSkeleton ? null : (
            <EmptyState
              compact
              title={
                filters.hasActiveFilters
                  ? "No matching businesses"
                  : "No businesses yet"
              }
              description={
                filters.hasActiveFilters
                  ? "No business matches the current filters. Try widening your search."
                  : "Nothing has been discovered yet. Run a scan to pull businesses into your workspace."
              }
              action={
                filters.hasActiveFilters
                  ? { label: "Clear filters", onClick: filters.resetFilters }
                  : undefined
              }
            />
          ),
        }}
      />
    </div>
  );
}
