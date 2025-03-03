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
  timestamp: string;
  user: string;
  action: string;
  details: string;
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
