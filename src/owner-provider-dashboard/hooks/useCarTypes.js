import { useQuery } from "@tanstack/react-query";
import { fetchCarTypes } from "../api/carTypes.api";

export function useCarTypes() {
  return useQuery({
    queryKey: ["car-types"],
    queryFn: fetchCarTypes,
    staleTime: 1000 * 60 * 10,
  });
}
