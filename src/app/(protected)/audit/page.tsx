"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogFilters } from "@/components/audit/audit-log-filters";
import { AuditLogTable } from "@/components/audit/audit-log-table";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useAuditLogs } from "@/hooks/use-audit";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuditPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const {
    data: logsData,
    isLoading,
    error,
  } = useAuditLogs(page, size, dateFrom, dateTo);

  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value);
    setSize(newSize);
    setPage(0); // Reset to first page when size changes
  };

  const handleNextPage = () => {
    if (logsData && page < logsData.totalPages - 1) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Audit Logs</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuditLogFilters
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            onExport={handleExport}
          />

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              {error.message || "Failed to load audit logs"}
            </div>
          ) : logsData ? (
            <>
              {console.log("Audit logs data:", logsData)}
              <AuditLogTable auditLogs={logsData.data} />
              <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={!logsData || page >= logsData.totalPages - 1}
                  >
                    Next
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span>Items per page:</span>
                  <Select
                    value={size.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder={size} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {logsData.data.length > 0 ? page * size + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {page * size + logsData.data.length}
                  </span>{" "}
                  of <span className="font-medium">{logsData.totalItems}</span>{" "}
                  items
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
