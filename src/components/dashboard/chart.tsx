// components/BarChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", value: 100 },
  { month: "Feb", value: 120 },
  { month: "Mar", value: 150 },
  { month: "Apr", value: 180 },
  { month: "May", value: 140 },
  { month: "Jun", value: 160 },
  { month: "Jul", value: 190 },
  { month: "Aug", value: 170 },
  { month: "Sep", value: 150 },
  { month: "Oct", value: 130 },
  { month: "Nov", value: 110 },
  { month: "Dec", value: 200 },
];

const BreakerChart = () => {
  return (
    <ResponsiveContainer width="100%" height={280} className="text-xs">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fill: "#6b7280" }} />
        <YAxis tick={{ fill: "#6b7280" }} />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
        />
        <Bar dataKey="value" fill="#16085F" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BreakerChart;
