/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBreakers,
  type RegisterBreakerPayload,
  type RegisterBreakerResponse,
} from "@/services/breakers-service"; // Make sure to import the new types
import { type Breaker, type BreakerFilters } from "@/types/breakers";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { env } from "@/env";
import { handleApiError } from "error";

const API_BASE_URL = env.NEXT_PUBLIC_BASE_URL;

export const useBreakers = (filters: BreakerFilters) => {
  const { getAccessToken } = useAuth();
  const token = getAccessToken();
  if (!token) {
    throw new Error("No token found in local storage");
  }
  return useQuery({
    enabled: !!token,
    queryKey: ["breakers", filters],
    queryFn: async () => {
      const response = await fetchBreakers(filters, token);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data as Breaker[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// --- create breaker ---
type RegisterBreakerResult =
  | { success: true; data: RegisterBreakerResponse }
  | { success: false; error: string };

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

export const useRegisterBreaker = () => {
  const { getAccessToken } = useAuth();
  const token = getAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterBreakerPayload) => {
      if (!token) {
        throw new Error("No token found in local storage");
      }
      const response = await registerBreaker(payload, token);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the 'breakers' query to show the newly created breaker
      queryClient.invalidateQueries({ queryKey: ["breakers"] });
      console.log("Breaker registered successfully!");
    },
    onError: (error) => {
      console.error("Error registering breaker:", error.message);
    },
  });
};