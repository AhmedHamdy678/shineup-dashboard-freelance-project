import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProviderProfile,
  submitProviderOnboarding,
  resubmitApplication,
} from '../../../api/endpoints/providerProfile.api';

export function useProviderProfile(isAuthenticated = true) {
  return useQuery({
    queryKey: ['providerProfile'],
    queryFn: getProviderProfile,
    retry: false, // Don't retry heavily if it might be 404
    enabled: isAuthenticated,
  });
}

export function useSubmitOnboarding() {
  return useMutation({
    mutationFn: (formData) => submitProviderOnboarding(formData),
  });
}

export function useResubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resubmitApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerProfile'] });
    },
  });
}
