import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProviderFullProfile, updateProviderProfile } from "../../api/profile.api";

export function useProviderProfileData() {
  return useQuery({
    queryKey: ["provider-profile-full"],
    queryFn: getProviderFullProfile,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProviderProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProviderProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-profile-full"] });
    },
  });
}
