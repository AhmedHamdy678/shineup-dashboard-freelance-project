import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../../admin-dashboard/api/axiosClient";

export function useGetAuditLog(page = 1, limit = 15) {
  return useQuery({
    queryKey: ["audit-log", page, limit],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/authorization/audit?page=${page}&limit=${limit}`);
      return data;
    },
    keepPreviousData: true, // Prevents layout shift while fetching next page
  });
}
