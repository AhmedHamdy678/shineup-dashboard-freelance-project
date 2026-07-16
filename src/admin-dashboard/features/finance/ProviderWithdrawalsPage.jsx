import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { CreditCard, AlertCircle, FileText, Upload, CheckCircle2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Pagination from '../../../shared/components/ui/Pagination';
import Modal from '../../../shared/components/ui/Modal';
import ApproveWithdrawalModal from './ApproveWithdrawalModal';

const statusConfig = {
  APPROVED: { label: 'بانتظار الدفع', color: 'bg-blue-100 text-blue-700' },
  PAID: { label: 'مدفوع', color: 'bg-green-100 text-green-700' },
  PENDING: { label: 'معلق', color: 'bg-yellow-100 text-yellow-700' },
  REQUESTED: { label: 'بانتظار الموافقة', color: 'bg-orange-100 text-orange-700' },
  REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-700' }
};

export default function ProviderWithdrawalsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [activeTab, setActiveTab] = useState('ALL');
  const queryClient = useQueryClient();

  const [markPaidModal, setMarkPaidModal] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(null);
  const [approveWithdrawalId, setApproveWithdrawalId] = useState(null);

  const [formData, setFormData] = useState({
    sourceAccountId: '',
    transferReference: '',
    transferReceipt: null,
    transferredAt: '',
    adminNote: ''
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-withdrawals', page, activeTab],
    queryFn: async () => {
      // Adding status to API if backend supports it, else we filter locally. 
      // Safe approach: we will try to pass status if not ALL.
      const statusParam = activeTab !== 'ALL' ? `&status=${activeTab}` : '';
      const res = await axiosClient.get(`/admin/provider-withdrawals?page=${page}&limit=${pageSize}${statusParam}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const { data: platformAccounts } = useQuery({
    queryKey: ['platform-accounts'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/payout-source-accounts');
      return Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
    }
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ id, actionType }) => {
      const payload = new FormData();
      payload.append('sourceAccountId', formData.sourceAccountId);
      payload.append('transferReference', formData.transferReference);
      if (formData.transferredAt) {
        payload.append('transferredAt', formData.transferredAt);
      }
      if (formData.adminNote) {
        payload.append('adminNote', formData.adminNote);
      }
      if (formData.transferReceipt) {
        payload.append('transferReceipt', formData.transferReceipt);
      }
      
      const idempotencyKey = uuidv4();

      if (actionType === 'APPROVE_AND_PAY') {
        return axiosClient.post(`/admin/provider-withdrawals/${id}/approve-and-mark-paid`, payload, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Idempotency-Key': idempotencyKey
          }
        });
      } else {
        return axiosClient.post(`/admin/provider-withdrawals/${id}/mark-paid`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    onSuccess: () => {
      toast.success('تم تنفيذ العملية بنجاح');
      queryClient.invalidateQueries({ queryKey: ['provider-withdrawals'] });
      setMarkPaidModal(null);
      setFormData({ sourceAccountId: '', transferReference: '', transferReceipt: null, transferredAt: '', adminNote: '' });
    },
    onError: (err) => {
      console.error(err);
      const status = err.response?.status;
      const code = err.response?.data?.code || err.response?.data?.message;
      if (status === 409) {
        toast.error('لا يمكن تنفيذ العملية: حالة الطلب غير صالحة');
      } else if (status === 403 || code === 'WITHDRAWAL_APPROVER_CANNOT_EXECUTE') {
        toast.error('غير مصرح لك بتنفيذ هذه العملية (فصل الصلاحيات)');
      } else {
        toast.error('حدث خطأ أثناء حفظ بيانات الدفع');
      }
    }
  });

  const handleMarkPaidSubmit = (e) => {
    e.preventDefault();
    if (!formData.sourceAccountId || !formData.transferReference) {
      toast.error('يرجى تعبئة الحقول المطلوبة');
      return;
    }
    markPaidMutation.mutate({ id: markPaidModal.item.id, actionType: markPaidModal.actionType });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const items = data?.items || [];
  const meta = data?.meta || { totalPages: 1, totalCount: 0 };
  const totalResults = meta.totalCount || meta.total || (meta.totalPages ? meta.totalPages * pageSize : items.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-blue-600" />
          طلبات السحب
        </h1>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'ALL', label: 'الكل' },
          { id: 'APPROVED', label: 'بانتظار الدفع' },
          { id: 'PAID', label: 'مدفوع' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">لا توجد طلبات سحب.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">المعرف (ID)</th>
                  <th className="px-6 py-4 font-medium">المزود (Provider)</th>
                  <th className="px-6 py-4 font-medium">المبلغ (Amount)</th>
                  <th className="px-6 py-4 font-medium">البنك المستلم (Destination)</th>
                  <th className="px-6 py-4 font-medium text-center">الحالة (Status)</th>
                  <th className="px-6 py-4 font-medium text-center">تاريخ الطلب (Date)</th>
                  <th className="px-6 py-4 font-medium text-center">الإجراءات (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const conf = statusConfig[item.status] || { label: item.status, color: 'bg-gray-100 text-gray-700' };
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-gray-500">{item.id?.substring(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{item.provider?.name || item.providerId || 'غير معروف'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900" dir="ltr">
                          {((item.amountMinor || 0) / 100).toFixed(2)} {item.currency || 'SAR'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2" dir="ltr">
                          <span className="text-gray-900 font-medium">{item.payoutMethod?.bankName || 'غير متوفر'}</span>
                          {item.payoutMethod?.ibanLast4 && (
                            <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs">
                              ****{item.payoutMethod.ibanLast4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${conf.color}`}>
                          {conf.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {formatDate(item.requestedAt || item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.status === 'REQUESTED' && (
                          <button
                            onClick={() => setApproveWithdrawalId(item.id)}
                            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            تأكيد الدفع
                          </button>
                        )}
                        {item.status === 'PENDING' && (
                          <button
                            onClick={() => setMarkPaidModal({ item, actionType: 'APPROVE_AND_PAY' })}
                            className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            اعتماد وصرف
                          </button>
                        )}
                        {item.status === 'APPROVED' && (
                          <button
                            onClick={() => setMarkPaidModal({ item, actionType: 'MARK_PAID' })}
                            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            تنفيذ الدفع
                          </button>
                        )}
                        {item.status === 'PAID' && (
                          <button
                            onClick={() => setViewDetailsModal(item)}
                            className="text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            عرض التفاصيل
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      {/* Mark as Paid Modal */}
      {markPaidModal && (
        <Modal 
          title={markPaidModal.actionType === 'APPROVE_AND_PAY' ? 'اعتماد وصرف (Approve & Pay)' : 'تنفيذ الدفع (Mark as Paid)'} 
          onClose={() => !markPaidMutation.isPending && setMarkPaidModal(null)} 
          size="md"
        >
          <form onSubmit={handleMarkPaidSubmit} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center text-sm border border-blue-100">
              <span className="text-blue-800">المبلغ المطلوب تحويله:</span>
              <strong className="text-blue-900 font-bold" dir="ltr">
                {((markPaidModal.item.amountMinor || 0) / 100).toFixed(2)} {markPaidModal.item.currency || 'SAR'}
              </strong>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حساب التحويل (منصة) <span className="text-red-500">*</span></label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.sourceAccountId}
                onChange={(e) => setFormData({ ...formData, sourceAccountId: e.target.value })}
              >
                <option value="">اختر حساب المنصة...</option>
                {platformAccounts?.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.label || acc.bankName} - ****{acc.accountLast4}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرقم المرجعي للتحويل <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل رقم الحوالة المرجعي"
                value={formData.transferReference}
                onChange={(e) => setFormData({ ...formData, transferReference: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التحويل</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.transferredAt}
                onChange={(e) => setFormData({ ...formData, transferredAt: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إدارية</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                placeholder="أضف أي ملاحظات هنا..."
                value={formData.adminNote}
                onChange={(e) => setFormData({ ...formData, adminNote: e.target.value })}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">إيصال التحويل (اختياري)</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium w-full justify-center border-dashed">
                  <Upload className="w-4 h-4" />
                  <span>{formData.transferReceipt ? formData.transferReceipt.name : 'اختر ملف الإيصال'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFormData({ ...formData, transferReceipt: e.target.files[0] })}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setMarkPaidModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={markPaidMutation.isPending}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center min-w-[100px]"
                disabled={markPaidMutation.isPending}
              >
                {markPaidMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'تأكيد الدفع'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Details Modal */}
      {viewDetailsModal && (
        <Modal 
          title="تفاصيل الدفع (Payment Details)" 
          onClose={() => setViewDetailsModal(null)}
          size="md"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg text-green-700">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <span className="font-bold text-lg">تم الدفع بنجاح</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">الرقم المرجعي:</span>
                <span className="font-mono text-gray-900 font-medium">{viewDetailsModal.manualTransfer?.reference || 'غير متوفر'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">تم الدفع بواسطة:</span>
                <span className="text-gray-900 font-medium">{viewDetailsModal.manualTransfer?.paidBy?.fullName || 'غير متوفر'}</span>
              </div>
              {viewDetailsModal.manualTransfer?.receiptMediaId && (
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-gray-500">الإيصال:</span>
                  <a 
                    href={`/api/v1/media/${viewDetailsModal.manualTransfer.receiptMediaId}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    عرض الإيصال
                  </a>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={() => setViewDetailsModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ApproveWithdrawalModal 
        isOpen={!!approveWithdrawalId} 
        onClose={() => setApproveWithdrawalId(null)} 
        withdrawalId={approveWithdrawalId} 
      />
    </div>
  );
}
