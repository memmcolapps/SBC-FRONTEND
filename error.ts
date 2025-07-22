import axios, { type AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
};

/**
 * Extracts error message from an unknown error object
 */
const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  // Handle objects with message property
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }
    // Handle validation errors (e.g., from class-validator)
    if ("errors" in error && typeof error.errors === "object") {
      const errors = error.errors as Record<string, string[]>;
      return Object.values(errors).flat().join(", ");
    }
  }

  return "An unexpected error occurred";
};

/**
 * Handles Axios specific errors
 */
const handleAxiosError = (error: AxiosError<ErrorResponse>): string => {
  if (error.response) {
    // Server responded with a status code outside 2xx range
    const { data, status } = error.response;

    if (data) {
      // Try to get message from common error response formats
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (data.errors) {
        return Object.values(data.errors).flat().join(", ");
      }
    }

    return `Request failed with status: ${status}`;
  }

  if (error.request) {
    return "No response received from the server";
  }

  return `Request setup failed: ${error.message}`;
};

/**
 * Universal error handler for API calls
 * @param error The error object
 * @param defaultMessage Optional default message to use when no specific error can be extracted
 * @returns A user-friendly error message
 */
export const handleApiError = (
  error: unknown,
  defaultMessage = "An unexpected error occurred",
): string => {
  if (axios.isAxiosError(error)) {
    return handleAxiosError(error);
  }

  const message = extractErrorMessage(error);
  return message || defaultMessage;
};
