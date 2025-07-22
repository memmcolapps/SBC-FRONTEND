import { useQuery } from "@tanstack/react-query";
import { fetchBreakers } from "@/services/breakers-service";
import { type Breaker, type BreakerFilters } from "@/types/breakers";
import { useAuth } from "@/context/auth-context";

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
