import React from 'react';
import { Ticket, Eye } from 'lucide-react';
import formatDate from '../../../../shared/utils/formatDate';

export default function ProviderPromotionsTable({ items, onView }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500 min-h-[300px]">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Ticket className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-lg font-medium text-gray-900 mb-1">لا توجد عروض ترويجية حالياً.</p>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          لم يتم إدراج أي عروض ترويجية لحسابك حتى الآن. يمكنك متابعة العروض الجديدة هنا عند إضافتها.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">نشط</span>;
      case 'PAUSED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">مؤقت</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">منتهي</span>;
      case 'DRAFT':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">مسودة</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">ملغي</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status || 'غير معروف'}</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">الكود</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">الاسم</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">قيمة الخصم</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">فترة العرض</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">الحالة</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded inline-block uppercase text-xs tracking-wider">
                  {item.code || 'تلقائي'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-gray-900">{item.nameAr || item.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.sponsorType === 'PLATFORM' ? 'ممول من المنصة' : 'ممول من المزود'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-green-600" dir="ltr">
                  {item.discountType === 'PERCENTAGE' 
                    ? `${item.percentageBps ? item.percentageBps / 100 : 0}%` 
                    : `${item.fixedDiscountMinor ? (item.fixedDiscountMinor / 100).toFixed(2) : '0.00'} SAR`
                  }
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">من:</span> 
                    <span dir="ltr">{formatDate(item.startsAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-gray-400">إلى:</span> 
                    <span dir="ltr">{formatDate(item.endsAt)}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(item.status)}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onView && onView(item.id)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
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
}
