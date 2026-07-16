import providerAxiosClient from '../providerAxiosClient';

export async function getProviderBookings(params) {
  const { data } = await providerAxiosClient.get('/providers/me/booking-requests', { params });
  return data;
}

export async function getProviderBookingById(id) {
  const { data } = await providerAxiosClient.get(`/providers/me/booking-requests/${id}`);
  return data;
}

export async function updateBookingStatus(id, status) {
  const { data } = await providerAxiosClient.patch(`/provider/bookings/${id}/status`, { status });
  return data;
}
