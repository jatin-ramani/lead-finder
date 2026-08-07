"use client";

import { App } from "antd";
import { useCallback, useState } from "react";

import { useBusinesses } from "@/hooks/useBusinesses";
import { postScan, ScanUnavailableError, toErrorMessage } from "@/services/api";
import type { ScanRequest } from "@/types/business";

/**
 * Categories the backend scanner accepts. GET /businesses does not return a
 * `category` field, so the filter dropdown would otherwise have nothing to
 * select and POST /scan could never be given one.
 */
export const SCAN_CATEGORIES = [
  "commercial",
  "catering",
  "healthcare",
  "education",
  "service",
  "accommodation",
  "activity",
];

export interface UseScannerResult {
  /** True from the moment POST /scan is sent until the reload settles. */
  scanning: boolean;
  /**
   * Runs POST /scan then reloads the table. Resolves true on success so callers
   * can close a dialog only when the scan actually went through.
   */
  startScan: (payload: Partial<ScanRequest>) => Promise<boolean>;
}

/**
 * Owns the POST /scan lifecycle: validation, the request, the success message
 * and the automatic GET /businesses refresh that follows it.
 *
 * Concurrent clicks are ignored while a scan is in flight, so the button can
 * never fire two scans or two reloads.
 */
export function useScanner(): UseScannerResult {
  const { message, notification } = App.useApp();
  const { refresh } = useBusinesses();
  const [scanning, setScanning] = useState(false);

  const startScan = useCallback(
    async (payload: Partial<ScanRequest>): Promise<boolean> => {
      if (scanning) return false;

      const city = payload.city?.trim() ?? "";
      const category = payload.category?.trim() ?? "";

      if (!city || !category) {
        message.warning("Select a city and a category before scanning.");
        return false;
      }

      setScanning(true);

      try {
        await postScan({ city, category });
        message.success("Scan Completed");

        // Pull the freshly scanned rows in before releasing the button, so the
        // table is already up to date when the spinner stops.
        await refresh();
        return true;
      } catch (error) {
        notification.error({
          message:
            error instanceof ScanUnavailableError
              ? "Scan endpoint unavailable"
              : "Scan failed",
          description: toErrorMessage(error),
        });
        return false;
      } finally {
        setScanning(false);
      }
    },
    [scanning, message, notification, refresh],
  );

  return { scanning, startScan };
}
