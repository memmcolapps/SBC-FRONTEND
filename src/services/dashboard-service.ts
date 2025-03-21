// services/dashboard-service.ts
import axios from "axios";

const DASHBOARD_API_URL =
  "https://api-gateway-service-production-8999.up.railway.app/smarte/organization/operator/api/dashboard";

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

interface DashboardResponse {
  responsecode: string;
  responsedesc: string;
  responsedata: {
    data: {
      content: Array<{
        description: string;
        createdAt: string;
        creator: {
          email: string;
        };
      }>;
    };
    totalBreakers: number;
    totalOperators: number;
    totalActiveOperators: number;
    totalInactiveOperators: number;
  };
}

export async function fetchDashboardData(
  token: string,
): Promise<DashboardData> {
  try {
    const response = await axios.get<DashboardResponse>(DASHBOARD_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.responsecode !== "000") {
      throw new Error(response.data.responsedesc);
    }

    const responsedata = response.data.responsedata; // Explicitly typed variable

    const processedData: DashboardData = {
      totalBreakers: responsedata.totalBreakers,
      totalOperators: responsedata.totalOperators,
      totalActiveOperators: responsedata.totalActiveOperators,
      totalInactiveOperators: responsedata.totalInactiveOperators,
      recentActivity: responsedata.data.content.map((item) => ({
        description: item.description,
        createdAt: item.createdAt,
        user: item.creator.email,
      })),
    };

    return processedData;
  } catch (error) {
    throw new Error("Failed to fetch dashboard data");
  }
}
