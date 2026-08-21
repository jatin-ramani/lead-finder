import { del, get, patch, post } from "./http";
import type {
  BusinessNote,
  DeletedCountResponse,
  NoteListResponse,
} from "@/types/api";

export function getBusinessNotes(
  businessId: number,
  signal?: AbortSignal,
): Promise<NoteListResponse> {
  return get<NoteListResponse>(`/businesses/${businessId}/notes`, { signal });
}

export function createBusinessNote(
  businessId: number,
  content: string,
): Promise<BusinessNote> {
  return post<BusinessNote>(`/businesses/${businessId}/notes`, { content });
}

export function updateBusinessNote(
  noteId: number,
  content: string,
): Promise<BusinessNote> {
  return patch<BusinessNote>(`/businesses/notes/${noteId}`, { content });
}

export function deleteBusinessNote(
  noteId: number,
): Promise<DeletedCountResponse> {
  return del<DeletedCountResponse>(`/businesses/notes/${noteId}`);
}
