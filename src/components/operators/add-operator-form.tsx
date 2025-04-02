// src/components/operators/add-operator-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Check,
  FolderTree,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { createOperator } from "@/services/operator-service";
import { fetchOrganizationTree } from "@/services/organization-service";
import { type OrganizationNode } from "@/types";

const roles = ["ROLE_READ", "ROLE_WRITE", "ROLE_ADMIN"];

export function AddOperatorForm() {
  const { getAccessToken } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    hierarchy: "", // Now storing hierarchy directly
    positionName: "", // For display only
    password: "Passw0rd",
    contact: "",
    role: "ROLE_READ",
  });
  const [organizationTree, setOrganizationTree] = useState<OrganizationNode[]>(
    [],
  );
  const [loadingTree, setLoadingTree] = useState(true);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {},
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const loadOrganizationTree = async () => {
      try {
        const token = getAccessToken();
        if (!token) return;

        const tree = await fetchOrganizationTree(token);
        setOrganizationTree(tree);
      } catch (err) {
        console.error("Failed to load organization tree:", err);
        setTreeError("Failed to load organization positions");
      } finally {
        setLoadingTree(false);
      }
    };

    void loadOrganizationTree();
  }, [getAccessToken]);

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectPosition = (hierarchy: number, name: string) => {
    setFormData((prev) => ({
      ...prev,
      hierarchy: hierarchy.toString(),
      positionName: name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("Authentication required");

      await createOperator(
        {
          operator: {
            firstname: formData.firstName,
            lastname: formData.lastName,
            email: formData.email,
            passwordEncrypt: formData.password,
            contact: formData.contact,
            hierarchy: Number(formData.hierarchy), // Send hierarchy directly
          },
          role: {
            operatorRole: formData.role,
          },
        },
        token,
      );

      setSubmitSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        hierarchy: "",
        positionName: "",
        password: "Passw0rd",
        contact: "",
        role: "ROLE_READ",
      });
    } catch (error) {
      console.error("Error creating operator:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create operator",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPositionTree = (nodes: OrganizationNode[]) => {
    if (loadingTree) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-2">Loading positions...</span>
        </div>
      );
    }

    if (treeError) {
      return (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {treeError}
        </div>
      );
    }

    if (nodes.length === 0) {
      return (
        <div className="p-3 text-sm text-gray-500">No positions available</div>
      );
    }

    return nodes.map((node) => {
      const hasChildren = node.nodes && node.nodes.length > 0;
      const isSelected = formData.hierarchy === node.id.toString();

      if (!hasChildren) {
        return (
          <div
            key={node.id}
            className={`flex cursor-pointer items-center rounded py-2 pl-6 hover:bg-gray-100 ${isSelected ? "bg-purple-100" : ""}`}
            onClick={() => selectPosition(node.id, node.name)}
          >
            <span className="ml-1">
              {node.name} (Level {node.id})
            </span>
            {isSelected && (
              <Check className="ml-auto h-4 w-4 text-purple-600" size={10} />
            )}
          </div>
        );
      }

      return (
        <Collapsible
          key={node.id}
          open={openCategories[node.id.toString()]}
          className="w-full"
        >
          <div className="flex flex-col">
            <CollapsibleTrigger
              asChild
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(node.id.toString());
              }}
            >
              <div
                className={`flex cursor-pointer items-center rounded py-2 hover:bg-gray-100 ${isSelected ? "bg-purple-100" : ""}`}
              >
                {openCategories[node.id.toString()] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" size={10} />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" size={10} />
                )}
                <span className="ml-2">
                  {node.name} (Level {node.id})
                </span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-2 border-l-2 border-gray-200 pl-4">
              {node.nodes && renderPositionTree(node.nodes)}
            </CollapsibleContent>
          </div>
        </Collapsible>
      );
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, lastName: e.target.value }))
            }
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
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label>Position (Hierarchy Level)</Label>
          <FolderTree className="ml-2 h-4 w-4 text-gray-500" size={10} />
        </div>
        {formData.positionName && (
          <div className="text-sm text-gray-500">
            Selected: {formData.positionName} (Level {formData.hierarchy})
          </div>
        )}
        <div className="max-h-60 overflow-y-auto rounded-md border p-3">
          {renderPositionTree(organizationTree)}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact">Contact</Label>
        <Input
          id="contact"
          value={formData.contact}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, contact: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, role: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role.replace("ROLE_", "")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {submitError && <div className="text-red-500">{submitError}</div>}
      {submitSuccess && (
        <div className="text-green-500">Operator created successfully!</div>
      )}

      <Button type="submit" disabled={isSubmitting || loadingTree}>
        {isSubmitting ? "Creating..." : "Add Operator"}
      </Button>
    </form>
  );
}
