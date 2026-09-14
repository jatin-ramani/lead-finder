"use client";

import type { LayerGroup, Map as LeafletMap } from "leaflet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Supercluster, { type PointFeature } from "supercluster";

import type { Business, LatestScanJob, ScanCellInfo } from "@/types/api";

interface LeadClusterProperties {
  cluster?: boolean;
  point_count?: number;
  cluster_id?: number;
  business?: Business;
}

interface LeadMapProps {
  businesses: Business[];
  scanJob?: LatestScanJob;
  onSelectBusiness: (business: Business) => void;
  emptyMessage?: string;
}

const NEUTRAL_MAP_VIEW: [number, number] = [20, 0];
const NEUTRAL_MAP_ZOOM = 2;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hasValidCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): latitude is number {
  return latitude != null
    && longitude != null
    && Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180;
}

function hasBusinessCoordinates(business: Business): boolean {
  return hasValidCoordinates(business.latitude, business.longitude);
}

function getScanCenter(scanJob: LatestScanJob | undefined): [number, number] | null {
  if (!scanJob || !hasValidCoordinates(scanJob.center_latitude, scanJob.center_longitude)) {
    return null;
  }

  return [scanJob.center_latitude!, scanJob.center_longitude!];
}



function scanCellStyle(cell: ScanCellInfo, scanJob: LatestScanJob) {
  const isPausedCurrentCell = scanJob.status === "Paused" && cell.label === scanJob.current_cell;
  const isFailedCurrentCell = scanJob.status === "Failed" && cell.label === scanJob.current_cell;

  if (isPausedCurrentCell) {
    return { label: "Paused", stroke: "var(--lf-warning)", fill: "var(--lf-warning)", opacity: 0.18, weight: 3, dashArray: undefined };
  }
  if (isFailedCurrentCell || cell.status === "failed") {
    return { label: "Failed", stroke: "var(--lf-error)", fill: "var(--lf-error)", opacity: 0.18, weight: 2, dashArray: undefined };
  }
  if (cell.status === "running") {
    return { label: "Current", stroke: "var(--lf-brand)", fill: "var(--lf-accent)", opacity: 0.25, weight: 3, dashArray: undefined };
  }
  if (cell.status === "in_progress") {
    return { label: "In progress", stroke: "var(--lf-brand)", fill: "var(--lf-accent)", opacity: 0.13, weight: 1.5, dashArray: "5, 4" };
  }
  if (cell.status === "completed") {
    return { label: "Completed", stroke: "var(--lf-brand-active)", fill: "var(--lf-success)", opacity: 0.1, weight: 1.5, dashArray: undefined };
  }
  if (cell.status === "retry_wait") {
    return { label: "Retrying", stroke: "var(--lf-warning)", fill: "var(--lf-warning)", opacity: 0.14, weight: 1.5, dashArray: "4, 4" };
  }
  return { label: "Pending", stroke: "var(--lf-text-muted)", fill: "var(--lf-text-muted)", opacity: 0.05, weight: 1, dashArray: "4, 4" };
}

