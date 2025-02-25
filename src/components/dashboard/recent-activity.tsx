"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const recentActivity = [
  {
    time: "10:30 AM",
    user: "John Doe",
    action: "Turned on Breaker XYZ",
  },
  {
    time: "11:15 AM",
    user: "Jane Smith",
    action: "Updated user permissions",
  },
  {
    time: "10:15 AM",
    user: "Mujibul Islam",
    action: "Updated user permissions",
  },
  {
    time: "12:15 AM",
    user: "Moshood Olawale",
    action: "Deleted Breaker 123",
  },
  {
    time: "09:15 AM",
    user: "Habeeb Oluwaseun",
    action: "Turned on Breaker 123",
  },
];

export function RecentActivity() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-2xl">
        {recentActivity.map((activity, index) => (
          <TableRow key={index}>
            <TableCell>{activity.time}</TableCell>
            <TableCell>{activity.user}</TableCell>
            <TableCell>{activity.action}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
