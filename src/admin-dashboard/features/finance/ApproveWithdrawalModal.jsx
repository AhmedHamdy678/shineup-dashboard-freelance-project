import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import Modal from '../../../shared/components/ui/Modal';

import { v4 as uuidv4 } from 'uuid';

export function useApproveWithdrawal() {
  return useMutation({
    mutationFn: async ({ withdrawalId, formData }) => {
      const idempotencyKey = uuidv4();
      const res = await axiosClient.post(
        `/admin/provider-withdrawals/${withdrawalId}/approve-and-mark-paid`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Idempotency-Key': idempotencyKey,
          },
        }
      );
      return res.data;
    },
  });
}

export default function ApproveWithdrawalModal({ isOpen, onClose, withdrawalId }) {
  const queryClient = useQueryClient();
  const { mutateAsync: approveWithdrawal, isPending } = useApproveWithdrawal();

  const [formData, setFormData] = useState({
    sourceAccountId: '',
    transferReference: '',
    transferredAt: '',
    adminNote: '',
  });
  const [transferReceipt, setTransferReceipt] = useState(null);

  const { data: platformAccounts } = useQuery({
    queryKey: ['platform-accounts'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/payout-source-accounts');
      return Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
    },
    enabled: isOpen,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawalId) return;

    try {
      const submitData = new FormData();
      submitData.append('sourceAccountId', formData.sourceAccountId);
      submitData.append('transferReference', formData.transferReference);
      
      if (formData.transferredAt) {
        submitData.append('transferredAt', new Date(formData.transferredAt).toISOString());
      }
      
      if (formData.adminNote) {
        submitData.append('adminNote', formData.adminNote);
      }
      
      if (transferReceipt) {
        submitData.append('transferReceipt', transferReceipt);
      }

      await approveWithdrawal({ withdrawalId, formData: submitData });
      
      toast.success('تم اعتماد طلب السحب وإثبات الدفع بنجاح.');
      queryClient.invalidateQueries({ queryKey: ['provider-withdrawals'] });
      onClose();
      
      // Reset form
      setFormData({
        sourceAccountId: '',
        transferReference: '',
        transferredAt: '',
        adminNote: '',
      });
      setTransferReceipt(null);
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء اعتماد طلب السحب');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title="تأكيد الدفع (Approve Payment)" onClose={() => !isPending && onClose()} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            حساب التحويل (منصة) <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.sourceAccountId}
            onChange={(e) => setFormData({ ...formData, sourceAccountId: e.target.value })}
            disabled={isPending}
          >
            <option value="">اختر حساب المنصة...</option>
            {platformAccounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.label || acc.bankName} - ****{acc.accountLast4}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الرقم المرجعي للتحويل <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="أدخل رقم الحوالة المرجعي"
            value={formData.transferReference}
            onChange={(e) => setFormData({ ...formData, transferReference: e.target.value })}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ ووقت التحويل <span className="text-red-500">*</span></label>
          <input
            type="datetime-local"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.transferredAt}
            onChange={(e) => setFormData({ ...formData, transferredAt: e.target.value })}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات الإدارة (اختياري)</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="أضف أي ملاحظات هنا..."
            rows={3}
            value={formData.adminNote}
            onChange={(e) => setFormData({ ...formData, adminNote: e.target.value })}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">إيصال التحويل <span className="text-red-500">*</span></label>
          <input
            type="file"
            required
            accept="image/*,application/pdf"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setTransferReceipt(e.target.files[0])}
            disabled={isPending}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[120px]"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'حفظ وإثبات الدفع'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
