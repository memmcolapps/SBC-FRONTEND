// components/dashboard/stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, TriangleAlert, Users } from "lucide-react";

interface DashboardStatsProps {
  activeOperators: number;
  activeBreakers: number;
  alerts: number;
}

export function DashboardStats({
  activeOperators,
  activeBreakers,
  alerts,
}: DashboardStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 text-xl">
        <div className="space-y-7">
          <div className="mr-10 flex justify-between">
            <div className="flex items-center">
              <Users size={15} />
              <span className="ml-2 text-muted-foreground">
                Active Operators:
              </span>
            </div>
            <span>{activeOperators}</span>
          </div>
          <div className="mr-10 flex justify-between">
            <div className="flex items-center">
              <Grid size={15} />
              <span className="ml-2 text-muted-foreground">
                Active Breakers
              </span>
            </div>
            <span>{activeBreakers}</span>
          </div>
          <div className="mr-10 flex justify-between">
            <div className="flex items-center">
              <TriangleAlert size={15} />
              <span className="ml-2 text-muted-foreground">Alerts</span>
            </div>
            <span>{alerts}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
