// src/app/operators/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddOperatorForm } from "@/components/operators/add-operator-form";
import { OperatorManagementTable } from "@/components/operators/operator-management-table";

export default function OperatorsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Operator Management
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create New Operator</CardTitle>
        </CardHeader>
        <CardContent>
          <AddOperatorForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operator List</CardTitle>
        </CardHeader>
        <CardContent>
          <OperatorManagementTable />
        </CardContent>
      </Card>
    </div>
  );
}
