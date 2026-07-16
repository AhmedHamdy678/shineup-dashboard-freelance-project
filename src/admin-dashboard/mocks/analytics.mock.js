export const mockAnalytics = {
  stats: {
    bookings: 5,
    bookingsTrend: "+0%",
    revenue: 320,
    revenueTrend: "+0%",
    platformFees: 32,
    feesTrend: "+0%",
    totalUsers: 7,
    usersTrend: "+0%",
  },

  revenueTrend: [
    { month: "Jun 10", revenue: 0 },
    { month: "Jun 11", revenue: 0 },
    { month: "Jun 12", revenue: 0 },
    { month: "Jun 13", revenue: 0 },
    { month: "Jun 14", revenue: 320 },
    { month: "Jun 15", revenue: 0 },
    { month: "Jun 16", revenue: 0 },
  ],

  bookingsByCategory: [
    { name: "Wash", value: 60, color: "#3B82F6" },
    { name: "Repair", value: 20, color: "#22C55E" },
    { name: "Diagnostics", value: 20, color: "#F59E0B" },
  ],

  topServices: [
    { rank: 1, name: "Express Wash", bookings: 1, totalValue: 80 },
    { rank: 4, name: "Brake Service", bookings: 1, totalValue: 450 },
    { rank: 5, name: "Diagnostic Check", bookings: 1, totalValue: 0 },
  ],

  userAcquisition: [
    { period: "This Month", activeExisting: 7, newSignups: 0 },
  ],

  paymentMethods: [
    { name: "CREDIT_CARD", value: 100, color: "#3B82F6" },
  ],

  topBusinesses: [],
};
