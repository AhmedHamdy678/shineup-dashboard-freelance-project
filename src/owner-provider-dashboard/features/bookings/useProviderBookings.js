import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProviderBookings, updateBookingStatus } from "../../api/endpoints/providerBookings.api";

export function useProviderBookings(params) {
  return useQuery({
    queryKey: ["provider-bookings", params],
    queryFn: () => getProviderBookings(params),
    staleTime: 1000 * 60,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["provider-dashboard"] });
    },
  });
}
