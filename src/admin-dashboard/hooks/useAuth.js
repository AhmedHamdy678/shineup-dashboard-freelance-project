/**
 * Convenience hook that returns the auth store so components don't
 * need to import both 'useAuthStore' and 'useNavigate' for logout.
 */
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { login as loginApi } from '../api/endpoints/auth.api';
import axiosClient from '../api/axiosClient';

export default function useAuth() {
  const navigate = useNavigate();
  const store = useAuthStore();

  /** Authenticate via the API, then update the store on success. */
  const login = async (phone, password) => {
    const { user, token } = await loginApi(phone, password);
    store.login(user, token);
    navigate('/admin');
  };

  /** Logout — deactivates device, clears store and redirects to /login. */
  const logout = async () => {
    const deviceUuid = localStorage.getItem('notificationDeviceUuid');
    
    if (deviceUuid) {
      try {
        // Call the API without blocking the UI
        await axiosClient.patch(`/notifications/devices/${deviceUuid}/deactivate`);
      } catch (error) {
        console.error('Failed to deactivate notification device, but proceeding with logout', error);
      }
    }

    store.logout();
    navigate('/login');
  };

  return { ...store, login, logout };
}
