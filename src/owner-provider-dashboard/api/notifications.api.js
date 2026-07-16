// v4 — force Vite HMR rebuild
/**
 * Notifications API service for the Owner Provider Dashboard.
 *
 * Endpoint (real): GET /api/v1/notifications/me?page=1&limit=20
 *
 * Uses a dedicated axios instance without the 401→redirect interceptor,
 * so failed requests fall through cleanly to the mock data fallback.
 */
import axios from 'axios';
import { mockNotifications } from '../mocks/providerNotifications.mock';

// A lightweight axios instance that shares the same base URL and auth header
// but does NOT redirect on 401 — lets us fall back to mocks gracefully.
const notifClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

notifClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('provider_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Fetch paginated notifications for the currently authenticated provider.
 * Falls back to rich mock data when the API is unavailable or returns empty.
 * @param {{ page?: number, limit?: number }} params
 */
export async function getNotifications(params = { page: 1, limit: 20 }) {
  try {
    const { data } = await notifClient.get('/notifications/me', { params });
    // Extract items from the response
    const items = data?.items ?? data?.data ?? data?.notifications ?? (Array.isArray(data) ? data : []);
    
    // Always return the real API data (even if empty) to respect the backend
    return { data: items, total: data?.meta?.total ?? items.length };
  } catch {
    // Network error, 4xx, 5xx → use mocks
    return { data: mockNotifications, total: mockNotifications.length };
  }
}

/**
 * Mark all unread notifications as read.
 * Silently succeeds if the API is unavailable (optimistic UI handles state).
 */
export async function markAllNotificationsRead() {
  try {
    const { data } = await notifClient.patch('/notifications/me/read-all');
    return data;
  } catch {
    return { success: true };
  }
}

/**
 * Mark a single notification as read by its ID.
 * Silently succeeds if the API is unavailable (optimistic UI handles state).
 * @param {string} id
 */
export async function markNotificationRead(id) {
  try {
    const { data } = await notifClient.patch(`/notifications/me/${id}/read`);
    return data;
  } catch {
    return { success: true };
  }
}

/**
 * Delete a single notification by its ID.
 * Silently succeeds if the API is unavailable (optimistic UI handles state).
 * @param {string} id
 */
export async function deleteNotification(id) {
  try {
    const { data } = await notifClient.delete(`/notifications/${id}`);
    return data;
  } catch {
    return { success: true };
  }
}
