/**
 * Booking API calls.
 * Supports toggle between Mock Data and Real API.
 */
import axiosClient from '../axiosClient';
// 1. استيراد البيانات الوهمية الخاصة بالحجوزات (تخيل أنك أنشأت هذا الملف)
import { mockBookings } from '../../mocks/bookings.mock';

// 2. قراءة حالة المفتاح من ملف الـ .env
const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";

/** GET /bookings — list all bookings with optional filters. */
export const getBookings = async (params = {}) => {
  // 3. إذا كان وضع الـ Mock مفعلًا، ارجع البيانات الوهمية فوراً
  if (useMock) {
    return Promise.resolve(mockBookings);
  }

  // 4. إذا كان مقفلاً، اذهب للباك إند الحقيقي
  const { data } = await axiosClient.get('/admin/bookings', { params });
  return data;
};