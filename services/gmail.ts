import { get, post } from "./http";
import type {
  GmailAuthUrlResponse,
  GmailStatusResponse,
  GmailTestSendRequest,
  GmailTestSendResponse,
  MessageResponse,
} from "@/types/api";

export function getGmailStatus(
  signal?: AbortSignal,
): Promise<GmailStatusResponse> {
  return get<GmailStatusResponse>("/integrations/gmail/status", { signal });
}

export function getGmailAuthUrl(
  signal?: AbortSignal,
): Promise<GmailAuthUrlResponse> {
  return get<GmailAuthUrlResponse>("/integrations/gmail/auth-url", { signal });
}

export function disconnectGmail(): Promise<MessageResponse> {
  return post<MessageResponse>("/integrations/gmail/disconnect");
}

export function sendGmailTestEmails(
  payload: GmailTestSendRequest,
): Promise<GmailTestSendResponse> {
  return post<GmailTestSendResponse>("/integrations/gmail/test-send", payload);
}
