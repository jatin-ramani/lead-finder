import { App } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { automationsApi, isApiError, queryKeys } from "@/services";
import type {
  CityAutomationStartInput,
} from "@/types/api";

export function useAvailableCities() {
  return useQuery({
    queryKey: queryKeys.automations.cities(),
    queryFn: ({ signal }) => automationsApi.getAvailableCities(signal),
    staleTime: 30_000,
  });
}

export function useCityStats(city?: string) {
  return useQuery({
    queryKey: queryKeys.automations.cityStats(city ?? ""),
    queryFn: ({ signal }) => automationsApi.getCityStats(city!, signal),
    enabled: Boolean(city && city.trim().length > 0),
    staleTime: 10_000,
  });
}

export function useMasterTemplate(city?: string) {
  return useQuery({
    queryKey: ["automations", "master-template", city ?? ""],
    queryFn: ({ signal }) => automationsApi.getMasterTemplate(city, signal),
    staleTime: 60_000,
  });
}

export function useGenerateAITemplates() {
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ city, industry }: { city: string; industry?: string }) =>
      automationsApi.generateAITemplates(city, industry),
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to generate AI templates";
      message.error(msg);
    },
  });
}

export function useGenerateSingleTemplate() {
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({
      grade,
      city,
      industry,
    }: {
      grade: string;
      city: string;
      industry?: string;
    }) => automationsApi.generateSingleTemplate(grade, city, industry),
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to regenerate template";
      message.error(msg);
    },
  });
}

export function useStartCityAutomation() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CityAutomationStartInput) =>
      automationsApi.startCityAutomation(payload),
    onSuccess: (data) => {
      message.success(data.message || "Automation launched successfully");
      void queryClient.invalidateQueries({ queryKey: queryKeys.automations.all });
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to launch automation";
      message.error(msg);
    },
  });
}

export function useCityAutomationRuns(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: queryKeys.automations.runs({ page, pageSize }),
    queryFn: ({ signal }) =>
      automationsApi.getCityAutomationRuns(page, pageSize, signal),
    staleTime: 10_000,
  });
}

export function useCityAutomationReport(
  id?: number | null,
  options?: {
    refetchInterval?:
      | number
      | false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | ((query: any) => number | false | undefined);
  },
) {
  return useQuery({
    queryKey: queryKeys.automations.runReport(id ?? 0),
    queryFn: ({ signal }) => automationsApi.getCityAutomationReport(id!, signal),
    enabled: Boolean(id && id > 0),
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function useCancelCityAutomation() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => automationsApi.cancelCityAutomation(id),
    onSuccess: () => {
      message.success("Automation run cancelled");
      void queryClient.invalidateQueries({ queryKey: queryKeys.automations.all });
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to cancel automation";
      message.error(msg);
    },
  });
}

export function useResumeCityAutomation() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => automationsApi.resumeCityAutomation(id),
    onSuccess: () => {
      message.success("Automation run resumed");
      void queryClient.invalidateQueries({ queryKey: queryKeys.automations.all });
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to resume automation";
      message.error(msg);
    },
  });
}

import { saveBlob } from "@/lib/download";

export function useExportCityMobileNumbers() {
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (city: string) => automationsApi.exportCityMobileNumbersXlsx(city),
    onSuccess: ({ blob, filename }) => {
      saveBlob(blob, filename);
      message.success(`Mobile numbers exported for ${filename}`);
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to export mobile numbers";
      message.error(msg);
    },
  });
}


