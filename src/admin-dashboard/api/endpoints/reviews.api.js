/**
 * Review API calls.
 * Supports toggling between Mock Data and Real API endpoints.
 */
import axiosClient from '../axiosClient';
// 1. استيراد البيانات الوهمية الخاصة بالتقييمات (تأكد من إنشاء هذا الملف في مجلد mocks)
import { mockReviews } from '../../mocks/reviews.mock';

// 2. قراءة حالة المفتاح من ملف الـ .env
const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";

/** GET /reviews — list all reviews with optional filters. */
export const getReviews = async (params = {}) => {
  // 3. إذا كان وضع الـ Mock مفعلًا، ارجع بيانات التقييمات الوهمية فوراً
  if (useMock) {
    return Promise.resolve({
      reviews: mockReviews.list || [],
      stats: mockReviews.stats || { averageRating: 0, totalReviews: 0 },
      pagination: {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        total: mockReviews.list?.length || 0
      }
    });
  }

  // 4. إذا كان مقفلاً (false)، اتصل بالباك إند الحقيقي مرسلاً الفلاتر (مثل التقييمات النجمية أو حسب الـ provider)
  const { data } = await axiosClient.get('/reviews', { params });
  return data;
};