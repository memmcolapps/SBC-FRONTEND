import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBreakerForm } from "@/components/breakers/create-breaker-form";
import { BreakerManagementTable } from "@/components/breakers/breaker-management-table";

export default function BreakersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Breaker Management</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create A New SBC</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateBreakerForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Breaker List</CardTitle>
        </CardHeader>
        <CardContent>
          <BreakerManagementTable />
        </CardContent>
      </Card>
    </div>
  );
}
