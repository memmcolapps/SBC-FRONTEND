import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogFilters } from "@/components/audit/audit-log-filters";
import { AuditLogTable } from "@/components/audit/audit-log-table";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Logs</h1>

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogFilters />
          <AuditLogTable />
        </CardContent>
      </Card>
    </div>
  );
}
