import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { Star, MessageSquare, Eye, EyeOff, Award, UserCheck } from 'lucide-react';

function useAdminReviewsAnalytics() {
  return useQuery({
    queryKey: ['admin', 'reviews', 'analytics'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/reviews/analytics');
      return res.data;
    }
  });
}

export default function ReviewsAnalyticsOverview() {
  const { data, isLoading, isError } = useAdminReviewsAnalytics();

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
        تعذر تحميل إحصائيات التقييمات.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse mb-8">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
        <div className="h-64 bg-gray-200 rounded-xl lg:col-span-2"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Section A: KPI Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">إجمالي التقييمات</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalReviews}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
        
        {/* Average Rating */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">متوسط التقييم</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data.averageRating ? Number(data.averageRating).toFixed(1) : '0.0'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
            <Star className="w-5 h-5 fill-yellow-500" />
          </div>
        </div>

        {/* Visible Reviews */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">التقييمات المرئية</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{data.visibleReviews}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        {/* Hidden Reviews */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">التقييمات المخفية</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{data.hiddenReviews}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <EyeOff className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Section B: Rating Distribution */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          توزيع التقييمات
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = data.ratingDistribution?.[star] || 0;
            const percentage = data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-8 flex items-center gap-1 font-medium text-gray-700">
                  {star} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-left text-gray-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section C: Leaderboards */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Top Providers */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
              <Award className="w-5 h-5 text-blue-500" />
              أفضل مقدمي الخدمات
            </h3>
            <div className="space-y-4">
              {data.topRatedProviders?.length === 0 ? (
                <p className="text-sm text-gray-400">لا توجد بيانات</p>
              ) : (
                data.topRatedProviders?.slice(0, 5).map((item, idx) => (
                  <div key={item.providerId} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-bold text-gray-400">{idx + 1}.</span>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {item.provider?.nameBusinessAr || item.provider?.nameBusinessEn || 'غير محدد'}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          item.provider?.typeProvider === 'COMPANY' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {item.provider?.typeProvider === 'COMPANY' ? 'شركة' : 'فرد'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-gray-800">
                      {item.averageRating ? Number(item.averageRating).toFixed(1) : '0.0'}
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Technicians */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
              <UserCheck className="w-5 h-5 text-emerald-500" />
              أفضل الفنيين
            </h3>
            <div className="space-y-4">
              {data.topRatedProviderMembers?.length === 0 ? (
                <p className="text-sm text-gray-400">لا توجد بيانات</p>
              ) : (
                data.topRatedProviderMembers?.slice(0, 5).map((item, idx) => (
                  <div key={item.providerMemberId} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-bold text-gray-400">{idx + 1}.</span>
                      <p className="text-sm font-medium text-gray-900">
                        {item.providerMember?.operationalProfile?.displayName || item.providerMember?.user?.fullName || "اسم غير متوفر"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-gray-800">
                      {item.averageRating ? Number(item.averageRating).toFixed(1) : '0.0'}
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
