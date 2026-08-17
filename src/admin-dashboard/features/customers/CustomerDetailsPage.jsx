import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Phone, Calendar, List, CheckCircle, XCircle, Star, CalendarDays } from 'lucide-react';
import { useCustomerDetails } from './useCustomerDetails';
import StatCard from '../../../shared/components/ui/StatCard';

const statusStyles = {
  ACTIVE: 'bg-green-50 text-green-700 ring-green-600/20',
  SUSPENDED: 'bg-red-50 text-red-700 ring-red-600/20',
  INACTIVE: 'bg-gray-100 text-gray-500 ring-gray-500/20',
};

const statusLabels = {
  ACTIVE: 'نشط',
  SUSPENDED: 'معلق',
  INACTIVE: 'غير نشط',
};

const bookingStatusStyles = {
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
  PENDING: 'bg-yellow-50 text-yellow-700',
  ACCEPTED: 'bg-blue-50 text-blue-700',
};

const bookingStatusLabels = {
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',
  PENDING: 'قيد الانتظار',
  ACCEPTED: 'مقبول',
};

function formatDate(dateStr) {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function CustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCustomerDetails(customerId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="space-y-3 flex-1">
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse"></div>)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          حدث خطأ أثناء تحميل بيانات العميل.
        </div>
      </div>
    );
  }

  const {
    fullName,
    email,
    phone,
    status,
    createdAt,
    bookingsCount = 0,
    completedBookingsCount = 0,
    cancelledBookingsCount = 0,
    latestBookings = [],
    reviewsWritten = [],
  } = data;

  const initial = fullName ? fullName.charAt(0).toUpperCase() : '?';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل العميل</h1>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold">
          {initial}
        </div>
        
        <div className="flex-1 text-center md:text-right space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${
                statusStyles[status] || statusStyles.INACTIVE
              }`}
            >
              {statusLabels[status] || status}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600">
            {email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                <span dir="ltr">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                <span dir="ltr">{phone}</span>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 pt-1">
            تاريخ الانضمام: {formatDate(createdAt)}
          </div>
        </div>
      </div>

      {/* Booking Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="إجمالي الحجوزات" 
          value={bookingsCount} 
          icon={List} 
          color="blue" 
        />
        <StatCard 
          title="حجوزات مكتملة" 
          value={completedBookingsCount} 
          icon={CheckCircle} 
          color="green" 
        />
        <StatCard 
          title="حجوزات ملغاة" 
          value={cancelledBookingsCount} 
          icon={XCircle} 
          color="red" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Bookings Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">أحدث الحجوزات</h3>
          </div>
          
          <div className="flex-1 p-0">
            {latestBookings && latestBookings.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-4 py-3">رقم الحجز</th>
                      <th className="px-4 py-3">النوع</th>
                      <th className="px-4 py-3">الحالة</th>
                      <th className="px-4 py-3">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {latestBookings.map((booking) => (
                      <tr key={booking.id || booking.codeBooking} className="hover:bg-gray-50/50">
                        <td className="px-4 py-4 font-mono text-gray-700">{booking.codeBooking}</td>
                        <td className="px-4 py-4">
                          {booking.bookingTimeMode === 'NOW' ? 'فوري' : 'مجدول'}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                              bookingStatusStyles[booking.status] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {bookingStatusLabels[booking.status] || booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                          {formatDate(booking.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <CalendarDays className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد حجوزات سابقة لهذا العميل</p>
              </div>
            )}
          </div>
        </div>

        {/* Written Reviews Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">التقييمات المكتوبة</h3>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto max-h-[400px]">
            {reviewsWritten && reviewsWritten.length > 0 ? (
              <div className="space-y-4">
                {reviewsWritten.map((review, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-yellow-300" />
                </div>
                <p className="text-gray-500 font-medium">لم يقم العميل بكتابة أي تقييمات حتى الآن</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
