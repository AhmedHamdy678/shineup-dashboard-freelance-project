/**
 * Authentication API calls.
 * Returns mock data when VITE_USE_MOCK_DATA === 'true'.
 */
import axiosClient from '../axiosClient';
import { mockLogin } from '../../mocks/auth.mock';

const useMocks = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/** POST /auth/login — authenticate admin credentials. */
export const login = async (phone, password) => {
  if (useMocks) {
    return Promise.resolve(mockLogin(phone, password));
  }
  const { data } = await axiosClient.post('/auth/login', {
    identifier: phone,
    password,
  });
  return { token: data.accessToken, user: data.user, owner_type: data.owner_type, role: data.role };
};

/** POST /auth/logout — invalidate the current session. */
export const logout = async () => {
  if (useMocks) return Promise.resolve();
  const { data } = await axiosClient.post('/auth/logout');
  return data;
};
