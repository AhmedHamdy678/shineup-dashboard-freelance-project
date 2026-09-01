import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { AlertCircle, Eye } from 'lucide-react';
import Modal from '../../../shared/components/ui/Modal';

export default function ProviderWithdrawalsHistoryTable({ providerId }) {
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-withdrawals', providerId],
    queryFn: async () => {
      const res = await axiosClient.get(`/admin/provider-withdrawals?providerId=${providerId}&page=1&limit=20`);
      return res.data;
    },
    enabled: !!providerId,
  });

  if (!providerId) return null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center items-center h-40">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center py-12 text-red-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        <p>فشل في تحميل سجل السحوبات.</p>
      </div>
    );
  }

  const items = data?.items || [];
  const total = data?.meta?.total || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">سجل السحوبات السابقة للمزود</h2>
      </div>
      
      {total === 0 ? (
        <div className="p-8 text-center text-gray-500">
          لا توجد سجلات سحب سابقة لهذا المزود
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500">
            <thead className="text-xs text-gray-700 bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">التاريخ</th>
                <th scope="col" className="px-6 py-3">المبلغ</th>
                <th scope="col" className="px-6 py-3">الرقم المرجعي</th>
                <th scope="col" className="px-6 py-3">حساب المنصة المحول منه</th>
                <th scope="col" className="px-6 py-3">المشرف المنفذ</th>
                <th scope="col" className="px-6 py-3">الحالة</th>
                <th scope="col" className="px-6 py-3 text-center">الإيصال</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.paidAt ? new Date(item.paidAt).toLocaleString('ar-SA') : 
                     item.requestedAt ? new Date(item.requestedAt).toLocaleString('ar-SA') : '-'}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap" dir="ltr">
                    {(item.amountMinor / 100).toFixed(2)} SAR
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.manualTransfer?.reference || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.manualTransfer?.sourceAccount?.bankName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.execution?.claimedBy?.fullName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.status === 'PAID' ? (
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        مدفوع
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {item.status === 'PAID' && item.manualTransfer?.receiptMediaId && (
                      <button 
                        onClick={() => setSelectedReceiptId(item.manualTransfer.receiptMediaId)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        عرض الإيصال
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReceiptId && (
        <Modal title="إيصال التحويل" onClose={() => setSelectedReceiptId(null)} size="lg">
          <div className="flex justify-center p-4">
            <img 
              src={`https://api-dev.shineupapp.tech/api/v1/media/${selectedReceiptId}`} 
              alt="Receipt" 
              className="max-w-full h-auto rounded-lg shadow-sm"
              onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=الصورة+غير+متوفرة' }}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => setSelectedReceiptId(null)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium text-sm"
            >
              إغلاق
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
