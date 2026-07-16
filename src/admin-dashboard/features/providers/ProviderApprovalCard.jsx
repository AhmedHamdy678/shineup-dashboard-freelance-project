/**
 * Card component that shows a single provider and lets the admin
 * approve / reject their application.
 * Props:
 *   provider — { id, name, email, phone, status, rating, totalBookings, joinedAt }
 *   onApprove — callback(id)
 *   onReject  — callback(id)
 *   disabled  — boolean, disables buttons while a mutation is in flight
 */
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';

const statusVariant = {
  مقبول: 'success',
  معلق:  'warning',
  موقوف: 'danger',
  مرفوض: 'danger',
};

export default function ProviderApprovalCard({ provider, onApprove, onReject, disabled }) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900 truncate">{provider.name}</h4>
          <Badge variant={statusVariant[provider.status] || 'default'}>{provider.status}</Badge>
        </div>
        <p className="text-sm text-gray-500">{provider.email} · {provider.phone}</p>
        <p className="text-xs text-gray-400 mt-1">
          انضم في {provider.joinedAt} · {provider.totalBookings} حجوزات
          {provider.rating > 0 && ` · ⭐ ${provider.rating}`}
        </p>
      </div>

      {/* Approval actions — only shown while status is 'pending' */}
      {provider.status === 'معلق' && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onApprove(provider.id)}
            disabled={disabled}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            موافقة
          </button>
          <button
            onClick={() => onReject(provider.id)}
            disabled={disabled}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            رفض
          </button>
        </div>
      )}
    </Card>
  );
}
