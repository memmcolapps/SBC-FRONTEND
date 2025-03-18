import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import BreakerChart from "@/components/dashboard/chart";

export default function DashboardPage() {
  return (
    <div className="mb-10 h-screen space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Dashboard</CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 text-xl md:grid-cols-3">
        <DashboardStats />
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
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
