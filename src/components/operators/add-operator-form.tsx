/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React, { useState } from "react";
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
import { ChevronDown, ChevronRight, Check, FolderTree } from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  positionPath: string; // Store the full path for display
  password: string;
  contact: string;
  adminRole: string;
  permissions: string;
}

interface PositionNode {
  id: string;
  label: string;
  children?: PositionNode[];
}

// Define the position hierarchy
const positionTree: PositionNode[] = [
  {
    id: "operator",
    label: "Operator",
    children: [
      { id: "bhub-1", label: "Bhub 1" },
      { id: "bhub-2", label: "Bhub 2" },
    ],
  },
  {
    id: "operator-2",
    label: "Operator 2",
  },
  {
    id: "underground-operator",
    label: "Underground Operator",
    children: [
      { id: "bhub-3", label: "Bhub 3" },
      { id: "bhub-4", label: "Bhub 4" },
    ],
  },
];

const adminRoles = ["Admin", "Super Admin", "Regular"];
const permissionLevels = ["Level 1", "Level 2", "Level 3"];

export function AddOperatorForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    positionPath: "",
    password: "",
    contact: "",
    adminRole: "",
    permissions: "",
  });

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {},
  );

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectPosition = (id: string, path: string) => {
    setFormData((prev) => ({
      ...prev,
      position: id,
      positionPath: path,
    }));
  };

  const renderPositionTree = (nodes: PositionNode[], currentPath = "") => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const path = currentPath ? `${currentPath} > ${node.label}` : node.label;
      const isSelected = formData.position === node.id;

      if (!hasChildren) {
        return (
          <div
            key={node.id}
            className={`flex cursor-pointer items-center rounded py-2 pl-6 hover:bg-gray-100 ${isSelected ? "bg-purple-100" : ""}`}
            onClick={() => selectPosition(node.id, path)}
          >
            <span className="ml-1">{node.label}</span>
            {isSelected && (
              <Check className="ml-auto h-4 w-4 text-purple-600" size={10} />
            )}
          </div>
        );
      }

      return (
        <Collapsible
          key={node.id}
          open={openCategories[node.id]}
          className="w-full"
        >
          <div className="flex flex-col">
            <CollapsibleTrigger
              asChild
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(node.id);
              }}
            >
              <div
                className={`flex cursor-pointer items-center rounded py-2 hover:bg-gray-100 ${formData.position === node.id ? "bg-purple-100" : ""}`}
              >
                {openCategories[node.id] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" size={10} />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" size={10} />
                )}
                <span className="ml-2">{node.label}</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-2 border-l-2 border-gray-200 pl-4">
              {node.children && renderPositionTree(node.children, path)}
            </CollapsibleContent>
          </div>
        </Collapsible>
      );
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission
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
          <Label>Position in Organization</Label>
          <FolderTree className="ml-2 h-4 w-4 text-gray-500" size={10} />
        </div>

        {formData.positionPath && (
          <div className="mb-2 text-sm text-gray-500">
            Selected: {formData.positionPath}
          </div>
        )}

        <div className="max-h-60 overflow-y-auto rounded-md border p-3">
          {renderPositionTree(positionTree)}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Default Password</Label>
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
        <Label htmlFor="adminRole">Admin Role</Label>
        <Select
          value={formData.adminRole}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, adminRole: value }))
          }
        >
          <SelectTrigger id="adminRole">
            <SelectValue placeholder="Select admin role" />
          </SelectTrigger>
          <SelectContent>
            {adminRoles.map((role) => (
              <SelectItem key={role} value={role.toLowerCase()}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="permissions">Permissions</Label>
        <Select
          value={formData.permissions}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, permissions: value }))
          }
        >
          <SelectTrigger id="permissions">
            <SelectValue placeholder="Select permissions" />
          </SelectTrigger>
          <SelectContent>
            {permissionLevels.map((level) => (
              <SelectItem key={level} value={level.toLowerCase()}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
        Add Operator
      </Button>
    </form>
  );
}
