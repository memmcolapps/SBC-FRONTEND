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
import type { AuditLog } from "@/types";

interface AuditLogTableProps {
  auditLogs: AuditLog[];
}

export function AuditLogTable({ auditLogs }: AuditLogTableProps) {
  return (
    <Table className="text-xl">
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
            <TableCell>{log.createdAt}</TableCell>
            <TableCell>{log.creator.firstname}</TableCell>
            <TableCell>{log.type}</TableCell>
            <TableCell>{log.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
