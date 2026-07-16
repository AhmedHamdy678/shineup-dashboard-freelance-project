/**
 * NotificationsHeader — Dumb UI component.
 *
 * Renders the page header containing:
 * - Title "الإشعارات" with a total unread count badge
 * - Pill-shaped All / Unread segmented toggle
 * - "Mark all read" action button (hidden when no unread notifications exist)
 *
 * Props:
 *   activeFilter     — 'all' | 'unread'
 *   setActiveFilter  — setter function
 *   unreadCount      — number of unread notifications
 *   onMarkAllRead    — called when "Mark all read" is clicked
 *   isMarkingRead    — loading state for the mark-all mutation
 */
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsHeader({
  activeFilter,
  setActiveFilter,
  unreadCount,
  onMarkAllRead,
  isMarkingRead,
}) {
  return (
    <div className="mb-6">
      {/* ── Top row: title + mark-all button ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            disabled={isMarkingRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            {isMarkingRead ? 'جارٍ التحديث...' : 'تحديد الكل كمقروء'}
          </button>
        )}
      </div>

      {/* ── Segmented pill toggle: All / Unread ── */}
      <div className="inline-flex items-center bg-gray-100 rounded-full p-1 gap-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-all ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-all ${
            activeFilter === 'unread'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          غير مقروءة
          {unreadCount > 0 && (
            <span className={`inline-flex items-center justify-center ml-1.5 rtl:mr-1.5 rtl:ml-0 w-4 h-4 text-[10px] font-bold rounded-full transition-all ${
              activeFilter === 'unread' ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-700'
            }`}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
