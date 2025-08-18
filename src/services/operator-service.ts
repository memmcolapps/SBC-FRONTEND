/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosError } from "axios";
import { env } from "@/env";

const api = axios.create({
  baseURL: `${env.NEXT_PUBLIC_BASE_URL}/v1`,
});

interface OperatorsApiResponse {
  responsecode: string;
  responsedesc: string;
  responsedata: {
    totalData: number;
    data: OperatorFromApi[];
  };
}

export interface OperatorApiResponse {
  responsecode: string;
  responsedesc: string;
  responsedata: OperatorFromApi | {
    totalData: number;
    data: OperatorFromApi[];
  } | string; // Allow string for empty responsedata
}

export interface OperatorFromApi {
  id: string;
  orgId: string;
  firstname: string;
  lastname: string;
  position: string;
  email: string;
  password?: string;
  phoneNumber: string;
  status: boolean;
  permission: boolean;
  active: boolean;
  access: string | null;
  roles?: Array<{
    id: string;
    orgId: string;
    userId: string;
    userRole: string;
  }>;
  createdAt: string;
  updatedAt: string;
  location?: string;
  hierarchy?: number;
}

export interface OperatorForUI {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
  position: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  permission: boolean;
  role: string;
  password?: string;
  location?: string;
  hierarchy?: number;
}

export interface PaginatedOperators {
  content: OperatorForUI[];
  totalElements: number;
  totalPages: number;
}

export interface FetchOperatorsParams {
  page?: number;
  size?: number;
  token?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  hierarchyId?: string;
}

export const fetchOperators = async (params: FetchOperatorsParams): Promise<PaginatedOperators> => {
  try {
    const { token, ...queryParams } = params;
    const response = await api.get<OperatorsApiResponse>("/api/operator/service/all", {
      params: queryParams,
      headers: { Authorization: `Bearer ${token}` },
    });

    const apiData = response.data.responsedata;

    const content: OperatorForUI[] = apiData.data.map((op: OperatorFromApi) => ({
      id: op.id,
      firstname: op.firstname,
      lastname: op.lastname,
      email: op.email,
      contact: op.phoneNumber,
      position: op.position,
      status: op.status ? "ACTIVE" : "BLOCKED",
      permission: op.permission,
      role: op.roles?.[0]?.userRole.replace("ROLE_", "") ?? "READ",
      password: op.password,
      location: op.location,
      hierarchy: op.hierarchy,
    }));

    return {
      content,
      totalElements: apiData.totalData,
      totalPages: Math.ceil(apiData.totalData / (params.size ?? 10)),
    };
  } catch (error) {
    console.error("Failed to fetch operators:", error);
    throw error;
  }
};

