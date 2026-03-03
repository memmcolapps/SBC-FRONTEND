"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { CreateBreakerForm } from "@/components/breakers/create-breaker-form";
import { BreakerManagementTable } from "@/components/breakers/breaker-management-table";

export default function BreakersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Breaker Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#16085F] hover:bg-[#1e0f7a]">
              <PlusCircle className="h-4 w-4" />
              Create SBC
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full h-fit bg-white">
            <DialogHeader>
              <DialogTitle>Create A New SBC</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new SBC.
              </DialogDescription>
            </DialogHeader>
            <CreateBreakerForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Breaker List</CardTitle>
        </CardHeader>
        <CardContent>
          <BreakerManagementTable />
        </CardContent>
      </Card>
    </div>
  );
}
