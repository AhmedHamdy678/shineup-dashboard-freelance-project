import React from 'react';
import formatDate from '../../../../shared/utils/formatDate';

export default function CancellationRequestsTable({ items, onViewDetails }) {
  const getStatusBadge = (status) => {
    if (!status) return null;
    
    // Default colors
    let bg = 'bg-gray-100';
    let text = 'text-gray-800';

    switch (status.code) {
      case 'ADMIN_APPROVED':
      case 'PROVIDER_APPROVED':
        bg = 'bg-green-100';
        text = 'text-green-800';
        break;
      case 'PENDING':
      case 'WAITING_ADMIN_DECISION':
      case 'ESCALATED_TO_ADMIN':
      case 'ESCALATED':
        bg = 'bg-yellow-100';
        text = 'text-yellow-800';
        break;
      case 'REJECTED':
      case 'PROVIDER_REJECTED':
      case 'ADMIN_REJECTED':
        bg = 'bg-red-100';
        text = 'text-red-800';
        break;
      default:
        break;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {status.label}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm text-right whitespace-nowrap" dir="rtl">
        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
          <tr>
            <th className="px-6 py-4 font-semibold">معرف الحجز</th>
            <th className="px-6 py-4 font-semibold">تاريخ الطلب</th>
            <th className="px-6 py-4 font-semibold">السبب</th>
            <th className="px-6 py-4 font-semibold">الحالة</th>
            <th className="px-6 py-4 font-semibold">موعد رد المزود</th>
            <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {item.bookingId?.substring(0, 8)}...
                </span>
              </td>
              <td className="px-6 py-4 text-gray-700">
                {formatDate(item.requestedAt)}
              </td>
              <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={item.reasonText || item.reasonCode}>
                {item.reasonText || item.reasonCode || 'غير محدد'}
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(item.status)}
              </td>
              <td className="px-6 py-4 text-gray-700">
                {item.providerResponseDeadlineAt ? formatDate(item.providerResponseDeadlineAt) : '-'}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => {
                    if (onViewDetails) onViewDetails(item.id);
                  }}
                  className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                >
                  عرض التفاصيل
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
