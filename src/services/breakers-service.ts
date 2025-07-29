/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { type AxiosError } from "axios";
import { env } from "@/env";
import { handleApiError } from "error";
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