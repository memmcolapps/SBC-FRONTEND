/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { type AxiosError } from "axios";
import { env } from "@/env";
import { handleApiError } from "error"; // Assuming this is a custom error handler
import {
  type BreakersResponse,
  type BreakerFilters,
  type Breaker,
} from "@/types/breakers";

const API_BASE_URL = env.NEXT_PUBLIC_BASE_URL;

type BreakersResult =
  | { success: true; data: Breaker[] }
  | { success: false; error: string };

// Define the type for the data sent to the register breaker API
export type RegisterBreakerPayload = {
  sbcId: string;
  state: string;
  name: string;
  breakerCount: number;
  city: string;
  streetName: string;
  assetId: string;
};

// Define the type for the response from the register breaker API
export type RegisterBreakerResponse = {
  responsecode: string;
  responsedesc: string;
  responsedata: any; // Adjust this type based on the actual success response data
};

// Define the type for the result of the registerBreaker function
export type RegisterBreakerResult =
  | { success: true; data: RegisterBreakerResponse }
  | { success: false; error: string };

// The correct payload for assigning breakers, using userId and sbcIds
export type AssignBreakersPayload = {
  userId: string;
  access: boolean;
  sbcIds: string[];
};

export const fetchBreakers = async (
  filters: BreakerFilters,
  token: string,
): Promise<BreakersResult> => {
  try {
    const params = new URLSearchParams();

    // Add filters to params if they exist
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await axios.get<BreakersResponse>(
      `${API_BASE_URL}/v1/api/breaker/service/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.responsecode !== "000") {
      return {
        success: false,
        error: response.data.responsedesc || "Failed to fetch audit logs",
      };
    }

    // Access the data property within responsedata
    return {
      success: true,
      data: response.data.responsedata.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: handleApiError(error),
    };
  }
};

/**
 * Calls the API to register a new breaker.
 * @param payload The data for the new breaker.
 * @param token The user's authentication token.
 * @returns An object indicating success or failure.
 */
export const registerBreaker = async (
  payload: RegisterBreakerPayload,
  token: string,
): Promise<RegisterBreakerResult> => {
  try {
    const response = await axios.post<RegisterBreakerResponse>(
      `${API_BASE_URL}/v1/api/breaker/service/register`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.responsecode !== "000") {
      return {
        success: false,
        error: response.data.responsedesc || "",
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: handleApiError(error),
    };
  }
};

/**
 * Assigns a single or multiple breakers to an operator using the specified API endpoint.
 * @param payload An object containing the user ID, access status, and an array of sbcIds.
 * @param token The user's authentication token.
 * @returns A promise that resolves when the assignment is successful.
 */
export const assignBreakers = async (
  payload: AssignBreakersPayload,
  token: string,
): Promise<void> => {
  try {
    const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

    const response = await axios.put(
      `${API_BASE_URL}/v1/api/breaker/service/assign`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const apiResponse = response.data;

    // Check for success code
    if (apiResponse.responsecode !== "000") {
      throw new Error(apiResponse.responsedesc || "Unexpected response code from backend.");
    }

    // Check if there were any failures in the assignment process
    if (apiResponse.responsedata?.failures?.length > 0) {
      // Create a more detailed error message for the user
      const failureMessage = apiResponse.responsedata.failures.join(", ");
      throw new Error(`Assignment partially failed. Details: ${failureMessage}`);
    }

  } catch (error: unknown) {
    console.error("Assign Breakers Error:", error);

    if (axios.isAxiosError(error) && error.response?.data?.responsedesc) {
      throw new Error(error.response.data.responsedesc);
    }

    // Pass on the detailed error message from the try block or handle generic errors
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(handleApiError(error));
  }
};