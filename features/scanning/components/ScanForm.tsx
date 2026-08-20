"use client";

import { ThunderboltOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Form, Input } from "antd";

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
/**
 * Structured taxonomy suggestions for the Scanner UI.
 *
 * Provides human-friendly labels for common business subcategories while
 * preserving broad Geoapify categories. The control remains an AutoComplete so
 * users can type custom/unlisted niches freely.
 */
interface CategoryOption {
  label: string;
  value: string;
}

interface CategoryGroup {
  label: string;
  options: CategoryOption[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: "Healthcare",
    options: [
      { label: "Dentists & Dental Clinics", value: "Dentists" },
      { label: "Clinics & Doctors", value: "Clinics" },
      { label: "Pharmacies & Chemists", value: "Pharmacies" },
      { label: "Hospitals & Medical Centers", value: "Hospitals" },
      { label: "All Healthcare (Broad)", value: "healthcare" },
    ],
  },
  {
    label: "Food & Catering",
    options: [
      { label: "Cafés & Coffee Shops", value: "Cafes" },
      { label: "Restaurants & Dining", value: "Restaurants" },
      { label: "Fast Food & Quick Bites", value: "Fast Food" },
      { label: "Bakeries & Cake Shops", value: "Bakeries" },
      { label: "All Food & Catering (Broad)", value: "catering" },
    ],
  },
  {
    label: "Local Services",
    options: [
      { label: "Hair Salons & Barbers", value: "Salons" },
      { label: "Auto Repair & Mechanics", value: "Auto Repair" },
      { label: "Banks & Financial", value: "Banks" },
      { label: "Dry Cleaning & Laundry", value: "Dry Cleaning" },
      { label: "All Local Services (Broad)", value: "service" },
    ],
  },
  {
    label: "Education",
    options: [
      { label: "Schools (Primary & High)", value: "Schools" },
      { label: "Colleges & Universities", value: "Colleges" },
      { label: "Libraries", value: "Libraries" },
      { label: "All Education (Broad)", value: "education" },
    ],
  },
  {
    label: "Retail & Commercial",
    options: [
      { label: "Clothing & Boutiques", value: "Clothing" },
      { label: "Supermarkets & Groceries", value: "Supermarkets" },
      { label: "Jewellery Stores", value: "Jewellery" },
      { label: "Electronics Stores", value: "Electronics" },
      { label: "Book Stores", value: "Book Stores" },
      { label: "All Commercial (Broad)", value: "commercial" },
    ],
  },
  {
    label: "Accommodation",
    options: [
      { label: "Hotels & Resorts", value: "Hotels" },
      { label: "Hostels & Student Housing", value: "Hostels" },
      { label: "Guest Houses", value: "Guest Houses" },
      { label: "Motels", value: "Motels" },
      { label: "All Accommodation (Broad)", value: "accommodation" },
    ],
  },
  {
    label: "Activity & Leisure",
    options: [
      { label: "Gyms & Fitness Centers", value: "Gyms" },
      { label: "Cinemas & Theatres", value: "Cinemas" },
      { label: "Community Centers", value: "Community Centers" },
      { label: "All Activity (Broad)", value: "activity" },
    ],
  },
  {
    label: "Other Sectors",
    options: [
      { label: "Entertainment (Broad)", value: "entertainment" },
      { label: "Leisure (Broad)", value: "leisure" },
      { label: "Office & Corporate (Broad)", value: "office" },
    ],
  },
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
      category: values.category.trim(),
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
        autoComplete="off"
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
            popupMatchSelectWidth
          >
            <Input
              placeholder="e.g. Ahmedabad"
              aria-label="City to scan"
              allowClear
              autoComplete="off"
              spellCheck={false}
            />
          </AutoComplete>
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          extra="Select a common business type or type custom keywords (e.g. Dentists, Bakeries, Salons, Electronics)."
          rules={[{ required: true, message: "Enter a category to scan." }]}
        >
          <AutoComplete
            options={CATEGORY_GROUPS}
            popupMatchSelectWidth
            filterOption={(input, option) => {
              const label = typeof option?.label === "string" ? option.label : "";
              const value =
                option && "value" in option && typeof option.value === "string"
                  ? option.value
                  : "";
              const text = `${label} ${value}`.toLowerCase();
              return text.includes(input.toLowerCase());
            }}
          >
            <Input
              placeholder="e.g. Dentists, Bakeries, Cafes, Salons"
              aria-label="Category to scan"
              allowClear
              autoComplete="off"
              spellCheck={false}
            />
          </AutoComplete>
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
