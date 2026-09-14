import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../../../admin-dashboard/api/axiosClient";

export function useGetAuthorizationOverview() {
  return useQuery({
    queryKey: ["authorization-overview"],
    queryFn: async () => {
      const { data } = await axiosClient.get("/authorization/overview");
      return data?.data || data || {};
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCheckPermission() {
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post("/authorization/check", payload);
      return data;
    },
  });
}
