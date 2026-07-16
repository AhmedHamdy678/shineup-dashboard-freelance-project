import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user) {
    const userRoles = user?.roles || [];
    const roleNames = userRoles.map((r) => (typeof r === 'string' ? r : r.name)?.toLowerCase());
    const directRole = (user?.role || '').toLowerCase();

    const allowedAdminRoles = ['admin', 'superadmin', 'super_admin', 'platform'];
    const isAdmin = roleNames.some(r => allowedAdminRoles.includes(r)) || allowedAdminRoles.includes(directRole);

    if (!isAdmin) {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
