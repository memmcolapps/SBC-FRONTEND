import { fetchAuditLogs } from "@/services/audit-logs-service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";

export function useAuditLogs(
  page?: number,
  size?: number,
  dateFrom?: Date,
  dateTo?: Date,
) {
  const { getAccessToken } = useAuth();

  const query = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No token found in local storage");
      }
      const response = await fetchAuditLogs(
        token,
        page,
        size,
        dateFrom,
        dateTo,
      );
      return response.success ? response.data : Promise.reject(response.error);
    },
  });

  return query;
}
