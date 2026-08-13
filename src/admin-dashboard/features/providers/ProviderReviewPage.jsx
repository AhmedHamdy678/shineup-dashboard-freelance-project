import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Circle, Download, MapPin, User, Mail, Phone, FileText, Check, X } from 'lucide-react';
import { useAdminProviderDetails } from './useProviders';
import { approveProvider, rejectProvider } from '../../api/endpoints/providers.api';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import ProviderMembersList from './ProviderMembersList';

const statusMap = {
  APPROVED: { text: 'مقبول', bg: 'bg-green-100 text-green-700' },
  PENDING_REVIEW: { text: 'قيد المراجعة', bg: 'bg-yellow-100 text-yellow-700' },
  REJECTED: { text: 'مرفوض', bg: 'bg-red-100 text-red-700' },
};

const getFileUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_SOCKET_URL || '';
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

export default function ProviderReviewPage() {
  const { providerId, id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Support both /:providerId and /:id
  const targetId = providerId || id;

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: provider, isLoading, isError } = useAdminProviderDetails(targetId);

  const approveMutation = useMutation({
    mutationFn: approveProvider,
    onSuccess: () => {
      toast.success('تم اعتماد المزود بنجاح! سيتم إشعاره الآن.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider', targetId] });
      queryClient.invalidateQueries({ queryKey: ['individual-providers'] });
      queryClient.invalidateQueries({ queryKey: ['company-owners'] });
      queryClient.invalidateQueries({ queryKey: ['pending-providers'] });
      navigate('/admin/providers');
    },
    onError: (error) => {
      console.error('Approve Provider Error:', error?.response || error);
      toast.error('حدث خطأ أثناء قبول المزود');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectProvider,
    onSuccess: () => {
      toast.success('تم رفض المزود بنجاح');
      setIsRejectModalOpen(false);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider', targetId] });
      queryClient.invalidateQueries({ queryKey: ['pending-providers'] });
    },
    onError: (error) => {
      console.error('Reject Provider Error:', error?.response || error);
      toast.error('حدث خطأ أثناء رفض المزود');
    },
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadDocument = async (mediaId, fileName) => {
    if (!mediaId) {
      toast.error('معرف المستند غير متوفر.');
      return;
    }
    
    try {
      setIsDownloading(true);
      const response = await axiosClient.get(`/admin/providers/${targetId}/verification-documents/${mediaId}`, { 
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `verification-document-${targetId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download Error:', error);
      toast.error('حدث خطأ أثناء تحميل المستند. تأكد من صلاحياتك أو صحة المسار.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-40" />
        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="p-6 text-center">
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm">
          <p className="text-red-500 font-medium">فشل تحميل بيانات المزود</p>
          <button onClick={() => navigate('/admin/providers')} className="mt-4 text-sm text-blue-600 hover:underline">
            العودة إلى مزودي الخدمات
          </button>
        </div>
      </div>
    );
  }

  const statusData = statusMap[provider.statusCode] || { text: provider.statusCode || 'غير محدد', bg: 'bg-gray-100 text-gray-700' };
  const typeText = provider.typeProvider === 'COMPANY' ? 'شركة' : 'فرد';
  const initials = (provider.nameBusinessAr || provider.nameBusinessEn || 'م').charAt(0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/providers')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={16} />
        العودة إلى مزودي الخدمات
      </button>

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-2xl font-bold text-blue-600 overflow-hidden shrink-0">
              {provider.files?.logo?.url ? (
                <img src={getFileUrl(provider.files.logo.url)} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{provider.nameBusinessAr || '—'}</h1>
                {provider.nameBusinessEn && (
                  <span className="text-sm text-gray-500 font-medium" dir="ltr">{provider.nameBusinessEn}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusData.bg}`}>
                  {statusData.text}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  {typeText}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          {provider.statusCode === 'PENDING_REVIEW' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من الموافقة على هذا المزود وتفعيل حسابه؟')) {
                    approveMutation.mutate(provider.providerId || provider.id);
                  }
                }}
                disabled={approveMutation.isPending}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50 disabled:cursor-wait"
              >
                <Check size={16} />
                {approveMutation.isPending ? 'جاري الاعتماد...' : 'موافقة واعتماد'}
              </button>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition shadow-sm"
              >
                <X size={16} />
                رفض الطلب
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columns 1 & 2 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">تفاصيل النشاط</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-50">
                <FileText size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">السجل التجاري / رقم الترخيص</p>
                  <p className="text-sm text-gray-900">{provider.registerCommercial || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">الوصف</p>
                  <p className="text-sm text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {provider.descriptionAr || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">بيانات المالك</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">الاسم الكامل</p>
                  <p className="text-sm text-gray-900 font-medium">{provider.owner?.fullName || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">رقم الهاتف</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-900" dir="ltr">{provider.owner?.phone || '—'}</p>
                    {provider.owner?.isPhoneVerified && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded uppercase tracking-wider">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">البريد الإلكتروني</p>
                  <p className="text-sm text-gray-900" dir="ltr">{provider.owner?.email || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {provider.address && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">الموقع والعنوان</h2>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{provider.address.title || 'العنوان الرئيسي'}</p>
                  <p className="text-sm text-gray-600">
                    {[provider.address.city, provider.address.area, provider.address.street].filter(Boolean).join('، ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Checklist & Documents */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">اكتمال الملف والمستندات</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                {provider.reviewFlags?.logoUploaded ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} className="text-gray-300" />}
                <span className="text-sm text-gray-700">شعار النشاط (Logo)</span>
              </div>
              <div className="flex items-center gap-3">
                {provider.reviewFlags?.coverUploaded ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} className="text-gray-300" />}
                <span className="text-sm text-gray-700">صورة الغلاف (Cover)</span>
              </div>
              <div className="flex items-center gap-3">
                {provider.reviewFlags?.verificationDocumentUploaded ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} className="text-gray-300" />}
                <span className="text-sm text-gray-700">مستند التوثيق</span>
              </div>
              <div className="flex items-center gap-3">
                {provider.reviewFlags?.profileComplete ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} className="text-gray-300" />}
                <span className="text-sm text-gray-700">الملف الشخصي مكتمل</span>
              </div>
            </div>

            {provider.files?.verificationDocument && (
              <div className="pt-5 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-900 mb-3">مستند التوثيق المرفق</p>
                <button
                  onClick={() => handleDownloadDocument(
                    provider.files.verificationDocument.mediaId || provider.files.verificationDocument.id,
                    provider.files.verificationDocument.fileName || provider.files.verificationDocument.name
                  )}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition group disabled:opacity-75 disabled:cursor-wait"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-md text-blue-600">
                      {isDownloading ? (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FileText size={20} />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition">
                        {isDownloading ? 'جاري التحميل...' : 'تحميل المستند'}
                      </p>
                      {provider.files.verificationDocument.fileName && (
                        <p className="text-xs text-gray-500 truncate max-w-[200px]" dir="ltr">{provider.files.verificationDocument.fileName}</p>
                      )}
                    </div>
                  </div>
                  <Download size={18} className="text-gray-400 group-hover:text-blue-600 transition" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProviderMembersList providerId={targetId} />

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">سبب الرفض</h3>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
              placeholder="اكتب سبب الرفض هنا ليتم إرساله للمزود..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                إلغاء
              </button>
              <button
                onClick={() => rejectMutation.mutate({ providerId: provider.id, reason: rejectReason })}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'جاري الرفض...' : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
