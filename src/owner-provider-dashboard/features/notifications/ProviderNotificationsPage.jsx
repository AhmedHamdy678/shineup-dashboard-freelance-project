// v3 — cache bust: real API data parsing fixed
import { useState, useEffect } from 'react';
import {
  useProviderNotifications,
  useMarkAllRead,
  useDeleteNotification,
} from './useProviderNotifications';
import NotificationsHeader from './components/NotificationsHeader';
import NotificationList from './components/NotificationList';

export default function ProviderNotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const { notifications, unreadCount, isLoading } = useProviderNotifications();
  const { mutate: markAllRead, isPending: isMarkingRead } = useMarkAllRead();
  const { mutate: deleteNotif } = useDeleteNotification();

  // Auto-mark all as read when the user visits this page,
  // so the topbar bell badge clears immediately.
  useEffect(() => {
    if (unreadCount > 0) {
      markAllRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive filtered list based on active tab
  const filteredNotifications = activeFilter === 'unread'
    ? notifications.filter((n) => n.readAt === null)
    : notifications;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3 p-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Dumb header: title, toggle, mark-all button */}
      <NotificationsHeader
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        unreadCount={unreadCount}
        onMarkAllRead={markAllRead}
        isMarkingRead={isMarkingRead}
      />

      {/* Dumb list: renders cards or empty state */}
      <NotificationList
        notifications={filteredNotifications}
        onDelete={deleteNotif}
      />
    </div>
  );
}
