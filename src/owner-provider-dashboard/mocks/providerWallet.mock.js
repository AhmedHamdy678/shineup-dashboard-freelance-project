export const mockWalletOverview = {
  balance: 8450,
  totalEarnings: 18450,
  pending: 3200,
  currency: "EGP",
};

export const mockWithdrawalHistory = [
  { id: "w1", type: "withdrawal", amount: 2000, date: "2026-06-20", status: "completed" },
  { id: "w2", type: "deposit", amount: 4500, date: "2026-06-18", status: "completed" },
  { id: "w3", type: "withdrawal", amount: 1000, date: "2026-06-15", status: "completed" },
  { id: "w4", type: "deposit", amount: 3200, date: "2026-06-12", status: "completed" },
  { id: "w5", type: "withdrawal", amount: 500, date: "2026-06-10", status: "pending" },
  { id: "w6", type: "deposit", amount: 1800, date: "2026-06-08", status: "completed" },
];
