import React from 'react';
import { Eye } from 'lucide-react';
import formatDate from '../../../../shared/utils/formatDate';

export default function PromotionsTable({ items, onViewDetails }) {
  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        لا توجد عروض ترويجية حالياً.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">نشط</span>;
      case 'DRAFT':
        return <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">مسودة</span>;
      case 'PAUSED':
        return <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">مؤقت</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">ملغي</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  const getSponsorText = (sponsorType) => {
    if (sponsorType === 'PLATFORM') return 'ممول من المنصة';
    if (sponsorType === 'PROVIDER') return 'ممول من المزود';
    return sponsorType;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-right text-gray-700">
        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 font-semibold">الكود</th>
            <th className="px-6 py-4 font-semibold">الاسم</th>
            <th className="px-6 py-4 font-semibold">قيمة الخصم</th>
            <th className="px-6 py-4 font-semibold">شروط الخصم</th>
            <th className="px-6 py-4 font-semibold">فترة العرض</th>
            <th className="px-6 py-4 font-semibold">الحالة</th>
            <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                {item.codeCanonical ? (
                  <span className="font-mono font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100" dir="ltr">
                    {item.codeCanonical}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded text-xs border border-gray-200 font-medium">
                    تلقائي
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{item.nameAr}</div>
                {item.sponsorType && (
                  <div className="text-xs text-gray-500 mt-1">{getSponsorText(item.sponsorType)}</div>
                )}
              </td>
              <td className="px-6 py-4 font-medium" dir="ltr">
                {item.discountType === 'PERCENTAGE' 
                  ? `${item.percentageBps / 100}%` 
                  : `${(item.fixedDiscountMinor / 100).toFixed(2)} ${item.currency || 'SAR'}`}
              </td>
              <td className="px-6 py-4 text-gray-600">
                <div className="flex flex-col gap-1">
                  <div>
                    الحد الأقصى: <span dir="ltr">{item.maximumDiscountMinor ? `${(item.maximumDiscountMinor / 100).toFixed(2)} ${item.currency || 'SAR'}` : 'بدون حد'}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    الحد الأدنى: <span dir="ltr">{item.minimumOrderMinor ? `${(item.minimumOrderMinor / 100).toFixed(2)} ${item.currency || 'SAR'}` : `0.00 ${item.currency || 'SAR'}`}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-xs space-y-1">
                  <div>من: <span dir="ltr">{formatDate(item.startsAt) || 'غير محدد'}</span></div>
                  <div>إلى: <span dir="ltr">{formatDate(item.endsAt) || 'مستمر'}</span></div>
                </div>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(item.status)}
              </td>
              <td className="px-6 py-4 text-center">
                <button 
                  onClick={() => onViewDetails(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
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