export const getOperator = async (id: string, token: string): Promise<OperatorForUI> => {
  try {
    const response = await axios.get<OperatorApiResponse>(
      `${env.NEXT_PUBLIC_BASE_URL}/v1/api/operator/service/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const apiData = response.data.responsedata;
    const op = Array.isArray(apiData) ? apiData[0] : (apiData as any).data?.[0] || apiData as OperatorFromApi;

    if (!op || typeof op === "string") {
      throw new Error("Invalid response from server: Empty or invalid operator data.");
    }

    return {
      id: op.id,
      firstname: op.firstname,
      lastname: op.lastname,
      email: op.email,
      contact: op.phoneNumber,
      location: op.location,
      hierarchy: op.hierarchy ?? 0,
      position: op.position,
      status: op.status ? "ACTIVE" : "BLOCKED",
      permission: op.permission ?? false,
      password: op.password ?? "",
      role: op.roles?.[0]?.userRole.replace("ROLE_", "") ?? "READ",
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("API Error Response:", JSON.stringify(error.response.data, null, 2));
      const serverError = error.response.data as { responsedesc?: string; error?: string };
      throw new Error(
        serverError.responsedesc?.includes("Invalid token") || serverError.error?.includes("Invalid token")
          ? "Authentication failed: Invalid or expired token."
          : serverError.responsedesc?.includes("not found") || serverError.error?.includes("Not Found")
            ? "Operator not found."
            : "Failed to fetch operator. Please try again."
      );
    }
    console.error("Non-Axios Error:", error);
    throw new Error("An unexpected error occurred while fetching the operator.");
  }
};

export interface CreateOperatorPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phoneNumber: string;
  position: string;
  location: string;
  permission: boolean;
  role: string;
}

export const createOperator = async (
  payload: CreateOperatorPayload,
  token: string,
): Promise<OperatorForUI> => {
  try {
    const apiPayload = {
      ...payload,
    };
    console.log("Create Operator Request:", { url: `${env.NEXT_PUBLIC_BASE_URL}/v1/api/operator/service/register`, payload: apiPayload });
    const response = await axios.post<OperatorApiResponse>(
      `${env.NEXT_PUBLIC_BASE_URL}/v1/api/operator/service/register`,
      apiPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Create Operator Response:", JSON.stringify(response.data, null, 2));

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`API error: Invalid status code ${response.status}`);
    }

    const apiResponse = response.data as OperatorApiResponse;
    if (!["200", "201", "00", "000"].includes(apiResponse.responsecode)) {
      throw new Error(`API error: ${apiResponse.responsedesc || "Unexpected response code"}`);
    }

    const op = Array.isArray((apiResponse.responsedata as any).data) ? (apiResponse.responsedata as any).data[0] : apiResponse.responsedata as OperatorFromApi;

    if (!op || typeof op === "string") {
      console.warn("Empty or invalid responsedata received, returning minimal OperatorForUI");
      return {
        id: "",
        firstname: payload.firstname,
        lastname: payload.lastname,
        email: payload.email,
        contact: payload.phoneNumber,
        location: payload.location,
        position: payload.position,
        status: "ACTIVE",
        permission: payload.permission,
        password: payload.password,
        role: payload.role,
      };
    }

    return {
      id: op.id,
      firstname: op.firstname,
      lastname: op.lastname,
      email: op.email,
      contact: op.phoneNumber,
      location: op.location,
      hierarchy: op.hierarchy ?? 0,
      position: op.position,
      status: op.status ? "ACTIVE" : "BLOCKED",
      permission: op.permission ?? false,
      password: op.password ?? "",
      role: op.roles?.[0]?.userRole.replace("ROLE_", "") ?? "READ",
    };
  } catch (error) {
    console.error("Create Operator Error:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("API Error Response:", JSON.stringify(error.response.data, null, 2));
      const serverError = error.response.data as { responsedesc?: string; error?: string };
      const status = error.response.status;
      throw new Error(
        status === 500
          ? "Server error occurred while creating the operator. Please try again or contact support."
          : serverError.responsedesc?.includes("already exists") || serverError.error?.includes("already exists")
            ? "An operator with this email already exists."
            : serverError.responsedesc?.includes("Invalid token") || serverError.error?.includes("Invalid token")
              ? "Authentication failed: Invalid or expired token."
              : serverError.responsedesc?.includes("validation") || serverError.error?.includes("validation")
                ? "Invalid input provided. Please check the form fields."
                : status === 403
                  ? "Access denied. You do not have permission to create operators."
                  : status === 400
                    ? "Invalid input provided. Please check the form fields."
                    : `Failed to create operator: ${serverError.responsedesc ?? serverError.error ?? "Unknown error"}`
      );
    }
    throw new Error(error instanceof Error ? error.message : "An unexpected error occurred while creating the operator.");
  }
};

export interface UpdateOperatorStatePayload {
  userId: string;
  state: boolean;
}

export const updateOperatorStatus = async (
  payload: UpdateOperatorStatePayload,
  token: string,
): Promise<OperatorForUI> => {
  try {
    console.log("Update Operator Status Request:", { 
      url: `${env.NEXT_PUBLIC_BASE_URL}/v1/api/operator/service/block`,
      payload 
    });
    const response = await axios.patch<OperatorApiResponse>(
      `${env.NEXT_PUBLIC_BASE_URL}/v1/api/operator/service/block`,
      { userId: payload.userId, state: payload.state }, // Send in body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Update Operator Status Response:", JSON.stringify(response.data, null, 2));

    if (!["200", "201", "00", "000"].includes(response.data.responsecode)) {
      throw new Error(`API error: ${response.data.responsedesc || "Unexpected response code"}`);
    }

    const apiData = response.data.responsedata;
    const op = Array.isArray(apiData) ? apiData[0] : (apiData as any).data?.[0] || (typeof apiData === "string" ? null : apiData as OperatorFromApi);

    if (!op) {
      console.error("Invalid response data:", apiData);
      throw new Error(`Invalid response from server: Empty or invalid operator data. Response: ${JSON.stringify(response.data, null, 2)}`);
    }

    return {
      id: op.id,
      firstname: op.firstname,
      lastname: op.lastname,
      email: op.email,
      contact: op.phoneNumber,
      location: op.location,
      hierarchy: op.hierarchy ?? 0,
      position: op.position,
      status: op.status ? "ACTIVE" : "BLOCKED",
      permission: op.permission ?? false,
      password: op.password ?? "",
      role: op.roles?.[0]?.userRole.replace("ROLE_", "") ?? "READ",
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("API Error Response:", JSON.stringify(error.response.data, null, 2));
      const serverError = error.response.data as { responsedesc?: string; error?: string };
      throw new Error(
        serverError.responsedesc?.includes("Invalid token") || serverError.error?.includes("Invalid token")
          ? "Authentication failed: Invalid or expired token."
          : serverError.responsedesc?.includes("not found") || serverError.error?.includes("Not Found")
            ? "Operator not found."
            : serverError.responsedesc?.includes("Required request parameter")
              ? `Invalid request: ${serverError.responsedesc ?? serverError.error ?? "Missing required parameter"}`
              : `Failed to update operator status: ${serverError.responsedesc ?? serverError.error ?? "Unknown error"}`
      );
    }
    console.error("Non-Axios Error:", error);
    throw error instanceof Error ? error : new Error("An unexpected error occurred while updating operator status.");
  }
};

export const editOperator = async (
  id: string,
  payload: CreateOperatorPayload,
  token: string,
): Promise<OperatorForUI> => {
  try {
    const apiPayload = {
      ...payload,
      id,
    };
    console.log("Edit Operator Request:", { url: `${env.NEXT_PUBLIC_BASE_URL}/v1/api/operator/service/update`, payload: apiPayload });
    const response = await axios.put<OperatorApiResponse>(
      `${env.NEXT_PUBLIC_BASE_URL}/v1/api/operator/service/update`,
      apiPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Edit Operator Response:", JSON.stringify(response.data, null, 2));

    const apiResponse = response.data as OperatorApiResponse;
    if (!["200", "201", "00", "000"].includes(apiResponse.responsecode)) {
      throw new Error(`API error: ${apiResponse.responsedesc || "Unexpected response code"}`);
    }

    const apiData = response.data.responsedata;
    const op = Array.isArray(apiData) ? apiData[0] : (apiData as any).data?.[0] || (typeof apiData === "string" ? null : apiData as OperatorFromApi);

    if (!op) {
      console.warn("Empty or invalid responsedata received, returning minimal OperatorForUI");
      return {
        id,
        firstname: payload.firstname,
        lastname: payload.lastname,
        email: payload.email,
        contact: payload.phoneNumber,
        location: payload.location,
        position: payload.position,
        status: "ACTIVE",
        permission: payload.permission,
        password: payload.password,
        role: payload.role,
      };
    }

    return {
      id: op.id,
      firstname: op.firstname,
      lastname: op.lastname,
      email: op.email,
      contact: op.phoneNumber,
      location: op.location,
      hierarchy: op.hierarchy ?? 0,
      position: op.position,
      status: op.status ? "ACTIVE" : "BLOCKED",
      permission: op.permission ?? false,
      password: op.password ?? "",
      role: op.roles?.[0]?.userRole.replace("ROLE_", "") ?? "READ",
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("API Error Response:", JSON.stringify(error.response.data, null, 2));
      const serverError = error.response.data as { responsedesc?: string; error?: string };
      const status = error.response.status;
      throw new Error(
        status === 500
          ? "Server error occurred while updating the operator. Please contact support with this error: " + (serverError.responsedesc ?? serverError.error ?? "Unknown error")
          : serverError.responsedesc?.includes("already exists") || serverError.error?.includes("already exists")
            ? "An operator with this email already exists."
            : serverError.responsedesc?.includes("Invalid token") || serverError.error?.includes("Invalid token")
              ? "Authentication failed: Invalid or expired token."
              : serverError.responsedesc?.includes("validation") || serverError.error?.includes("validation")
                ? "Invalid input provided. Please check the form fields."
                : status === 403
                  ? "Access denied. You do not have permission to update operators."
                  : status === 404
                    ? "Operator not found. Please verify the operator ID."
                    : `Failed to update operator: ${serverError.responsedesc ?? serverError.error ?? "Unknown error"}`
      );
    }
    console.error("Non-Axios Error:", error);
    throw new Error("An unexpected error occurred while updating the operator.");
  }
};