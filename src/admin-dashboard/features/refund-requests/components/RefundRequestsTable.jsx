import React from 'react';
import { Eye } from 'lucide-react';

const RefundRequestsTable = ({ items, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getStatusBadge = (status, financialStatus) => {
    let colorClass = 'bg-gray-100 text-gray-700';
    let label = status;

    if (status === 'REFUNDED' || status === 'COMPLETED') {
      colorClass = 'bg-green-100 text-green-700';
      label = 'تم الاسترجاع';
    } else if (status === 'PENDING') {
      colorClass = 'bg-yellow-100 text-yellow-700';
      label = 'قيد المراجعة';
    } else if (status === 'REJECTED') {
      colorClass = 'bg-red-100 text-red-700';
      label = 'مرفوض';
    }

    return (
      <div className="flex flex-col items-center gap-1">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
          {label}
        </span>
        {financialStatus?.labelAr && (
          <span className="text-[10px] text-gray-500 max-w-[120px] truncate" title={financialStatus.labelAr}>
            {financialStatus.labelAr}
          </span>
        )}
      </div>
    );
  };

  const formatReason = (item) => {
    if (item.reasonText) return item.reasonText;
    const reasons = {
      SERVICE_NOT_PROVIDED: 'الخدمة لم تقدم',
    };
    return reasons[item.reason] || item.reason || 'غير متوفر';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-right">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 font-medium">معرف الحجز</th>
            <th className="px-6 py-4 font-medium text-center">تاريخ الطلب</th>
            <th className="px-6 py-4 font-medium">المبلغ</th>
            <th className="px-6 py-4 font-medium">السبب</th>
            <th className="px-6 py-4 font-medium text-center">الحالة</th>
            <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr 
              key={item.id} 
              className="hover:bg-gray-50/50 transition-colors"
            >
              <td className="px-6 py-4">
                <span className="font-mono text-gray-500" dir="ltr" title={item.bookingId}>
                  {item.bookingId?.substring(0, 8)}...
                </span>
              </td>
              <td className="px-6 py-4 text-center text-gray-500" dir="ltr">
                {formatDate(item.requestedAt)}
              </td>
              <td className="px-6 py-4">
                <span className="font-bold text-gray-900" dir="ltr">
                  {((item.amountMinor || 0) / 100).toFixed(2)} {item.currency || 'SAR'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-900 max-w-[200px] truncate block" title={formatReason(item)}>
                  {formatReason(item)}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                {getStatusBadge(item.status, item.financialStatus)}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onViewDetails && onViewDetails(item.id)}
                  className="text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  عرض التفاصيل
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RefundRequestsTable;
