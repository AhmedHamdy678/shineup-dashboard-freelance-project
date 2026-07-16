import { useState } from "react";
import { Star } from "lucide-react";
import { useGetReviewsSummary, useGetReviews } from "./useProviderReviews";
import Pagination from "../../../shared/components/ui/Pagination";

function StarRating({ rating }) {
  const roundedRating = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= roundedRating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProviderReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: summaryData, isLoading: isLoadingSummary } = useGetReviewsSummary();
  const { data: reviewsData, isLoading: isLoadingReviews } = useGetReviews({ page: currentPage, limit });

  const summary = summaryData || { averageRating: 0, reviewsCount: 0, ratingDistribution: {}, lastReviewAt: null };
  const items = Array.isArray(reviewsData?.items) ? reviewsData.items : (Array.isArray(reviewsData) ? reviewsData : []);
  const meta = reviewsData?.meta || { page: 1, totalPages: 1 };

  // Calculate rating distribution bars
  const totalReviews = summary.reviewsCount || 1; // Prevent division by zero
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = summary.ratingDistribution?.[stars] || 0;
    const percentage = (count / totalReviews) * 100;
    return { stars, count, percentage };
  });

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">التقييمات</h1>
        <p className="text-gray-500 mt-1">تابع تقييمات العملاء لجودة خدماتك وأداء فريقك.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Average Rating */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
          {isLoadingSummary ? (
            <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-amber-400 animate-spin" />
          ) : (
            <>
              <span className="text-5xl font-bold text-gray-900 mb-2">
                {Number(summary.averageRating || 0).toFixed(1)}
              </span>
              <StarRating rating={summary.averageRating} />
              {summary.lastReviewAt && (
                <p className="text-xs text-gray-400 mt-3">
                  آخر تقييم: {new Date(summary.lastReviewAt).toLocaleDateString("ar-EG")}
                </p>
              )}
            </>
          )}
        </div>

        {/* Card 2: Total Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
          {isLoadingSummary ? (
            <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-blue-400 animate-spin" />
          ) : (
            <>
              <span className="text-5xl font-bold text-gray-900 mb-2">
                {summary.reviewsCount || 0}
              </span>
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                إجمالي التقييمات
              </span>
            </>
          )}
        </div>

        {/* Card 3: Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          {isLoadingSummary ? (
            <div className="space-y-3 w-full">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5 w-full">
              {distribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-8 shrink-0 text-gray-600 font-medium">
                    {stars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 shrink-0 text-left text-gray-500 font-medium">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">سجل التقييمات</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                <th className="px-6 py-4 text-center">العميل</th>
                <th className="px-6 py-4 text-center">التقييم والتعليق</th>
                <th className="px-6 py-4 text-center">الخدمة</th>
                <th className="px-6 py-4 text-center">الموظف</th>
                <th className="px-6 py-4 text-center">رقم الحجز</th>
                <th className="px-6 py-4 text-center">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white text-center">
              {isLoadingReviews ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-emerald-500 animate-spin mb-4" />
                      <p className="text-gray-500">جاري تحميل التقييمات...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="font-medium">لا توجد تقييمات مسجلة بعد</p>
                  </td>
                </tr>
              ) : (
                items.map((review) => {
                  const customerName = review?.customer?.fullName || "عميل غير معروف";
                  const serviceName = review?.booking?.service?.nameAr || review?.booking?.service?.nameEn || "خدمة عامة";
                  const memberName = review?.providerMember?.displayNameAr || review?.providerMember?.displayName || "غير محدد";
                  const bookingCode = review?.booking?.codeBooking || "—";
                  const dateStr = review?.createdAt ? new Date(review.createdAt).toLocaleDateString("ar-EG", { year: 'numeric', month: 'long', day: 'numeric' }) : "—";
                  const initials = memberName !== "غير محدد" ? memberName.substring(0, 2).toUpperCase() : "?";

                  return (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {customerName}
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="flex justify-center">
                          <StarRating rating={review.rating} />
                        </div>
                        <p className={`mt-2 text-sm leading-relaxed ${review.comment ? "text-gray-700" : "text-gray-400 italic"}`}>
                          {review.comment || "بدون تعليق"}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {serviceName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <span className="text-gray-700">{memberName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium uppercase tracking-wider">
                          {bookingCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination logic */}
        {meta && meta.totalPages > 1 && (
          <div className="border-t border-gray-100 bg-white px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
