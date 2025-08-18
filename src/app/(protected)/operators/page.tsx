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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-bold">
            Operator Management
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" size={14} />
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
        </CardHeader>
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