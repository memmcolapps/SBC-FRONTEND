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

// types.ts
// export interface DashboardData {
//   totalBreakers: number;
//   totalOperators: number;
//   totalActiveOperators: number;
//   totalInactiveOperators: number;
//   recentActivity: {
//     time: string;
//     user: string;
//     action: string;
//   }[];
// }

// types.ts
export interface RecentActivityItem {
  description: string;
  createdAt: string;
  user: string;
}

export interface DashboardData {
  totalBreakers: number;
  totalOperators: number;
  totalActiveOperators: number;
  totalInactiveOperators: number;
  recentActivity: RecentActivityItem[];
}

// src/types/organization.ts
export interface OrganizationNodeResponse {
  responsecode: string;
  responsedesc: string;
  responsedata: {
    node: OrganizationNode;
  };
}

export interface OrganizationErrorResponse {
  responsecode: string;
  responsedesc: string;
}

export interface OrganizationNode {
  id: number;
  name: string;
  parent_id: number | null;
  nodes?: OrganizationNode[];
}

export interface OrganizationTreeResponse {
  responsecode: string;
  responsedesc: string;
  responsedata: OrganizationNode[];
}
