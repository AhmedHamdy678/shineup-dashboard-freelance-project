import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function SuperAdminGuard({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user) {
    const userRoles = user?.roles || [];
    const roleNames = userRoles.map((r) => (typeof r === 'string' ? r : r.name)?.toLowerCase());
    const directRole = (user?.role || '').toLowerCase();

    // Strict check for exactly 'super_admin'
    const isSuperAdmin = roleNames.includes('super_admin') || directRole === 'super_admin';

    if (!isSuperAdmin) {
      return <Navigate to="/admin" replace />;
    }
  }

  return children ? children : <Outlet />;
}
