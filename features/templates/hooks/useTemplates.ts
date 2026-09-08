import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, templatesApi } from "@/services";
import type {
  TemplateCreateInput,
  TemplateFilterParams,
  TemplatePreviewRequest,
  TemplateUpdateInput,
} from "@/types/api";

export function useTemplates(params?: TemplateFilterParams) {
  return useQuery({
    queryKey: queryKeys.templates.list(params as Record<string, unknown>),
    queryFn: ({ signal }) => templatesApi.getTemplates(params, signal),
  });
}

export function useTemplate(templateId: number | null) {
  return useQuery({
    queryKey: queryKeys.templates.detail(templateId!),
    queryFn: ({ signal }) => templatesApi.getTemplate(templateId!, signal),
    enabled: typeof templateId === "number" && templateId > 0,
  });
}

export function useTemplateVariables() {
  return useQuery({
    queryKey: queryKeys.templates.variables(),
    queryFn: ({ signal }) => templatesApi.getTemplateVariables(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TemplateCreateInput) => templatesApi.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TemplateUpdateInput }) =>
      templatesApi.updateTemplate(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(id) });
    },
  });
}

export function useToggleTemplateArchive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_archived }: { id: number; is_archived: boolean }) =>
      templatesApi.toggleTemplateArchive(id, is_archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => templatesApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
    },
  });
}

export function usePreviewTemplate() {
  return useMutation({
    mutationFn: (payload: TemplatePreviewRequest) => templatesApi.previewTemplate(payload),
  });
}
