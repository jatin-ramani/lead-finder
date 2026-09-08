"use client";

import React from "react";
import { Button, Drawer, Space, Table, Tag } from "antd";
import { EyeOutlined, HistoryOutlined } from "@ant-design/icons";

import type { CityAutomationRunItem } from "@/types/api";
import { useCityAutomationRuns } from "./../hooks/useCityAutomations";

interface AutomationHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectRun: (id: number) => void;
}

export const AutomationHistoryDrawer: React.FC<AutomationHistoryDrawerProps> = ({
  open,
  onClose,
  onSelectRun,
}) => {
  const { data, isLoading } = useCityAutomationRuns(1, 50);
  const runs = data?.items || [];

  const columns = [
    {
      title: "City / Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: CityAutomationRunItem) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-xs text-gray-900 dark:text-gray-100">
            {record.city ? `${record.city} Automation` : name}
          </div>
          <div className="text-[11px] text-gray-400">
            {new Date(record.created_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: "Audience",
      dataIndex: "recipient_count",
      key: "recipient_count",
      render: (cnt: number) => <span className="text-xs">{cnt} leads</span>,
    },
    {
      title: "Sent",
      dataIndex: "sent_count",
      key: "sent_count",
      render: (cnt: number) => (
        <span className="text-xs font-semibold text-emerald-600">{cnt}</span>
      ),
    },
    {
      title: "Failed",
      dataIndex: "failed_count",
      key: "failed_count",
      render: (cnt: number) => (
        <span className="text-xs font-semibold text-red-500">{cnt}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (st: string) => {
        if (st === "completed") return <Tag color="success">Completed</Tag>;
        if (st === "running") return <Tag color="processing">Running</Tag>;
        if (st === "cancelled") return <Tag color="default">Cancelled</Tag>;
        if (st === "scheduled") return <Tag color="warning">Scheduled</Tag>;
        return <Tag>{st}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: CityAutomationRunItem) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            onSelectRun(record.id);
            onClose();
          }}
        >
          View Report
        </Button>
      ),
    },
  ];

  return (
    <Drawer
      title={
        <Space>
          <HistoryOutlined className="text-blue-600" />
          <span>Automation History & Reports</span>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={720}
    >
      <Table
        dataSource={runs}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 15 }}
      />
    </Drawer>
  );
};
