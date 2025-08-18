// services/use-dashboard.ts
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData, type DashboardData } from "@/services/dashboard-service";
import { useAuth } from "@/context/auth-context";

/**
 * Custom hook to fetch and manage dashboard data using TanStack Query.
 * This hook handles authentication, caching, loading, and error states.
 *
 * @returns An object containing the query status, data, and error.
 */
export function useDashboardData() {
    const { getAccessToken } = useAuth();

    return useQuery<DashboardData, Error>({
        // A unique key for this query, used for caching and invalidation.
        queryKey: ['dashboard'],

        // The asynchronous function that fetches the data.
        queryFn: async () => {
            const token = getAccessToken();
            if (!token) {
                // If there's no token, throw an error to halt the query and
                // trigger the error state.
                throw new Error("Authentication token not found.");
            }
            return await fetchDashboardData(token);
        },

        // The query will only run if an access token is available.
        enabled: !!getAccessToken(),
    });
}
