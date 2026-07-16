import { useNavigate } from 'react-router-dom';
import useProviderAuthStore from '../store/providerAuthStore';
import { providerLogin as loginApi } from '../api/endpoints/providerAuth.api';

export default function useProviderAuth() {
  const navigate = useNavigate();
  const store = useProviderAuthStore();

  const login = async (phone, password) => {
    const { user, token } = await loginApi(phone, password);
    store.login(user, token);
    navigate('/provider');
  };

  const logout = () => {
    store.logout();
    navigate('/login');
  };

  return { ...store, login, logout };
}
