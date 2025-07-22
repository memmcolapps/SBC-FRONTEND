// auditLogsService.ts
import axios, { type AxiosError } from "axios";
import { env } from "@/env";
import { handleApiError } from "error";

const AUDIT_LOGS_API_URL = env.NEXT_PUBLIC_BASE_URL;

interface Role {
  id: string;
  orgId: string;
  userId: string;
  userRole: string;
}

interface Creator {
  id: string;
  orgId: string;
  firstname: string;
  lastname: string;
  position: string;
  email: string;
  password: string;
  location: string;
  status: boolean;
  permission: boolean;
  active: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  creator: Creator;
  description: string;
  type: string;
  ipAddress: string;
  userAgent: string;
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

// For the service function return type
type AuditLogsResult =
  | { success: true; data: AuditLogsResponseData }
  | { success: false; error: string };

export async function fetchAuditLogs(
  token: string,
  page?: number,
  size?: number,
  dateFrom?: Date,
  dateTo?: Date,
): Promise<AuditLogsResult> {
  try {
    if (!page) page = 0;
    if (!size) size = 10;
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());

    if (dateFrom) {
      params.append("startDate", dateFrom.toISOString().substring(0, 10));
    }
    if (dateTo) {
      params.append("endDate", dateTo.toISOString().substring(0, 10));
    }

    const response = await axios.get<AuditLogsResponse>(
      `${AUDIT_LOGS_API_URL}/v1/api/audit/service/logs`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        params,
      },
    );

    if (response.data.responsecode !== "000") {
      return {
        success: false,
        error: response.data.responsedesc || "Failed to fetch audit logs",
      };
    }

    return {
      success: true,
      data: response.data.responsedata,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: handleApiError(error),
    };
  }
}
