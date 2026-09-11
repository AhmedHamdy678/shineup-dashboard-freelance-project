import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient, { getApiErrorMessage } from '../../api/axiosClient';
import { ArrowRight, Star, User, Building, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

// 1. Custom Hook for Data Fetching
function useAdminReviewDetails(reviewId) {
  const fetchReviewDetails = async () => {
    const res = await axiosClient.get(`/admin/reviews/${reviewId}`);
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: fetchReviewDetails,
    enabled: !!reviewId,
  });

  return { data, isLoading, isError };
}

function useUpdateReviewVisibility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reviewId, visibleIs, hiddenReason }) => {
      const payload = { visibleIs };
      if (visibleIs === false) {
        payload.hiddenReason = hiddenReason;
      }
      const res = await axiosClient.patch(`/admin/reviews/${reviewId}/visibility`, payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review', variables.reviewId] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews', 'analytics'] });
      toast.success(variables.visibleIs ? 'تم إظهار التقييم بنجاح' : 'تم إخفاء التقييم بنجاح');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'حدث خطأ أثناء التحديث'));
    }
  });
}

// 2. UI Component
export default function ReviewDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: item, isLoading, isError } = useAdminReviewDetails(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hiddenReason, setHiddenReason] = useState('');
  const visibilityMutation = useUpdateReviewVisibility();

  const handleShowReview = () => {
    if (window.confirm('هل أنت متأكد من إعادة إظهار هذا التقييم؟')) {
      visibilityMutation.mutate({ reviewId: id, visibleIs: true });
    }
  };

  const handleHideReview = () => {
    visibilityMutation.mutate({ reviewId: id, visibleIs: false, hiddenReason }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setHiddenReason('');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-gray-500">جاري تحميل التفاصيل...</p>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="p-10 text-center text-red-600 bg-red-50 rounded-xl">
        حدث خطأ أثناء تحميل تفاصيل التقييم أو التقييم غير موجود.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/reviews')}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            title="عودة"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تفاصيل التقييم</h1>
            <p className="text-sm text-gray-500 mt-1">عرض جميع البيانات المتعلقة بالتقييم</p>
          </div>
        </div>
        
        <div>
          {item.visibleIs ? (
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={visibilityMutation.isPending}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition-colors border border-red-200 disabled:opacity-50"
            >
              إخفاء التقييم
            </button>
          ) : (
            <button
              onClick={handleShowReview}
              disabled={visibilityMutation.isPending}
              className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 font-medium rounded-lg transition-colors border border-green-200 disabled:opacity-50"
            >
              إظهار التقييم
            </button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: التقييم والتعليق */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            التقييم والتعليق
          </h2>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-6 h-6 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} 
                />
              ))}
            </div>
            {item.visibleIs ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                مرئي
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-100">
                مخفي
              </span>
            )}
          </div>
          
          <blockquote className="bg-gray-50/80 p-4 rounded-lg text-gray-700 italic border-r-4 border-gray-200 flex-1">
            {item.comment ? `"${item.comment}"` : <span className="text-gray-400 not-italic">لا يوجد تعليق مكتوب</span>}
          </blockquote>
          
          <div className="text-xs text-gray-400 mt-4 text-left">
            كتب في: {item.createdAt ? format(new Date(item.createdAt), 'dd MMMM yyyy, hh:mm a', { locale: ar }) : ''}
          </div>
        </div>

        {/* Card 2: تفاصيل الحجز */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            تفاصيل الحجز
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">كود الحجز</p>
              <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-mono font-medium tracking-wider">
                {item.booking?.codeBooking || 'غير متوفر'}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">حالة الحجز</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {item.booking?.status?.labelAr || 'غير متوفر'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: العميل */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
            <User className="w-5 h-5 text-blue-500" />
            بيانات العميل
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">الاسم الكامل</p>
              <p className="font-medium text-gray-900">{item.customer?.fullName || 'غير متوفر'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
              <p className="font-medium text-gray-900" dir="ltr">{item.customer?.phone || 'غير متوفر'}</p>
            </div>
          </div>
        </div>

        {/* Card 4: مزود الخدمة */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
            <Building className="w-5 h-5 text-blue-500" />
            مزود الخدمة
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">النشاط التجاري</p>
                <p className="font-medium text-gray-900">{item.provider?.nameBusiness || 'غير متوفر'}</p>
              </div>
              {item.provider?.typeProvider === 'COMPANY' ? (
                <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold">شركة</span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">فرد</span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">اسم الفني المسؤول</p>
              <p className="font-medium text-gray-900">{item.providerMember?.displayNameAr || item.providerMember?.fullName || 'غير متوفر'}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Hide Reason Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">سبب إخفاء التقييم</h3>
              <p className="text-sm text-gray-500 mt-1">يرجى كتابة سبب إخفاء هذا التقييم ليتم حفظه في السجلات.</p>
            </div>
            <div className="p-6">
              <textarea
                value={hiddenReason}
                onChange={(e) => setHiddenReason(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="اكتب السبب هنا..."
              ></textarea>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleHideReview}
                disabled={!hiddenReason.trim() || visibilityMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {visibilityMutation.isPending ? 'جاري الإخفاء...' : 'تأكيد الإخفاء'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
