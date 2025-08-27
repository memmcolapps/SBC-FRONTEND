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
import { Label } from "@/components/ui/label";
import type { AuditLog as OriginalAuditLog } from "@/services/audit-logs-service";

// Extend AuditLog to include optional sbc property
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
                className="cursor-pointer transition-colors hover:bg-muted/50"
              >
                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  {log.creator.firstname} {log.creator.lastname}
                </TableCell>
                <TableCell>{log.type}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {log.ipAddress}
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                  {log.userAgent.trim()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No audit logs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Audit Log Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] h-fit bg-white">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-1 font-semibold">Log ID:</Label>
                <span className="col-span-3">{selectedLog.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-1 font-semibold">Timestamp:</Label>
                <span className="col-span-3">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-1 font-semibold">User:</Label>
                <span className="col-span-3">
                  {selectedLog.creator.firstname} {selectedLog.creator.lastname}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-1 font-semibold">Action Type:</Label>
                <span className="col-span-3">{selectedLog.type}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="col-span-1 font-semibold">Description:</Label>
                <span className="col-span-3 break-words">
                  {selectedLog.description}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-1 font-semibold">IP Address:</Label>
                <span className="col-span-3">{selectedLog.ipAddress}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="col-span-1 font-semibold">User Agent:</Label>
                <span className="col-span-3 break-all">
                  {selectedLog.userAgent}
                </span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="col-span-1 font-semibold">User Role:</Label>
                <span className="col-span-3">
                  {selectedLog.creator.roles?.[0]?.userRole ?? "N/A"}
                </span>
              </div>
              {selectedLog.sbc && (
                <>
                  <h4 className="mt-4 font-bold col-span-4">Breaker Details:</h4>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="col-span-1 font-semibold">SBC ID:</Label>
                    <span className="col-span-3">{selectedLog.sbc.sbcId}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="col-span-1 font-semibold">Name:</Label>
                    <span className="col-span-3">{selectedLog.sbc.name}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="col-span-1 font-semibold">Location:</Label>
                    <span className="col-span-3">
                      {selectedLog.sbc.streetName}, {selectedLog.sbc.city}, {selectedLog.sbc.state}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleCloseDetails}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}