import providerAxiosClient from '../providerAxiosClient';

export async function getProviderReviewsSummary() {
  const { data } = await providerAxiosClient.get('/providers/me/reviews/summary');
  return data;
}

export async function getProviderReviews(params) {
  const { data } = await providerAxiosClient.get('/providers/me/reviews', { params });
  return data;
}
