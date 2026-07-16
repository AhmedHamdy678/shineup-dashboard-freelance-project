import providerAxiosClient from './providerAxiosClient';

export async function getProviderFullProfile() {
  const { data } = await providerAxiosClient.get('/providers/me');
  return data?.data || data;
}

export async function updateProviderProfile(formData) {
  // Use native fetch to completely bypass Axios's global 'application/json' headers
  // This guarantees the browser natively sets multipart/form-data and the correct boundary
  const token = localStorage.getItem('provider_token');
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  
  const response = await fetch(`${baseURL}/providers/me`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
      // Do NOT set Content-Type, fetch will automatically set it to multipart/form-data with the boundary
    },
    body: formData
  });

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw { response: { data } };
  }
  
  return data?.data || data;
}
