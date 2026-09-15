"use client";

import {
  ClearOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Select, Tooltip } from "antd";
import { useState } from "react";

import Panel from "@/components/Panel";
import type { ScanRequest } from "@/types/api";
import ClearDataModal from "./ClearDataModal";

const RADIUS_OPTIONS = [
  { label: "3 km (Compact Core)", value: 3 },
  { label: "5 km (City Center / Core)", value: 5 },
  { label: "10 km (Standard City)", value: 10 },
  { label: "15 km (Greater Metro)", value: 15 },
  { label: "25 km (Comprehensive Metro - Recommended)", value: 25 },
  { label: "30 km (Extended Metro)", value: 30 },
  { label: "50 km (Regional & Suburbs — may span provider quota)", value: 50 },
];

interface ScanFormProps {
  onSubmit: (values: ScanRequest) => void;
  scanning: boolean;
  onClearData?: (confirm: boolean) => Promise<unknown>;
  isClearing?: boolean;
}

export default function ScanForm({
  onSubmit,
  scanning,
  onClearData,
  isClearing = false,
}: ScanFormProps) {
  const [form] = Form.useForm<ScanRequest>();
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const handleFinish = (values: ScanRequest) => {
    onSubmit({
      city: values.city.trim(),
      radius_km: values.radius_km ?? 25,
    });
  };

  const handleClearConfirm = async () => {
    if (onClearData) {
      await onClearData(true);
    }
  };

  return (
    <>
      <Panel
        title="City Coverage Scanner"
        description="Comprehensive, multi-cell business discovery across the geographic coverage you request."
        extra={
          onClearData ? (
            <Tooltip title="Safely clear scanned business records while preserving users and email templates">
              <Button
                size="small"
                danger
                icon={<ClearOutlined />}
                onClick={() => setClearModalOpen(true)}
                disabled={scanning || isClearing}
              >
                Clear Scanned Leads
              </Button>
            </Tooltip>
          ) : null
        }
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          disabled={scanning}
          onFinish={handleFinish}
          initialValues={{ radius_km: 25 }}
          autoComplete="off"
        >
          <Form.Item
            name="city"
            label="Target City"
            rules={[
              { required: true, message: "Enter a city to scan." },
              { min: 2, message: "That is too short to be a city name." },
            ]}
          >
            <Input
              prefix={<EnvironmentOutlined className="text-[var(--lf-text-muted)]" />}
              placeholder="e.g. Ahmedabad, London, Chicago"
              aria-label="Target city to scan"
              allowClear
              autoComplete="off"
              spellCheck={false}
            />
          </Form.Item>

          <div
            className="mb-4 flex gap-2 rounded-lg border border-[var(--lf-border)] bg-[var(--lf-subtle)] p-3 text-xs text-[var(--lf-text-secondary)]"
            role="note"
          >
            <InfoCircleOutlined className="mt-0.5 text-[var(--lf-brand)]" aria-hidden />
            <span>
              All supported provider business categories are searched automatically in each new geographic cell. No category selection is needed.
            </span>
          </div>

          <Form.Item
            name="radius_km"
            label="Requested Geographic Coverage"
            extra="The selected radius is divided into deterministic cells. Areas completed in earlier scans are skipped automatically."
          >
            <Select
              options={RADIUS_OPTIONS}
              prefix={<CompassOutlined className="text-[var(--lf-text-muted)]" />}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            icon={<ThunderboltOutlined aria-hidden />}
            loading={scanning}
            disabled={scanning}
            className="mt-2"
            data-testid="start-scan-button"
            aria-label={scanning ? "City coverage scan in progress" : "Launch city coverage scan"}
          >
            {scanning ? "Scanning City Coverage..." : "Launch City Coverage Scan"}
          </Button>

          {scanning && (
            <p className="lf-form-note mt-2 text-center text-xs text-[var(--lf-text-muted)]" aria-live="polite">
              The scanner is checking new geographic cells and saving verified leads with email or phone.
            </p>
          )}
        </Form>
      </Panel>

      {onClearData && (
        <ClearDataModal
          open={clearModalOpen}
          onClose={() => setClearModalOpen(false)}
          onConfirm={handleClearConfirm}
          isClearing={isClearing}
        />
      )}
    </>
  );
}
