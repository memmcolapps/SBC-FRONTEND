"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBreakers } from "@/hooks/use-breakers";
import { Skeleton } from "@/components/ui/skeleton";
import { type Breaker } from "@/types/breakers";
import React from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExpandedBreaker extends Breaker {
  isExpanded: boolean;
  buttons: Record<string, boolean>;
  lastAction?: string;
  status: "ACTIVE" | "INACTIVE";
}

export function BreakerManagementTable() {
  const [localModifications, setLocalModifications] = useState<
    Record<string, Partial<ExpandedBreaker>>
  >({});
  const { data = [], isLoading, isError } = useBreakers({
    page: 0,
    size: 10,
  });

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    breakerId: string | null;
    action: "activate" | "deactivate" | null;
  }>({
    isOpen: false,
    breakerId: null,
    action: null,
  });

  const [viewDetails, setViewDetails] = useState<{
    isOpen: boolean;
    breaker: ExpandedBreaker | null;
  }>({
    isOpen: false,
    breaker: null,
  });

  const breakers = useMemo(() => {
    const uniqueBreakers = new Map<string, Breaker>();
    data.forEach((breaker) => {
      if (!uniqueBreakers.has(breaker.sbcId)) {
        uniqueBreakers.set(breaker.sbcId, breaker);
      }
    });

    return Array.from(uniqueBreakers.values()).map((breaker) => {
      const localData = localModifications[breaker.sbcId] ?? {};
      return {
        ...breaker,
        isExpanded: localData.isExpanded ?? false,
        status: localData.status ?? "INACTIVE",
        lastAction: localData.lastAction ?? "No recent actions",
        buttons: localData.buttons ?? {
          B1: localData.status === "ACTIVE",
          B2: localData.status === "ACTIVE",
          B3: localData.status === "ACTIVE",
          B4: localData.status === "ACTIVE",
          B5: breaker.breakerCount > 4,
          B6: breaker.breakerCount > 5,
        },
      };
    });
  }, [data, localModifications]);


  const handleViewDetails = (breaker: ExpandedBreaker) => {
    setViewDetails({ isOpen: true, breaker });
  };

  const toggleButton = (sbcId: string, buttonId: string) => {
    setLocalModifications((prev) => {
      const current = prev[sbcId] ?? {};
      const newButtonState = !(current.buttons?.[buttonId] ?? false);

      return {
        ...prev,
        [sbcId]: {
          ...current,
          status: newButtonState ? "ACTIVE" : "INACTIVE",
          lastAction: `Button ${buttonId} turned ${
            newButtonState ? "ON" : "OFF"
          } (just now)`,
          buttons: {
            ...(current.buttons ?? {}),
            [buttonId]: newButtonState,
          },
        },
      };
    });
  };

  const handleActionClick = (breakerId: string, action: "activate" | "deactivate") => {
    setDialogState({ isOpen: true, breakerId, action });
  };

  const confirmAction = () => {
    if (!dialogState.breakerId || !dialogState.action) {
      return;
    }
    const { breakerId, action } = dialogState;

    setLocalModifications((prev) => {
      const isDeactivating = action === "deactivate";
      const breakerData = breakers.find((b) => b.sbcId === breakerId);
      return {
        ...prev,
        [breakerId]: {
          ...prev[breakerId],
          status: isDeactivating ? "INACTIVE" : "ACTIVE",
          lastAction: isDeactivating ? "Deactivated" : "Activated",
          buttons: isDeactivating
            ? {
                ...(breakerData?.buttons ?? {}),
                B1: false,
                B2: false,
                B3: false,
                B4: false,
              }
            : {
                ...(breakerData?.buttons ?? {}),
                B1: true,
                B2: true,
                B3: true,
                B4: true,
              },
        },
      };
    });
    setDialogState({ isOpen: false, breakerId: null, action: null });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        Failed to load breakers
      </div>
    );
  }

  if (!breakers.length) {
    return <div className="py-8 text-center">No breakers found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Sort</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SBC ID</TableHead>
              <TableHead>Asset Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Breaker Count</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakers.map((breaker) => (
              <React.Fragment key={breaker.sbcId}>
                <TableRow
                  className={`cursor-pointer ${
                    breaker.status === "INACTIVE" ? "bg-gray-100 text-gray-400" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleViewDetails(breaker)}
                >
                  <TableCell>{breaker.sbcId}</TableCell>
                  <TableCell>{breaker.assetId}</TableCell>
                  <TableCell>{breaker.name}</TableCell>
                  <TableCell>
                    {breaker.city}, {breaker.state}, {breaker.streetName}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        breaker.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {breaker.status}
                    </span>
                  </TableCell>
                  <TableCell>{breaker.breakerCount}</TableCell>
                  <TableCell>
                    {new Date(breaker.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {breaker.status === "ACTIVE" ? (
                          <DropdownMenuItem
                            onClick={() => handleActionClick(breaker.sbcId, "deactivate")}
                          >
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleActionClick(breaker.sbcId, "activate")}
                            >
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {breaker.isExpanded && (
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={9}>
                      <div className="flex justify-end gap-2 p-2">
                        {Object.entries(breaker.buttons)
                          .filter(([_, show]) => show)
                          .map(([btnId, isActive]) => (
                            <Button
                              key={btnId}
                              variant={isActive ? "default" : "outline"}
                              className={
                                isActive
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "hover:bg-gray-200"
                              }
                              onClick={() => toggleButton(breaker.sbcId, btnId)}
                              disabled={breaker.status === "INACTIVE"}
                            >
                              {btnId}
                            </Button>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={dialogState.isOpen}
        onOpenChange={() => setDialogState({ isOpen: false, breakerId: null, action: null })}
      >
        <DialogContent className="bg-white w-full">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              <span className="font-bold">
                {dialogState.action === "activate" ? "activate" : "deactivate"}
              </span>{" "}
              this breaker?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogState({ isOpen: false, breakerId: null, action: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              variant={dialogState.action === "deactivate" ? "destructive" : "default"}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewDetails.isOpen}
        onOpenChange={() => setViewDetails({ isOpen: false, breaker: null })}
      >
        <DialogContent className="w-full h-fit bg-white">
          <DialogHeader>
            <DialogTitle>Breaker Details</DialogTitle>
            <DialogDescription>
              Comprehensive information for Breaker:{" "}
              <span className="font-bold">{viewDetails.breaker?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>{viewDetails.breaker?.sbcId}</CardTitle>
                <CardDescription>
                  Asset ID: {viewDetails.breaker?.assetId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Location:</span>
                  <span>
                    {viewDetails.breaker?.streetName}, {viewDetails.breaker?.city},{" "}
                    {viewDetails.breaker?.state}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant="outline"
                    className={`${
                      viewDetails.breaker?.status === "ACTIVE"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {viewDetails.breaker?.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Breaker Count:</span>
                  <span>{viewDetails.breaker?.breakerCount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Date Added:</span>
                  <span>
                    {viewDetails.breaker?.createdAt ? new Date(viewDetails.breaker.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assigned Operators</CardTitle>
                <CardDescription>
                  Operators who have access to this breaker.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {viewDetails.breaker?.access && viewDetails.breaker.access.length > 0 ? (
                    viewDetails.breaker.access.map((item, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                        <div>
                          <p className="font-medium">
                            {item.operator?.firstname} {item.operator?.lastname}
                          </p>
                          <p className="text-sm text-gray-500">{item.operator?.phoneNumber}</p>
                        </div>
                        <Badge variant="secondary">{item.operator?.position}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No operators assigned.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              className="border-gray-800 focus:ring-gray300/10"
              onClick={() => setViewDetails({ isOpen: false, breaker: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}