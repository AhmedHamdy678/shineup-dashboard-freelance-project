import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useAnalytics } from './useAnalytics';
import StatCard from '../../../shared/components/ui/StatCard';
import RevenueTrendChart from '../../../shared/components/charts/RevenueTrendChart';
import BookingsByCategoryChart from '../../../shared/components/charts/BookingsByCategoryChart';
import UserAcquisitionChart from '../../../shared/components/charts/UserAcquisitionChart';
import PaymentMethodChart from '../../../shared/components/charts/PaymentMethodChart';

const PERIODS = [
  { value: 'month', label: 'هذا الشهر' },
  { value: 'week', label: 'هذا الأسبوع' },
  { value: 'year', label: 'هذا العام' },
];

function Trend({ value }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
      <TrendingUp size={12} />
      {value}
    </span>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month');
  const { data, isLoading, isError } = useAnalytics(period);

  if (isLoading) return <div className="p-6 text-gray-500">جارٍ التحميل...</div>;
  if (isError) return <div className="p-6 text-red-500">حدث خطأ في تحميل بيانات التحليلات</div>;

  const {
    stats,
    revenueTrend,
    bookingsByCategory,
    topServices,
    userAcquisition,
    paymentMethods,
    topBusinesses,
  } = data;

  return (
    <div className="p-6 space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تحليلات المنصة</h1>
          <p className="text-sm text-gray-500 mt-1">
            مراقبة جميع الإيرادات والمستخدمين ومقاييس الخدمة على مستوى المنصة
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="حجوزات المنصة"
          value={stats.bookings}
          sub={<Trend value={stats.bookingsTrend} />}
        />
        <StatCard
          label="إيرادات المنصة"
          value={`EGP ${stats.revenue}`}
          sub={<Trend value={stats.revenueTrend} />}
        />
        <StatCard
          label="رسوم المنصة"
          value={`EGP ${stats.platformFees}`}
          sub={<Trend value={stats.feesTrend} />}
        />
        <StatCard
          label="إجمالي المستخدمين"
          value={stats.totalUsers}
          sub={<Trend value={stats.usersTrend} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">اتجاه الإيرادات</h2>
          <RevenueTrendChart data={revenueTrend} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">الحجوزات حسب الفئة</h2>
          <BookingsByCategoryChart data={bookingsByCategory} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">أفضل الخدمات على المنصة</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-start pb-3 font-medium w-8">#</th>
                <th className="text-start pb-3 font-medium">الخدمة</th>
                <th className="text-start pb-3 font-medium">الحجوزات</th>
                <th className="text-end pb-3 font-medium">القيمة الإجمالية</th>
              </tr>
            </thead>
            <tbody>
              {topServices.map((service) => (
                <tr key={service.rank} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 text-gray-400">{service.rank}</td>
                  <td className="py-3 font-medium text-gray-800">{service.name}</td>
                  <td className="py-3 text-blue-500 font-medium">{service.bookings}</td>
                  <td className="py-3 text-end text-gray-700">EGP {service.totalValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">اكتساب المستخدمين</h2>
          <UserAcquisitionChart data={userAcquisition} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">الإيرادات حسب طريقة الدفع</h2>
          <PaymentMethodChart data={paymentMethods} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">أفضل المنشآت أداءً</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-start pb-3 font-medium w-8">#</th>
                <th className="text-start pb-3 font-medium">اسم المنشأة</th>
                <th className="text-start pb-3 font-medium">التقييم</th>
                <th className="text-start pb-3 font-medium">الحجوزات</th>
                <th className="text-end pb-3 font-medium">صافي الإيرادات</th>
              </tr>
            </thead>
            <tbody>
              {topBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                    لا توجد منشآت نشطة حققت إيرادات خلال هذه الفترة
                  </td>
                </tr>
              ) : (
                topBusinesses.map((biz, i) => (
                  <tr key={biz.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-gray-400">{i + 1}</td>
                    <td className="py-3 font-medium text-gray-800">{biz.name}</td>
                    <td className="py-3 text-gray-600">{biz.rating ?? '\u2014'}</td>
                    <td className="py-3 text-gray-600">{biz.bookings}</td>
                    <td className="py-3 text-end text-gray-700">EGP {biz.netRevenue}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
