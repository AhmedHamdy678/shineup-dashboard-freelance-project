/**
 * Payment / Transaction API calls.
 * Supports toggling between Mock Data and Real API endpoints.
 */
import axiosClient from '../axiosClient';
// 1. استيراد البيانات الوهمية الخاصة بالمدفوعات (تأكد من إنشاء هذا الملف في مجلد mocks)
import { mockPayments } from '../../mocks/payments.mock';

// 2. قراءة حالة المفتاح من ملف الـ .env
const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";

/** GET /payments — list all payment transactions with optional filters. */
export const getPayments = async (params = {}) => {
  // 3. إذا كان وضع الـ Mock مفعلًا، ارجع البيانات المالية الوهمية فوراً
  if (useMock) {
    return Promise.resolve({
      list: mockPayments.list || [],
      stats: mockPayments.stats || { totalEarnings: 0, platformCommission: 0 },
      pagination: {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        total: mockPayments.list?.length || 0
      }
    });
  }

  // 4. إذا كان مقفلاً (false)، اتصل بالباك إند الحقيقي مرسلاً فلاتر البحث والصفحات
  const { data } = await axiosClient.get('/payments', { params });
  return data;
};