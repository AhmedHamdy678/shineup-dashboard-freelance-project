import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useProviderAuthStore from '../store/providerAuthStore';
import { useProviderProfile } from '../features/profile/hooks/useProviderProfileHooks';
import PageSkeleton from '../../shared/components/ui/PageSkeleton';

export default function ProviderProtectedRoute() {
  const isAuthenticated = useProviderAuthStore((s) => s.isAuthenticated);
  const user = useProviderAuthStore((s) => s.user);
  const setProfileStatus = useProviderAuthStore((s) => s.setProfileStatus);
  const profileStatus = useProviderAuthStore((s) => s.profileStatus);
  const location = useLocation();

  const { data, isLoading, isError, error } = useProviderProfile(isAuthenticated);

  useEffect(() => {
    if (data?.statusCode) {
      setProfileStatus(data.statusCode);
    } else if (isError && error?.response?.status === 404) {
      setProfileStatus('INCOMPLETE');
    }
  }, [data, isError, error, setProfileStatus]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user) {
    const userRoles = user?.roles || [];
    const roleNames = userRoles.map((r) => (typeof r === 'string' ? r : r.name)?.toLowerCase());
    const directRole = (user?.role || user?.type || '').toLowerCase();
    
    const allowedProviderRoles = ['provider_owner', 'provider', 'owner', 'provider_applicant'];
    const isProvider = roleNames.some((r) => allowedProviderRoles.includes(r)) || allowedProviderRoles.includes(directRole);

    if (!isProvider) {
      return <Navigate to="/login" replace />;
    }
  }

  if (isLoading && !profileStatus) {
    return <PageSkeleton />;
  }

  const isComplete = profileStatus !== 'INCOMPLETE';
  const isPending = profileStatus === 'PENDING_REVIEW' || profileStatus === 'PENDING';
  const isRejected = profileStatus === 'REJECTED';
  
  if (!isComplete && location.pathname !== '/provider/onboarding') {
    return <Navigate to="/provider/onboarding" replace />;
  }

  // Restrict PENDING users to the base dashboard route
  if (isPending && location.pathname !== '/provider') {
    return <Navigate to="/provider" replace />;
  }

  // Restrict REJECTED users to the base dashboard route and the profile edit page
  if (isRejected && location.pathname !== '/provider' && location.pathname !== '/provider/profile') {
    return <Navigate to="/provider" replace />;
  }

  return <Outlet />;
}
