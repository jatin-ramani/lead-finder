"use client";

import {
  ClearOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  RadarChartOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { AutoComplete, Button, Form, Input, Select, Tag, Tooltip } from "antd";
import { useMemo, useState } from "react";

import Panel from "@/components/Panel";
import type { ScanRequest } from "@/types/api";
import ClearDataModal from "./ClearDataModal";

interface CategorySubItem {
  label: string;
  value: string;
}

interface CategoryFamilyDef {
  label: string;
  value: string;
  subcategories: CategorySubItem[];
}

const CATEGORY_FAMILIES_DATA: CategoryFamilyDef[] = [
  {
    label: "Healthcare & Wellness",
    value: "healthcare",
    subcategories: [
      { label: "Dentists & Dental Clinics", value: "Dentists" },
      { label: "Clinics & Doctors", value: "Clinics" },
      { label: "Pharmacies & Chemists", value: "Pharmacies" },
      { label: "Hospitals & Medical Centers", value: "Hospitals" },
    ],
  },
  {
    label: "Food & Catering",
    value: "catering",
    subcategories: [
      { label: "Cafés & Coffee Shops", value: "Cafes" },
      { label: "Restaurants & Dining", value: "Restaurants" },
      { label: "Fast Food & Takeaways", value: "Fast Food" },
      { label: "Bakeries & Confectionery", value: "Bakeries" },
    ],
  },
  {
    label: "Local Services",
    value: "service",
    subcategories: [
      { label: "Hair Salons & Barbers", value: "Salons" },
      { label: "Auto Repair & Garages", value: "Auto Repair" },
      { label: "Banks & Financial", value: "Banks" },
      { label: "Dry Cleaning & Laundry", value: "Dry Cleaning" },
      { label: "Pet Care & Vets", value: "Pet Services" },
    ],
  },
  {
    label: "Retail & Commercial",
    value: "commercial",
    subcategories: [
      { label: "Clothing & Boutiques", value: "Clothing" },
      { label: "Supermarkets & Groceries", value: "Supermarkets" },
      { label: "Jewellery & Watches", value: "Jewellery" },
      { label: "Electronics & Computers", value: "Electronics" },
      { label: "Book Stores & Stationery", value: "Book Stores" },
    ],
  },
  {
    label: "Education & Learning",
    value: "education",
    subcategories: [
      { label: "Schools & Academies", value: "Schools" },
      { label: "Colleges & Universities", value: "Colleges" },
      { label: "Music & Art Schools", value: "Music Schools" },
      { label: "Libraries & Archives", value: "Libraries" },
    ],
  },
  {
    label: "Accommodation & Hospitality",
    value: "accommodation",
    subcategories: [
      { label: "Hotels & Resorts", value: "Hotels" },
      { label: "Guest Houses & B&Bs", value: "Guest Houses" },
      { label: "Hostels & Student Housing", value: "Hostels" },
      { label: "Motels & Lodging", value: "Motels" },
    ],
  },
  {
    label: "Activity & Leisure",
    value: "activity",
    subcategories: [
      { label: "Gyms & Fitness Centers", value: "Gyms" },
      { label: "Cinemas & Theatres", value: "Cinemas" },
      { label: "Sports Clubs & Courts", value: "Sports Clubs" },
      { label: "Community Centers", value: "Community Centers" },
    ],
  },
];

const RADIUS_OPTIONS = [
  { label: "5 km (City Center / Core)", value: 5 },
  { label: "10 km (Standard City)", value: 10 },
  { label: "15 km (Greater Metro)", value: 15 },
  { label: "25 km (Comprehensive Metro - Recommended)", value: 25 },
  { label: "50 km (Regional & Suburbs)", value: 50 },
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
  const [selectedCategory, setSelectedCategory] = useState<string>("healthcare");
  const [clearModalOpen, setClearModalOpen] = useState(false);

  // Find active family definition for preview chips
  const activeFamily = useMemo(() => {
    const val = (selectedCategory || "").toLowerCase().trim();
    return CATEGORY_FAMILIES_DATA.find(
      (f) => f.value === val || f.label.toLowerCase().includes(val) || f.subcategories.some((s) => s.value.toLowerCase() === val)
    );
  }, [selectedCategory]);

  const handleFinish = (values: ScanRequest) => {
    onSubmit({
      city: values.city.trim(),
      category: values.category.trim(),
      radius_km: values.radius_km || 25,
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
        title="Continuous City Scanner"
        description="Multi-cell radial continuous scanning covering the full geography without result caps."
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
          initialValues={{
            category: "healthcare",
            radius_km: 25,
          }}
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

          <Form.Item
            name="category"
            label="Category Family or Keyword"
            extra="Selecting a category family will automatically scan all associated subcategories across every geographic zone."
            rules={[{ required: true, message: "Enter or select a category to scan." }]}
          >
            <AutoComplete
              options={CATEGORY_FAMILIES_DATA.map((f) => ({
                label: f.label,
                value: f.value,
              }))}
              popupMatchSelectWidth
              onChange={(val) => setSelectedCategory(val)}
            >
              <Input
                prefix={<RadarChartOutlined className="text-[var(--lf-text-muted)]" />}
                placeholder="Select category family (e.g. Healthcare, Food, Retail) or type keyword"
                aria-label="Category family to scan"
                allowClear
                autoComplete="off"
                spellCheck={false}
              />
            </AutoComplete>
          </Form.Item>

          {/* Subcategory Preview Chips */}
          {activeFamily && (
            <div className="p-3 mb-4 rounded-lg bg-[var(--lf-subtle)] border border-[var(--lf-border)] flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs text-[var(--lf-text-secondary)] font-medium">
                <InfoCircleOutlined className="text-[var(--lf-brand)]" />
                <span>Subcategories included in this continuous scan:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeFamily.subcategories.map((sub) => (
                  <Tag key={sub.value} color="blue" className="text-xs">
                    {sub.label}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          <Form.Item
            name="radius_km"
            label="Geographic Scan Radius"
            extra="Concentric radial subdivision (0 to selected radius km) covering the entire metropolitan area in small overlapping cells."
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
            aria-label={scanning ? "Continuous scanning in progress" : "Launch continuous city scan"}
          >
            {scanning ? "Continuous Scanning in Progress…" : "Launch Continuous City Scan"}
          </Button>

          {scanning && (
            <p className="lf-form-note mt-2 text-xs text-[var(--lf-text-muted)] text-center" aria-live="polite">
              Multi-cell scanner is actively querying concentric rings and saving verified leads with email/phone.
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

