"use client";

import { useState } from "react";
import type { User } from "@/types";

const initialUsers: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    contact: "123-456-7890",
    hierarchyPosition: "Operator",
    permissions: "Level 2",
    status: "Active",
  },
];

export function useUsers() {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const addUser = async (newUser: Omit<User, "id" | "status">) => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser,
      status: "Active",
    };
    setUsers((prev) => [...prev, user]);
  };

  const toggleUserStatus = async (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "Active" ? "Blocked" : "Active" }
          : user,
      ),
    );
  };

  return {
    users,
    addUser,
    toggleUserStatus,
  };
}
