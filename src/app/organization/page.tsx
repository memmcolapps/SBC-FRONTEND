import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgTree } from "@/components/organization/org-tree";

export default function OrganizationPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Organizational Management
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Organizational Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <OrgTree />
        </CardContent>
      </Card>
    </div>
  );
}
