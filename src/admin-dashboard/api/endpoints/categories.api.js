import axiosClient from '../axiosClient';
import {
  getMockCategories,
  addMockCategory,
  updateMockCategory,
  deleteMockCategory,
} from '../../mocks/categories.mock';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// 1. جلب الفئات
export const getCategories = async () => {
  if (useMock) return getMockCategories();
  const { data } = await axiosClient.get('/admin/catalog/service-categories');
  return data;
};

// 2. إنشاء فئة جديدة
export const createCategory = async (payload) => {
  if (useMock) return addMockCategory(payload);

  // نقوم ببناء كائن نظيف؛ إذا كان الحقل فارغاً نمرر له undefined ليتم حذفه تلقائياً
  const cleanPayload = {
    nameAr: payload.nameAr,
    nameEn: payload.nameEn,
    descriptionAr: payload.descriptionAr || undefined,
    descriptionEn: payload.descriptionEn || undefined,
    // لا نحول الرقم إلا إذا كان هناك قيمة مكتوبة فعلياً، وإلا نرسل undefined
    orderSort: payload.orderSort ? Number(payload.orderSort) : undefined,
    // نضمن إرسال قيمة بولين صحيحة، وإذا لم توجد نرسل true كافتراضي
    activeIs: payload.activeIs !== undefined ? payload.activeIs : true,
  };

  const { data } = await axiosClient.post('/admin/catalog/service-categories', cleanPayload);
  return data;
};

// 3. تعديل فئة موجودة
export const updateCategory = async (id, payload) => {
  if (useMock) return updateMockCategory(id, payload);

  const cleanPayload = {
    nameAr: payload.nameAr || undefined,
    nameEn: payload.nameEn || undefined,
    descriptionAr: payload.descriptionAr || undefined,
    descriptionEn: payload.descriptionEn || undefined,
    orderSort: payload.orderSort ? Number(payload.orderSort) : undefined,
    activeIs: payload.activeIs !== undefined ? payload.activeIs : undefined,
  };

  // بما أنها PATCH، يفضل حذف أي حقل قيمته undefined حتى نحدث فقط ما تغير
  Object.keys(cleanPayload).forEach(key => {
    if (cleanPayload[key] === undefined) {
      delete cleanPayload[key];
    }
  });

  const { data } = await axiosClient.patch(`/admin/catalog/service-categories/${id}`, cleanPayload);
  return data;
};

// 4. حذف فئة
export const deleteCategory = async (id) => {
  if (useMock) return deleteMockCategory(id);
  await axiosClient.delete(`/admin/catalog/service-categories/${id}`);
};

// 5. ترتيب الفئات
export const reorderCategories = async (items) => {
  if (useMock) return;
  const { data } = await axiosClient.patch('/admin/catalog/order/service-categories', { items });
  return data;
};