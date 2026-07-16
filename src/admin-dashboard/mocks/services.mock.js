const mockCategories = {
  cat_1: { id: 'cat_1', nameAr: 'غسيل السيارات', nameEn: 'Car Wash', descriptionAr: 'خدمات تنظيف خارجية وداخلية', descriptionEn: 'Exterior and interior cleaning', image: null, orderSort: 1, activeIs: true },
  cat_2: { id: 'cat_2', nameAr: 'إصلاح وصيانة', nameEn: 'Repair & Maintenance', descriptionAr: 'خدمات الإصلاح الميكانيكي', descriptionEn: 'Mechanical repair services', image: null, orderSort: 2, activeIs: true },
  cat_3: { id: 'cat_3', nameAr: 'تشخيص الأعطال', nameEn: 'Fault Diagnosis', descriptionAr: 'فحوصات تشخيصية إلكترونية', descriptionEn: 'Electronic diagnostic inspections', image: null, orderSort: 3, activeIs: false },
};

let store = [
  {
    id: 'svc_1',
    categoryId: 'cat_1',
    nameAr: 'غسيل سريع',
    nameEn: 'Express Wash',
    type: 'SERVICE',
    descriptionAr: 'غسيل خارجي سريع باستخدام الماء عالي الضغط والرغوة.',
    descriptionEn: 'Quick exterior wash using high-pressure water and foam.',
    image: null,
    activeIs: true,
    category: { ...mockCategories.cat_1 },
  },
  {
    id: 'svc_2',
    categoryId: 'cat_1',
    nameAr: 'غسيل داخلي وخارجي كامل',
    nameEn: 'Full Interior & Exterior',
    type: 'SERVICE',
    descriptionAr: 'حزمة تنظيف شاملة تغطي جميع الأسطح من الداخل والخارج.',
    descriptionEn: 'Complete cleaning package covering all surfaces inside and out.',
    image: null,
    activeIs: true,
    category: { ...mockCategories.cat_1 },
  },
  {
    id: 'svc_3',
    categoryId: 'cat_2',
    nameAr: 'خدمة الفرامل',
    nameEn: 'Brake Service',
    type: 'SERVICE',
    descriptionAr: 'فحص واستبدال وسادات وأقراص الفرامل.',
    descriptionEn: 'Inspection and replacement of brake pads and rotors.',
    image: null,
    activeIs: true,
    category: { ...mockCategories.cat_2 },
  },
  {
    id: 'svc_4',
    categoryId: 'cat_3',
    nameAr: 'فحص تشخيصي',
    nameEn: 'Diagnostic Check',
    type: 'SERVICE',
    descriptionAr: 'مسح كامل لوحدة التحكم الإلكترونية وقراءة رموز الأعطال.',
    descriptionEn: 'Full ECU scan and fault code reading.',
    image: null,
    activeIs: false,
    category: { ...mockCategories.cat_3 },
  },
];

export const getMockServices = () => [...store];

export const addMockService = (payload) => {
  const newItem = { ...payload, id: `svc_${Date.now()}`, type: 'SERVICE', image: null };
  store = [...store, newItem];
  return newItem;
};

export const updateMockService = (id, payload) => {
  store = store.map((s) => (s.id === id ? { ...s, ...payload } : s));
  return store.find((s) => s.id === id);
};

export const deleteMockService = (id) => {
  store = store.filter((s) => s.id !== id);
};
