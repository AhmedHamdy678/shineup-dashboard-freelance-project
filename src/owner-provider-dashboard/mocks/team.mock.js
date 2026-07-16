export let mockTeam = [
  {
    id: "m1",
    name: "Ahmed Ali",
    phone: "01012345678",
    email: "ahmed.ali@glowfix.com",
    status: "ACTIVE",
    isCurrentlyWorking: true,
    completedBookings: 45,
    cancelledBookings: 2,
    avgRating: 4.9,
    canEditServices: true,
    canEditPrices: true,
    joinedAt: "2026-01-10T10:00:00Z"
  },
  {
    id: "m2",
    name: "Mohamed Kamel",
    phone: "01123456789",
    email: "mohamed.kamel@glowfix.com",
    status: "ACTIVE",
    isCurrentlyWorking: false,
    completedBookings: 32,
    cancelledBookings: 4,
    avgRating: 4.7,
    canEditServices: true,
    canEditPrices: false,
    joinedAt: "2026-02-15T11:00:00Z"
  },
  {
    id: "m3",
    name: "Youssef Hassan",
    phone: "01234567890",
    email: "youssef.hassan@glowfix.com",
    status: "ACTIVE",
    isCurrentlyWorking: true,
    completedBookings: 18,
    cancelledBookings: 1,
    avgRating: 4.5,
    canEditServices: false,
    canEditPrices: false,
    joinedAt: "2026-03-20T09:30:00Z"
  },
  {
    id: "m4",
    name: "Mostafa Mahmoud",
    phone: "01545678901",
    email: "mostafa.mahmoud@glowfix.com",
    status: "SUSPENDED",
    isCurrentlyWorking: false,
    completedBookings: 50,
    cancelledBookings: 8,
    avgRating: 4.3,
    canEditServices: false,
    canEditPrices: true,
    joinedAt: "2026-04-05T14:20:00Z"
  },
  {
    id: "m5",
    name: "Khaled Ibrahim",
    phone: "01098765432",
    email: "khaled.ibrahim@glowfix.com",
    status: "ACTIVE",
    isCurrentlyWorking: false,
    completedBookings: 0,
    cancelledBookings: 0,
    avgRating: null,
    canEditServices: true,
    canEditPrices: true,
    joinedAt: "2026-06-01T16:45:00Z"
  }
];

export const getMockMembers = () => {
  return [...mockTeam];
};

export const addMockMember = (payload) => {
  const newMember = {
    id: `m_${Date.now()}`,
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    status: "ACTIVE",
    isCurrentlyWorking: false,
    completedBookings: 0,
    cancelledBookings: 0,
    avgRating: null,
    canEditServices: payload.canEditServices ?? false,
    canEditPrices: payload.canEditPrices ?? false,
    joinedAt: new Date().toISOString()
  };
  mockTeam = [newMember, ...mockTeam]; // Add to top of the list
  return newMember;
};

export const updateMockMember = (id, payload) => {
  mockTeam = mockTeam.map((m) =>
    m.id === id ? { ...m, ...payload } : m
  );
  return mockTeam.find((m) => m.id === id);
};

export const deleteMockMember = (id) => {
  mockTeam = mockTeam.filter((m) => m.id !== id);
  return { success: true };
};
