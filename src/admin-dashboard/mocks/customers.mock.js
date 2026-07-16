const items = [
  {
    id: 'cust_1',
    fullName: 'أحمد محمد',
    phone: '01012345678',
    email: 'ahmed@example.com',
    status: 'ACTIVE',
    roles: ['customer'],
    bookingsCount: 5,
    completedBookingsCount: 3,
    cancelledBookingsCount: 1,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'cust_2',
    fullName: 'سارة علي',
    phone: '01098765432',
    email: 'sara@example.com',
    status: 'ACTIVE',
    roles: ['customer'],
    bookingsCount: 8,
    completedBookingsCount: 6,
    cancelledBookingsCount: 2,
    createdAt: '2026-05-15T08:30:00Z',
    updatedAt: '2026-05-15T08:30:00Z',
  },
  {
    id: 'cust_3',
    fullName: 'محمد نور',
    phone: '01055551234',
    email: 'mohamed@example.com',
    status: 'SUSPENDED',
    roles: ['customer'],
    bookingsCount: 2,
    completedBookingsCount: 0,
    cancelledBookingsCount: 2,
    createdAt: '2026-04-20T14:00:00Z',
    updatedAt: '2026-04-20T14:00:00Z',
  },
  {
    id: 'cust_4',
    fullName: 'ليلى سالم',
    phone: '01044443333',
    email: 'laila@example.com',
    status: 'ACTIVE',
    roles: ['customer'],
    bookingsCount: 12,
    completedBookingsCount: 10,
    cancelledBookingsCount: 1,
    createdAt: '2026-03-10T09:15:00Z',
    updatedAt: '2026-03-10T09:15:00Z',
  },
  {
    id: 'cust_5',
    fullName: 'خالد محمود',
    phone: '01077778888',
    email: 'khaled@example.com',
    status: 'INACTIVE',
    roles: ['customer'],
    bookingsCount: 1,
    completedBookingsCount: 0,
    cancelledBookingsCount: 0,
    createdAt: '2026-06-20T16:45:00Z',
    updatedAt: '2026-06-20T16:45:00Z',
  },
];

export const mockCustomers = {
  items,
  meta: {
    page: 1,
    limit: 20,
    total: items.length,
    totalPages: 1,
  },
};

export function getMockCustomers({ page = 1, limit = 20 } = {}) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const sliced = items.slice(start, start + limit);
  return { items: sliced, meta: { page, limit, total, totalPages } };
}
