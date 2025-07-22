// audit-log-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditLog } from "@/services/audit-logs-service";

interface AuditLogTableProps {
  auditLogs: AuditLog[];
}

export function AuditLogTable({ auditLogs }: AuditLogTableProps) {
  console.log("AuditLogTable rendered with logs:", auditLogs);
  return (
    <Table className="text-xl">
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>User Agent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {auditLogs.map((log, index) => (
          <TableRow key={index}>
            <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
            <TableCell>
              {log.creator.firstname} {log.creator.lastname}
            </TableCell>
            <TableCell>{log.type}</TableCell>
            <TableCell>{log.description}</TableCell>
            <TableCell>{log.ipAddress}</TableCell>
            <TableCell>{log.userAgent.trim()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
