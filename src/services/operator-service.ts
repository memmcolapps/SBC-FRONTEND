// src/services/operator-service.ts
import axios from "axios";
import { env } from "@/env";

interface Operator {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
  hierarchy: number;
  status: "ACTIVE" | "INACTIVE";
  roles: {
    operatorRole: string;
  }[];
}

interface PaginatedResponse {
  content: Operator[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

interface ApiResponse {
  responsecode: string;
  responsedesc: string;
  responsedata: {
    content: Operator[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  };
}

interface FetchOperatorsParams {
  hierarchyId?: number;
  page?: number;
  size?: number;
  token: string;
}

interface CreateOperatorPayload {
  operator: {
    firstname: string;
    lastname: string;
    email: string;
    passwordEncrypt: string;
    contact: string;
    hierarchy: number;
  };
  role: {
    operatorRole: string;
  };
}

export const createOperator = async (
  payload: CreateOperatorPayload,
  token: string,
): Promise<Operator> => {
  const response = await axios.post<Operator>(
    `${env.NEXT_PUBLIC_BASE_URL}/organization/api/create/operator`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

export const fetchOperators = async ({
  hierarchyId,
  page = 0,
  size = 10,
  token,
}: FetchOperatorsParams): Promise<PaginatedResponse> => {
  const params = new URLSearchParams();
  if (hierarchyId) params.append("hierarchyId", hierarchyId.toString());
  params.append("page", page.toString());
  params.append("size", size.toString());

  const response = await axios.get<ApiResponse>(
    `${env.NEXT_PUBLIC_BASE_URL}/organization/operator/api/get-operators`,
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.data.responsedata) {
    throw new Error("Invalid response format");
  }

  return {
    content: response.data.responsedata.content,
    totalElements: response.data.responsedata.totalElements,
    totalPages: response.data.responsedata.totalPages,
    page: response.data.responsedata.page,
    size: response.data.responsedata.size,
  };
};

export const updateOperatorStatus = async (
  id: string,
  status: "ACTIVE" | "INACTIVE",
  token: string,
): Promise<Operator> => {
  const response = await axios.put<Operator>(
    `${env.NEXT_PUBLIC_BASE_URL}/organization/api/update/operator/${id}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};
