import providerAxiosClient from './providerAxiosClient';
import {
  getMockCatalogServices,
  getMockProviderServices,
  addMockProviderService,
  updateMockProviderService,
  deleteMockProviderService
} from '../mocks/services.mock';

  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';


export async function fetchCatalogServices() {
  // Catalog endpoint returns a plain array: [{ id, name, category, ... }]
  const { data } = await providerAxiosClient.get('/catalog/services');
  return Array.isArray(data) ? data : [];
}


export async function getCatalogServices() {
  return fetchCatalogServices();
}

export async function getProviderServices(availableIs) {
  if (useMock) {
    return Promise.resolve(getMockProviderServices());
  }
  const params = {};
  if (availableIs !== undefined && availableIs !== null) {
    params.availableIs = availableIs;
  }
  const { data } = await providerAxiosClient.get('/providers/me/services', { params });
  // The endpoint returns { items: [...] }; unwrap to a plain array.
  return Array.isArray(data?.items) ? data.items : [];
}

export async function addProviderService(payload) {
  if (useMock) {
    return Promise.resolve(addMockProviderService(payload));
  }
  const { data } = await providerAxiosClient.post('/providers/me/services', payload);
  return data;
}


export async function updateProviderService({ id, ...payload }) {
  if (useMock) {
    return Promise.resolve(updateMockProviderService(id, payload));
  }
  const { data } = await providerAxiosClient.patch(`/providers/me/services/${id}/configuration`, payload);
  return data;
}

export async function updateProviderServicePrices({ id, prices }) {
  if (useMock) {
    return Promise.resolve(updateMockProviderService(id, { prices }));
  }
  const { data } = await providerAxiosClient.patch(`/providers/me/services/${id}/prices`, { prices });
  return data;
}

export async function deleteProviderService(id) {
  if (useMock) {
    return Promise.resolve(deleteMockProviderService(id));
  }
  const { data } = await providerAxiosClient.delete(`/providers/me/services/${id}`);
  return data;
}
