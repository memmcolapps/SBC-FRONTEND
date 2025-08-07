/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosError } from "axios";
import { env } from "@/env";

// The 'api' object was used but not defined.
const api = axios.create({
  baseURL: `${env.NEXT_PUBLIC_BASE_URL}/v1`, // Assuming the base URL is where the endpoints are
  // You might want to add other default headers or configurations here
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
  };
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

// Simplified OperatorForUI interface to have a single `role` field.
export interface OperatorForUI {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
  position: string;
  status: "ACTIVE" | "INACTIVE";
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

    // Map the raw API data to the cleaner UI format.
    const content: OperatorForUI[] = apiData.data.map((op: OperatorFromApi) => ({
      id: op.id,
      firstname: op.firstname,
      lastname: op.lastname,
      email: op.email,
      contact: op.phoneNumber,
      position: op.position,
      status: op.status ? "ACTIVE" : "INACTIVE",
      permission: op.permission,
      // Map the first role from the API to the single `role` field for the UI.
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
    // Handle errors
    console.error("Failed to fetch operators:", error);
    throw error;
  }
};

export const getOperator = async (id: string, token: string): Promise<OperatorForUI> => {
  try {
    const response = await axios.get<OperatorApiResponse>(
      `${env.NEXT_PUBLIC_BASE_URL}/v1/api/operator/service/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const apiData = response.data.responsedata;
    const op = Array.isArray(apiData) ? apiData[0] : (apiData as any).data?.[0] || apiData as OperatorFromApi;

    if (!op) {
      throw new Error("Invalid response from server: Empty operator data.");
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
      status: op.status ? "ACTIVE" : "INACTIVE",
      permission: op.permission ?? false,
      password: op.password ?? "",
      // Map the first role from the API to the single `role` field for the UI.
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

    if (!op?.id) {
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
      status: op.status ? "ACTIVE" : "INACTIVE",
      permission: op.permission ?? false,
      password: op.password ?? "",
      // Map the first role from the API to the single `role` field for the UI.
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

export const updateOperatorStatus = async (
  id: string,
  status: "ACTIVE" | "INACTIVE",
  token: string,
): Promise<OperatorForUI> => {
  try {
    const newStatus = status === "ACTIVE";
    console.log("Update Operator Status Request:", { url: `${env.NEXT_PUBLIC_BASE_URL}/v1/api/operator/service/update`, status: newStatus, id });
    const response = await axios.put<OperatorApiResponse>(
      `${env.NEXT_PUBLIC_BASE_URL}/v1/api/operator/service/update`,
      { id, status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Update Operator Status Response:", JSON.stringify(response.data, null, 2));
    const apiData = response.data.responsedata;
    const op = Array.isArray(apiData) ? apiData[0] : (apiData as any).data?.[0] || apiData as OperatorFromApi;

    if (!op) {
      throw new Error("Invalid response from server: Empty operator data.");
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
      status: op.status ? "ACTIVE" : "INACTIVE",
      permission: op.permission ?? false,
      password: op.password ?? "",
      // Map the first role from the API to the single `role` field for the UI.
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
            : "Failed to update operator status. Please try again."
      );
    }
    console.error("Non-Axios Error:", error);
    throw new Error("An unexpected error occurred while updating operator status.");
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
      id, // Add the ID to the payload for the update
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
    const op = Array.isArray(apiData) ? apiData[0] : (apiData as any).data?.[0] || apiData as OperatorFromApi;
    
    if (!op) {
      console.warn("Empty responsedata received, returning minimal OperatorForUI");
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
      status: op.status ? "ACTIVE" : "INACTIVE",
      permission: op.permission ?? false,
      password: op.password ?? "",
      // Map the first role from the API to the single `role` field for the UI.
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