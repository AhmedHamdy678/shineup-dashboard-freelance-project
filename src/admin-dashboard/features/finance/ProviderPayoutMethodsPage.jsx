import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient, { getApiErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../shared/components/ui/Pagination';
import Modal from '../../../shared/components/ui/Modal';

export default function ProviderPayoutMethodsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [verifyModalItem, setVerifyModalItem] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['provider-payout-methods', page],
    queryFn: async () => {
      const res = await axiosClient.get(`/admin/provider-payout-methods?page=${page}&limit=${pageSize}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData, // keepPreviousData replacement in v5
  });

  const verifyMutation = useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("معرف الحساب مفقود");
      const idempotencyKey = uuidv4();
      return axiosClient.post(`/admin/provider-payout-methods/${id}/verify`, {}, {
        headers: { 'Idempotency-Key': idempotencyKey }
      });
    },
    onSuccess: () => {
      toast.success('تم توثيق الحساب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['provider-payout-methods'] });
      setVerifyModalItem(null);
    },
    onError: (error) => {
      console.error('Verify error:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message;
      toast.error(`حدث خطأ أثناء توثيق الحساب: ${msg}`);
    }
  });

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">موثق</span>;
      case 'PENDING':
        return <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">قيد المراجعة</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">مرفوض</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  };

  if (isError) {
    toast.error(getApiErrorMessage(error, 'حدث خطأ أثناء جلب الحسابات البنكية للمزودين'));
  }

  const items = data?.items || [];
  const meta = data?.meta || { page: 1, totalPages: 1, totalCount: 0, total: 0 };
  const totalResults = meta.totalCount || meta.total || (meta.totalPages ? meta.totalPages * pageSize : items.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Landmark className="w-7 h-7 text-blue-600" />
          الحسابات البنكية للمزودين
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p>فشل في تحميل البيانات.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">لا توجد حسابات بنكية للمزودين حتى الآن.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">المزود (Provider)</th>
                  <th className="px-6 py-4 font-medium">صاحب الحساب (Account Holder)</th>
                  <th className="px-6 py-4 font-medium">تفاصيل البنك (Bank Details)</th>
                  <th className="px-6 py-4 font-medium text-center">نوع المستفيد (Beneficiary Type)</th>
                  <th className="px-6 py-4 font-medium text-center">حالة التوثيق (Verification Status)</th>
                  <th className="px-6 py-4 font-medium text-center">تاريخ الإضافة (Created At)</th>
                  <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr 
                    key={item.id || Math.random()} 
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/provider-payout-methods/${item.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.provider?.name || 'غير معروف'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.provider?.type || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{item.accountHolderName || 'غير متوفر'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start gap-2" dir="ltr">
                        <span className="text-gray-900 font-medium">{item.bankName}</span>
                        {item.last4 && (
                          <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs">
                            ****{item.last4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-700">{item.beneficiaryType || 'غير متوفر'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getVerificationBadge(item.verificationStatus)}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {item.verificationStatus === 'PENDING' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/provider-payout-methods/${item.id}`);
                          }}
                          className="text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          مراجعة الحساب
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/provider-payout-methods/${item.id}`);
                          }}
                          className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          عرض التفاصيل
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!isLoading && !isError && items.length > 0 && (
          <div className="border-t border-gray-100">
            <Pagination 
              currentPage={page} 
              totalResults={totalResults} 
              pageSize={pageSize} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </div>


    </div>
  );
}
