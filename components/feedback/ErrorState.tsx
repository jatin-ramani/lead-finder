"use client";

import { ReloadOutlined, WarningFilled } from "@ant-design/icons";
import { Button, Typography } from "antd";

import { copyText } from "@/lib/format";
import { ApiError, ErrorCode, errorTitle, isApiError } from "@/services";

const { Text } = Typography;

interface ErrorStateProps {
  error: unknown;
  /** Wire this to a query's `refetch`. Omit when nothing can be retried. */
  onRetry?: () => void;
  /** `inline` sits inside a panel; `block` fills a page region. */
  variant?: "inline" | "block";
  /** Overrides the derived heading when the surrounding context says it better. */
  title?: string;
}

function normalize(error: unknown): ApiError {
  if (isApiError(error)) return error;

  return new ApiError({
    message:
      error instanceof Error ? error.message : "An unexpected error occurred.",
    code: ErrorCode.INTERNAL_ERROR,
  });
}

/**
 * The single error UI.
 *
 * Every failed read in the app renders this, so an error looks the same
 * wherever it happens and there is one place to improve. It always offers a
 * next step: a retry when retrying could work, and the request id either way.
 *
 * `role="alert"` so assistive technology announces it the moment it replaces
 * the content that failed.
 */
export default function ErrorState({
  error,
  onRetry,
  variant = "block",
  title,
}: ErrorStateProps) {
  const apiError = normalize(error);
  const heading = title ?? errorTitle(apiError);

  return (
    <div
      className={`lf-error-state lf-error-state--${variant}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="lf-error-state-icon" aria-hidden>
        <WarningFilled />
      </span>

      <div className="lf-error-state-body">
        <h3 className="lf-error-state-title">{heading}</h3>
        <p className="lf-error-state-message">
          {apiError.message === "Request validation failed."
            ? "We were unable to complete this request due to invalid or unrecognised parameters."
            : apiError.message}
        </p>

        {apiError.validationDetails.length > 0 && (
          <ul className="lf-error-state-details">
            {apiError.validationDetails.map((detail) => (
              <li key={`${detail.field}-${detail.type}`}>
                <Text code>{detail.field}</Text> {detail.message}
              </li>
            ))}
          </ul>
        )}

        <div className="lf-error-state-actions">
          {onRetry && (
            <Button
              size="small"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={onRetry}
            >
              Try again
            </Button>
          )}

          {apiError.requestId && (
            /*
             * Never hidden behind a "details" toggle. This is the string that
             * turns a support message into a one-command investigation, and a
             * user will only quote it if they can see and copy it.
             */
            <button
              type="button"
              className="lf-error-state-ref"
              onClick={() => void copyText(apiError.requestId)}
              title="Copy this reference"
            >
              Reference: <code>{apiError.requestId}</code>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
