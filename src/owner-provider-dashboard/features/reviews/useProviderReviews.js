import { useQuery } from "@tanstack/react-query";
import { getProviderReviewsSummary, getProviderReviews } from "../../api/endpoints/providerReviews.api";

export function useGetReviewsSummary() {
  return useQuery({
    queryKey: ["provider-reviews-summary"],
    queryFn: getProviderReviewsSummary,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetReviews({ page = 1, limit = 10 }) {
  return useQuery({
    queryKey: ["provider-reviews", page, limit],
    queryFn: () => getProviderReviews({ page, limit }),
    staleTime: 1000 * 60 * 5,
  });
}
