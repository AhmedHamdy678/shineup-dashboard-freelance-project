import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProviderDetail,
  suspendProviderDetail,
} from '../../api/endpoints/providerDetail.api';

export function useProviderDetail(id) {
  return useQuery({
    queryKey: ['provider-detail', id],
    queryFn: () => getProviderDetail(id),
    enabled: !!id,
  });
}

export function useSuspendProviderDetail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suspendProviderDetail,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['provider-detail', id] });
    },
  });
}
