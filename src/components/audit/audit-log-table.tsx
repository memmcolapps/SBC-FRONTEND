"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditLog } from "@/types";

const auditLogs: AuditLog[] = [
  {
    timestamp: "2024-02-26 14:30:00",
    user: "John Doe",
    action: "Breaker Operation",
    details: "Turned on Breaker XYZ",
  },
  {
    timestamp: "2024-02-26 13:45:00",
    user: "Jane Smith",
    action: "User Management",
    details: "Added new user: Mike Johnson",
  },
];

export function AuditLogTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {auditLogs.map((log, index) => (
          <TableRow key={index}>
            <TableCell>{log.timestamp}</TableCell>
            <TableCell>{log.user}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>{log.details}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
