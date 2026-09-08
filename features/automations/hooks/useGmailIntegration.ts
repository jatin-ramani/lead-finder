import { App } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { gmailApi, isApiError, queryKeys } from "@/services";
import type {
  GmailTestSendRequest,
  GmailTestSendResponse,
} from "@/types/api";

export function useGmailStatus() {
  return useQuery({
    queryKey: queryKeys.gmail.status(),
    queryFn: ({ signal }) => gmailApi.getGmailStatus(signal),
    staleTime: 10_000,
    retry: 1,
  });
}

export function useGmailAuthUrl() {
  const { message } = App.useApp();

  return useMutation({
    mutationFn: () => gmailApi.getGmailAuthUrl(),
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to generate Gmail authorization URL";
      message.error(msg);
    },
  });
}

export function useDisconnectGmail() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => gmailApi.disconnectGmail(),
    onSuccess: (data) => {
      message.success(data.message || "Gmail account disconnected");
      void queryClient.invalidateQueries({ queryKey: queryKeys.gmail.all });
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to disconnect Gmail account";
      message.error(msg);
    },
  });
}

export function useSendGmailTestEmails() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation<GmailTestSendResponse, Error, GmailTestSendRequest>({
    mutationFn: (payload: GmailTestSendRequest) => gmailApi.sendGmailTestEmails(payload),
    onSuccess: (data) => {
      if (data.sent > 0 && data.failed === 0 && data.skipped === 0) {
        message.success(`Successfully sent ${data.sent} test email${data.sent === 1 ? "" : "s"}!`);
      } else if (data.sent > 0) {
        message.warning(`Sent ${data.sent} test email(s), but ${data.failed} failed and ${data.skipped} skipped.`);
      } else {
        message.error(`Failed to send test emails. ${data.failed} failed, ${data.skipped} skipped.`);
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.gmail.status() });
    },
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Failed to send test emails";
      message.error(msg);
    },
  });
}
