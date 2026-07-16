/**
 * Payments / Transactions page.
 * Displays all payment transactions with status and amounts.
 */
import { useQuery } from '@tanstack/react-query';
import { getPayments } from '../../api/endpoints/payments.api';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import formatCurrency from '../../../shared/utils/formatCurrency';
import formatDate from '../../../shared/utils/formatDate';

const statusVariant = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'info',
};

export default function PaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  });

  if (isLoading) {
    return <div className="text-center py-20 text-gray-400">جاري تحميل المدفوعات...</div>;
  }

  const payments = data?.list ?? [];

  const columns = [
    { key: 'id', label: 'المعرف' },
    { key: 'customer', label: 'العميل', render: (_, row) => row.customerName },
    { key: 'provider', label: 'مقدم الخدمة', render: (_, row) => row.providerName },
    { key: 'amount', label: 'المبلغ', render: (val) => formatCurrency(val) },
    { key: 'method', label: 'طريقة الدفع' },
    { key: 'status', label: 'الحالة', render: (val) => <Badge variant={statusVariant[val] || 'default'}>{val}</Badge> },
    { key: 'createdAt', label: 'التاريخ', render: (val) => formatDate(val) },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-800">المعاملات المالية</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table columns={columns} rows={payments} />
      </div>
    </div>
  );
}
