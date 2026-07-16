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

export async function getProviderServices() {
  if (useMock) {
    return Promise.resolve(getMockProviderServices());
  }
  const { data } = await providerAxiosClient.get('/providers/me/services', {
    params: {
      limit: 1000,
      all: true,
      includeInactive: true,
      status: 'ALL'
    }
  });
  // The endpoint returns { items: [...] }; unwrap to a plain array.
  return Array.isArray(data?.items) ? data.items : [];
}

export async function addProviderService(payload) {
  if (useMock) {
    return Promise.resolve(addMockProviderService(payload));
  }
  const { data } = await providerAxiosClient.post('/providers/me/services', payload);
  // console.log("addProviderService", data);
  // console.log(payload, " payload  payload  payload ");
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
