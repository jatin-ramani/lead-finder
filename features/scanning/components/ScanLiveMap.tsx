"use client";

import type { LayerGroup, Map as LeafletMap } from "leaflet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Supercluster, { type PointFeature } from "supercluster";

import {
  clusterBboxesForViewport,
  geographicBoundsForCoordinates,
  longitudeNear,
} from "@/lib/mapBounds";
import type { LatestScanJob, ScanCellInfo, ScanRecentLead } from "@/types/api";

interface ScanLeadClusterProperties {
  cluster?: boolean;
  point_count?: number;
  cluster_id?: number;
  lead?: ScanRecentLead;
}

interface ScanLiveMapProps {
  job: LatestScanJob | undefined;
  scanning?: boolean;
  onSelectLead?: (businessId: number) => void;
}

const NEUTRAL_CENTER: [number, number] = [20, 0];
const NEUTRAL_ZOOM = 2;

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
): boolean {
  return latitude != null
    && longitude != null
    && Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180;
}


function cellPresentation(
  cell: ScanCellInfo,
  isPausedCurrentCell: boolean,
  isFailedCurrentCell: boolean,
) {
  if (isPausedCurrentCell) {
    return {
      label: "Paused",
      color: "var(--lf-warning)",
      fillColor: "var(--lf-warning)",
      fillOpacity: 0.18,
      weight: 3,
      dashArray: undefined,
      className: "lf-scan-cell-paused",
    };
  }

  if (isFailedCurrentCell || cell.status === "failed") {
    return {
      label: "Failed",
      color: "var(--lf-error)",
      fillColor: "var(--lf-error)",
      fillOpacity: isFailedCurrentCell ? 0.2 : 0.16,
      weight: isFailedCurrentCell ? 3 : 1.5,
      dashArray: undefined,
      className: "lf-scan-cell-failed",
    };
  }

  if (cell.status === "running") {
    return {
      label: "Running",
      color: "var(--lf-success)",
      fillColor: "var(--lf-accent)",
      fillOpacity: 0.28,
      weight: 3,
      dashArray: undefined,
      className: "lf-scan-cell-current animate-pulse",
    };
  }

  if (cell.status === "in_progress") {
    return {
      label: "In progress",
      color: "var(--lf-brand)",
      fillColor: "var(--lf-accent)",
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: "5, 4",
      className: "lf-scan-cell-in-progress",
    };
  }
  if (cell.status === "completed") {
    return {
      label: "Completed",
      color: "var(--lf-brand-active)",
      fillColor: "var(--lf-success)",
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: undefined,
      className: "lf-scan-cell-completed",
    };
  }

  if (cell.status === "skipped") {
    return {
      label: "Already covered",
      color: "var(--lf-info)",
      fillColor: "var(--lf-info)",
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: "2, 5",
      className: "lf-scan-cell-already-covered",
    };
  }
  if (cell.status === "retry_wait") {
    return {
      label: "Retrying",
      color: "var(--lf-warning)",
      fillColor: "var(--lf-warning)",
      fillOpacity: 0.16,
      weight: 1.5,
      dashArray: "7, 3",
      className: "lf-scan-cell-retry",
    };
  }

  return {
    label: "Pending",
    color: "var(--lf-text-muted)",
    fillColor: "var(--lf-text-muted)",
    fillOpacity: 0.05,
    weight: 1,
    dashArray: "4, 4",
    className: "lf-scan-cell-pending",
  };
}

