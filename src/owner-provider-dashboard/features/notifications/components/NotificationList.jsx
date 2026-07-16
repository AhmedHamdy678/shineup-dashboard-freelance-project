/**
 * NotificationList — Dumb UI component.
 *
 * Renders a list of NotificationCard components.
 * Shows an appropriate empty-state illustration when the list is empty.
 *
 * Props:
 *   notifications — array of notification objects
 *   onDelete(id)  — forwarded to each NotificationCard
 */
import { BellOff } from 'lucide-react';
import NotificationCard from './NotificationCard';

export default function NotificationList({ notifications, onDelete }) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <BellOff className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-base font-semibold text-gray-500">لا توجد إشعارات</p>
        <p className="text-sm text-gray-400 mt-1">ستظهر إشعاراتك هنا فور وصولها</p>
      </div>
    );
  }

  return (
    <div>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
