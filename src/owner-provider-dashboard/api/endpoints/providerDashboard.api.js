import providerAxiosClient from '../providerAxiosClient';

export async function getDashboardOverview() {
  const { data } = await providerAxiosClient.get('/providers/me/dashboard/overview');
  return data;
}
