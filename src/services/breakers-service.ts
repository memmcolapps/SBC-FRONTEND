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
