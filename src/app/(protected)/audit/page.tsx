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
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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

        const logsResponse = await fetchAuditLogs(
          page,
          size,
          token,
          dateFrom,
          dateTo,
        );
        setAuditLogs(logsResponse.data);
        setTotalItems(logsResponse.totalItems);
        setTotalPages(logsResponse.totalPages);
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

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setSize(newSize);
    setPage(0); // Reset to first page when size changes
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage((prevPage) => prevPage - 1);
    }
  };

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
            <>
              <AuditLogTable auditLogs={auditLogs} />
              <div className="mt-4 flex items-center justify-between">
                {/* Pagination Controls */}
                <div>
                  <button
                    className="mr-2 rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
                    onClick={handlePrevPage}
                    disabled={page === 0}
                  >
                    Previous
                  </button>
                  <button
                    className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
                    onClick={handleNextPage}
                    disabled={page === totalPages - 1}
                  >
                    Next
                  </button>
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center">
                  <span className="mr-2">Items per page:</span>
                  <select
                    value={size}
                    onChange={handlePageSizeChange}
                    className="rounded-md border px-3 py-2"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>

                {/* Pagination Info */}
                <div>
                  <span>
                    Showing {page * size + 1} to{" "}
                    {page * size + auditLogs.length} of {totalItems} items
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
