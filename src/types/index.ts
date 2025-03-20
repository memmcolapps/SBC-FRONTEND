export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  hierarchyPosition: string;
  permissions: string;
  status: "Active" | "Blocked";
}

export interface Breaker {
  id: string;
  breakerId: string;
  name: string;
  location: string;
  status: "Active" | "Inactive";
  assignedUser: string;
  lastAction: string;
}

export interface AuditLog {
  id: string;
  creator: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    contact: string;
    ustate: boolean;
    permission: boolean;
    active: boolean;
    roleId: number;
    hierarchy: number;
    roles: Array<{
      roleId: number;
      operatorRole: string;
    }>;
    nodes: Array<{
      id: number;
      name: string;
      parent_id: number | null;
    }>;
    createdAt: string;
    updatedAt: string;
  };
  description: string;
  type: string;
  sbc: unknown;
  operator: unknown;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
}
export interface Operator {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  accessLevel: "Level 1" | "Level 2" | "Level 3";
  status: "Active" | "Inactive";
  assignedSBCs: string[];
}
