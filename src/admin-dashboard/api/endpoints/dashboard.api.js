/**
 * Dashboard API calls.
 * While VITE_USE_MOCK_DATA === 'true' the app imports from mocks instead.
 */
import axiosClient from "../axiosClient";
import { mockDashboardStats } from "../../mocks/dashboard.mock";

const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";

// أي component بينادي الـ function دي بس، ومش عارف هي جايبة من mock ولا API حقيقي
export async function getDashboardStats() {
  if (useMock) {
    return mockDashboardStats;
  }
  const { data } = await axiosClient.get("/admin/dashboard/stats");
  return data;
}

export async function getDashboardOverview() {
  const { data } = await axiosClient.get("/admin/dashboard/overview");
  return data;
}
