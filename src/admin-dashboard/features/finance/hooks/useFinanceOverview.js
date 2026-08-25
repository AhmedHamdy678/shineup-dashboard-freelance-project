import { useQuery } from '@tanstack/react-query';
import { getFinanceOverview } from '../../../api/endpoints/finance.api';

export const useFinanceOverview = () => {
  return useQuery({
    queryKey: ['admin-finance-overview'],
    queryFn: getFinanceOverview,
  });
};
