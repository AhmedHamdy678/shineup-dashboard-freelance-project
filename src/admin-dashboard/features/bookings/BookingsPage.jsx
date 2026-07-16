import { useQuery } from '@tanstack/react-query';
import { getBookings } from '../../api/endpoints/bookings.api';
import Table from '../../../shared/components/ui/Table';
import Pagination from '../../../shared/components/ui/Pagination';
import Badge from '../../../shared/components/ui/Badge';
import formatCurrency from '../../../shared/utils/formatCurrency';
import formatDate from '../../../shared/utils/formatDate';
import { useState } from 'react';

const statusVariant = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  EXPIRED: 'default',
};

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookings', { page, limit }],
    queryFn: () => getBookings({ page, limit, sortBy: 'createdAt', sortOrder: 'desc' }),
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

  const columns = [
    { key: '_rowNumber', label: '#' },
    { key: 'code', label: 'الكود' },
    {
      key: 'customer',
      label: 'العميل',
      render: (_, row) => row.customer?.name,
    },
    {
      key: 'provider',
      label: 'مقدم الخدمة',
      render: (_, row) => {
        const companyName = row.provider?.companyName || row.provider?.individualDisplayName || '';
        const displayName = row.providerMember?.displayName || '';
        return (
          <div>
            <div className="font-semibold text-gray-900">{companyName}</div>
            <div className="text-xs text-gray-400">{displayName}</div>
          </div>
        );
      },
    },
    {
      key: 'service',
      label: 'الخدمة',
      render: (_, row) => row.service?.name,
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (val) => <Badge variant={statusVariant[val] || 'default'}>{val}</Badge>,
    },
    {
      key: 'amount',
      label: 'المبلغ',
      render: (val) => formatCurrency(val),
    },
    {
      key: 'createdAt',
      label: 'التاريخ',
      render: (val) => formatDate(val),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-800">جميع الحجوزات</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table columns={columns} rows={bookings} />
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
