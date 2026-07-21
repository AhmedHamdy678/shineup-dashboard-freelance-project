import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { ArrowRight, Copy, CheckCircle2, AlertCircle, Building2, User, Landmark, Building, MapPin, Hash, Check } from 'lucide-react';
import Modal from '../../../shared/components/ui/Modal';

export default function BankAccountDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-payout-method', id],
    queryFn: async () => {
      const res = await axiosClient.get(`/admin/provider-payout-methods/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const idempotencyKey = `verify-payout-${crypto.randomUUID()}`;
      return axiosClient.post(
        `/admin/provider-payout-methods/${id}/verify`,
        {}, // Empty body
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
    },
    onSuccess: () => {
      toast.success('تم توثيق الحساب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['provider-payout-method', id] });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message;
      toast.error(`حدث خطأ أثناء توثيق الحساب: ${msg}`);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (reason) => {
      const idempotencyKey = `reject-payout-${crypto.randomUUID()}`;
      return axiosClient.post(
        `/admin/provider-payout-methods/${id}/reject`, 
        { reason },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
    },
    onSuccess: () => {
      toast.success('تم رفض الحساب');
      queryClient.invalidateQueries({ queryKey: ['provider-payout-method', id] });
      setRejectModalOpen(false);
      setRejectionReason('');
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message;
      toast.error(`حدث خطأ أثناء رفض الحساب: ${msg}`);
    }
  });

  const handleCopyIBAN = (iban) => {
    if (!iban) return;
    navigator.clipboard.writeText(iban);
    setCopied(true);
    toast.success('تم نسخ الآيبان');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        <p>فشل في تحميل تفاصيل الحساب البنكي.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">العودة للجدول</button>
      </div>
    );
  }

  const account = data.data || data;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل الحساب البنكي</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Provider Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Building2 className="w-5 h-5 text-blue-600" />
            معلومات المزود
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Building className="w-4 h-4"/> اسم المتجر/الشركة</p>
              <p className="text-gray-900 font-medium">{account.provider?.name || 'غير متوفر'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><User className="w-4 h-4"/> اسم المالك</p>
              <p className="text-gray-900 font-medium">{account.provider?.owner?.fullName || 'غير متوفر'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Hash className="w-4 h-4"/> نوع المستفيد</p>
              <p className="text-gray-900 font-medium">
                {account.beneficiaryType === 'COMPANY' ? 'شركة/مؤسسة' : 
                 account.beneficiaryType === 'INDIVIDUAL' ? 'فرد' : account.beneficiaryType || 'غير متوفر'}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Bank Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
          {account.isDefault && (
            <span className="absolute top-6 left-6 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              حساب افتراضي
            </span>
          )}
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Landmark className="w-5 h-5 text-blue-600" />
            التفاصيل البنكية
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">البنك</p>
              <p className="text-gray-900 font-medium">{account.bankName || 'غير متوفر'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">صاحب الحساب</p>
              <p className="text-gray-900 font-medium">{account.accountHolderName || 'غير متوفر'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">رقم الآيبان (IBAN)</p>
              <div className="flex items-center gap-3">
                <p className="text-gray-900 font-medium font-mono" dir="ltr">{account.iban || 'غير متوفر'}</p>
                {account.iban && (
                  <button 
                    onClick={() => handleCopyIBAN(account.iban)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                    title="نسخ الآيبان"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><MapPin className="w-4 h-4"/> الدولة والمدينة</p>
              <p className="text-gray-900 font-medium">
                {account.beneficiaryCountry || ''} {account.beneficiaryCity ? `- ${account.beneficiaryCity}` : ''}
                {!account.beneficiaryCountry && !account.beneficiaryCity && 'غير متوفر'}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Verification & Timestamps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            حالة التوثيق والتواريخ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">حالة الحساب</p>
              {account.status === 'ACTIVE' ? (
                 <span className="bg-green-100 text-green-700 text-sm font-semibold px-2.5 py-1 rounded-full">نشط</span>
              ) : (
                 <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-2.5 py-1 rounded-full">{account.status || 'غير متوفر'}</span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">حالة التوثيق</p>
              {account.verificationStatus === 'VERIFIED' && <span className="bg-green-100 text-green-700 text-sm font-semibold px-2.5 py-1 rounded-full">موثق</span>}
              {account.verificationStatus === 'PENDING' && <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-2.5 py-1 rounded-full">قيد المراجعة</span>}
              {account.verificationStatus === 'REJECTED' && <span className="bg-red-100 text-red-700 text-sm font-semibold px-2.5 py-1 rounded-full">مرفوض</span>}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">تاريخ الإضافة</p>
              <p className="text-gray-900 font-medium">{formatDate(account.createdAt)}</p>
            </div>
            {account.verifiedAt && (
              <div>
                <p className="text-sm text-gray-500 mb-1">تاريخ التوثيق</p>
                <p className="text-gray-900 font-medium">{formatDate(account.verifiedAt)}</p>
              </div>
            )}
          </div>
          {account.verificationStatus === 'REJECTED' && account.rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-1">سبب الرفض:</p>
              <p className="text-red-700">{account.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-8 bg-white border-t border-gray-100 p-6 rounded-xl shadow-sm flex items-center justify-end gap-4">
        {account.verificationStatus === 'PENDING' ? (
          <>
            <button 
              onClick={() => setRejectModalOpen(true)}
              className="px-6 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              رفض
            </button>
            <button 
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center min-w-[120px]"
            >
              {verifyMutation.isPending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'توثيق الحساب'}
            </button>
          </>
        ) : account.verificationStatus === 'VERIFIED' ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg w-full justify-center">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">هذا الحساب موثق وجاهز للاستخدام</span>
          </div>
        ) : null}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <Modal title="رفض الحساب البنكي" onClose={() => setRejectModalOpen(false)} size="md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">سبب الرفض</label>
              <textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows="4"
                placeholder="اكتب سبب الرفض هنا..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={rejectMutation.isPending}
              >
                إلغاء
              </button>
              <button
                onClick={() => rejectMutation.mutate(rejectionReason)}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
              >
                {rejectMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'تأكيد الرفض'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
