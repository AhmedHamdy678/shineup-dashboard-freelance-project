/**
 * ProviderTopbar — Top navigation bar for the provider dashboard.
 *
 * Features:
 * - Displays the current page title (resolved from the navigation config)
 * - Bell icon with a live red badge showing unread notification count
 *   (fetched via useProviderNotifications — cached/shared query, no extra request)
 * - Clicking the bell navigates to /provider/notifications
 * - Avatar circle showing the first letter of the provider's name
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { providerAllNav } from '../../constants/providerNavigation';
import useProviderAuthStore from '../../store/providerAuthStore';
import { useProviderNotifications } from '../../features/notifications/useProviderNotifications';

export default function ProviderTopbar({ setIsMobileMenuOpen }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Current page label from nav config
  const current = providerAllNav.find((n) => n.path === pathname);

  // Live unread count — shares the same React Query cache as the notifications page
  const { unreadCount } = useProviderNotifications();

  const userInitial =
    useProviderAuthStore.getState().user?.name?.charAt(0) || 'م';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page title */}
        <h2 className="text-xl font-semibold text-gray-800">
          {current?.label || 'لوحة التحكم'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* ── Bell button with dynamic badge ── */}
        <button
          onClick={() => navigate('/provider/notifications')}
          className="relative p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="الإشعارات"
        >
          <Bell className="w-6 h-6" />

          {/* Badge — only shown when unread count > 0 */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 ltr:-right-1 rtl:-left-1 min-w-[1rem] h-4 px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
