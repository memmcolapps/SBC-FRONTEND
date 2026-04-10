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
import {
  useBreakers,
  useChangeBreakerState,
  useEditBreaker,
} from "@/hooks/use-breakers";
import { useMqttBreakers } from "@/hooks/use-mqtt-breakers";
import { Skeleton } from "@/components/ui/skeleton";
import { type Breaker } from "@/types/breakers";
import React from "react";
import { Loader2, MoreVertical, Wifi, WifiOff } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExpandedBreaker extends Omit<Breaker, "status"> {
  lastAction?: string;
  status: "ACTIVE" | "INACTIVE";
}

export function BreakerManagementTable() {
  const [localModifications, setLocalModifications] = useState<
    Record<string, Partial<ExpandedBreaker>>
  >({});
  const {
    data = [],
    isLoading,
    isError,
  } = useBreakers({
    page: 0,
    size: 10,
  });
  const changeStateMutation = useChangeBreakerState();
  const editMutation = useEditBreaker();

  const uniqueBreakers = useMemo(() => {
    const map = new Map<string, Breaker>();
    data.forEach((breaker) => {
      if (!map.has(breaker.sbcId)) {
        map.set(breaker.sbcId, breaker);
      }
    });
    return Array.from(map.values());
  }, [data]);

  const {
    breakerStatuses,
    systemStatuses,
    controlBreaker,
    isConnected: mqttConnected,
  } = useMqttBreakers(uniqueBreakers);

  const breakers = useMemo(() => {
    return uniqueBreakers.map((breaker) => {
      const localData = localModifications[breaker.sbcId] ?? {};
      const apiStatus = breaker.status ? "ACTIVE" : "INACTIVE";
      const currentStatus = localData.status ?? apiStatus;
      return {
        ...breaker,
        status: currentStatus,
        lastAction: localData.lastAction ?? "No recent actions",
      };
    });
  }, [uniqueBreakers, localModifications]);

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

  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    breaker: ExpandedBreaker | null;
  }>({
    isOpen: false,
    breaker: null,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    streetName: "",
    city: "",
    state: "",
    assetId: "",
  });

  const handleViewDetails = (breaker: ExpandedBreaker) => {
    setViewDetails({ isOpen: true, breaker });
  };

  const handleEditClick = (breaker: ExpandedBreaker) => {
    setEditDialog({ isOpen: true, breaker });
    setEditForm({
      name: breaker.name,
      streetName: breaker.streetName,
      city: breaker.city,
      state: breaker.state,
      assetId: breaker.assetId,
    });
  };

  const handleEditSubmit = () => {
    if (!editDialog.breaker) return;

    editMutation.mutate(
      { id: editDialog.breaker.id, ...editForm },
      {
        onSuccess: () => {
          setEditDialog({ isOpen: false, breaker: null });
        },
        onError: () => {
          setEditDialog({ isOpen: false, breaker: null });
        },
      },
    );
  };

  const toggleBreaker = (sbcId: string, breakerNumber: number) => {
    const currentStatus = breakerStatuses[sbcId]?.[breakerNumber];
    const command = currentStatus === "ON" ? "OFF" : "ON";
    controlBreaker(sbcId, breakerNumber, command);
  };

  const handleActionClick = (
    breakerId: string,
    action: "activate" | "deactivate",
  ) => {
    setDialogState({ isOpen: true, breakerId: breakerId, action });
  };

  const confirmAction = () => {
    if (!dialogState.breakerId || !dialogState.action) {
      return;
    }
    const { breakerId, action } = dialogState;
    const newState = action === "activate";
    const breaker = breakers.find((b) => b.sbcId === breakerId);

    if (!breaker) {
      return;
    }

    changeStateMutation.mutate(
      { id: breaker.id, status: newState },
      {
        onSuccess: () => {
          setLocalModifications((prev) => ({
            ...prev,
            [breakerId]: {
              ...prev[breakerId],
              status: newState ? "ACTIVE" : "INACTIVE",
              lastAction: newState ? "Activated" : "Deactivated",
            },
          }));
          setDialogState({ isOpen: false, breakerId: null, action: null });
        },
        onError: () => {
          setDialogState({ isOpen: false, breakerId: null, action: null });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Failed to load breakers
      </div>
    );
  }

  if (!breakers.length) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        No breakers found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs">
        {mqttConnected ? (
          <span className="flex items-center gap-1 text-green-600">
            <Wifi className="h-3.5 w-3.5" />
            MQTT Connected
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-500">
            <WifiOff className="h-3.5 w-3.5" />
            MQTT Disconnected
          </span>
        )}
      </div>

      <div className="rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SBC ID</TableHead>
              <TableHead>Asset ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Breakers</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakers.map((breaker) => {
              const sbcStatus = systemStatuses[breaker.sbcId];
              const individualStatuses = breakerStatuses[breaker.sbcId] ?? {};

              return (
                <React.Fragment key={breaker.sbcId}>
                  <TableRow
                    className={`cursor-pointer ${
                      breaker.status === "INACTIVE"
                        ? "bg-gray-50 text-gray-400"
                        : "hover:bg-gray-50/50"
                    }`}
                    onClick={() => handleViewDetails(breaker)}
                  >
                    <TableCell className="font-medium">
                      {breaker.sbcId}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {breaker.assetId}
                    </TableCell>
                    <TableCell>{breaker.name}</TableCell>
                    <TableCell className="text-gray-600">
                      {breaker.city}, {breaker.state}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={
                            breaker.status === "ACTIVE"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }
                        >
                          {breaker.status}
                        </Badge>
                        {sbcStatus && (
                          <span
                            className={`h-2 w-2 rounded-full ${
                              sbcStatus === "ONLINE"
                                ? "bg-green-500"
                                : sbcStatus === "OFFLINE"
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                            }`}
                            title={`SBC ${sbcStatus}`}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {breaker.breakerCount}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(breaker.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {breaker.status === "ACTIVE" ? (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleActionClick(breaker.sbcId, "deactivate")
                                }
                              >
                                Deactivate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditClick(breaker)}
                              >
                                Edit
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                handleActionClick(breaker.sbcId, "activate")
                              }
                            >
                              Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={8}>
                      <div className="flex items-center justify-end gap-2 p-2">
                        {Array.from(
                          { length: breaker.breakerCount },
                          (_, i) => {
                            const breakerNum = i + 1;
                            const status = individualStatuses[breakerNum];
                            const isOn = status === "ON";
                            const isUnknown =
                              status === "UNKNOWN" || status === undefined;
                            const isDisabled =
                              breaker.status === "INACTIVE" || !mqttConnected;

                            return (
                              <Button
                                key={breakerNum}
                                variant={isOn ? "default" : "outline"}
                                size="sm"
                                className={
                                  isOn
                                    ? "bg-green-600 hover:bg-green-700"
                                    : isUnknown
                                      ? "border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200"
                                      : "hover:bg-gray-200"
                                }
                                onClick={() =>
                                  toggleBreaker(breaker.sbcId, breakerNum)
                                }
                                disabled={isDisabled}
                                title={
                                  isUnknown
                                    ? `Breaker ${breakerNum}: Waiting for status...`
                                    : `Breaker ${breakerNum}: ${isOn ? "ON" : "OFF"} — Click to toggle`
                                }
                              >
                                B{breakerNum}
                                {isUnknown && (
                                  <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                                )}
                              </Button>
                            );
                          },
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Confirm Action Dialog */}
      <Dialog
        open={dialogState.isOpen}
        onOpenChange={() =>
          setDialogState({ isOpen: false, breakerId: null, action: null })
        }
      >
        <DialogContent className="bg-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              <span className="font-semibold">
                {dialogState.action === "activate" ? "activate" : "deactivate"}
              </span>{" "}
              this breaker?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDialogState({ isOpen: false, breakerId: null, action: null })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              className={
                dialogState.action === "deactivate"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#16085F] hover:bg-[#1e0f7a]"
              }
              disabled={changeStateMutation.isPending}
            >
              {changeStateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {changeStateMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDetails.isOpen}
        onOpenChange={() => setViewDetails({ isOpen: false, breaker: null })}
      >
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Breaker Details</DialogTitle>
            <DialogDescription>
              Information for{" "}
              <span className="font-semibold">{viewDetails.breaker?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {viewDetails.breaker?.sbcId}
                </CardTitle>
                <CardDescription>
                  Asset ID: {viewDetails.breaker?.assetId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Location</span>
                  <span>
                    {viewDetails.breaker?.streetName},{" "}
                    {viewDetails.breaker?.city}, {viewDetails.breaker?.state}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={
                        viewDetails.breaker?.status === "ACTIVE"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }
                    >
                      {viewDetails.breaker?.status}
                    </Badge>
                    {viewDetails.breaker?.sbcId &&
                      systemStatuses[viewDetails.breaker.sbcId] && (
                        <span
                          className={`h-2 w-2 rounded-full ${
                            systemStatuses[viewDetails.breaker.sbcId] ===
                            "ONLINE"
                              ? "bg-green-500"
                              : systemStatuses[viewDetails.breaker.sbcId] ===
                                  "OFFLINE"
                                ? "bg-red-500"
                                : "bg-gray-400"
                          }`}
                          title={`SBC ${systemStatuses[viewDetails.breaker.sbcId]}`}
                        />
                      )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Breaker Count</span>
                  <span>{viewDetails.breaker?.breakerCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Date Added</span>
                  <span>
                    {viewDetails.breaker?.createdAt
                      ? new Date(
                          viewDetails.breaker.createdAt,
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                {viewDetails.breaker?.sbcId &&
                  breakerStatuses[viewDetails.breaker.sbcId] && (
                    <div className="border-t border-gray-100 pt-3">
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Breaker Status (Live)
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.from(
                          { length: viewDetails.breaker.breakerCount },
                          (_, i) => {
                            const num = i + 1;
                            const status =
                              breakerStatuses[viewDetails.breaker!.sbcId]?.[
                                num
                              ];
                            return (
                              <Badge
                                key={num}
                                variant="outline"
                                className={
                                  status === "ON"
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : status === "OFF"
                                      ? "border-red-200 bg-red-50 text-red-700"
                                      : "border-gray-200 bg-gray-50 text-gray-500"
                                }
                              >
                                B{num}: {status ?? "—"}
                              </Badge>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Assigned Operators</CardTitle>
                <CardDescription>
                  Operators who have access to this breaker.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {viewDetails.breaker?.access &&
                  viewDetails.breaker.access.length > 0 ? (
                    viewDetails.breaker.access.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {item.operator?.firstname} {item.operator?.lastname}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.operator?.phoneNumber}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {item.operator?.position}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No operators assigned.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDetails({ isOpen: false, breaker: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) setEditDialog({ isOpen: false, breaker: null });
        }}
      >
        <DialogContent className="bg-white sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Breaker</DialogTitle>
            <DialogDescription>
              Update details for {editDialog.breaker?.sbcId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-sm text-gray-600">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-city" className="text-sm text-gray-600">
                  City
                </Label>
                <Input
                  id="edit-city"
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-state" className="text-sm text-gray-600">
                  State
                </Label>
                <Input
                  id="edit-state"
                  value={editForm.state}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, state: e.target.value }))
                  }
                  placeholder="Enter state"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-street" className="text-sm text-gray-600">
                Street Name
              </Label>
              <Input
                id="edit-street"
                value={editForm.streetName}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    streetName: e.target.value,
                  }))
                }
                placeholder="Enter street name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-asset" className="text-sm text-gray-600">
                Asset ID
              </Label>
              <Input
                id="edit-asset"
                value={editForm.assetId}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, assetId: e.target.value }))
                }
                placeholder="Enter asset ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ isOpen: false, breaker: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              className="bg-[#16085F] hover:bg-[#1e0f7a]"
              disabled={editMutation.isPending}
            >
              {editMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
