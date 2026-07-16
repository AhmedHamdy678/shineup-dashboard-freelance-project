/**
 * Top bar showing the current page title and a placeholder for
 * global actions (notifications, profile menu, etc.).
 */
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { generalNav, settingsNav } from '../../constants/navigation';

export default function Topbar() {
  const { pathname } = useLocation();
  const allNav = [...generalNav, ...settingsNav];
  const current = allNav.find((n) => n.path === pathname);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const res = await axiosClient.get('/notifications/me/unread-count');
      return res.data;
    },
    refetchInterval: 60000,
  });

  const unreadCount = unreadData?.unreadCount || 0;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <h2 className="text-xl font-semibold text-gray-800">
        {current?.label || 'لوحة التحكم'}
      </h2>
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <Link to="/admin/notifications" className="relative text-gray-400 hover:text-gray-600 transition-colors block">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 ltr:-right-1 rtl:-left-1 min-w-4 h-4 px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {displayCount}
            </span>
          )}
        </Link>
        {/* Avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
          A
        </div>
      </div>
    </header>
  );
}
