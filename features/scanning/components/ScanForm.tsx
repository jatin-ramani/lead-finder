"use client";

import { ThunderboltOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Form } from "antd";

import Panel from "@/components/Panel";
import type { ScanRequest } from "@/types/api";

/**
 * Categories the Geoapify Places API recognises.
 *
 * A *suggestion* list, not a closed set — Geoapify accepts far more than these,
 * so the control is an AutoComplete and any value can be typed. Offering seven
 * options in a `Select` would tell the user these are the only categories, and
 * that would be untrue.
 */
const CATEGORY_SUGGESTIONS = [
  "commercial",
  "catering",
  "healthcare",
  "education",
  "service",
  "accommodation",
  "activity",
  "entertainment",
  "leisure",
  "office",
];

interface ScanFormProps {
  onSubmit: (values: ScanRequest) => void;
  scanning: boolean;
}

/**
 * Starts a scan.
 *
 * Both fields are free text with suggestions. City has to be — Geoapify
 * geocodes whatever string it is given, so constraining it to a list would
 * limit the product to places already scanned.
 */
export default function ScanForm({ onSubmit, scanning }: ScanFormProps) {
  const [form] = Form.useForm<ScanRequest>();

  const handleFinish = (values: ScanRequest) => {
    onSubmit({
      city: values.city.trim(),
      category: values.category.trim().toLowerCase(),
    });
  };

  return (
    <Panel
      title="New scan"
      description="Queries Geoapify for a city and category, and stores anything not already known."
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        disabled={scanning}
        onFinish={handleFinish}
      >
        <Form.Item
          name="city"
          label="City"
          rules={[
            { required: true, message: "Enter a city to scan." },
            {
              // Caught here rather than as a 502 after a round trip.
              min: 2,
              message: "That is too short to be a city name.",
            },
          ]}
        >
          <AutoComplete
            options={[]}
            placeholder="e.g. Ahmedabad"
            aria-label="City to scan"
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          extra="Any Geoapify category. The suggestions are the common ones."
          rules={[{ required: true, message: "Enter a category to scan." }]}
        >
          <AutoComplete
            options={CATEGORY_SUGGESTIONS.map((value) => ({ value }))}
            placeholder="e.g. commercial"
            aria-label="Category to scan"
            allowClear
            filterOption={(input, option) =>
              String(option?.value ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<ThunderboltOutlined aria-hidden />}
          loading={scanning}
          disabled={scanning}
        >
          {scanning ? "Scanning…" : "Start scan"}
        </Button>

        {scanning && (
          <p className="lf-form-note" aria-live="polite">
            A scan runs to completion before it reports back. You can leave this
            page — it will keep running.
          </p>
        )}
      </Form>
    </Panel>
  );
}
