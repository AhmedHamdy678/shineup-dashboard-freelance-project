import { create } from 'zustand';

const getInitialUser = () => {
  try {
    const storedUser = localStorage.getItem('provider_auth_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const useProviderAuthStore = create((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('provider_token') || null,
  isAuthenticated: !!localStorage.getItem('provider_token'),
  profileStatus: null,

  login: (user, token) => {
    localStorage.setItem('provider_token', token);
    localStorage.setItem('provider_auth_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('provider_token');
    localStorage.removeItem('provider_auth_user');
    set({ user: null, token: null, isAuthenticated: false, profileStatus: null });
  },

  setUser: (user) => {
    localStorage.setItem('provider_auth_user', JSON.stringify(user));
    set({ user });
  },
  setProfileStatus: (status) => set({ profileStatus: status }),
}));

export default useProviderAuthStore;
