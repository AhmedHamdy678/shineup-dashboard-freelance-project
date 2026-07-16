export const mockDashboardStats = {
  totalRevenue: 320,
  platformFees: 32,
  totalUsers: 7,
  newUsersThisWeek: 7,
  pendingBusinesses: 3,
  bookingTrends: [
    { date: "06-15", bookings: 0 },
    { date: "06-16", bookings: 1 },
    { date: "06-17", bookings: 0 },
    { date: "06-18", bookings: 2 },
    { date: "06-19", bookings: 6 },
  ],
  services: [
    { name: "غسيل", percentage: 60, color: "#3B82F6" },
    { name: "إصلاح", percentage: 20, color: "#22C55E" },
    { name: "تشخيص", percentage: 20, color: "#F59E0B" },
  ],
  topProviders: [
    { name: "Shine & Co. Detailing", city: "Cairo", bookings: 2, rating: 5.0 },
  ],
};
