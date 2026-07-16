import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../../api/endpoints/dashboard.api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60, // الداتا تفضل "طازة" لمدة دقيقة قبل ما تتطلب تاني
  });
}
