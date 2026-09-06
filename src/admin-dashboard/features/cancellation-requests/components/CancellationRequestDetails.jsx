import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Calendar, FileText, AlertCircle, Ban, Copy, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../../../api/axiosClient';
import formatDate from '../../../../shared/utils/formatDate';
import { useApproveCancellationRequest, useRejectCancellationRequest } from '../useCancellationRequests';

export default function CancellationRequestDetails({ requestId, onBack }) {
  const { mutateAsync: approveRequestAsync, isPending: isApproving } = useApproveCancellationRequest();
  const { mutateAsync: rejectRequestAsync, isPending: isRejecting } = useRejectCancellationRequest();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");


  const { data: responseData, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-cancellation-request', requestId],
    queryFn: async () => {
      const res = await axiosClient.get(`admin/booking-cancellation-requests/${requestId}`);
      return res.data;
    },
    enabled: !!requestId,
  });

  const data = responseData?.data || responseData;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ المرجع');
  };

  const handleApprove = async () => {
    if (window.confirm("هل أنت متأكد من الموافقة على إلغاء هذا الحجز؟")) {
      try {
        await approveRequestAsync(requestId);
      } catch (error) {
        if (error.response?.status === 409) {
          toast.error("عفواً، تم اتخاذ إجراء على هذا الطلب مسبقاً.");
          refetch();
        }
      }
    }
  };

  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await rejectRequestAsync({ id: requestId, payload: { providerDecisionReason: rejectReason.trim() } });
      setIsRejectModalOpen(false);
      setRejectReason("");
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("عفواً، تم اتخاذ إجراء على هذا الطلب مسبقاً.");
        refetch();
        setIsRejectModalOpen(false);
        setRejectReason("");
      }
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    let bg = 'bg-gray-100';
    let text = 'text-gray-800';

    switch (status.code) {
      case 'ADMIN_APPROVED':
      case 'PROVIDER_APPROVED':
        bg = 'bg-green-100';
        text = 'text-green-800';
        break;
      case 'PENDING':
      case 'WAITING_ADMIN_DECISION':
      case 'ESCALATED_TO_ADMIN':
      case 'ESCALATED':
        bg = 'bg-yellow-100';
        text = 'text-yellow-800';
        break;
      case 'REJECTED':
      case 'PROVIDER_REJECTED':
      case 'ADMIN_REJECTED':
        bg = 'bg-red-100';
        text = 'text-red-800';
        break;
      default:
        break;
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
        {status.label}
      </span>
    );
  };

  const isPendingStatus = data?.status?.code === 'PENDING';

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium">
          <ArrowRight className="w-5 h-5" />
          <span>العودة للطلبات</span>
        </button>
        <h2 className="text-xl font-bold text-gray-800">تفاصيل طلب الإلغاء</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse h-48"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse h-48"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse h-48"></div>
          </>
        ) : isError || !data ? (
          <div className="col-span-3 bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-red-500 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p>حدث خطأ أثناء تحميل تفاصيل الطلب.</p>
          </div>
        ) : (
          <>
            {/* Card 1: Basic Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                معلومات الطلب الأساسية
              </h3>
              <div className="space-y-4 text-sm mt-2">
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-gray-500">رقم الطلب:</span>
                  <span className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded text-xs" title={data.id}>
                    {data.id?.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-gray-500">معرف الحجز:</span>
                  <span className="font-medium text-gray-900">{data.bookingId}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-gray-500">الحالة:</span>
                  {getStatusBadge(data.status)}
                </div>
                <div className="flex flex-col gap-1 mt-auto pt-2">
                  <span className="text-gray-500">السبب:</span>
                  <span className="font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {data.reasonText || data.reasonCode || 'غير محدد'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Timeline */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                الجدول الزمني للطلب
              </h3>
              <div className="space-y-4 text-sm mt-4 relative before:absolute before:inset-y-0 before:right-2 before:w-0.5 before:bg-gray-100">
                <div className="relative pr-6">
                  <span className="absolute right-1 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></span>
                  <span className="block text-gray-500 mb-1">تاريخ إنشاء الطلب</span>
                  <span className="font-medium text-gray-900" dir="ltr">{formatDate(data.requestedAt)}</span>
                </div>
                
                {data.providerResponseDeadlineAt && (
                  <div className="relative pr-6">
                    <span className="absolute right-1 top-1 w-2.5 h-2.5 rounded-full bg-orange-400 ring-4 ring-white"></span>
                    <span className="block text-gray-500 mb-1">المهلة المحددة لرد المزود</span>
                    <span className="font-medium text-gray-900" dir="ltr">{formatDate(data.providerResponseDeadlineAt)}</span>
                  </div>
                )}

                {data.respondedAt && (
                  <div className="relative pr-6">
                    <span className="absolute right-1 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white"></span>
                    <span className="block text-gray-500 mb-1">تاريخ الرد</span>
                    <span className="font-medium text-gray-900" dir="ltr">{formatDate(data.respondedAt)}</span>
                  </div>
                )}

                {data.resolvedAt && (
                  <div className="relative pr-6">
                    <span className="absolute right-1 top-1 w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-white"></span>
                    <span className="block text-gray-500 mb-1">تاريخ حسم الطلب</span>
                    <span className="font-medium text-gray-900" dir="ltr">{formatDate(data.resolvedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Additional Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                معلومات إضافية (نظام)
              </h3>
              {(data.arrivalContinuationDecisionId || data.scheduleConflictId) ? (
                <div className="space-y-4 text-sm mt-2">
                  {data.arrivalContinuationDecisionId && (
                    <div className="flex flex-col gap-2 p-4 bg-red-50 text-red-800 rounded-lg">
                      <span className="font-semibold text-xs text-red-600">مرجع قرار العميل (تأخر المزود):</span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm break-all" dir="ltr">{data.arrivalContinuationDecisionId}</span>
                        <button 
                          onClick={() => handleCopy(data.arrivalContinuationDecisionId)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition shrink-0"
                          title="نسخ المرجع"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-red-700 mt-1 opacity-80 leading-relaxed">
                        يُستخدم هذا المرجع لتتبع السجل الدقيق لقرار العميل وقت تأخر مقدم الخدمة وحسم النزاعات.
                      </p>
                    </div>
                  )}
                  {data.scheduleConflictId && (
                    <div className="flex flex-col gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                      <span className="font-semibold text-xs text-yellow-600">معرف تعارض المواعيد:</span>
                      <span className="font-mono text-sm break-all" dir="ltr">{data.scheduleConflictId}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm h-full">
                  لا توجد معلومات إضافية مرتبطة
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions Footer */}
      {!isLoading && !isError && data && isPendingStatus && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleReject}
            disabled={isApproving || isRejecting}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRejecting ? (
              <span className="w-5 h-5 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin"></span>
            ) : (
              <X className="w-5 h-5" />
            )}
            رفض الطلب
          </button>
          
          <button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Check className="w-5 h-5" />
            )}
            موافقة على الإلغاء
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" dir="rtl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">سبب رفض الإلغاء</h3>
                <p className="text-sm text-gray-500">يرجى توضيح سبب الرفض لمزود الخدمة أو العميل</p>
              </div>
            </div>
            <div className="p-6">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                maxLength={100}
                placeholder="اكتب سبب الرفض هنا..."
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[100px] resize-y"
              />
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <span>يجب ألا يتجاوز السبب 100 حرف</span>
                <span>{rejectReason.length}/100</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason("");
                }}
                disabled={isRejecting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={confirmReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRejecting && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
