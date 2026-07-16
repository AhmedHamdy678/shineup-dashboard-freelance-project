import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { Star, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import ReviewsAnalyticsOverview from './ReviewsAnalyticsOverview';

// 1. Custom Hook for Data Fetching & State
function useAdminReviews() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchReviews = async (currentPage) => {
    const res = await axiosClient.get(`/admin/reviews?page=${currentPage}&limit=${limit}&sortBy=createdAt&sortOrder=desc`);
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-reviews', page],
    queryFn: () => fetchReviews(page),
    placeholderData: keepPreviousData,
  });

  return { data, isLoading, isError, page, setPage };
}

// 2. UI Component
export default function ReviewsPage() {
  const { data, isLoading, isError, page, setPage } = useAdminReviews();
  const navigate = useNavigate();

  const handleNextPage = () => {
    if (data?.meta && page < data.meta.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl">
        حدث خطأ أثناء جلب التقييمات.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">تقييمات العملاء</h1>
        <p className="text-sm text-gray-500 mt-1">
          إدارة ومتابعة التقييمات المقدمة من العملاء لمقدمي الخدمات.
        </p>
      </div>

      {/* Analytics Overview Section */}
      <ReviewsAnalyticsOverview />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            لا توجد تقييمات حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">العميل</th>
                  <th className="px-6 py-4">مزود الخدمة</th>
                  <th className="px-6 py-4">تفاصيل الحجز</th>
                  <th className="px-6 py-4">التقييم والتعليق</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{item.customer?.fullName}</div>
                      <div className="text-gray-500 text-xs mt-1" dir="ltr">{item.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {item.provider?.nameBusiness}
                        {item.provider?.typeProvider === 'COMPANY' ? (
                          <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            شركة
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            فرد
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        الفني: {item.providerMember?.displayName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-mono font-medium">
                        {item.booking?.codeBooking}
                      </div>
                      <div className="text-gray-500 text-xs mt-2">
                        {item.createdAt ? format(new Date(item.createdAt), 'dd MMMM yyyy', { locale: ar }) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      <div className="text-gray-700 italic text-sm line-clamp-3">
                        {item.comment ? `"${item.comment}"` : <span className="text-gray-400 not-italic">بدون تعليق</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.visibleIs ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          مرئي
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                          مخفي
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/admin/reviews/${item.id}`)}
                        className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-sm text-gray-600">
              صفحة <span className="font-semibold">{data.meta.page}</span> من <span className="font-semibold">{data.meta.totalPages}</span>
              <span className="mx-2 text-gray-300">|</span>
              إجمالي التقييمات: {data.meta.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="السابق"
              >
                <ChevronRight className="w-4 h-4" /> {/* RTL chevron for Previous */}
              </button>
              <button
                onClick={handleNextPage}
                disabled={page === data.meta.totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="التالي"
              >
                <ChevronLeft className="w-4 h-4" /> {/* RTL chevron for Next */}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
