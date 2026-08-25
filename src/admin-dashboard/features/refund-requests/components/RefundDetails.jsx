import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, AlertCircle, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import formatDate from '../../../../shared/utils/formatDate';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export default function RefundDetails({ requestId, onBack }) {
  const queryClient = useQueryClient();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approveAmount, setApproveAmount] = useState('');
  const [approveNote, setApproveNote] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncAmount, setSyncAmount] = useState('');
  const [syncReference, setSyncReference] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ['admin-refund-request', requestId],
    queryFn: async () => {
      const res = await axiosClient.get(`admin/refund-requests/${requestId}`, {
        headers: {
          'Accept-Language': 'ar'
        }
      });
      return res.data;
    },
    enabled: !!requestId,
  });

  const data = responseData?.data || responseData;

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      setIsApproving(true);
      const amountMinor = Math.round(parseFloat(approveAmount) * 100);
      await axiosClient.post(
        `admin/refund-requests/${requestId}/approve`,
        { amountMinor, adminNote: approveNote },
        {
          headers: {
            'Accept-Language': 'ar',
            'Idempotency-Key': `refund-approve-${requestId}-${uuidv4()}`
          }
        }
      );
      toast.success('تمت الموافقة بنجاح');
      setIsApproveModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-refund-request', requestId] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء الموافقة على الطلب');
      console.error(error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleProcess = async () => {
    if (!window.confirm("هل أنت متأكد من تنفيذ عملية الاسترجاع مالياً عبر ميسر؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }
    try {
      setIsProcessing(true);
      await axiosClient.post(
        `admin/refund-requests/${requestId}/process`,
        {},
        {
          headers: {
            'Accept-Language': 'ar',
            'Idempotency-Key': `refund-process-${requestId}-${uuidv4()}`
          }
        }
      );
      toast.success('تم التنفيذ المالي بنجاح');
      queryClient.invalidateQueries({ queryKey: ['admin-refund-request', requestId] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء التنفيذ المالي');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      setIsRejecting(true);
      await axiosClient.post(
        `admin/refund-requests/${requestId}/reject`,
        { adminNote: rejectNote },
        {
          headers: {
            'Accept-Language': 'ar',
            'Idempotency-Key': `refund-reject-${requestId}-${uuidv4()}`
          }
        }
      );
      toast.success('تم رفض الطلب بنجاح');
      setIsRejectModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-refund-request', requestId] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء رفض الطلب');
      console.error(error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSync = async (e) => {
    e.preventDefault();
    try {
      setIsSyncing(true);
      const refundedAmountMinor = Math.round(parseFloat(syncAmount) * 100);
      await axiosClient.post(
        `admin/refund-requests/${requestId}/sync`,
        { refundedAmountMinor, reference: syncReference },
        {
          headers: {
            'Accept-Language': 'ar',
            'Idempotency-Key': `refund-sync-${requestId}-${uuidv4()}`
          }
        }
      );
      toast.success('تمت التسوية المالية وتحديث حالة الطلب بنجاح');
      setIsSyncModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-refund-request', requestId] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء التسوية اليدوية');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition">
          <ArrowRight className="w-5 h-5" />
          <span>العودة للقائمة</span>
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-48 animate-pulse flex flex-col gap-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-48 animate-pulse flex flex-col gap-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-48 animate-pulse flex flex-col gap-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6" dir="rtl">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition">
          <ArrowRight className="w-5 h-5" />
          <span>العودة للقائمة</span>
        </button>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-red-500 flex flex-col items-center">
          <AlertCircle className="w-10 h-10 mb-2" />
          <p>حدث خطأ أثناء تحميل تفاصيل الاسترجاع.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REFUNDED':
      case 'COMPLETED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 ml-1" /> مكتمل</span>;
      case 'PENDING':
      case 'REQUESTED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"><Clock className="w-4 h-4 ml-1" /> قيد الانتظار</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"><XCircle className="w-4 h-4 ml-1" /> مرفوض</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };



  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium">
          <ArrowRight className="w-5 h-5" />
          <span>العودة للطلبات</span>
        </button>
        <h2 className="text-xl font-bold text-gray-800">تفاصيل طلب الاسترجاع</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Request Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">معلومات الطلب</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">رقم الطلب:</span>
              <span className="font-medium text-gray-900" title={data.id}>{data.id?.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">رقم الحجز:</span>
              <span className="font-medium text-gray-900">{data.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">السبب:</span>
              <span className="font-medium text-gray-900">{data.reasonText || data.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">تاريخ الطلب:</span>
              <span className="font-medium text-gray-900">{formatDate(data.requestedAt)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Financial Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">التفاصيل المالية</h3>
          <div className="space-y-4 text-sm mt-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">المبلغ المدفوع:</span>
              <span className="font-bold text-gray-900 text-lg">{(data.paidAmountMinor / 100).toFixed(2)} SAR</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800">المبلغ المطلوب استرجاعه:</span>
              <span className="font-bold text-blue-900 text-lg">{(data.requestedAmountMinor / 100).toFixed(2)} SAR</span>
            </div>
            {data.approvedAmountMinor > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">المبلغ المعتمد:</span>
                <span className="font-bold text-green-900 text-lg">{(data.approvedAmountMinor / 100).toFixed(2)} SAR</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Refund Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">حالة الاسترجاع</h3>
          <div className="flex flex-col gap-4 items-start h-full pt-2">
            <div>
              <span className="block text-gray-500 text-sm mb-1">الحالة المالية:</span>
              <span className="font-semibold text-lg text-gray-900">{data.financialStatus?.labelAr || 'غير محدد'}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm mb-2">حالة الطلب:</span>
              {getStatusBadge(data.status)}
            </div>
            {data.adminNote && (
              <div className="mt-auto w-full p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                <span className="block text-yellow-800 text-xs font-semibold mb-1">ملاحظات الإدارة:</span>
                <p className="text-sm text-yellow-900">{data.adminNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 mt-6">
        {['PENDING', 'REQUESTED'].includes(data.status) && (
          <>
            <button 
              onClick={() => {
                setApproveAmount(data.requestedAmountMinor ? (data.requestedAmountMinor / 100).toString() : '');
                setApproveNote('');
                setIsApproveModalOpen(true);
              }}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition shadow-sm"
            >
              موافقة على الاسترجاع
            </button>
            <button 
              onClick={() => {
                setRejectNote('');
                setIsRejectModalOpen(true);
              }}
              className="px-6 py-2.5 border-2 border-red-500 text-red-600 hover:bg-red-50 font-medium rounded-lg transition"
            >
              رفض الطلب
            </button>
          </>
        )}
        
        {data.status === 'APPROVED' && data.isRequestFinanciallyCompleted === false && (
          <div className="flex gap-4 mr-auto">
            <button 
              onClick={handleProcess}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition shadow-sm flex items-center gap-2"
            >
              {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              التنفيذ المالي - ميسر
            </button>
            <button 
              onClick={() => {
                setSyncAmount(data.approvedAmountMinor ? (data.approvedAmountMinor / 100).toString() : '');
                setSyncReference('');
                setIsSyncModalOpen(true);
              }}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition"
            >
              تسوية خارجية يدوية
            </button>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">موافقة على الاسترجاع</h3>
              <button 
                onClick={() => setIsApproveModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleApprove} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المعتمد (ر.س)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  dir="ltr"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات الإدارة (اختياري)</label>
                <textarea 
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                  placeholder="أدخل أي ملاحظات إضافية هنا..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={isApproving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  {isApproving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  تأكيد الموافقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">رفض طلب الاسترجاع</h3>
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleReject} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سبب الرفض / الملاحظات</label>
                <textarea 
                  required
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition resize-none"
                  placeholder="الرجاء كتابة سبب الرفض هنا..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={isRejecting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  {isRejecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  تأكيد الرفض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">تسوية مالية يدوية</h3>
              <button 
                onClick={() => setIsSyncModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSync} className="p-4 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                استخدم هذا الخيار فقط إذا تم إرجاع المبلغ للعميل خارج النظام (مثل حوالة بنكية مباشرة).
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المسترجع (ر.س)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={syncAmount}
                  onChange={(e) => setSyncAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  dir="ltr"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرقم المرجعي</label>
                <input 
                  type="text"
                  required
                  value={syncReference}
                  onChange={(e) => setSyncReference(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="رقم الحوالة أو الإيصال..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsSyncModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={isSyncing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  {isSyncing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  تأكيد التسوية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
