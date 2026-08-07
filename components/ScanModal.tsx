"use client";

import { ThunderboltOutlined } from "@ant-design/icons";
import { AutoComplete, Form, Modal } from "antd";
import { useEffect } from "react";

import { SCAN_CATEGORIES, useScanner } from "@/hooks/useScanner";
import type { ScanRequest } from "@/types/business";

interface ScanModalProps {
  open: boolean;
  onClose: () => void;
  cities: string[];
  categories: string[];
  /** Prefilled from the filter bar when only one of the two was chosen. */
  initialCity?: string;
  initialCategory?: string;
  /** Optional hook for callers that need to react after a successful scan. */
  onScanned?: () => void;
}

export default function ScanModal({
  open,
  onClose,
  cities,
  categories,
  initialCity,
  initialCategory,
  onScanned,
}: ScanModalProps) {
  const [form] = Form.useForm<ScanRequest>();
  // The reload after a successful scan is handled inside useScanner, so the
  // modal never triggers a second GET /businesses.
  const { scanning, startScan } = useScanner();

  const categoryOptions = Array.from(
    new Set([...categories, ...SCAN_CATEGORIES]),
  ).map((value) => ({ value }));

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        city: initialCity ?? "",
        category: initialCategory ?? "",
      });
    }
  }, [open, initialCity, initialCategory, form]);

  const handleClose = () => {
    if (scanning) return;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const ok = await startScan(values);

    if (ok) {
      onScanned?.();
      form.resetFields();
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={() => void handleSubmit()}
      okText={scanning ? "Scanning..." : "Start Scan"}
      okButtonProps={{
        icon: <ThunderboltOutlined />,
        loading: scanning,
        disabled: scanning,
      }}
      cancelButtonProps={{ disabled: scanning }}
      title="Start a new scan"
      destroyOnHidden
      width={440}
    >
      <p className="lf-modal-lead">
        Pull businesses for a city and category into your workspace.
      </p>

      <Form form={form} layout="vertical" requiredMark={false} disabled={scanning}>
        <Form.Item
          name="city"
          label="City"
          rules={[{ required: true, message: "Enter a city to scan." }]}
        >
          <AutoComplete
            options={cities.map((value) => ({ value }))}
            placeholder="e.g. Ahmedabad"
            filterOption={(input, option) =>
              (option?.value as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Enter a category to scan." }]}
        >
          <AutoComplete
            options={categoryOptions}
            placeholder="e.g. commercial"
            filterOption={(input, option) =>
              (option?.value as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
