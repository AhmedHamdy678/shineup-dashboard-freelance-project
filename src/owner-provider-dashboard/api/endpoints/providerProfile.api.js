import providerAxiosClient from '../providerAxiosClient';

export async function getProviderProfile() {
  const { data } = await providerAxiosClient.get('/providers/me');
  return data;
}

export async function updateProviderProfile(payload) {
  const { data } = await providerAxiosClient.patch('/providers/me', payload);
  return data;
}

export async function submitProviderOnboarding(formData) {
  const { data } = await providerAxiosClient.post('/providers/onboarding', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function resubmitApplication() {
  const { data } = await providerAxiosClient.post('/providers/me/resubmit');
  return data;
}
