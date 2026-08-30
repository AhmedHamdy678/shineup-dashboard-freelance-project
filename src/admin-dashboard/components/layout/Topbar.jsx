/**
 * Top bar showing the current page title and a placeholder for
 * global actions (notifications, profile menu, etc.).
 */
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { generalNav, settingsNav } from '../../constants/navigation';

export default function Topbar({ setIsMobileMenuOpen }) {
  const { pathname } = useLocation();
  const allNav = [...generalNav, ...settingsNav];
  const current = allNav.find((n) => n.path === pathname);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const res = await axiosClient.get('/notifications/me/unread-count');
      return res.data;
    },
    // TODO: Replace with WebSocket 'notification:new' event to update badge instantly
    refetchInterval: 180000,    // Fallback poll every 3 min
    refetchOnWindowFocus: true, // Badge refreshes when admin returns to tab
  });

  const { data: supportData } = useQuery({
    queryKey: ['admin-support-conversations', 'ALL'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/support-conversations?type=PROVIDER_SUPPORT&page=1&limit=20');
      return res.data;
    },
    // TODO: useChatSocket already invalidates 'admin-support-conversations' on new_message
    refetchInterval: 180000,    // Fallback poll every 3 min
    refetchOnWindowFocus: true, // Badge refreshes when admin returns to tab
  });

  const notificationsUnreadCount = unreadData?.unreadCount || 0;
  const supportUnreadCount = supportData?.items?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0;
  const unreadCount = notificationsUnreadCount + supportUnreadCount;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {current?.label || 'لوحة التحكم'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <Link to="/admin/notifications" className="relative text-gray-400 hover:text-gray-600 transition-colors block">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600"></span>}
        </Link>
        {/* Avatar — links to settings */}
        <Link
          to="/admin/settings"
          title="الإعدادات"
          className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity"
        >
          A
        </Link>
      </div>
    </header>
  );
}
