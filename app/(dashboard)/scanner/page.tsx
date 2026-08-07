"use client";

import { EnvironmentOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Card, Form } from "antd";
import { useMemo } from "react";

import CityCoverageBars, {
  type CityRow,
} from "@/components/charts/CityCoverageBars";
import { hasWebsite } from "@/lib/format";
import { useBusinesses } from "@/hooks/useBusinesses";
import { SCAN_CATEGORIES, useScanner } from "@/hooks/useScanner";
import type { ScanRequest } from "@/types/business";

export default function ScannerPage() {
  const { businesses, cities, categories, loading } = useBusinesses();
  const { scanning, startScan } = useScanner();

  const [form] = Form.useForm<ScanRequest>();

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set([...categories, ...SCAN_CATEGORIES])).map((value) => ({
        value,
      })),
    [categories],
  );

  /** Per-city coverage, so you can see where the scanner has already been. */
  const coverage = useMemo<CityRow[]>(() => {
    const byCity = new Map<string, CityRow>();

    for (const business of businesses) {
      const city = business.city?.trim();
      if (!city) continue;
      const row = byCity.get(city) ?? { city, total: 0, noWebsite: 0 };
      row.total += 1;
      if (!hasWebsite(business)) row.noWebsite += 1;
      byCity.set(city, row);
    }

    return Array.from(byCity.values()).sort((a, b) => b.total - a.total);
  }, [businesses]);

  const handleScan = async () => {
    const values = await form.validateFields();
    if (await startScan(values)) form.resetFields();
  };

  return (
    <>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,420px)_1fr]">
        <Card variant="outlined" className="lf-panel" styles={{ body: { padding: 20 } }}>
          <h2 className="lf-panel-title">
            <ThunderboltOutlined className="me-2 lf-accent-text" />
            New scan
          </h2>
          <p className="lf-panel-description">
            The scanner queries the Geoapify source and stores anything it has not
            seen before, de-duplicated by place id.
          </p>


          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            className="mt-4"
            disabled={scanning}
          >
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

            <Button
              type="primary"
              block
              icon={<ThunderboltOutlined />}
              loading={scanning}
              disabled={scanning}
              onClick={() => void handleScan()}
            >
              {scanning ? "Scanning..." : "Start Scan"}
            </Button>
          </Form>
        </Card>

        <Card
          variant="outlined"
          className="lf-panel"
          styles={{ body: { padding: 20 } }}
        >
          <h2 className="lf-panel-title">
            <EnvironmentOutlined className="me-2 lf-accent-text" />
            Coverage by city
          </h2>
          <p className="lf-panel-description">
            How much of each scanned city still has no website.
          </p>

          {loading && coverage.length === 0 ? (
            <p className="lf-panel-empty">Loading coverage…</p>
          ) : (
            <div className="mt-5">
              <CityCoverageBars rows={coverage} />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
