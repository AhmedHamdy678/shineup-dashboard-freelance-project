import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getBookings } from '../../api/endpoints/bookings.api';
import { useServices } from '../services/useServices';
import Pagination from '../../../shared/components/ui/Pagination';
import Badge from '../../../shared/components/ui/Badge';
import formatDate from '../../../shared/utils/formatDate';
import { useState } from 'react';

const statusVariant = {
  PENDING: 'warning',
  PENDING_PROVIDER_ACCEPTANCE: 'warning',
  CONFIRMED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  EXPIRED: 'default',
  PAYMENT_EXPIRED: 'warning',
  CANCELLED_BY_CUSTOMER: 'danger',
  CANCELLED_BY_PROVIDER: 'danger',
  REJECTED_BY_PROVIDER: 'danger',
  PENDING_PAYMENT: 'warning',
  NO_PROVIDERS_AVAILABLE: 'default',
};

const statusTranslations = {
  PENDING: 'قيد الانتظار',
  PENDING_PROVIDER_ACCEPTANCE: 'بانتظار قبول المزود',
  CONFIRMED: 'مؤكد',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  EXPIRED: 'منتهي',
  PAYMENT_EXPIRED: 'انتهت صلاحية الدفع',
  CANCELLED_BY_CUSTOMER: 'أُلغي من قبل العميل',
  CANCELLED_BY_PROVIDER: 'أُلغي من قبل المزود',
  REJECTED_BY_PROVIDER: 'مرفوض من المزود',
  PENDING_PAYMENT: 'بانتظار الدفع',
  NO_PROVIDERS_AVAILABLE: 'لا يوجد مزودون',
};

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const limit = 20;

  const { data: services } = useServices();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookings', { page, limit, status: statusFilter }],
    queryFn: () => getBookings({ page, limit, sortBy: 'createdAt', sortOrder: 'desc', status: statusFilter || undefined }),
    placeholderData: (prev) => prev,
  });

  if (isLoading) {
    return <div className="text-center py-20 text-gray-400">جاري تحميل الحجوزات...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        فشل تحميل البيانات. {error?.response?.data?.message || error?.message || 'حاول مرة أخرى'}
      </div>
    );
  }

  const raw = Array.isArray(data) ? data : data?.items;
  const meta = data?.meta ?? { page: 1, limit, total: 0, totalPages: 0 };
  const bookings = (raw ?? []).map((item, idx) => ({
    ...item,
    _rowNumber: (meta.page - 1) * (meta.limit || limit) + idx + 1,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">جميع الحجوزات</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setStatusFilter('');
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              statusFilter === '' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            كل الحالات
          </button>
          {Object.entries(statusTranslations).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                statusFilter === key 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[900px] text-sm text-right" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '3%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '13%' }} />
            </colgroup>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">#</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">الكود</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">العميل</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">مقدم الخدمة</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">الخدمة</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">الحالة</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">المبلغ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">لا توجد حجوزات</td>
                </tr>
              )}
              {bookings.map((row) => {
                const companyName = row.provider?.companyName || row.provider?.individualDisplayName || '';
                const memberName = row.providerMember?.displayName || '';
                const adminService = services?.find(s => s.id === row.service?.id);
                const serviceName = adminService?.nameAr || adminService?.nameEn || row.items?.[0]?.serviceName || row.service?.nameAr || row.service?.name || '—';
                const status = row.status || row.bookingStatus?.code;
                const amount = row.amount ?? row.totalAmount;

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/60 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/bookings/${row.id}`)}
                    title="عرض تفاصيل الحجز"
                  >
                    <td className="px-4 py-3 text-center text-gray-500">{row._rowNumber}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-xs font-mono text-blue-600 truncate block" title={row.code || row.codeBooking}>
                        {row.code || row.codeBooking || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-gray-700 truncate block" title={row.customer?.name || row.customer?.fullName}>
                        {row.customer?.name || row.customer?.fullName || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="font-semibold text-gray-900 truncate" title={companyName}>{companyName || '—'}</div>
                      {memberName && <div className="text-xs text-gray-400 truncate" title={memberName}>{memberName}</div>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-gray-700 truncate block" title={serviceName}>{serviceName}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge variant={statusVariant[status] || 'default'}>
                        {statusTranslations[status] || status || '—'}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-700">
                      {amount != null ? `${Number(amount).toFixed(2)} ر.س` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.bookingMethod === 'SCHEDULED' ? (
                        <div className="flex flex-col items-center gap-1">
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: '#ede9fe',
                            color: '#6d28d9',
                            fontSize: '10px',
                            fontWeight: '600',
                            padding: '2px 7px',
                            borderRadius: '999px',
                            letterSpacing: '0.02em',
                          }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            مجدول
                          </span>
                          <div className="text-xs font-semibold text-gray-800 leading-tight">
                            {row.scheduledAt ? (
                              <>
                                <span className="text-purple-700 block" style={{ fontSize: '10px', fontWeight: '500', marginBottom: '1px' }}>موعد التنفيذ</span>
                                {formatDate(row.scheduledAt)}
                              </>
                            ) : '—'}
                          </div>
                          {row.createdAt && (
                            <div className="text-gray-400 leading-tight" style={{ fontSize: '10px' }}>
                              <span className="block" style={{ fontSize: '9px' }}>تاريخ الطلب</span>
                              {formatDate(row.createdAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            fontSize: '10px',
                            fontWeight: '600',
                            padding: '2px 7px',
                            borderRadius: '999px',
                            letterSpacing: '0.02em',
                          }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            فوري
                          </span>
                          <div className="text-xs text-gray-600 leading-tight">
                            {row.createdAt ? formatDate(row.createdAt) : '—'}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={meta.page}
          totalResults={meta.total}
          pageSize={meta.limit || limit}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
