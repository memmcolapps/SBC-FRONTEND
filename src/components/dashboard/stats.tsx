import { Card, CardContent } from "@/components/ui/card";
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
  const stats = [
    {
      label: "Active Operators",
      value: activeOperators,
      icon: <Users size={20} className="text-[#16085F]" />,
      bg: "bg-[#eeecff]",
    },
    {
      label: "Active Breakers",
      value: activeBreakers,
      icon: <Grid size={20} className="text-[#16085F]" />,
      bg: "bg-[#eeecff]",
    },
    {
      label: "Alerts",
      value: alerts,
      icon: <TriangleAlert size={20} className="text-amber-600" />,
      bg: "bg-amber-50",
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-lg p-2.5 ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
