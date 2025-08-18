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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-bold">
            Breaker Management
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" size={14} />
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
        </CardHeader>
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