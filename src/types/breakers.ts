// src/types/breakers.ts

export interface Role {
  id: string;
  orgId: string;
  userId: string;
  userRole: string;
}

export interface Operator {
  id: string;
  orgId: string;
  firstname: string;
  lastname: string;
  position: string;
  location: string;
  phoneNumber: string;
  status: boolean;
  permission: boolean;
  active: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Access {
  id: string;
  access: boolean;
  userId: string;
  sbcId: string;
  orgId: string;
  sbc: null;
  operator: Operator;
}

export interface Topic {
  id: string;
  orgId: string;
  sbcId: string;
  sbcTopic: string;
  sb1Topic: string;
  sb2Topic: string;
  sb3Topic: string;
  sb4Topic: string;
  sb5Topic?: string;
  sb6Topic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Breaker {
  id: string;
  orgId: string;
  sbcId: string;
  name: string;
  breakerCount: number;
  state: string;
  streetName: string;
  city: string;
  assetId: string;
  subscribeTopic: Topic;
  publishTopic: Topic;
  access: Access[];
  operatorId: string | null;
  createdAt: string;
  updatedAt: string;
  // This property was missing in the provided interface, but used in the component
  status: "ACTIVE" | "INACTIVE";
}

export interface BreakersResponseData {
  totalData: number;
  data: Breaker[];
  size: number;
  totalPages: number;
  page: number;
}

export interface BreakersResponse {
  responsecode: string;
  responsedesc: string;
  responsedata: BreakersResponseData;
}

export interface BreakerFilters {
  page?: number;
  size?: number;
  name?: string;
  sbcId?: string;
  assetId?: string;
  state?: string;
  city?: string;
  createdAt?: string;
}
