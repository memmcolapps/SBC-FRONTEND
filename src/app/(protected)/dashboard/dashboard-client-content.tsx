'use client';

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import BreakerChart from "@/components/dashboard/chart";
import { toast } from "sonner";
import {
    fetchDashboardData,
    type DashboardData,
} from "@/services/dashboard-service";
import { useAuth } from "@/context/auth-context";

export function useDashboardData() {
    const { getAccessToken } = useAuth();
    return useQuery<DashboardData, Error>({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const token = getAccessToken();
            if (!token) {
                throw new Error("Authentication token not found.");
            }
            return await fetchDashboardData(token);
        },
        enabled: !!getAccessToken(),
    });
}

export default function DashboardClientContent() {
    const {
        data: dashboardData,
        isLoading,
        isError,
        error,
    } = useDashboardData();

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#16085F] border-t-transparent"></div>
            </div>
        );
    }

    if (isError) {
        toast.error("Failed to load dashboard data: " + error.message);
        return (
            <div className="flex h-64 items-center justify-center text-red-500">
                Error: {error.message}
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
                No data to display.
            </div>
        );
    }

    const {
        totalBreakers,
        totalActiveOperators,
        recentActivity,
    } = dashboardData;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <DashboardStats
                    activeOperators={totalActiveOperators}
                    activeBreakers={totalBreakers}
                    alerts={3}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentActivity activities={recentActivity} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Breaker Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BreakerChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