export default function LeadMap({
  businesses,
  scanJob,
  onSelectBusiness,
  emptyMessage,
}: LeadMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const coverageLayerRef = useRef<LayerGroup | null>(null);
  const clusterIndexRef = useRef<Supercluster<LeadClusterProperties> | null>(null);
  const lastViewKeyRef = useRef<string | null>(null);
  const onSelectBusinessRef = useRef(onSelectBusiness);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);

  useEffect(() => {
    onSelectBusinessRef.current = onSelectBusiness;
  }, [onSelectBusiness]);

  const validBusinesses = useMemo(
    () => businesses.filter(hasBusinessCoordinates),
    [businesses],
  );

  const fitBusinessBounds = useCallback((map: LeafletMap) => {
    if (validBusinesses.length === 0) return false;

    void import("leaflet").then((L) => {
      const bounds = L.latLngBounds([]);
      validBusinesses.forEach((business) => {
        bounds.extend([business.latitude!, business.longitude!]);
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    });

    return true;
  }, [validBusinesses]);

  const updateClustersOnMap = useCallback(() => {
    const map = mapInstanceRef.current;
    const markerLayer = markerLayerRef.current;
    const clusterIndex = clusterIndexRef.current;
    if (!map || !markerLayer || !clusterIndex) return;

    void import("leaflet").then((L) => {
      if (mapInstanceRef.current !== map) return;
      markerLayer.clearLayers();

      const bounds = map.getBounds();
      const clusters = clusterIndex.getClusters(
        [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
        Math.floor(map.getZoom()),
      );

      clusters.forEach((feature) => {
        const [longitude, latitude] = feature.geometry.coordinates;
        if (feature.properties.cluster) {
          const count = feature.properties.point_count ?? 1;
          const clusterId = feature.properties.cluster_id;
          const size = count > 50 ? 48 : count > 15 ? 40 : 34;
          const tone = count > 50 ? "lf-map-cluster--large" : count > 15 ? "lf-map-cluster--medium" : "lf-map-cluster--small";
          const icon = L.divIcon({
            html: `<div class="lf-map-cluster ${tone}" style="width:${size}px;height:${size}px;font-size:${size > 40 ? "13px" : "11px"}">${count}</div>`,
            className: "lf-map-cluster-pin",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
          const marker = L.marker([latitude, longitude], { icon, title: `Cluster of ${count} leads`, alt: `Cluster of ${count} leads`, keyboard: true });
          marker.on("click", () => {
            if (clusterId != null) {
              const expansionZoom = Math.min(clusterIndex.getClusterExpansionZoom(clusterId), 18);
              map.flyTo([latitude, longitude], expansionZoom, { duration: 0.5 });
            }
          });
          markerLayer.addLayer(marker);
          return;
        }

        const business = feature.properties.business;
        if (!business) return;

        const grade = ["A", "B", "C", "D"].includes(business.lead_grade ?? "")
          ? business.lead_grade!
          : "D";
        const gradeClass = `lf-map-grade-${grade.toLowerCase()}`;
        const safeName = escapeHtml(business.name);
        const safeCategory = escapeHtml(business.category || "General business");
        const safeCity = escapeHtml(business.city || "Unknown city");
        const safePhone = escapeHtml(business.phone || "Unavailable");
        const score = typeof business.lead_score === "number" ? business.lead_score : 0;
        const pinIcon = L.divIcon({
          html: `<div class="lf-map-lead-pin ${gradeClass}">${grade}</div>`,
          className: "lf-map-lead-pin-wrap",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });
        const marker = L.marker([latitude, longitude], { icon: pinIcon, title: `Grade ${grade} lead: ${business.name}`, alt: `Grade ${grade} lead: ${business.name}`, keyboard: true });
        const popup = document.createElement("div");
        popup.className = "lf-map-popup";
        popup.innerHTML = `
          <div class="lf-map-popup-title">
            <span>${safeName}</span>
            <span class="lf-map-popup-grade ${gradeClass}">Grade ${grade}</span>
          </div>
          <p class="lf-map-popup-subtitle">${safeCategory} &middot; ${safeCity}</p>
          <div class="lf-map-popup-details">
            <span>Phone: <strong>${business.phone ? safePhone : "Unavailable"}</strong></span>
            <span>Email: <strong>${business.email ? "Available" : "Unavailable"}</strong></span>
            <span>Website: <strong>${business.website ? "Available" : "Unavailable"}</strong></span>
            <span>Lead score: <strong>${score}</strong></span>
          </div>
          <button type="button" data-open-lead-id="${business.id}" class="lf-map-popup-button">Open lead details</button>
        `;
        marker.bindPopup(popup);
        marker.on("popupopen", () => {
          const button = popup.querySelector<HTMLButtonElement>(`[data-open-lead-id="${business.id}"]`);
          if (button) {
            button.onclick = () => onSelectBusinessRef.current(business);
          }
        });
        markerLayer.addLayer(marker);
      });
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    void import("leaflet").then((L) => {
      if (!mounted || !mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: NEUTRAL_MAP_VIEW,
        zoom: NEUTRAL_MAP_ZOOM,
        zoomControl: false,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      coverageLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      map.on("moveend", updateClustersOnMap);
      setIsLeafletReady(true);
    }).catch(() => {
      if (mounted) setMapLoadFailed(true);
    });

    return () => {
      mounted = false;
      const map = mapInstanceRef.current;
      if (map) {
        map.off("moveend", updateClustersOnMap);
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [updateClustersOnMap]);

  useEffect(() => {
    if (!isLeafletReady) return;

    const points: PointFeature<LeadClusterProperties>[] = validBusinesses.map((business) => ({
      type: "Feature",
      properties: { cluster: false, business },
      geometry: {
        type: "Point",
        coordinates: [business.longitude!, business.latitude!],
      },
    }));
    const index = new Supercluster<LeadClusterProperties>({ radius: 55, maxZoom: 16 });
    index.load(points);
    clusterIndexRef.current = index;
    updateClustersOnMap();
  }, [isLeafletReady, updateClustersOnMap, validBusinesses]);

  useEffect(() => {
    if (!isLeafletReady) return;

    const map = mapInstanceRef.current;
    const coverageLayer = coverageLayerRef.current;
    if (!map || !coverageLayer) return;

    void import("leaflet").then((L) => {
      if (mapInstanceRef.current !== map) return;
      coverageLayer.clearLayers();
      const cells = scanJob?.cells ?? [];
      const center = getScanCenter(scanJob);

      cells.forEach((cell) => {
        if (!hasValidCoordinates(cell.latitude, cell.longitude) || !scanJob) return;
        const style = scanCellStyle(cell, scanJob);
        const radius = Number.isFinite(cell.radius_meters) && cell.radius_meters > 0
          ? cell.radius_meters
          : 3000;
        const circle = L.circle([cell.latitude, cell.longitude], {
          radius,
          color: style.stroke,
          fillColor: style.fill,
          fillOpacity: style.opacity,
          weight: style.weight,
          dashArray: style.dashArray,
        });
        circle.bindTooltip(
          `<strong>${escapeHtml(cell.label)}</strong><br/>${style.label} &middot; ${cell.stored_count ?? 0} stored`,
          { sticky: true, direction: "top" },
        );
        coverageLayer.addLayer(circle);
      });

      if (cells.length === 0 && center && scanJob) {
        const radius = Math.max(1, scanJob.scan_radius_km ?? 25) * 1000;
        L.circle(center, {
          radius,
          color: "var(--lf-brand)",
          fillColor: "var(--lf-success)",
          fillOpacity: 0.05,
          weight: 1.5,
          dashArray: "6, 6",
        }).addTo(coverageLayer);
      }
    });
  }, [isLeafletReady, scanJob]);

  useEffect(() => {
    if (!isLeafletReady) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    const center = getScanCenter(scanJob);
    const viewKey = [
      validBusinesses.map((business) => `${business.id}:${business.latitude}:${business.longitude}`).join(","),
      scanJob?.id ?? "",
      center?.join(":") ?? "",
    ].join("|");
    if (lastViewKeyRef.current === viewKey) return;
    lastViewKeyRef.current = viewKey;

    if (fitBusinessBounds(map)) return;
    if (center) {
      map.setView(center, 11);
      return;
    }
    map.setView(NEUTRAL_MAP_VIEW, NEUTRAL_MAP_ZOOM);
  }, [fitBusinessBounds, isLeafletReady, scanJob, validBusinesses]);

  const resetMapView = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (fitBusinessBounds(map)) return;
    const center = getScanCenter(scanJob);
    map.setView(center ?? NEUTRAL_MAP_VIEW, center ? 11 : NEUTRAL_MAP_ZOOM);
  }, [fitBusinessBounds, scanJob]);

  const centerOnVerifiedScanData = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const center = getScanCenter(scanJob);
    map.setView(center ?? NEUTRAL_MAP_VIEW, center ? 11 : NEUTRAL_MAP_ZOOM);
  }, [scanJob]);

  return (
    <div className="lf-map-canvas">
      <div ref={mapContainerRef} className="lf-map-canvas__viewport" />

      <div className="lf-map-controls">
        <div className="lf-map-control-group">
          <button type="button" aria-label="Zoom in" onClick={() => mapInstanceRef.current?.zoomIn()} className="lf-map-control-button lf-map-control-button--split">+</button>
          <button type="button" aria-label="Zoom out" onClick={() => mapInstanceRef.current?.zoomOut()} className="lf-map-control-button">−</button>
        </div>
        <button type="button" aria-label="Fit visible leads" onClick={resetMapView} className="lf-map-control-button lf-map-control-button--label">
          <span className="hidden sm:inline">Fit Leads</span><span className="sm:hidden">Fit</span>
        </button>
        <button type="button" aria-label="Center on verified scan data" onClick={centerOnVerifiedScanData} className="lf-map-control-button lf-map-control-button--label">
          <span className="hidden sm:inline">City View</span><span className="sm:hidden">Center</span>
        </button>
      </div>

      {scanJob && (
        <div data-testid="map-scan-coverage" className="lf-map-overlay lf-map-coverage">
          <p className="lf-map-overlay-title">Scanner coverage: {scanJob.city ?? "Selected city"}</p>
          <div className="lf-map-legend" aria-label="Scanner cell state legend">
            <span><i className="lf-map-legend-dot lf-map-legend-dot--pending" aria-hidden />Pending</span>
            <span><i className="lf-map-legend-dot lf-map-legend-dot--current" aria-hidden />Current</span>
            <span><i className="lf-map-legend-dot lf-map-legend-dot--progress" aria-hidden />In progress</span>
            <span><i className="lf-map-legend-dot lf-map-legend-dot--completed" aria-hidden />Completed</span>
            <span><i className="lf-map-legend-dot lf-map-legend-dot--paused" aria-hidden />Retrying / paused</span>
            <span><i className="lf-map-legend-dot lf-map-legend-dot--failed" aria-hidden />Failed</span>
          </div>
        </div>
      )}

      {mapLoadFailed ? (
        <div className="lf-map-state lf-map-state--error" role="alert">
          <div>
            <p className="lf-map-state-title">The interactive map could not load.</p>
            <p className="lf-map-state-copy">Check your connection and reload this workspace to try again.</p>
            <button type="button" onClick={() => window.location.reload()} className="lf-map-state-action">Reload map</button>
          </div>
        </div>
      ) : !isLeafletReady ? (
        <div className="lf-map-state lf-map-state--loading">
          <div className="text-center">
            <div className="lf-map-loader" />
            <p className="lf-map-state-copy">Loading interactive lead map...</p>
          </div>
        </div>
      ) : validBusinesses.length === 0 ? (
        <div className="lf-map-empty-overlay">
          <div className="lf-map-empty-card">
            <p className="lf-map-state-title">No mappable leads in this view</p>
            <p className="lf-map-state-copy">{emptyMessage ?? "Adjust the filters or scan a location with coordinates to see leads here."}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}