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

export const getCustomerDetails = async (customerId) => {
  if (useMock) {
    // If mock, we might not have a specific function for it, but just simulate
    const list = getMockCustomers({ page: 1, limit: 100 });
    return list.items.find((c) => c.id === customerId) || null;
  }
  const { data } = await axiosClient.get(`/admin/users/customers/${customerId}`);
  return data;
};
