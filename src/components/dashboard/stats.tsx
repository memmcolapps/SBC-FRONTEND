"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsers } from "@/hooks/use-users";
import { useBreakers } from "@/hooks/use-breakers";
import { Grid, TriangleAlert, Users } from "lucide-react";

export function DashboardStats() {
  const { users } = useUsers();
  const { breakers } = useBreakers();

  const activeUsers =
    users?.filter((user) => user.status === "Active").length ?? 0;
  const activeBreakers =
    breakers?.filter((breaker) => breaker.status === "Active").length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle> Statistics</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="flex items-center">
              <Users size={10} />{" "}
              <span className="ml-2 text-muted-foreground">
                Active Operators:
              </span>
            </div>
            <span className="font-medium">{activeUsers}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center">
              <Grid size={10} />
              <span className="ml-2 text-muted-foreground">
                Active Breakers
              </span>
            </div>
            <span className="font-medium">{activeBreakers}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center">
              <TriangleAlert size={10} />
              <span className="ml-2 text-muted-foreground">Alerts</span>
            </div>
            <span className="font-medium">3</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
