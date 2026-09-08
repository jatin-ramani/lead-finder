import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignsApi, queryKeys } from "@/services";
import type {
  CampaignCreateInput,
  CampaignFilterCriteria,
  CampaignFilterParams,
  CampaignRecipientFilterParams,
  CampaignUpdateInput,
} from "@/types/api";

export function useCampaigns(params?: CampaignFilterParams) {
  return useQuery({
    queryKey: queryKeys.campaigns.list(params as Record<string, unknown>),
    queryFn: ({ signal }) => campaignsApi.getCampaigns(params, signal),
  });
}

export function useCampaign(campaignId: number | null) {
  return useQuery({
    queryKey: queryKeys.campaigns.detail(campaignId!),
    queryFn: ({ signal }) => campaignsApi.getCampaign(campaignId!, signal),
    enabled: typeof campaignId === "number" && campaignId > 0,
    refetchInterval: (query) => {
      // Poll running campaigns every 3 seconds
      const status = query.state.data?.data?.status;
      return status === "running" ? 3000 : false;
    },
  });
}

export function useCampaignRecipients(
  campaignId: number | null,
  params?: CampaignRecipientFilterParams,
) {
  return useQuery({
    queryKey: queryKeys.campaigns.recipients(campaignId!, params as Record<string, unknown>),
    queryFn: ({ signal }) => campaignsApi.getCampaignRecipients(campaignId!, params, signal),
    enabled: typeof campaignId === "number" && campaignId > 0,
  });
}

export function usePreviewCampaignRecipients() {
  return useMutation({
    mutationFn: (criteria: CampaignFilterCriteria) =>
      campaignsApi.previewCampaignRecipients(criteria),
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampaignCreateInput) => campaignsApi.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CampaignUpdateInput }) =>
      campaignsApi.updateCampaign(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(id) });
    },
  });
}

export function useStartCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => campaignsApi.startCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

export function useCancelCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => campaignsApi.cancelCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(id) });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => campaignsApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    },
  });
}

export function useProcessDueCampaigns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => campaignsApi.processDueCampaigns(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}
