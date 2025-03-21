// dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import BreakerChart from "@/components/dashboard/chart";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchDashboardData } from "@/services/dashboard-service"; // New service
import type { DashboardData } from "@/types";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const data = await fetchDashboardData(token);
        setDashboardData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const {
    totalBreakers,
    totalOperators,
    totalActiveOperators,
    recentActivity,
  } = dashboardData!;

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
