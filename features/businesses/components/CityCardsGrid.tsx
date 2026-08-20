"use client";

import {
  AppstoreOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Empty, Input, Skeleton } from "antd";
import { useMemo, useState } from "react";

import type { CitySummary } from "@/types/api";

interface CityCardsGridProps {
  cities: CitySummary[];
  isLoading: boolean;
  onSelectCity: (city: string) => void;
  onViewAll: () => void;
}

export default function CityCardsGrid({
  cities,
  isLoading,
  onSelectCity,
  onViewAll,
}: CityCardsGridProps) {
  const [search, setSearch] = useState("");

  const filteredCities = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cities;
    return cities.filter((c) => c.city.toLowerCase().includes(term));
  }, [cities, search]);

  const totals = useMemo(() => {
    return cities.reduce(
      (acc, c) => {
        acc.totalBusinesses += c.totalBusinesses;
        acc.withWebsite += c.withWebsite;
        acc.withoutWebsite += c.withoutWebsite;
        acc.withEmail += c.withEmail;
        acc.withPhone += c.withPhone;
        acc.actionableLeads += c.actionableLeads;
        return acc;
      },
      {
        totalBusinesses: 0,
        withWebsite: 0,
        withoutWebsite: 0,
        withEmail: 0,
        withPhone: 0,
        actionableLeads: 0,
      },
    );
  }, [cities]);

  if (isLoading && cities.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <div className="lf-panel">
          <Skeleton active paragraph={{ rows: 2 }} />
        </div>
        <div className="lf-city-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="lf-city-card">
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner & Quick Totals */}
      <div className="lf-panel">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <EnvironmentOutlined className="text-[var(--lf-brand)] text-lg" />
              <h2 className="text-lg font-bold text-[var(--lf-text)] m-0">
                Discovered Cities
              </h2>
            </div>
            <p className="text-xs text-[var(--lf-text-muted)] mt-1 mb-0">
              {cities.length} {cities.length === 1 ? "city" : "cities"} discovered •{" "}
              {totals.totalBusinesses.toLocaleString()} total businesses
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Input
              prefix={<SearchOutlined className="text-[var(--lf-text-muted)]" />}
              placeholder="Filter cities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              autoComplete="off"
              className="w-full md:w-56"
            />
            <Button
              type="default"
              icon={<AppstoreOutlined />}
              onClick={onViewAll}
            >
              View all businesses
            </Button>
          </div>
        </div>
      </div>

      {/* Grid of City Cards */}
      {filteredCities.length === 0 ? (
        <div className="lf-panel text-center py-12">
          <Empty
            description={
              search
                ? `No discovered cities matching "${search}".`
                : "No cities discovered yet. Run scanner to add businesses."
            }
          />
        </div>
      ) : (
        <div className="lf-city-grid">
          {filteredCities.map((cityData) => (
            <div
              key={cityData.city}
              className="lf-city-card"
              onClick={() => onSelectCity(cityData.city)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectCity(cityData.city);
                }
              }}
              aria-label={`View businesses in ${cityData.city}`}
            >
              <div>
                <div className="lf-city-card-header">
                  <div className="flex items-center gap-2 min-w-0">
                    <EnvironmentOutlined className="text-[var(--lf-brand)]" />
                    <h3 className="lf-city-title truncate" title={cityData.city}>
                      {cityData.city}
                    </h3>
                  </div>
                  <span className="lf-city-count-badge">
                    {cityData.totalBusinesses.toLocaleString()} leads
                  </span>
                </div>

                <div className="lf-city-metrics">
                  <div className="lf-city-metric-item">
                    <span className="lf-city-metric-label flex items-center gap-1">
                      <GlobalOutlined /> Website
                    </span>
                    <span className="lf-city-metric-value">
                      {cityData.withWebsite.toLocaleString()}
                    </span>
                  </div>

                  <div className="lf-city-metric-item">
                    <span className="lf-city-metric-label flex items-center gap-1">
                      <CheckCircleOutlined /> No Website
                    </span>
                    <span className="lf-city-metric-value lf-city-metric-value--warning">
                      {cityData.withoutWebsite.toLocaleString()}
                    </span>
                  </div>

                  <div className="lf-city-metric-item">
                    <span className="lf-city-metric-label flex items-center gap-1">
                      <MailOutlined /> Email
                    </span>
                    <span className="lf-city-metric-value">
                      {cityData.withEmail.toLocaleString()}
                    </span>
                  </div>

                  <div className="lf-city-metric-item">
                    <span className="lf-city-metric-label flex items-center gap-1">
                      <PhoneOutlined /> Phone
                    </span>
                    <span className="lf-city-metric-value">
                      {cityData.withPhone.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lf-city-footer">
                <span>
                  {cityData.highQualityLeads && cityData.highQualityLeads > 0
                    ? `${cityData.highQualityLeads.toLocaleString()} Grade-A leads (${cityData.averageLeadScore ? `Avg ${cityData.averageLeadScore}` : "High value"})`
                    : cityData.actionableLeads > 0
                    ? `${cityData.actionableLeads.toLocaleString()} actionable targets`
                    : "Explore city leads"}
                </span>
                <ArrowRightOutlined />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
