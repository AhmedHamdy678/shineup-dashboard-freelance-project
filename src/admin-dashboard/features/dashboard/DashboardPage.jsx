import { useGetDashboardOverview } from "./useDashboardOverview";
import StatCard from "../../../shared/components/ui/StatCard";
import { 
  Wallet, 
  Store, 
  CalendarClock, 
  MessageCircleWarning, 
  Star,
  Users,
  Building2,
  UserCircle,
  CheckCircle2,
  XCircle,
  CreditCard,
  AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardOverview();

  if (isLoading) return <div className="p-6 text-gray-500">جارٍ التحميل...</div>;
  if (isError) return <div className="p-6 text-red-500">حدث خطأ في تحميل البيانات</div>;

  if (!data) return null;

  const { payments, providers, bookings, support, users, reviews } = data;
  const unreadSupport = (support?.unreadSupportConversations || 0) + (support?.unreadProviderSupportConversations || 0);

  // Formatting currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount || 0);
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">نظرة عامة</h1>
        <p className="text-gray-500 mt-1">مرحباً بعودتك. إليك ملخص الأداء العام للمنصة.</p>
      </div>

      {/* Section 1: Critical Actions & Revenue */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="إجمالي الإيرادات" 
            value={formatCurrency(payments?.revenueTotal)} 
            icon={Wallet} 
            color="green" 
          />
          <StatCard 
            title="المزودين المعلقين" 
            value={providers?.pendingProviders || 0} 
            icon={Store} 
            color="yellow" 
            badge="بانتظار الموافقة"
          />
          <StatCard 
            title="الحجوزات النشطة" 
            value={bookings?.activeBookings || 0} 
            icon={CalendarClock} 
            color="blue" 
          />
          <StatCard 
            title="رسائل الدعم غير المقروءة" 
            value={unreadSupport} 
            icon={MessageCircleWarning} 
            color="red" 
            subValue="تتطلب استجابة"
          />
        </div>
      </section>

      {/* Section 2: Users & Providers Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">إحصائيات المستخدمين</h2>
              <p className="text-sm text-gray-500">إجمالي {users?.totalUsers || 0} مستخدم</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">عملاء</p>
              <p className="text-xl font-bold text-gray-900">{users?.totalCustomers || 0}</p>
            </div>
            <div className="text-center border-r border-gray-100 pr-4">
              <p className="text-gray-500 text-sm mb-1">مُلاك</p>
              <p className="text-xl font-bold text-gray-900">{users?.totalProviderOwners || 0}</p>
            </div>
            <div className="text-center border-r border-gray-100 pr-4">
              <p className="text-gray-500 text-sm mb-1">أعضاء فرق</p>
              <p className="text-xl font-bold text-gray-900">{users?.totalProviderMembers || 0}</p>
            </div>
          </div>
        </div>

        {/* Providers Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">إحصائيات المزودين</h2>
              <p className="text-sm text-gray-500">إجمالي {providers?.totalProviders || 0} مزود</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">شركات</p>
              <p className="text-xl font-bold text-gray-900">{providers?.totalCompanyProviders || 0}</p>
            </div>
            <div className="text-center border-r border-gray-100 pr-4">
              <p className="text-gray-500 text-sm mb-1">أفراد</p>
              <p className="text-xl font-bold text-gray-900">{providers?.totalIndividualProviders || 0}</p>
            </div>
            <div className="text-center border-r border-gray-100 pr-4">
              <p className="text-gray-500 text-sm mb-1">معتمدين</p>
              <p className="text-xl font-bold text-emerald-600">{providers?.approvedProviders || 0}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Operations */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500 mb-4">ملخص الحجوزات</p>
          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="text-lg font-bold">{bookings?.completedBookings || 0}</p>
                <p className="text-xs">مكتمل</p>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="w-5 h-5" />
              <div>
                <p className="text-lg font-bold">{bookings?.cancelledBookings || 0}</p>
                <p className="text-xs">ملغى</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500 mb-4">حالة المدفوعات</p>
          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center gap-2 text-emerald-600">
              <CreditCard className="w-5 h-5" />
              <div>
                <p className="text-lg font-bold">{payments?.paymentsPaidCount || 0}</p>
                <p className="text-xs">ناجحة</p>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="text-lg font-bold">{payments?.paymentsFailedCount || 0}</p>
                <p className="text-xs">فاشلة</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500 mb-4">التقييمات</p>
          <div className="flex items-center gap-4 mt-auto">
            <div className="p-3 bg-yellow-50 text-yellow-500 rounded-xl">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reviews?.averageRating?.toFixed(1) || '0.0'} <span className="text-sm font-normal text-gray-500">/ 5</span></p>
              <p className="text-sm text-gray-500">{reviews?.totalReviews || 0} تقييم إجمالي</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
