let store = [
  {
    id: 'cat_1',
    nameAr: 'غسيل السيارات',
    nameEn: 'Car Wash',
    descriptionAr: 'خدمات تنظيف خارجية وداخلية لجميع أنواع المركبات.',
    descriptionEn: 'Exterior and interior cleaning services for all vehicle types.',
    orderSort: 1,
    activeIs: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'cat_2',
    nameAr: 'إصلاح وصيانة',
    nameEn: 'Repair & Maintenance',
    descriptionAr: 'خدمات الإصلاح الميكانيكي والصيانة الدورية.',
    descriptionEn: 'Mechanical repair services and periodic maintenance.',
    orderSort: 2,
    activeIs: true,
    createdAt: '2026-06-02T00:00:00Z',
  },
  {
    id: 'cat_3',
    nameAr: 'تشخيص الأعطال',
    nameEn: 'Fault Diagnosis',
    descriptionAr: 'فحوصات تشخيصية إلكترونية وميكانيكية.',
    descriptionEn: 'Electronic and mechanical diagnostic inspections.',
    orderSort: 3,
    activeIs: false,
    createdAt: '2026-06-03T00:00:00Z',
  },
];

export const getMockCategories = () => [...store];

export const addMockCategory = (payload) => {
  const newItem = { ...payload, id: `cat_${Date.now()}`, createdAt: new Date().toISOString() };
  store = [...store, newItem];
  return newItem;
};

export const updateMockCategory = (id, payload) => {
  store = store.map((c) => (c.id === id ? { ...c, ...payload } : c));
  return store.find((c) => c.id === id);
};

export const deleteMockCategory = (id) => {
  store = store.filter((c) => c.id !== id);
};
