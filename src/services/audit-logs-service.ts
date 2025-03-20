// auditLogsService.ts
import axios, { type AxiosError } from "axios";
import { env } from "@/env";

const AUDIT_LOGS_API_URL = env.NEXT_PUBLIC_BASE_URL;

interface AuditLog {
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

interface AuditLogsResponseData {
  totalItems: number;
  data: AuditLog[];
  totalPages: number;
  currentPage: number;
}

interface AuditLogsResponse {
  responsecode: string;
  responsedesc: string;
  responsedata: AuditLogsResponseData;
}

export async function fetchAuditLogs(
  page: number,
  size: number,
  token: string,
  dateFrom?: Date,
  dateTo?: Date,
): Promise<AuditLogsResponseData> {
  try {
    // Create URLSearchParams for form data
    const formData = new URLSearchParams();
    formData.append("page", page.toString());
    formData.append("size", size.toString());

    // if (dateFrom) {
    //   formData.append("dateFrom", dateFrom.toISOString().split("T")[0]);
    // }
    // if (dateTo) {
    //   formData.append("dateTo", dateTo.toISOString().split("T")[0]);
    // }

    const response = await axios.get<AuditLogsResponse>(
      `${AUDIT_LOGS_API_URL}/organization/api/audit/logs?page=${page}&size=${size}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // Check if the response indicates success
    if (response.data.responsecode !== "000") {
      throw new Error(
        response.data.responsedesc || "Failed to fetch audit logs",
      );
    }

    return response.data.responsedata;
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch audit logs";

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<AuditLogsResponse>;

      if (axiosError.response) {
        // Server responded with a status other than 2xx
        errorMessage =
          axiosError.response.data.responsedesc ||
          `Failed to fetch audit logs with status: ${axiosError.response.status}`;
      } else if (axiosError.request) {
        // Request was made but no response was received
        errorMessage = "No response received while fetching audit logs";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Request setup failed: ${axiosError.message}`;
      }
    } else if (error instanceof Error) {
      // Handle other Error instances
      errorMessage = `An unexpected error occurred: ${error.message}`;
    } else {
      // Handle other types of errors (e.g., strings, numbers)
      errorMessage = `An unexpected error occurred: ${String(error)}`;
    }

    console.error("Audit Logs API error:", errorMessage);
    throw new Error(errorMessage);
  }
}
