// src/app/(protected)/dashboard/dashboard-client-content.tsx
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

// This hook remains unchanged.
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

// This is the client component that uses the hook.
export default function DashboardClientContent() {
    const {
        data: dashboardData,
        isLoading,
        isError,
        error,
    } = useDashboardData();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (isError) {
        toast.error("Failed to load dashboard data: " + error.message);
        return (
            <div className="flex h-screen items-center justify-center text-red-500">
                Error: {error.message}
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex h-screen items-center justify-center">
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
                    alerts={3}
                />
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentActivity activities={recentActivity} />
                    </CardContent>
                </Card>
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Breaker Status</CardTitle>
                    </CardHeader>
                    <BreakerChart />
                    <CardContent></CardContent>
                </Card>
            </div>
        </div>
    );
}