// src/components/operators/operator-management-table.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
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
import { useAuth } from "@/context/auth-context";
import {
  fetchOperators,
  updateOperatorStatus,
} from "@/services/operator-service";
import { fetchOrganizationTree } from "@/services/organization-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { OrganizationNode } from "@/types";

interface Operator {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
  hierarchy: number;
  status: "ACTIVE" | "INACTIVE";
  roles?: Array<{ operatorRole: string }>;
}

interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface FlatPosition {
  id: number;
  name: string;
  hierarchy: number;
}

export function OperatorManagementTable() {
  const { getAccessToken, user } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [hierarchyFilter, setHierarchyFilter] = useState<number | undefined>();
  const [organizationTree, setOrganizationTree] = useState<OrganizationNode[]>(
    [],
  );

  // Flatten the organization tree for the position filter
  const flatPositions = useMemo(() => {
    const flatten = (
      nodes: OrganizationNode[],
      parentHierarchy = 1,
    ): FlatPosition[] => {
      return nodes.flatMap((node) => {
        const current: FlatPosition = {
          id: node.id,
          name: node.name,
          hierarchy: parentHierarchy,
        };
        const children = node.nodes
          ? flatten(node.nodes, parentHierarchy + 1)
          : [];
        return [current, ...children];
      });
    };
    return flatten(organizationTree);
  }, [organizationTree]);

  const loadOrganizationTree = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const tree = await fetchOrganizationTree(token);
      setOrganizationTree(tree);
    } catch (err) {
      console.error("Failed to load organization tree:", err);
    }
  };

  const loadOperators = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      if (!token || !user) {
        throw new Error("Authentication required");
      }

      const data = await fetchOperators({
        hierarchyId: hierarchyFilter ?? user.hierarchy,
        page: pagination.page,
        size: pagination.size,
        token,
      });

      setOperators(data?.content ?? []);
      setPagination({
        page: data?.page ?? 0,
        size: data?.size ?? 10,
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load operators");
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrganizationTree();
    void loadOperators();
  }, []);

  useEffect(() => {
    void loadOperators();
  }, [pagination.page, pagination.size, hierarchyFilter]);

  const toggleStatus = async (
    id: string,
    currentStatus: "ACTIVE" | "INACTIVE",
  ) => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updateOperatorStatus(id, newStatus, token);

      setOperators((prev) =>
        prev.map((op) => (op.id === id ? { ...op, status: newStatus } : op)),
      );
    } catch (error) {
      console.error("Error updating operator status:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update operator status",
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSizeChange = (newSize: number) => {
    setPagination((prev) => ({ ...prev, size: newSize, page: 0 }));
  };

  const handleHierarchyChange = (hierarchyId: string) => {
    if (hierarchyId === "all") {
      setHierarchyFilter(undefined);
    } else {
      const id = parseInt(hierarchyId);
      if (!isNaN(id)) {
        setHierarchyFilter(id);
      }
    }
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const getPositionName = (hierarchyId: number): string => {
    const position = flatPositions.find((pos) => pos.id === hierarchyId);
    return position?.name ?? "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading operators...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h3 className="font-medium text-red-800">Error loading operators</h3>
        <p className="mt-1 text-red-600">{error}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => loadOperators()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select onValueChange={handleHierarchyChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {flatPositions.map((position) => (
              <SelectItem key={position.id} value={position.id.toString()}>
                {position.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
            {operators.length > 0 ? (
              operators.map((operator) => (
                <TableRow key={operator.id}>
                  <TableCell>{`${operator.firstname} ${operator.lastname}`}</TableCell>
                  <TableCell>{operator.email}</TableCell>
                  <TableCell>{operator.contact}</TableCell>
                  <TableCell>{getPositionName(operator.hierarchy)}</TableCell>
                  <TableCell>
                    {operator.roles?.[0]?.operatorRole.replace("ROLE_", "") ??
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        operator.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {operator.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(operator.id, operator.status)}
                    >
                      {operator.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </Button>
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

      {operators.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {operators.length} of {pagination.totalElements} operators
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
              Page {pagination.page + 1} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
