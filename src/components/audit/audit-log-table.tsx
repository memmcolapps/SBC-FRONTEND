"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { AuditLog as OriginalAuditLog } from "@/services/audit-logs-service";

type AuditLog = OriginalAuditLog & {
  sbc?: {
    sbcId: string;
    name: string;
    streetName: string;
    city: string;
    state: string;
  };
};
import { Button } from "@/components/ui/button";

interface AuditLogTableProps {
  auditLogs: AuditLog[];
}

export function AuditLogTable({ auditLogs }: AuditLogTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
    setIsDetailsOpen(false);
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="hidden md:table-cell">IP Address</TableHead>
              <TableHead className="hidden lg:table-cell">User Agent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <TableRow
                  key={log.id}
                  onClick={() => handleViewDetails(log)}
                  className="cursor-pointer hover:bg-gray-50/50"
                >
                  <TableCell className="text-gray-500">
                    {new Date(log.createdAt).toLocaleDateString()}{" "}
                    <span className="text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.creator.firstname} {log.creator.lastname}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-200 font-normal">
                      {log.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-gray-500">
                    {log.ipAddress}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-gray-500">
                    {log.userAgent.trim()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-gray-500">
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Audit Log Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Log ID</span>
                <span className="font-mono text-xs">{selectedLog.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Timestamp</span>
                <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">User</span>
                <span className="font-medium">
                  {selectedLog.creator.firstname} {selectedLog.creator.lastname}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Role</span>
                <Badge variant="outline" className="border-gray-200">
                  {selectedLog.creator.roles?.[0]?.userRole ?? "N/A"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Action</span>
                <Badge variant="outline" className="border-gray-200 font-normal">
                  {selectedLog.type}
                </Badge>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="shrink-0 text-gray-500">Description</span>
                <span className="text-right break-words">{selectedLog.description}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">IP Address</span>
                <span className="font-mono text-xs">{selectedLog.ipAddress}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="shrink-0 text-gray-500">User Agent</span>
                <span className="max-w-[300px] truncate text-right text-xs text-gray-600">
                  {selectedLog.userAgent}
                </span>
              </div>

              {selectedLog.sbc && (
                <>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Breaker Details</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">SBC ID</span>
                    <span className="font-mono text-xs">{selectedLog.sbc.sbcId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Name</span>
                    <span>{selectedLog.sbc.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Location</span>
                    <span>
                      {selectedLog.sbc.streetName}, {selectedLog.sbc.city}, {selectedLog.sbc.state}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleCloseDetails}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
