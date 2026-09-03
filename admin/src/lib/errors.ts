import { AxiosError, isAxiosError } from "axios";

export interface ParsedApiError {
  title: string;
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  isNetworkError: boolean;
  isUnauthorized: boolean;
  isForbidden: boolean;
  isValidationError: boolean;
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: "The request was invalid. Please check your input.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This action conflicts with existing data.",
  422: "The data could not be processed. Please review and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our servers. Please try again.",
  503: "The service is temporarily unavailable. Please try again shortly.",
};

function pickMessage(...candidates: unknown[]): string | undefined {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return undefined;
}

function extractFromData(data: unknown): {
  message?: string;
  code?: string;
  details?: unknown;
} {
  if (!data || typeof data !== "object") {
    return {};
  }

  const payload = data as Record<string, unknown>;
  const nestedError = payload.error as Record<string, unknown> | undefined;

  const message = pickMessage(
    payload.message,
    nestedError?.message,
    typeof payload.error === "string" ? payload.error : undefined,
  );

  const code = pickMessage(payload.code, nestedError?.code);
  const details = payload.details ?? nestedError?.details ?? payload.errors;

  return { message, code, details };
}

export function parseApiError(error: unknown, fallbackTitle = "Request failed"): ParsedApiError {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;
    const extracted = extractFromData(data);

    const isNetworkError = !axiosError.response && Boolean(axiosError.code);
    const message =
      extracted.message ||
      (isNetworkError
        ? "Network error. Check your internet connection and try again."
        : status
          ? DEFAULT_MESSAGES[status] || axiosError.message || "An unexpected error occurred."
          : axiosError.message || "An unexpected error occurred.");

    return {
      title: fallbackTitle,
      message,
      status,
      code: extracted.code,
      details: extracted.details,
      isNetworkError,
      isUnauthorized: status === 401,
      isForbidden: status === 403,
      isValidationError: status === 400 || status === 422,
    };
  }

  if (error instanceof Error) {
    return {
      title: fallbackTitle,
      message: error.message || "An unexpected error occurred.",
      isNetworkError: false,
      isUnauthorized: false,
      isForbidden: false,
      isValidationError: false,
    };
  }

  return {
    title: fallbackTitle,
    message: "An unexpected error occurred.",
    isNetworkError: false,
    isUnauthorized: false,
    isForbidden: false,
    isValidationError: false,
  };
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  return parseApiError(error).message || fallback;
}

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Skip global error toast for this request */
    skipErrorToast?: boolean;
  }
}
