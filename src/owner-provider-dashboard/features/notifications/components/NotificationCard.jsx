/**
 * NotificationCard — Dumb UI component.
 *
 * Renders a single notification row with:
 * - A type-mapped colored icon on the left
 * - Title, body, and relative "time ago" in the center
 * - A delete (trash) button on the right
 * - A subtle blue-tinted background when the notification is unread (readAt === null)
 *
 * Props:
 *   notification — the notification data object
 *   onDelete(id) — called when the trash button is clicked
 */
import { Trash2, Star, CheckCircle, XCircle, AlertTriangle, Users, Wallet, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Icon & color config per notification type ──────────────────────────────
const TYPE_CONFIG = {
  REVIEW_RECEIVED: {
    Icon: Star,
    bg: 'bg-amber-100',
    iconColor: 'text-amber-500',
  },
  BOOKING_CONFIRMED: {
    Icon: CheckCircle,
    bg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  BOOKING_CANCELLED: {
    Icon: XCircle,
    bg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  PROVIDER_REJECTED: {
    Icon: AlertTriangle,
    bg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  TEAM_MEMBER_ADDED: {
    Icon: Users,
    bg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  PAYMENT_RECEIVED: {
    Icon: Wallet,
    bg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
};

const DEFAULT_CONFIG = {
  Icon: BellRing,
  bg: 'bg-gray-100',
  iconColor: 'text-gray-500',
};

// ─── Relative-time formatter ─────────────────────────────────────────────────
function timeAgo(isoString) {
  if (!isoString) return '';
  const now = Date.now();
  const diff = Math.max(0, now - new Date(isoString).getTime());
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  < 1)  return 'الآن';
  if (mins  < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days  < 30) return `منذ ${days} يوم`;
  return `منذ ${Math.floor(days / 30)} شهر`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NotificationCard({ notification, onDelete }) {
  const navigate = useNavigate();
  const { id, type, title, body, readAt, createdAt, link } = notification;
  const isUnread = readAt === null;
  const config = TYPE_CONFIG[type] ?? DEFAULT_CONFIG;
  const { Icon, bg, iconColor } = config;

  const handleCardClick = () => {
    if (link) {
      navigate(link);
      return;
    }

    const conversationId =
      notification.data?.conversationId ||
      notification.data?.chatId ||
      notification.metadata?.conversationId ||
      notification.metadata?.chatId ||
      notification.entityId;

    switch (type) {
      case 'REVIEW_RECEIVED': navigate('/provider/reviews'); break;
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_CANCELLED': navigate('/provider/bookings'); break;
      case 'PAYMENT_RECEIVED': navigate('/provider/wallet'); break;
      case 'TEAM_MEMBER_ADDED': navigate('/provider/team'); break;
      case 'PROVIDER_REJECTED': navigate('/provider/profile'); break;
      default:
        // Fallback checks for title/body content
        if (title?.includes('دعم') || body?.includes('رسالة')) {
          navigate('/provider/chat', conversationId ? { state: { conversationId, tab: 'ADMIN' } } : undefined);
        }
        break;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`flex items-start gap-4 p-4 mb-3 rounded-xl border transition-colors cursor-pointer hover:shadow-sm ${
        isUnread
          ? 'bg-blue-50/60 border-blue-100 hover:bg-blue-50'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
    >
      {/* ── Left: type icon ── */}
      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>

      {/* ── Center: content ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-sm font-bold leading-snug ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
            {title}
          </p>
          {/* Unread dot indicator */}
          {isUnread && (
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          )}
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
        <p className="mt-1.5 text-xs text-gray-400 font-medium">{timeAgo(createdAt)}</p>
      </div>

      {/* ── Right: delete button ── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
        className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="حذف الإشعار"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
