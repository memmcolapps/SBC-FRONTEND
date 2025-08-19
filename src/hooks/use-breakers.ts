/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBreakers,
  registerBreaker,
  assignBreakers,
  type RegisterBreakerPayload,
  type RegisterBreakerResponse,
  type AssignBreakersPayload,
} from "@/services/breakers-service";
import { type Breaker, type BreakerFilters } from "@/types/breakers";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner"; // Assuming you use sonner for toasts

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
      queryClient.invalidateQueries({ queryKey: ["breakers"] });
      console.log("Breaker registered successfully!");
    },
    onError: (error) => {
      console.error("Error registering breaker:", error.message);
    },
  });
};

// --- assign breakers ---
export const useAssignBreakers = () => {
  const { getAccessToken } = useAuth();
  const token = getAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AssignBreakersPayload) => {
      if (!token) {
        throw new Error("No token found in local storage");
      }
      return assignBreakers(payload, token);
    },
    onSuccess: () => {
      // Invalidate the cache for both operators and breakers to force a refetch
      // and update the UI with the new assignment status.
      queryClient.invalidateQueries({ queryKey: ["operators"] });
      queryClient.invalidateQueries({ queryKey: ["breakers"] });
      toast.success("Breakers assigned successfully!");
    },
    onError: (error) => {
      toast.error("Failed to assign breakers: " + error.message);
    },
  });
};
export { AssignBreakersPayload };