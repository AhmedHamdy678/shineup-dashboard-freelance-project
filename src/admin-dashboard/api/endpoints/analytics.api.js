import axiosClient from '../axiosClient';
import { mockAnalytics } from '../../mocks/analytics.mock';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getAnalytics = async (period = 'month') => {
  if (useMock) {
    return Promise.resolve(mockAnalytics);
  }
  const { data } = await axiosClient.get('/admin/analytics', { params: { period } });
  return data;
};
