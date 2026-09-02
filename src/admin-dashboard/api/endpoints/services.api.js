import axiosClient from '../axiosClient';
import {
  getMockServices,
  addMockService,
  updateMockService,
  deleteMockService,
} from '../../mocks/services.mock';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getServices = async () => {
  if (useMock) return Promise.resolve(getMockServices());
  const { data } = await axiosClient.get('/admin/catalog/services');
  return data;
};

export const createService = async (payload) => {
  if (useMock) return Promise.resolve(addMockService(payload));

  const cleanPayload = {
    nameAr: payload.nameAr || undefined,
    nameEn: payload.nameEn || undefined,
    descriptionAr: payload.descriptionAr || undefined,
    descriptionEn: payload.descriptionEn || undefined,
    categoryId: payload.categoryId,
    type: 'SERVICE',
    activeIs: payload.activeIs !== undefined ? payload.activeIs : true,
    image: payload.image || undefined,
    orderSort: payload.orderSort ? Number(payload.orderSort) : undefined,
  };

  Object.keys(cleanPayload).forEach((key) => {
    if (cleanPayload[key] === undefined) delete cleanPayload[key];
  });

  const { data } = await axiosClient.post('/admin/catalog/services', cleanPayload);
  return data;
};

export const updateService = async (id, payload) => {
  if (useMock) return Promise.resolve(updateMockService(id, payload));

  const cleanPayload = {
    nameAr: payload.nameAr || undefined,
    nameEn: payload.nameEn || undefined,
    descriptionAr: payload.descriptionAr || undefined,
    descriptionEn: payload.descriptionEn || undefined,
    categoryId: payload.categoryId || undefined,
    activeIs: payload.activeIs !== undefined ? payload.activeIs : undefined,
    image: payload.image || undefined,
    orderSort: payload.orderSort ? Number(payload.orderSort) : undefined,
  };

  Object.keys(cleanPayload).forEach((key) => {
    if (cleanPayload[key] === undefined) delete cleanPayload[key];
  });

  const { data } = await axiosClient.patch(`/admin/catalog/services/${id}`, cleanPayload);
  return data;
};

export const deleteService = async (id) => {
  if (useMock) return Promise.resolve(deleteMockService(id));
  await axiosClient.delete(`/admin/catalog/services/${id}`);
};

export const reorderServices = async (categoryId, items) => {
  if (useMock) return;
  const { data } = await axiosClient.patch('/admin/catalog/order/services', { categoryId, items });
  return data;
};
