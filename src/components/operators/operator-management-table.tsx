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

interface Operator {
  id: string;
  name: string;
  email: string;
  contact: string;
  position: string;
  permissions: string;
  status: "Active" | "Inactive";
}

const initialOperators: Operator[] = [
  {
    id: "1",
    name: "Oyewo",
    email: "ope@gmail.com",
    contact: "123-221-12",
    position: "Operator",
    permissions: "Level 2",
    status: "Active",
  },
  {
    id: "2",
    name: "Habeeb",
    email: "abc@gmail.com",
    contact: "231-212-11",
    position: "Operator",
    permissions: "Level 1",
    status: "Inactive",
  },
];

export function OperatorManagementTable() {
  const [operators, setOperators] = useState<Operator[]>(initialOperators);

  const toggleStatus = (id: string) => {
    setOperators((prev) =>
      prev.map((operator) =>
        operator.id === id
          ? {
              ...operator,
              status: operator.status === "Active" ? "Inactive" : "Active",
            }
          : operator,
      ),
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {operators.map((operator) => (
          <TableRow key={operator.id}>
            <TableCell>{operator.name}</TableCell>
            <TableCell>{operator.email}</TableCell>
            <TableCell>{operator.contact}</TableCell>
            <TableCell>{operator.position}</TableCell>
            <TableCell>{operator.permissions}</TableCell>
            <TableCell>
              <Badge
                variant={operator.status === "Active" ? "default" : "secondary"}
              >
                {operator.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleStatus(operator.id)}
              >
                Disable
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