export default function ScanLiveMap({
  job,
  scanning,
  onSelectLead,
}: ScanLiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const cellsLayerRef = useRef<LayerGroup | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const clusterIndexRef = useRef<Supercluster<ScanLeadClusterProperties> | null>(
    null,
  );
  const onSelectLeadRef = useRef(onSelectLead);
  const fittedJobIdRef = useRef<number | null>(null);
  const clusteredLeadSignatureRef = useRef<string | null>(null);
  const isPopupOpenRef = useRef(false);
  const hasDeferredClusterRefreshRef = useRef(false);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);

  useEffect(() => {
    onSelectLeadRef.current = onSelectLead;
  }, [onSelectLead]);

  const city = job?.city ?? "Scanner map";
  const status = job?.status ?? "Pending";
  const isRunning = status === "Running" || Boolean(scanning);
  const isPaused = status === "Paused";
  const isCompleted = status === "Completed";
  const isFailed = status === "Failed";
  const currentCell = job?.current_cell || "Initializing scan grid...";
  const totalCells = job?.total_cells ?? job?.requested_cells ?? 0;
  const requestedCells = job?.requested_cells ?? totalCells;
  const completedCells = job?.completed_cells ?? 0;
  const alreadyCoveredCells = job?.already_covered_cells ?? 0;
  const newCellsQueued = job?.new_cells_queued ?? 0;
  const coveredCells = requestedCells > 0 ? Math.min(requestedCells, completedCells + alreadyCoveredCells) : 0;
  const coverageProgress = job?.coverage_progress ?? job?.progress ?? 0;
  const jobId = job?.id;
  const centerLatitude = job?.center_latitude;
  const centerLongitude = job?.center_longitude;
  const scanRadius = job?.scan_radius_km ?? 25;

  const cells = useMemo<ScanCellInfo[]>(() => job?.cells ?? [], [job?.cells]);
  const recentLeads = useMemo<ScanRecentLead[]>(
    () => job?.recent_leads ?? [],
    [job?.recent_leads],
  );
  const validLeads = useMemo(
    () =>
      recentLeads.filter((lead) =>
        hasValidCoordinates(lead.latitude, lead.longitude),
      ),
    [recentLeads],
  );
  const geographicBounds = useMemo(
    () => geographicBoundsForCoordinates([
      ...cells
        .filter((cell) => hasValidCoordinates(cell.latitude, cell.longitude))
        .map((cell) => ({
          latitude: cell.latitude,
          longitude: cell.longitude,
        })),
      ...validLeads.map((lead) => ({
        latitude: lead.latitude!,
        longitude: lead.longitude!,
      })),
    ]),
    [cells, validLeads],
  );
  const longitudeReference = geographicBounds
    ? (geographicBounds.west + geographicBounds.east) / 2
    : centerLongitude ?? 0;
  // The full, exact job result stays in the spatial index, but identical poll
  // responses never rebuild clusters or Leaflet marker layers.
  const leadSignature = useMemo(
    () => [
      jobId ?? "none",
      ...validLeads.map((lead) => [
        lead.id,
        lead.latitude,
        lead.longitude,
        lead.lead_grade,
        lead.lead_score,
        lead.phone,
        lead.has_email,
        lead.has_website,
      ].join(":")),
    ].join("|"),
    [jobId, validLeads],
  );

  const updateClustersOnMap = useCallback(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const clusterIndex = clusterIndexRef.current;
    if (!map || !markersLayer || !clusterIndex) return;
    if (isPopupOpenRef.current) {
      hasDeferredClusterRefreshRef.current = true;
      return;
    }

    void import("leaflet")
      .then((L) => {
        if (!mapInstanceRef.current || mapInstanceRef.current !== map) return;

        markersLayer.clearLayers();
        const bounds = map.getBounds();
        const clusters = clusterBboxesForViewport(
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ).flatMap((bbox) => clusterIndex.getClusters(bbox, Math.floor(map.getZoom())));

        clusters.forEach((feature) => {
          const [longitude, latitude] = feature.geometry.coordinates;
          if (!hasValidCoordinates(latitude, longitude)) return;
          const displayedLongitude = longitudeNear(longitude, map.getCenter().lng);

          if (feature.properties.cluster) {
            const count = feature.properties.point_count ?? 1;
            const clusterId = feature.properties.cluster_id;
            const size = count > 50 ? 46 : count > 15 ? 40 : 34;
            const clusterIcon = L.divIcon({
              html:
                '<div class="lf-scan-cluster" style="width:' +
                size +
                "px;height:" +
                size +
                'px;font-size:11px">' +
                count +
                "</div>",
              className: "lf-scan-cluster-pin",
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            });
            const marker = L.marker([latitude, displayedLongitude], {
              icon: clusterIcon,
              title: `Cluster of ${count} discovered leads`,
              alt: `Cluster of ${count} discovered leads`,
              keyboard: true,
            });
            marker.on("click", () => {
              if (clusterId == null) return;
              const expansionZoom = Math.min(
                clusterIndex.getClusterExpansionZoom(clusterId),
                18,
              );
              map.flyTo([latitude, displayedLongitude], expansionZoom, {
                duration: 0.6,
              });
            });
            markersLayer.addLayer(marker);
            return;
          }

          const lead = feature.properties.lead;
          if (!lead) return;

          const grade = ["A", "B", "C", "D"].includes(
            lead.lead_grade ?? "",
          )
            ? lead.lead_grade!
            : "D";
          const phone = escapeHtml(lead.phone || "Unavailable");
          const score = typeof lead.lead_score === "number" ? lead.lead_score : 0;
          const icon = L.divIcon({
            html:
              '<div class="lf-scan-marker lf-map-lead-pin lf-map-grade-' +
              grade.toLowerCase() +
              '" style="width:30px;height:30px">' +
              grade +
              "</div>",
            className: "lf-scan-marker-pin",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -16],
          });
          const marker = L.marker([latitude, displayedLongitude], {
            icon,
            title: `Grade ${grade} lead: ${lead.name}`,
            alt: `Grade ${grade} lead: ${lead.name}`,
            keyboard: true,
          });
          const popupContent = document.createElement("div");
          popupContent.className = "lf-map-popup lf-scan-map-popup";
          popupContent.innerHTML = [
            '<div class="lf-map-popup-title">',
            "<span>",
            escapeHtml(lead.name),
            "</span>",
            '<span class="lf-map-popup-grade lf-map-grade-',
            grade.toLowerCase(),
            '">Grade ',
            grade,
            "</span></div>",
            '<div class="lf-map-popup-subtitle">',
            escapeHtml(lead.category || "General business"),
            " &middot; ",
            escapeHtml(lead.city || "Unknown city"),
            "</div>",
            '<div class="lf-map-popup-details">',
            "<span>Phone: <strong>",
            phone,
            "</strong></span>",
            "<span>Email: <strong>",
            lead.has_email ? "Available" : "Unavailable",
            "</strong></span>",
            "<span>Website: <strong>",
            lead.has_website ? "Available" : "Unavailable",
            "</strong></span>",
            "<span>Lead score: <strong>",
            score,
            "</strong></span></div>",
            '<button type="button" class="lf-map-popup-button" data-open-scan-lead-id="',
            lead.id,
            '">Open Lead Details</button>',
          ].join("");
          // Keep a popup visibly and interactively clear of the fixed scanner
          // HUD at the top and the cell-state legend at the bottom.
          marker.bindPopup(popupContent, {
            autoPan: true,
            autoPanPaddingTopLeft: L.point(24, 132),
            autoPanPaddingBottomRight: L.point(24, 112),
          });
          marker.on("popupopen", () => {
            isPopupOpenRef.current = true;
            const button = popupContent.querySelector<HTMLButtonElement>(
              '[data-open-scan-lead-id="' + lead.id + '"]',
            );
            if (button) {
              button.onclick = () => onSelectLeadRef.current?.(lead.id);
            }
          });
          marker.on("popupclose", () => {
            isPopupOpenRef.current = false;
            if (hasDeferredClusterRefreshRef.current) {
              hasDeferredClusterRefreshRef.current = false;
              map.fire("moveend");
            }
          });
          markersLayer.addLayer(marker);
        });
      })
      .catch(() => setMapLoadFailed(true));
  }, []);

  useEffect(() => {
    let isMounted = true;

    void import("leaflet")
      .then((L) => {
        if (!isMounted || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: NEUTRAL_CENTER,
            zoom: NEUTRAL_ZOOM,
            zoomControl: false,
          });
          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
              maxZoom: 19,
              subdomains: "abcd",
            },
          ).addTo(map);

          cellsLayerRef.current = L.layerGroup().addTo(map);
          markersLayerRef.current = L.layerGroup().addTo(map);
          mapInstanceRef.current = map;
          map.on("moveend", updateClustersOnMap);
        }

        setIsLeafletReady(true);
      })
      .catch(() => {
        if (isMounted) setMapLoadFailed(true);
      });

    return () => {
      isMounted = false;
      isPopupOpenRef.current = false;
      hasDeferredClusterRefreshRef.current = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [updateClustersOnMap]);

  useEffect(() => {
    fittedJobIdRef.current = null;
  }, [jobId]);

  useEffect(() => {
    if (!isLeafletReady || clusteredLeadSignatureRef.current === leadSignature) return;
    clusteredLeadSignatureRef.current = leadSignature;

    const points: PointFeature<ScanLeadClusterProperties>[] = validLeads.map(
      (lead) => ({
        type: "Feature",
        properties: { cluster: false, lead },
        geometry: {
          type: "Point",
          coordinates: [lead.longitude!, lead.latitude!],
        },
      }),
    );
    const index = new Supercluster<ScanLeadClusterProperties>({
      radius: 55,
      maxZoom: 16,
    });
    index.load(points);
    clusterIndexRef.current = index;
    updateClustersOnMap();
  }, [isLeafletReady, leadSignature, updateClustersOnMap, validLeads]);

  useEffect(() => {
    if (!isLeafletReady || !mapInstanceRef.current || !cellsLayerRef.current) {
      return;
    }

    void import("leaflet")
      .then((L) => {
        const map = mapInstanceRef.current;
        const cellsLayer = cellsLayerRef.current;
        if (!map || !cellsLayer) return;

        cellsLayer.clearLayers();

        cells.forEach((cell) => {
          if (!hasValidCoordinates(cell.latitude, cell.longitude)) return;

          const presentation = cellPresentation(
            cell,
            isPaused && cell.label === currentCell,
            isFailed && cell.label === currentCell,
          );
          const circle = L.circle([
            cell.latitude,
            longitudeNear(cell.longitude, longitudeReference),
          ], {
            radius: cell.radius_meters || 3000,
            color: presentation.color,
            fillColor: presentation.fillColor,
            fillOpacity: presentation.fillOpacity,
            weight: presentation.weight,
            dashArray: presentation.dashArray,
            className: presentation.className,
          });
          circle.bindTooltip(
            [
              '<div style="font-size:11px;font-family:inherit;padding:2px">',
              "<strong>",
              escapeHtml(cell.label),
              "</strong><br/>",
              "<span>Status: <b>",
              presentation.label,
              "</b></span><br/>",
              "<span>Stored leads: <b>",
              cell.stored_count ?? 0,
              "</b></span><br/>",
              "<span>Search operations complete: <b>",
              cell.completed_units ?? 0,
              " / ",
              cell.total_units ?? 0,
              "</b></span></div>",
            ].join(""),
            { sticky: true, direction: "top" },
          );
          cellsLayer.addLayer(circle);
        });

        if (geographicBounds) {
          if (fittedJobIdRef.current !== jobId) {
            map.fitBounds(
              L.latLngBounds(
                [geographicBounds.south, geographicBounds.west],
                [geographicBounds.north, geographicBounds.east],
              ),
              { padding: [30, 30], maxZoom: 13 },
            );
            fittedJobIdRef.current = jobId ?? null;
          }
          return;
        }

        if (
          hasValidCoordinates(centerLatitude, centerLongitude)
        ) {
          map.setView([centerLatitude!, centerLongitude!], 11);
        } else {
          map.setView(NEUTRAL_CENTER, NEUTRAL_ZOOM);
        }
      })
      .catch(() => setMapLoadFailed(true));
  }, [
    cells,
    currentCell,
    isFailed,
    isLeafletReady,
    isPaused,
    centerLatitude,
    centerLongitude,
    geographicBounds,
    jobId,
    longitudeReference,
    validLeads,
  ]);

  return (
    <div
      className="lf-workspace-card relative h-full min-h-[380px] w-full overflow-hidden"
      data-testid="scan-live-map"
      data-longitude-wrap={geographicBounds?.crossesAntimeridian ? "antimeridian" : "standard"}
    >
      <div ref={mapContainerRef} className="relative z-0 h-full min-h-[380px] w-full" />

      <div className="lf-map-overlay absolute right-3 top-28 z-10 flex overflow-hidden sm:top-20">
        <button
          type="button"
          aria-label="Zoom in scanner map"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="flex h-11 w-11 items-center justify-center border-r border-[var(--lf-border)] text-lg font-bold text-[var(--lf-text)] transition-colors hover:bg-[var(--lf-surface-muted)]"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out scanner map"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="flex h-11 w-11 items-center justify-center text-lg font-bold text-[var(--lf-text)] transition-colors hover:bg-[var(--lf-surface-muted)]"
        >
          −
        </button>
      </div>

      <div className="lf-map-overlay pointer-events-none absolute left-3 right-3 top-3 z-10 flex flex-col justify-between gap-2 px-4 py-2.5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <span
            className={
              "h-3 w-3 shrink-0 rounded-full " +
              (isRunning
                ? "animate-ping bg-[var(--lf-success)]"
                : isPaused
                  ? "bg-[var(--lf-warning)]"
                  : isCompleted
                    ? "bg-[var(--lf-success)]"
                    : isFailed
                      ? "bg-[var(--lf-error)]"
                      : "bg-[var(--lf-text-muted)]")
            }
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--lf-text)]">{city}</span>
              <span className="lf-status-badge rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {isRunning ? "Scanning" : status}
              </span>
            </div>
            <p className="max-w-xs truncate text-xs font-medium text-[var(--lf-text-muted)] sm:max-w-md">
              {isRunning || isPaused
                ? currentCell
                : "Geographic coverage across " +
                  scanRadius +
                  " km"}
            </p>
          </div>
        </div>

        <div className="shrink-0 border-t border-[var(--lf-border)] pt-1 text-right sm:border-t-0 sm:pt-0">
          {requestedCells > 0 && (
            <>
              <div className="text-xs font-bold text-[var(--lf-text)]">
                {coveredCells} / {requestedCells} cells covered
              </div>
              <div className="text-[10px] font-medium text-[var(--lf-success)]">
                {alreadyCoveredCells > 0
                  ? `${alreadyCoveredCells} already covered · ${coverageProgress}% coverage`
                  : `${newCellsQueued} new cells queued · ${coverageProgress}% coverage`}
              </div>
            </>
          )}
          {job?.recent_leads_truncated && (
            <p className="max-w-52 text-[10px] font-medium text-[var(--lf-text-muted)]" role="status">
              Live map shows the latest {recentLeads.length.toLocaleString()} of {(job.recent_leads_total ?? recentLeads.length).toLocaleString()} leads.
            </p>
          )}
        </div>
      </div>

      <div
        className="lf-map-overlay pointer-events-none absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] px-3 py-2 text-[10px] text-[var(--lf-text-secondary)]"
        aria-label="Scan cell state legend"
      >
        <p className="mb-1 font-semibold uppercase tracking-wide text-[var(--lf-text-secondary)]">
          Cell states
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1" role="list">
          <span role="listitem" className="flex items-center gap-1">
            <i
              className="h-2.5 w-2.5 rounded-full border-2 border-[var(--lf-success)]"
              aria-hidden
            />
            Running
          </span>
          <span role="listitem" className="flex items-center gap-1">
            <i
              className="h-2.5 w-2.5 rounded-full border border-dashed border-[var(--lf-success)]"
              aria-hidden
            />
            In progress
          </span>
          <span role="listitem" className="flex items-center gap-1">
            <i
              className="h-2.5 w-2.5 rounded-full border border-[var(--lf-success)] bg-[var(--lf-success-soft)]"
              aria-hidden
            />
            Completed
          </span>
          <span role="listitem" className="flex items-center gap-1">
            <i
              className="h-2.5 w-2.5 rounded-full border border-dashed border-[var(--lf-info)]"
              aria-hidden
            />
            Already covered
          </span>
          <span role="listitem" className="flex items-center gap-1">
            <i
              className="h-2.5 w-2.5 rounded-full border border-dashed border-[var(--lf-text-muted)]"
              aria-hidden
            />
            Pending
          </span>
          <span role="listitem" className="flex items-center gap-1">
            <i
              className="h-2.5 w-2.5 rotate-45 border border-[var(--lf-warning)]"
              aria-hidden
            />
            Retrying
          </span>
          <span role="listitem" className="flex items-center gap-1">
            <i className="h-2.5 w-2.5 bg-[var(--lf-error)]" aria-hidden />
            Failed
          </span>
          <span role="listitem" className="flex items-center gap-1">
            <i
              className="h-2.5 w-2.5 border-2 border-[var(--lf-warning)] bg-[var(--lf-surface)]"
              aria-hidden
            />
            Paused
          </span>
        </div>
      </div>

      {mapLoadFailed ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--lf-surface)] p-6 text-center"
          role="alert"
        >
          <div>
            <p className="text-sm font-semibold text-[var(--lf-text)]">
              The scanner map could not load.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-[var(--lf-brand)] px-3 py-2 text-xs font-semibold text-[var(--lf-on-brand)]"
            >
              Reload scanner
            </button>
          </div>
        </div>
      ) : !isLeafletReady ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--lf-surface)]/80 backdrop-blur-xs">
          <div className="text-center">
            <div className="mx-auto mb-1.5 h-7 w-7 animate-spin rounded-full border-3 border-[var(--lf-brand)] border-t-transparent" />
            <p className="text-xs font-medium text-[var(--lf-text-secondary)]">
              Loading live scanner map...
            </p>
          </div>
        </div>
      ) : validLeads.length === 0 && cells.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6 text-center">
          <div className="lf-map-overlay max-w-sm px-5 py-4">
            <p className="text-sm font-semibold text-[var(--lf-text)]">
              Waiting for geographic scan data
            </p>
            <p className="mt-1 text-xs text-[var(--lf-text-secondary)]">
              The map will focus on the job center, cells, or real lead
              coordinates as soon as the scanner provides them.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}