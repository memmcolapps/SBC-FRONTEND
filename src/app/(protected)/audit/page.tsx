// audit-page.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogFilters } from "@/components/audit/audit-log-filters";
import { AuditLogTable } from "@/components/audit/audit-log-table";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchAuditLogs } from "@/services/audit-logs-service"; // Adjust the path accordingly
import type { AuditLog } from "@/types";
import { useAuth } from "@/context/auth-context";

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const { getAccessToken } = useAuth();

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = getAccessToken();
        if (!token) {
          window.location.href = "/login";
          return;
        }
        const logs = await fetchAuditLogs(page, size, token, dateFrom, dateTo);
        setAuditLogs(logs.data);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
          setError(error.message);
        } else {
          toast.error("An unexpected error occurred");
          setError("An unexpected error occurred. Please try again.");
        }
        console.error("Fetch audit logs error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLogs();
  }, [page, size, dateFrom, dateTo]);

  const handleExport = () => {
    // Implement your export logic here
    console.log("Exporting logs...");
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
        <CardContent>
          <AuditLogFilters
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            onExport={handleExport}
          />
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <AuditLogTable auditLogs={auditLogs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
