import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import Modal from '../../../shared/components/ui/Modal';

export default function ApproveWithdrawalModal({ isOpen, onClose, withdrawalId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sourceAccountId: '',
    transferReference: '',
    transferredAt: '',
    adminNote: '',
  });
  const [transferReceipt, setTransferReceipt] = useState(null);

  const { data: platformAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['platform-accounts'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/payout-source-accounts');
      return Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      // Set default datetime to current local time in YYYY-MM-DDThh:mm format
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const localDatetime = now.toISOString().slice(0, 16);
      
      setFormData({
        sourceAccountId: '',
        transferReference: '',
        transferredAt: localDatetime,
        adminNote: '',
      });
      setTransferReceipt(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawalId) return;

    setLoading(true);

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

      const idempotencyKey = `manual-payout-${crypto.randomUUID()}`;

      await axiosClient.post(
        `/admin/provider-withdrawals/${withdrawalId}/approve-and-mark-paid`,
        submitData,
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
            // Override the axiosClient default application/json to let the browser handle FormData boundary
            'Content-Type': undefined,
          },
        }
      );
      
      toast.success('تم تأكيد الدفع بنجاح');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      toast.error(`حدث خطأ: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title="تأكيد التحويل ورفع الإيصال" onClose={() => !loading && onClose()} size="md">
      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            معرف حساب المصدر (Source Account) <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.sourceAccountId}
            onChange={(e) => setFormData({ ...formData, sourceAccountId: e.target.value })}
            disabled={loading || accountsLoading}
          >
            <option value="">اختر حساب المنصة المحول منه...</option>
            {platformAccounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name || acc.bankName || acc.accountHolderName || 'حساب'} - ****{acc.accountLast4 || acc.iban?.slice(-4) || 'XXXX'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الرقم المرجعي للتحويل (Reference No.) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.transferReference}
            onChange={(e) => setFormData({ ...formData, transferReference: e.target.value })}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">وقت التحويل <span className="text-red-500">*</span></label>
          <input
            type="datetime-local"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.transferredAt}
            onChange={(e) => setFormData({ ...formData, transferredAt: e.target.value })}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات الإدارة (اختياري)</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={formData.adminNote}
            onChange={(e) => setFormData({ ...formData, adminNote: e.target.value })}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">إيصال التحويل (Receipt) <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-3">
            <label className={`cursor-pointer bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium w-full border-dashed ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span>{transferReceipt ? transferReceipt.name : 'اختر ملف (صورة أو PDF)'}</span>
              <input
                type="file"
                required
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setTransferReceipt(e.target.files[0])}
                disabled={loading}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[120px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'تأكيد الدفع'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
