import { useQuery } from '@tanstack/react-query';
import { getCustomerDetails } from '../../api/endpoints/customers.api';

export function useCustomerDetails(customerId, options = {}) {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => getCustomerDetails(customerId),
    enabled: !!customerId,
    ...options,
  });
}
