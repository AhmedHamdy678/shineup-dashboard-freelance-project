import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "../../api/endpoints/providerDashboard.api";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: getDashboardOverview,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
