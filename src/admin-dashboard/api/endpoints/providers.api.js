import axiosClient from '../axiosClient';
import { getMockIndividualProviders, getMockCompanyOwners } from '../../mocks/providers.mock';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getIndividualProviders = async ({ page = 1, limit = 20, approvalStatus } = {}) => {
  if (useMock) return getMockIndividualProviders({ page, limit });
  const { data } = await axiosClient.get('/admin/users/individual-providers', {
    params: { page, limit, sortBy: 'createdAt', sortOrder: 'desc', ...(approvalStatus && { approvalStatus }) },
  });
  return data;
};

export const getCompanyOwners = async ({ page = 1, limit = 20, approvalStatus } = {}) => {
  if (useMock) return getMockCompanyOwners({ page, limit });
  const { data } = await axiosClient.get('/admin/users/company-owners', {
    params: { page, limit, sortBy: 'createdAt', sortOrder: 'desc', ...(approvalStatus && { approvalStatus }) },
  });
  return data;
};

export const getPendingProviders = async ({ page = 1, limit = 20 } = {}) => {
  if (useMock) return { items: [], meta: { page, limit, total: 0, totalPages: 0 } }; // Basic mock for pending
  const { data } = await axiosClient.get('/admin/providers/pending', {
    params: { page, limit },
  });
  return data;
};

export const getCompanyOwnerDetail = async (ownerUserId) => {
  // If mocks were needed for detail we could add them, but for now we fetch directly
  const { data } = await axiosClient.get(`/admin/users/company-owners/${ownerUserId}`);
  return data;
};

export const getAdminProviderDetails = async (providerId) => {
  const { data } = await axiosClient.get(`/admin/providers/${providerId}`);
  return data;
};

export const suspendProvider = async (providerId) => {
  if (useMock) return Promise.resolve({ success: true });
  const { data } = await axiosClient.patch(`/admin/providers/${providerId}/status`, {
    status: 'SUSPENDED',
  });
  return data;
};

export const approveProvider = async (providerId) => {
  const { data } = await axiosClient.patch(`/admin/providers/${providerId}/approve`);
  return data;
};

export const rejectProvider = async ({ providerId, reason }) => {
  const { data } = await axiosClient.patch(`/admin/providers/${providerId}/reject`, { reason });
  return data;
};
