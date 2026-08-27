import { AxiosError } from "axios";

/**
 * Extracts a clear, user-friendly, and actionable error message
 * distinguishing network errors, CORS issues, auth failures, 403, 404, 500, etc.
 */
export function extractApiErrorMessage(err: unknown, defaultFallback = "An unexpected error occurred."): string {
  if (!err) return defaultFallback;

  const axiosError = err as AxiosError<{ message?: string; error?: string; errorCode?: string }>;

  // If there is a response with an explicit message from backend API
  if (axiosError.response) {
    const data: any = axiosError.response.data;
    const status = axiosError.response.status;

    if (data && typeof data === "object") {
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message.trim();
      }
      if (typeof data.error === "string" && data.error.trim()) {
        return data.error.trim();
      }
    } else if (typeof data === "string" && data.length > 0 && data.length < 200) {
      return data;
    }

    switch (status) {
      case 400:
        return "Invalid request data. Please check your input.";
      case 401:
        return "Authentication required or session expired. Please sign in again.";
      case 403:
        return "Access denied: You do not have permission to perform this action.";
      case 404:
        return "The requested resource or endpoint was not found.";
      case 409:
        return "A conflict occurred with an existing resource.";
      case 413:
        return "The uploaded file is too large. Maximum file size is 10MB.";
      case 429:
        return "Too many requests. Please slow down and try again shortly.";
      case 500:
        return "Internal server error. The backend encountered an unexpected issue.";
      case 502:
      case 503:
      case 504:
        return "Backend service temporarily unavailable. Please try again in a few moments.";
      default:
        return `Server returned error (${status}).`;
    }
  }

  // Network / Connection errors (no response received)
  if (axiosError.request || axiosError.message === "Network Error") {
    if (axiosError.code === "ECONNABORTED" || axiosError.message?.includes("timeout")) {
      return "Request timed out while waiting for server response. Please try again.";
    }
    if (window.location.protocol === "https:" && import.meta.env.VITE_API_URL?.startsWith("http://")) {
      return "Mixed Content Block: Cannot connect to an insecure (HTTP) API from a secure (HTTPS) frontend.";
    }
    return "Network Error: Cannot reach API server. Please check your backend connection and Railway environment variables.";
  }

  if (axiosError.message && typeof axiosError.message === "string") {
    return axiosError.message;
  }

  return defaultFallback;
}
