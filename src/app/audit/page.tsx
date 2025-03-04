import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogFilters } from "@/components/audit/audit-log-filters";
import { AuditLogTable } from "@/components/audit/audit-log-table";

export default function AuditPage() {
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
          <AuditLogFilters />
          <AuditLogTable />
        </CardContent>
      </Card>
    </div>
  );
}
