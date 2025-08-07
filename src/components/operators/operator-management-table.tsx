"use client";
import { useState } from "react";
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
// Import the updated use-operator hooks which now use the simplified data structure
import { useOperators, useUpdateOperatorStatus, useEditOperator } from "@/hooks/use-operators";
import { type OperatorForUI, type CreateOperatorPayload } from "@/services/operator-service";
import { toast } from "sonner";

interface PaginationState {
  page: number;
  size: number;
}

interface OperatorForUIWithPassword extends OperatorForUI {}

export function OperatorManagementTable() {
  const { user } = useAuth();
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 10,
  });
  const [editOperator, setEditOperator] = useState<OperatorForUIWithPassword | null>(null);
  const [formData, setFormData] = useState<CreateOperatorPayload | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOperatorStatus();
  const { mutate: editOperatorMutate, isPending: isEditing } = useEditOperator();

  const roles = ["READ", "WRITE", "ADMIN"];

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSizeChange = (newSize: number) => {
    setPagination((prev) => ({ ...prev, size: newSize, page: 0 }));
  };

  const handleToggleStatus = (id: string, currentStatus: "ACTIVE" | "INACTIVE") => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateStatus(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Operator status updated to ${newStatus}`);
        },
        onError: (err) => {
          toast.error("Failed to update operator status: " + err.message);
        },
      },
    );
  };

  const handleEdit = (operator: OperatorForUIWithPassword) => {
    console.log("Operator data from API:", operator);
    console.log("Operator Email:", operator.email);
    console.log("Operator Contact:", operator.contact);
    console.log("Operator Password:", operator.password);

    const newFormData: CreateOperatorPayload = {
      firstname: operator.firstname ?? "",
      lastname: operator.lastname ?? "",
      email: operator.email ?? "",
      password: operator.password ?? "",
      phoneNumber: operator.contact ?? "",
      position: operator.position ?? "",
      location: operator.location ?? "",
      permission: operator.permission ?? true,
      // Use the single `role` field from the OperatorForUI object
      role: operator.role ?? "READ",
    };
    
    console.log("Form data to be set:", newFormData);

    setFormData(newFormData);
    setEditOperator(operator);
    setIsDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !editOperator) {
      toast.error("Cannot update operator: Missing form data.");
      return;
    }

    console.log("Updating operator with data:", formData);

    editOperatorMutate(
      { id: editOperator.id, payload: formData },
      {
        onSuccess: () => {
          toast.success("Operator updated successfully!");
          setEditOperator(null);
          setFormData(null);
          setIsDialogOpen(false);
        },
        onError: (err) => {
          toast.error("Failed to update operator: " + err.message);
        },
      },
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
              operatorsData.content.map((operator: OperatorForUIWithPassword) => (
                <TableRow key={operator.id || "N/A"}>
                  <TableCell>{`${operator.firstname} ${operator.lastname}`}</TableCell>
                  <TableCell>{operator.email || "N/A"}</TableCell>
                  <TableCell>{operator.contact || "N/A"}</TableCell>
                  <TableCell>{operator.position || "N/A"}</TableCell>
                  {/* Now correctly using the single `role` field */}
                  <TableCell>{operator.role ?? "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={operator.status === "ACTIVE" ? "default" : "secondary"}
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
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(operator.id, operator.status)}
                          disabled={isUpdating}
                        >
                          {operator.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(operator)}
                        >
                          Edit
                        </DropdownMenuItem>
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
        <Dialog open={isDialogOpen} onOpenChange={() => {
          setEditOperator(null);
          setFormData(null);
          setIsDialogOpen(false);
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
                  setIsDialogOpen(false);
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
    </div>
  );
}