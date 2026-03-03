"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OperatorManagementTable } from "@/components/operators/operator-management-table";
import { AddOperatorForm } from "@/components/operators/add-operator-form";
import { PlusCircle } from "lucide-react";

export default function OperatorsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Operator Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#16085F] hover:bg-[#1e0f7a]">
              <PlusCircle className="h-4 w-4" />
              Add Operator
            </Button>
          </DialogTrigger>
          <DialogContent className="w-fit h-fit bg-white">
            <DialogHeader>
              <DialogTitle>Create New Operator</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new operator account.
              </DialogDescription>
            </DialogHeader>
            <AddOperatorForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Operator List</CardTitle>
        </CardHeader>
        <CardContent>
          <OperatorManagementTable />
        </CardContent>
      </Card>
    </div>
  );
}
