import providerAxiosClient from '../providerAxiosClient';

export async function getProviderServices() {
  const { data } = await providerAxiosClient.get('/providers/me/services');
  return data;
}

export async function updateProviderService(id, payload) {
  const { data } = await providerAxiosClient.patch(`/providers/me/services${id}`, payload);
  return data;
}

