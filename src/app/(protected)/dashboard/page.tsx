/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import BreakerChart from "@/components/dashboard/chart";
import { toast } from "sonner";
import { fetchDashboardData, type DashboardData } from "@/services/dashboard-service";
import { useAuth } from "@/context/auth-context";

// ========================================================================
// New TanStack Query Hook: use-dashboard.ts
// ========================================================================
// This hook encapsulates the data fetching logic using useQuery.
// It handles caching, retries, and state management (loading, error).
export function useDashboardData() {
  const { getAccessToken } = useAuth();
  
  // The useQuery hook requires a unique query key and a query function.
  // The query key is used for caching and invalidation.
  // The query function is the asynchronous function that fetches the data.
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) {
        // If no token, throw an error to trigger the error state
        // and prevent the query from running.
        throw new Error("Authentication token not found.");
      }
      return await fetchDashboardData(token);
    },
    // The 'onError' option is not available in TanStack Query v5.
    // Error handling is now typically done in the component by checking
    // the 'isError' and 'error' properties returned by the hook.
    // We have removed the 'onError' option to fix the TypeScript error.
    enabled: !!getAccessToken(),
  });
}

// ========================================================================
// Updated Dashboard Page Component: dashboard/page.tsx
// ========================================================================
// This is the main component that now uses the new hook.
export default function DashboardPage() {
  // Use the custom hook to fetch data and get the state.
  // It handles the loading, error, and data states for us.
  const { data: dashboardData, isLoading, isError, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isError) {
    // The toast message is now triggered here, directly in the component's render logic,
    // which is the recommended approach for TanStack Query v5.
    toast.error("Failed to load dashboard data: " + error.message);
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  // After the loading and error checks, we can safely assume dashboardData exists.
  // This addresses the type errors you were seeing with destructuring.
  if (!dashboardData) {
    return (
      <div className="flex h-screen items-center justify-center">
        No data to display.
      </div>
    );
  }
  
  const {
    totalBreakers,
    totalOperators,
    totalActiveOperators,
    recentActivity,
  } = dashboardData;

  return (
    <div className="mb-10 h-screen space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Dashboard</CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 text-xl md:grid-cols-3">
        <DashboardStats
          activeOperators={totalActiveOperators}
          activeBreakers={totalBreakers}
          alerts={3} // Keep placeholder for now
        />
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity activities={recentActivity} />
          </CardContent>
        </Card>
        {/* Breaker chart needs real data */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Breaker Status</CardTitle>
          </CardHeader>
          {/* Add real chart data handling */}
          <BreakerChart />
          <CardContent></CardContent>
        </Card>
      </div>
    </div>
  );
}
