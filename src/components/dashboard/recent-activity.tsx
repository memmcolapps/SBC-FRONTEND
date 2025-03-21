// components/dashboard/recent-activity.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RecentActivityProps {
  activities: {
    description: string;
    createdAt: string;
    user: string;
  }[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity, index) => (
          <TableRow key={index}>
            <TableCell>{activity.createdAt}</TableCell>
            <TableCell>{activity.user}</TableCell>
            <TableCell>{activity.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
