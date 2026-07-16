import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "../../api/endpoints/dashboard.api";

export function useGetDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverview,
    staleTime: 1000 * 60, // 1 minute
  });
}
