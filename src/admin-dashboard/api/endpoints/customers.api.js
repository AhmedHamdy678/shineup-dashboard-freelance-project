import axiosClient from '../axiosClient';
import { getMockCustomers } from '../../mocks/customers.mock';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getCustomers = async ({ page = 1, limit = 20 } = {}) => {
  if (useMock) return getMockCustomers({ page, limit });
  const { data } = await axiosClient.get('/admin/users/customers', {
    params: { page, limit, sortBy: 'createdAt', sortOrder: 'desc' },
  });
  return data;
};
