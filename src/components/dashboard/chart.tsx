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
    <ResponsiveContainer width="100%" height={250} className="text-sm">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BreakerChart;
