import axiosClient from '../axiosClient';

export const approveCancellationRequest = async (cancelBookingId) => {
  const { data } = await axiosClient.patch(`/admin/booking-cancellation-requests/${cancelBookingId}/approve`);
  return data;
};

export const rejectCancellationRequest = async (cancelBookingId) => {
  const { data } = await axiosClient.patch(`/admin/booking-cancellation-requests/${cancelBookingId}/reject`);
  return data;
};
