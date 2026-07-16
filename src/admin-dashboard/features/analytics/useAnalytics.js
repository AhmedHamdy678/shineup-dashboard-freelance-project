import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../../api/endpoints/analytics.api';

export function useAnalytics(period = 'month') {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: () => getAnalytics(period),
  });
}
