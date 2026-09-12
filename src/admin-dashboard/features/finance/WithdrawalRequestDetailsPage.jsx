import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { ArrowRight, AlertTriangle, CreditCard, Landmark, Copy, Check, Info } from 'lucide-react';
import ApproveWithdrawalModal from './ApproveWithdrawalModal';
import ProviderWithdrawalsHistoryTable from './ProviderWithdrawalsHistoryTable';
import Modal from '../../../shared/components/ui/Modal';

const statusConfig = {
  APPROVED: { label: 'بانتظار الدفع', color: 'bg-blue-100 text-blue-700' },
  PAID: { label: 'مدفوع', color: 'bg-green-100 text-green-700' },
  PENDING: { label: 'معلق', color: 'bg-yellow-100 text-yellow-700' },
  REQUESTED: { label: 'بانتظار الموافقة', color: 'bg-orange-100 text-orange-700' },
  REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-700' }
};

export default function WithdrawalRequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const rejectMutation = useMutation({
    mutationFn: async () => {
      await axiosClient.post(`/admin/provider-withdrawals/${id}/reject`, 
        { adminNote: adminNote.trim() || undefined },
        {
          headers: {
            'Idempotency-Key': `withdrawal-reject-${id}-${Date.now()}`
          }
        }
      );
    },
    onSuccess: () => {
      setIsRejectModalOpen(false);
      setAdminNote('');
      toast.success('تم رفض طلب السحب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['provider-withdrawal', id] });
      queryClient.invalidateQueries({ queryKey: ['provider-withdrawals'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'حدث خطأ أثناء رفض الطلب');
      console.error(error);
    }
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-withdrawal', id],
    queryFn: async () => {
      const res = await axiosClient.get(`/admin/provider-withdrawals/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const formatMinorToSAR = (minorAmount) => {
    if (minorAmount === undefined || minorAmount === null) return '0.00 SAR';
    return (minorAmount / 100).toFixed(2) + ' SAR';
  };

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
        <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
        <p>فشل في تحميل تفاصيل طلب السحب.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">العودة</button>
      </div>
    );
  }

  const req = data.data || data; 
  const conf = statusConfig[req.status] || { label: req.status, color: 'bg-gray-100 text-gray-700' };

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
          <h1 className="text-2xl font-bold text-gray-900">مراجعة طلب السحب</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Full Width Request Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2 space-y-4">
           {req.provider?.financiallyBlocked && (
             <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
               <AlertTriangle className="w-6 h-6" />
               <p className="font-semibold text-lg">هذا المزود محظور مالياً - لا تقم بالتحويل</p>
             </div>
           )}
           <div className="flex justify-between items-center">
             <div>
               <p className="text-sm text-gray-500 mb-1">المبلغ المطلوب (Requested Amount)</p>
               <p className="text-4xl font-bold text-gray-900" dir="ltr">{formatMinorToSAR(req.amountMinor)}</p>
             </div>
             <div className="text-left">
                <span className={`px-4 py-2 rounded-full font-bold text-sm ${conf.color}`}>
                  {conf.label}
                </span>
             </div>
           </div>
        </div>

        {/* Card 2: Financial Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            الملخص المالي
          </h2>
          <div className="space-y-4">
             <div>
               <p className="text-sm text-gray-500">الرصيد المتاح</p>
               <p className="text-gray-900 font-medium font-mono" dir="ltr">{formatMinorToSAR(req.financialSummary?.availableBalanceMinor)}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500">إجمالي المسحوبات السابقة</p>
               <p className="text-gray-900 font-medium font-mono" dir="ltr">{formatMinorToSAR(req.financialSummary?.totalWithdrawnMinor)}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500">إجمالي الأرباح التاريخية</p>
               <p className="text-gray-900 font-medium font-mono" dir="ltr">{formatMinorToSAR(req.financialSummary?.lifetimeNetEarningsMinor)}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500">تاريخ آخر سحب</p>
               <p className="text-gray-900 font-medium">{req.financialSummary?.lastWithdrawalAt ? formatDate(req.financialSummary.lastWithdrawalAt) : 'لا يوجد سحوبات سابقة'}</p>
             </div>
          </div>
        </div>

        {/* Card 3: Bank Account Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Landmark className="w-5 h-5 text-blue-600" />
            تفاصيل الحساب البنكي
          </h2>
          <div className="space-y-4">
             <div>
               <p className="text-sm text-gray-500">البنك</p>
               <p className="text-gray-900 font-medium">{req.bankAccount?.bankName || 'غير متوفر'}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500">المستفيد</p>
               <p className="text-gray-900 font-medium">{req.bankAccount?.accountHolderName || 'غير متوفر'}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500 mb-1">رقم الآيبان (IBAN)</p>
               <div className="flex items-center gap-3">
                 <p className="text-gray-900 font-medium font-mono" dir="ltr">
                   {req.bankAccount?.safeToDisplayFullIban 
                     ? (req.bankAccount?.iban || 'غير متوفر') 
                     : (req.bankAccount?.ibanLast4 ? `****${req.bankAccount.ibanLast4}` : 'محمي')}
                 </p>
                 {req.bankAccount?.safeToDisplayFullIban && req.bankAccount?.iban && (
                   <button 
                     onClick={() => handleCopyIBAN(req.bankAccount.iban)}
                     className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                     title="نسخ الآيبان"
                   >
                     {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                   </button>
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {req.status === 'REQUESTED' && !req.provider?.financiallyBlocked && (
         <div className="mt-8 bg-white border-t border-gray-100 p-6 rounded-xl shadow-sm flex items-center justify-end gap-4">
           <button 
              onClick={() => setIsRejectModalOpen(true)}
              disabled={rejectMutation.isPending}
              className={`px-6 py-2.5 text-sm font-medium border rounded-lg transition-colors ${
                rejectMutation.isPending 
                  ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                  : 'text-red-700 bg-white border-red-200 hover:bg-red-50 hover:border-red-300'
              }`}
            >
              {rejectMutation.isPending ? 'جارٍ الرفض...' : 'رفض الطلب'}
            </button>
            <button 
              onClick={() => setIsApproveModalOpen(true)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center min-w-[120px]"
            >
              تأكيد التحويل ورفع الإيصال
            </button>
         </div>
      )}
      
      {req.status === 'REQUESTED' && req.provider?.financiallyBlocked && (
        <div className="mt-8 bg-gray-50 border-t border-gray-100 p-6 rounded-xl shadow-sm flex items-center justify-center gap-2 text-gray-500">
           <Info className="w-5 h-5"/> 
           <span>الإجراءات معطلة بسبب حظر المزود مالياً</span>
        </div>
      )}

      {/* Withdrawals History Table */}
      <ProviderWithdrawalsHistoryTable providerId={req.provider?.id} />

      <ApproveWithdrawalModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        withdrawalId={id}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['provider-withdrawal', id] })}
      />

      {isRejectModalOpen && (
        <Modal 
          title="تأكيد رفض طلب السحب" 
          onClose={() => !rejectMutation.isPending && setIsRejectModalOpen(false)}
          size="sm"
        >
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-900 font-medium mb-1">هل أنت متأكد من رفض طلب السحب؟</p>
            <p className="text-sm text-gray-500 mb-4">لا يمكن التراجع عن هذا الإجراء، وسيتم إرجاع المبلغ إلى رصيد المزود.</p>
            
            <div className="mb-6 text-right">
              <label className="block text-sm font-medium text-gray-700 mb-2">سبب الرفض (ملاحظة إدارية)</label>
              <textarea 
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="اكتب سبب الرفض هنا..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-red-500 focus:border-red-500 outline-none transition-colors min-h-[80px]"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                disabled={rejectMutation.isPending}
                className="flex-1 py-2.5 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-colors border border-gray-200"
              >
                تراجع
              </button>
              <button 
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'جاري الرفض...' : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
