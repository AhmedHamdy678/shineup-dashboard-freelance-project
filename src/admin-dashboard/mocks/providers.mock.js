const individualItems = [
  {
    userId: "usr_001",
    providerId: "prov_001",
    displayName: "أحمد حسن",
    phone: "+201001234567",
    email: "ahmed@example.com",
    city: "القاهرة",
    rating: 4.5,
    userStatus: "ACTIVE",
    providerType: "INDIVIDUAL",
    approvalStatus: "PENDING_REVIEW",
    isCurrentlyWorking: true,
    completedBookingsCount: 12,
    cancelledBookingsCount: 3,
    createdAt: "2026-05-15T08:30:00Z",
  },
  {
    userId: "usr_002",
    providerId: "prov_002",
    displayName: "سارة علي",
    phone: "+201009876543",
    email: "sara@example.com",
    city: "الإسكندرية",
    rating: 4.8,
    userStatus: "ACTIVE",
    providerType: "INDIVIDUAL",
    approvalStatus: "APPROVED",
    isCurrentlyWorking: false,
    completedBookingsCount: 45,
    cancelledBookingsCount: 2,
    createdAt: "2026-04-20T10:00:00Z",
  },
  {
    userId: "usr_003",
    providerId: "prov_003",
    displayName: "محمد نور",
    phone: "+201005551234",
    email: "mohamed@example.com",
    city: "الرياض",
    rating: 3.2,
    userStatus: "INACTIVE",
    providerType: "INDIVIDUAL",
    approvalStatus: "REJECTED",
    isCurrentlyWorking: true,
    completedBookingsCount: 3,
    cancelledBookingsCount: 8,
    createdAt: "2026-03-10T14:15:00Z",
  },
];

const companyItems = [
  {
    ownerUserId: "own_001",
    ownerName: "خالد محمود",
    phone: "+201002223333",
    email: "khalid@example.com",
    city: "جدة",
    rating: 4.2,
    userStatus: "ACTIVE",
    providerId: "prov_004",
    providerType: "COMPANY",
    companyName: "كلين تك للحلول",
    approvalStatus: "APPROVED",
    membersCount: 15,
    activeMembersCount: 12,
    completedBookingsCount: 230,
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    ownerUserId: "own_002",
    ownerName: "ليلى سالم",
    phone: "+201004445555",
    email: "laila@example.com",
    city: "الدوحة",
    rating: 3.9,
    userStatus: "ACTIVE",
    providerId: "prov_005",
    providerType: "COMPANY",
    companyName: "أوتو فيكس للصيانة",
    approvalStatus: "PENDING_REVIEW",
    membersCount: 8,
    activeMembersCount: 6,
    completedBookingsCount: 67,
    createdAt: "2026-06-05T11:30:00Z",
  },
];

export function getMockIndividualProviders({ page = 1, limit = 20 } = {}) {
  const total = individualItems.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = individualItems.slice(start, start + limit);
  return { items, meta: { page, limit, total, totalPages } };
}

export function getMockCompanyOwners({ page = 1, limit = 20 } = {}) {
  const total = companyItems.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = companyItems.slice(start, start + limit);
  return { items, meta: { page, limit, total, totalPages } };
}
