/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { updateUser } from "@/services";
import { Loader2 } from "lucide-react";

interface UserProfile {
  operator: {
    firstname: string;
    lastname: string;
    email: string;
    contact: string;
    hierarchy: number;
  };
  role: {
    roleId: number;
    operatorRole: string;
  };
}

export function UserProfileForm() {
  const { getAccessToken, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    operator: {
      firstname: user?.firstName || "",
      lastname: user?.lastName || "",
      email: user?.email || "",
      contact: user?.contact || "",
      hierarchy: Number(user?.hierarchy) || 0,
    },
    role: {
      roleId: user?.roles?.[0]?.roleId || 0,
      operatorRole: user?.roles?.[0]?.operatorRole || "ROLE_WRITE",
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        operator: {
          firstname: user.firstName || "",
          lastname: user.lastName || "",
          email: user.email || "",
          contact: user.contact || "",
          hierarchy: user.hierarchy || 1,
        },
        role: {
          roleId: user.roles?.[0]?.roleId || 9,
          operatorRole: user.roles?.[0]?.operatorRole || "ROLE_WRITE",
        },
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id.startsWith("operator.")) {
      const operatorField = id.substring("operator.".length);
      setProfile((prev) => ({
        ...prev,
        operator: { ...prev.operator, [operatorField]: value },
      }));
    } else if (id.startsWith("role.")) {
      const roleField = id.substring("role.".length);
      setProfile((prev) => ({
        ...prev,
        role: { ...prev.role, [roleField]: value },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = getAccessToken();
      if (!token || !user?.id) {
        toast.error("Authentication token is missing or user ID not found.");
        return;
      }

      const payload = {
        operator: {
          firstname: profile.operator.firstname,
          lastname: profile.operator.lastname,
          email: profile.operator.email,
          contact: profile.operator.contact,
          hierarchy: profile.operator.hierarchy,
        },
        role: {
          roleId: profile.role.roleId,
          operatorRole: profile.role.operatorRole,
        },
      };

      const updatedUser = await updateUser(payload, token);
      console.log("Profile updated successfully:", updatedUser);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Failed to update profile:", error?.message || "An unexpected error occurred");
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="operator.firstname" className="text-sm text-gray-600">First Name</Label>
          <Input
            id="operator.firstname"
            value={profile.operator.firstname}
            onChange={handleChange}
            placeholder="Enter first name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="operator.lastname" className="text-sm text-gray-600">Last Name</Label>
          <Input
            id="operator.lastname"
            value={profile.operator.lastname}
            onChange={handleChange}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="operator.email" className="text-sm text-gray-600">Email</Label>
          <Input
            id="operator.email"
            type="email"
            value={profile.operator.email}
            onChange={handleChange}
            placeholder="Enter email address"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="operator.contact" className="text-sm text-gray-600">Contact</Label>
          <Input
            id="operator.contact"
            value={profile.operator.contact}
            onChange={handleChange}
            placeholder="Enter contact number"
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          className="bg-[#16085F] hover:bg-[#1e0f7a]"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </form>
  );
}
