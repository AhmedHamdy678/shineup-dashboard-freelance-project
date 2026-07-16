import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIndividualProviders, getCompanyOwners, suspendProvider, getPendingProviders, getAdminProviderDetails } from '../../api/endpoints/providers.api';

export function useIndividualProviders(page = 1, limit = 20, options = {}) {
  return useQuery({
    queryKey: ['individual-providers', page, limit],
    queryFn: () => getIndividualProviders({ page, limit, approvalStatus: 'APPROVED' }),
    ...options,
  });
}

export function useCompanyOwners(page = 1, limit = 20, options = {}) {
  return useQuery({
    queryKey: ['company-owners', page, limit],
    queryFn: () => getCompanyOwners({ page, limit, approvalStatus: 'APPROVED' }),
    ...options,
  });
}

export function usePendingProviders(page = 1, limit = 20, options = {}) {
  return useQuery({
    queryKey: ['pending-providers', page, limit],
    queryFn: () => getPendingProviders({ page, limit }),
    ...options,
  });
}

export function useAdminProviderDetails(providerId, options = {}) {
  return useQuery({
    queryKey: ['admin', 'provider', providerId],
    queryFn: () => getAdminProviderDetails(providerId),
    enabled: !!providerId,
    ...options,
  });
}

export function useSuspendProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suspendProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['individual-providers'] });
      queryClient.invalidateQueries({ queryKey: ['company-owners'] });
    },
  });
}
