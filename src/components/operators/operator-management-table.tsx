"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useOperators, useUpdateOperatorStatus, useEditOperator } from "@/hooks/use-operators";
import { useBreakers, useAssignBreakers, type AssignBreakersPayload } from "@/hooks/use-breakers";
import { type OperatorForUI, type CreateOperatorPayload } from "@/services/operator-service";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { type Breaker } from "@/types/breakers";

interface PaginationState {
  page: number;
  size: number;
}

export function OperatorManagementTable() {
  const { user } = useAuth();
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 10,
  });
  const [editOperator, setEditOperator] = useState<OperatorForUI | null>(null);
  const [formData, setFormData] = useState<CreateOperatorPayload | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [operatorToBlock, setOperatorToBlock] = useState<OperatorForUI | null>(null);
  const [isAssignBreakerDialogOpen, setIsAssignBreakerDialogOpen] = useState(false);
  const [operatorToAssign, setOperatorToAssign] = useState<OperatorForUI | null>(null);
  const [selectedBreakerSbcIds, setSelectedBreakerSbcIds] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const {
    data: operatorsData,
    isLoading,
    isError,
    error,
  } = useOperators({
    page: pagination.page,
    size: pagination.size,
    hierarchyId: user?.hierarchy?.toString(),
  });

  const {
    data: allBreakers,
    isLoading: isLoadingBreakers,
    isError: isErrorBreakers,
    error: breakersError,
  } = useBreakers({});

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOperatorStatus();
  const { mutate: editOperatorMutate, isPending: isEditing } = useEditOperator();
  const { mutate: assignBreakersMutate, isPending: isAssigning } = useAssignBreakers();

  const roles = ["READ", "WRITE", "ADMIN"];

  // Use useMemo to get unique and unassigned breakers
  const unassignedBreakers = useMemo(() => {
    if (!allBreakers) return [];

    const seenSbcIds = new Set<string>();
    return allBreakers.filter((breaker) => {
      // Filter out breakers with an assigned operator and filter out duplicates using sbcId.
      if (breaker.operatorId || seenSbcIds.has(breaker.sbcId)) {
        return false;
      }
      seenSbcIds.add(breaker.sbcId);
      return true;
    });
  }, [allBreakers]);

  useEffect(() => {
    if (unassignedBreakers.length > 0 && selectedBreakerSbcIds.length === unassignedBreakers.length) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [unassignedBreakers, selectedBreakerSbcIds]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSizeChange = (newSize: number) => {
    setPagination((prev) => ({ ...prev, size: newSize, page: 0 }));
  };

  const handleBlockOperator = (operator: OperatorForUI) => {
    setOperatorToBlock(operator);
    setIsBlockDialogOpen(true);
  };

  const handleConfirmBlock = () => {
    if (!operatorToBlock) return;
    const newState = operatorToBlock.status === "ACTIVE" ? false : true;
    updateStatus(
      { userId: operatorToBlock.id, state: newState },
      {
        onSuccess: () => {
          toast.success(`Operator ${newState ? "unblocked" : "blocked"} successfully`);
          setIsBlockDialogOpen(false);
          setOperatorToBlock(null);
        },
        onError: (err) => {
          toast.error(`Failed to ${newState ? "unblock" : "block"} operator: ${err.message}`);
          setIsBlockDialogOpen(false);
          setOperatorToBlock(null);
        },
      },
    );
  };

  const handleEdit = (operator: OperatorForUI) => {
    const newFormData: CreateOperatorPayload = {
      firstname: operator.firstname ?? "",
      lastname: operator.lastname ?? "",
      email: operator.email ?? "",
      password: "",
      phoneNumber: operator.contact ?? "",
      position: operator.position ?? "",
      location: operator.location ?? "",
      permission: operator.permission ?? true,
      role: operator.role ?? "READ",
    };

    setFormData(newFormData);
    setEditOperator(operator);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !editOperator) {
      toast.error("Cannot update operator: Missing form data.");
      return;
    }

    editOperatorMutate(
      { id: editOperator.id, payload: formData },
      {
        onSuccess: () => {
          toast.success("Operator updated successfully!");
          setEditOperator(null);
          setFormData(null);
          setIsEditDialogOpen(false);
        },
        onError: (err) => {
          toast.error("Failed to update operator: " + err.message);
        },
      },
    );
  };

  const handleAssignBreaker = (operator: OperatorForUI) => {
    setOperatorToAssign(operator);
    setSelectedBreakerSbcIds([]);
    setIsAssignBreakerDialogOpen(true);
  };

  const handleSelectBreaker = (sbcId: string) => {
    setSelectedBreakerSbcIds((prev) =>
      prev.includes(sbcId)
        ? prev.filter((id) => id !== sbcId)
        : [...prev, sbcId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allUnassignedBreakerSbcIds = unassignedBreakers.map(breaker => breaker.sbcId);
      setSelectedBreakerSbcIds(allUnassignedBreakerSbcIds);
    } else {
      setSelectedBreakerSbcIds([]);
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorToAssign || selectedBreakerSbcIds.length === 0) {
      toast.error("Please select at least one breaker to assign.");
      return;
    }

    const payload: AssignBreakersPayload = {
      userId: operatorToAssign.id,
      access: true,
      sbcIds: selectedBreakerSbcIds,
    };

    assignBreakersMutate(
      payload,
      {
        onSuccess: () => {
          setIsAssignBreakerDialogOpen(false);
          setOperatorToAssign(null);
          setSelectedBreakerSbcIds([]);
          setIsAllSelected(false);
          toast.success("Breakers assigned successfully!");
        },
        onError: (err) => {
          toast.error("Failed to assign breakers: " + err.message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading operators...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h3 className="font-medium text-red-800">Error loading operators</h3>
        <p className="mt-1 text-red-600">{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Select
          value={pagination.size.toString()}
          onValueChange={(value) => handleSizeChange(parseInt(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Page size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operatorsData?.content && operatorsData.content.length > 0 ? (
              operatorsData.content.map((operator: OperatorForUI) => (
                <TableRow
                  key={operator.id || "N/A"}
                  className={operator.status === "BLOCKED" ? "bg-gray-100 opacity-50" : ""}
                >
                  <TableCell>{`${operator.firstname} ${operator.lastname}`}</TableCell>
                  <TableCell>{operator.email || "N/A"}</TableCell>
                  <TableCell>{operator.contact || "N/A"}</TableCell>
                  <TableCell>{operator.position || "N/A"}</TableCell>
                  <TableCell>{operator.role ?? "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        operator.status === "ACTIVE"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }
                    >
                      {operator.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {operator.status === "BLOCKED" ? (
                          <DropdownMenuItem
                            onClick={() => handleBlockOperator(operator)}
                            disabled={isUpdating}
                          >
                            Unblock
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleBlockOperator(operator)}
                              disabled={isUpdating}
                            >
                              Block
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(operator)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAssignBreaker(operator)}
                            >
                              Assign Breaker
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  No operators found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {operatorsData?.content && operatorsData.content.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {operatorsData.content.length} of {operatorsData.totalElements} operators
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.page + 1} of {operatorsData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= operatorsData.totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {editOperator && formData && (
        <Dialog open={isEditDialogOpen} onOpenChange={() => {
          setEditOperator(null);
          setFormData(null);
          setIsEditDialogOpen(false);
        }}>
          <DialogContent className="sm:max-w-[425px] h-fit bg-white">
            <DialogHeader>
              <DialogTitle>Edit Operator</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstname}
                    onChange={(e) => setFormData((prev) => prev ? { ...prev, firstname: e.target.value } : prev)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastname}
                    onChange={(e) => setFormData((prev) => prev ? { ...prev, lastname: e.target.value } : prev)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled={true}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={formData.phoneNumber}
                  disabled={true}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData((prev) => prev ? { ...prev, position: e.target.value.toUpperCase() } : prev)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => prev ? { ...prev, location: e.target.value } : prev)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData((prev) => prev ? { ...prev, role: value } : prev)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="permission">Permission</Label>
                <Select
                  value={formData.permission ? "true" : "false"}
                  onValueChange={(value) => setFormData((prev) => prev ? { ...prev, permission: value === "true" } : prev)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setEditOperator(null);
                  setFormData(null);
                  setIsEditDialogOpen(false);
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isEditing}>
                  {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isEditing ? "Updating..." : "Update Operator"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {operatorToAssign && (
        <Dialog open={isAssignBreakerDialogOpen} onOpenChange={() => {
          setIsAssignBreakerDialogOpen(false);
          setOperatorToAssign(null);
          setSelectedBreakerSbcIds([]);
          setIsAllSelected(false);
        }}>
          <DialogContent className="sm:max-w-[600px] h-fit bg-white">
            <DialogHeader>
              <DialogTitle>Assign Breaker to {operatorToAssign.firstname} {operatorToAssign.lastname}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px] text-center">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                          disabled={unassignedBreakers.length === 0}
                        />
                      </TableHead>
                      <TableHead>Breaker Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingBreakers ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Loading breakers...</span>
                        </TableCell>
                      </TableRow>
                    ) : isErrorBreakers ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-red-500">
                          Error: {breakersError?.message}
                        </TableCell>
                      </TableRow>
                    ) : unassignedBreakers.length > 0 ? (
                      unassignedBreakers.map((breaker: Breaker) => (
                        <TableRow key={breaker.sbcId}>
                          <TableCell className="w-[50px] text-center">
                            <Checkbox
                              checked={selectedBreakerSbcIds.includes(breaker.sbcId)}
                              onCheckedChange={() => handleSelectBreaker(breaker.sbcId)}
                            />
                          </TableCell>
                          <TableCell>{breaker.name}</TableCell>
                          <TableCell>
                            {breaker.city}, {breaker.state}, {breaker.streetName}
                          </TableCell>
                          <TableCell>
                            <Badge variant={breaker.status === "ACTIVE" ? "default" : "secondary"}>
                              {breaker.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center">
                          No unassigned breakers available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAssignBreakerDialogOpen(false);
                  setOperatorToAssign(null);
                  setSelectedBreakerSbcIds([]);
                  setIsAllSelected(false);
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isAssigning || selectedBreakerSbcIds.length === 0}>
                  {isAssigning ? <Loader2 size={14} className="h-4 w-4 animate-spin" /> : null}
                  {isAssigning ? "Assigning..." : `Assign (${selectedBreakerSbcIds.length})`}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {operatorToBlock && (
        <Dialog open={isBlockDialogOpen} onOpenChange={() => {
          setIsBlockDialogOpen(false);
          setOperatorToBlock(null);
        }}>
          <DialogContent className="sm:max-w-[425px] h-fit bg-white">
            <DialogHeader>
              <DialogTitle>
                {operatorToBlock.status === "ACTIVE" ? "Block Operator" : "Unblock Operator"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to {operatorToBlock.status === "ACTIVE" ? "block" : "unblock"} {operatorToBlock.firstname} {operatorToBlock.lastname}?
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsBlockDialogOpen(false);
                  setOperatorToBlock(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmBlock}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 size={14} className="h-4 w-4 animate-spin" /> : null}
                {operatorToBlock.status === "ACTIVE" ? "Block" : "Unblock"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}