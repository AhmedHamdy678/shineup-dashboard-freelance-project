import axiosClient from '../axiosClient';
import providerDetailMock from '../../mocks/providerDetail.mock';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getProviderDetail = async (id) => {
  if (useMock) return Promise.resolve(providerDetailMock);
  const { data } = await axiosClient.get(`/admin/providers/${id}`);
  return data;
};

export const suspendProviderDetail = async (id) => {
  if (useMock) return Promise.resolve({ success: true });
  const { data } = await axiosClient.patch(`/admin/providers/${id}/status`, {
    status: 'SUSPENDED',
  });
  return data;
};
