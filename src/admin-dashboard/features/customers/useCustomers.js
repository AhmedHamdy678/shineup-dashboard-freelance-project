import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '../../api/endpoints/customers.api';

export function useCustomers(page = 1, limit = 20, options = {}) {
  return useQuery({
    queryKey: ['customers', page, limit],
    queryFn: () => getCustomers({ page, limit }),
    ...options,
  });
}
