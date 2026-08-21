import { del, get, patch, post } from "./http";
import type {
  BulkTagActionResponse,
  DeletedCountResponse,
  Tag,
  TagListResponse,
} from "@/types/api";

export interface CreateTagParams {
  name: string;
}

export interface UpdateTagParams {
  name: string;
}

export interface AssignBusinessTagParams {
  businessId: number;
  tagId?: number;
  name?: string;
}

export interface RemoveBusinessTagParams {
  businessId: number;
  tagId: number;
}

export interface BulkAttachTagsParams {
  businessIds: number[];
  tagId?: number;
  tagName?: string;
}

export interface BulkRemoveTagsParams {
  businessIds: number[];
  tagId: number;
}

export function listTags(signal?: AbortSignal): Promise<TagListResponse> {
  return get<TagListResponse>("/tags", { signal });
}

export function createTag(params: CreateTagParams): Promise<Tag> {
  return post<Tag>("/tags", params);
}

export function updateTag(id: number, params: UpdateTagParams): Promise<Tag> {
  return patch<Tag>(`/tags/${id}`, params);
}

export function deleteTag(id: number): Promise<DeletedCountResponse> {
  return del<DeletedCountResponse>(`/tags/${id}`);
}

export function attachTagToBusiness(params: AssignBusinessTagParams): Promise<Tag> {
  return post<Tag>(`/businesses/${params.businessId}/tags`, {
    tag_id: params.tagId,
    name: params.name,
  });
}

export function removeTagFromBusiness(params: RemoveBusinessTagParams): Promise<DeletedCountResponse> {
  return del<DeletedCountResponse>(
    `/businesses/${params.businessId}/tags/${params.tagId}`
  );
}

export function bulkAttachTag(params: BulkAttachTagsParams): Promise<BulkTagActionResponse> {
  return post<BulkTagActionResponse>("/businesses/tags/bulk", {
    business_ids: params.businessIds,
    tag_id: params.tagId,
    tag_name: params.tagName,
  });
}

export function bulkRemoveTag(params: BulkRemoveTagsParams): Promise<BulkTagActionResponse> {
  return post<BulkTagActionResponse>("/businesses/tags/bulk-remove", {
    business_ids: params.businessIds,
    tag_id: params.tagId,
  });
}
