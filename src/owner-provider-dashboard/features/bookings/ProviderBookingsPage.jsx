import { useState, useEffect, useRef } from "react";
import { Calendar, Search, Filter, Clock, Car, MoreHorizontal, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProviderBookings, useUpdateBookingStatus } from "./useProviderBookings";


const statusFilters = ["all", "pending", "confirmed", "completed", "cancelled"];

const statusLabels = {
  pending: "معلق",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export default function ProviderBookingsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const { data: bookings, isLoading } = useProviderBookings();
  const { mutate: updateStatus } = useUpdateBookingStatus();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = Array.isArray(bookings) ? bookings : (bookings?.items || []);
  const filtered = items.filter((b) => {
    const customerName = b.booking?.customer?.fullName || b.customerName || "";
    const serviceName = b.booking?.items?.[0]?.serviceName || b.serviceName || "";
    const matchesSearch = customerName.includes(search) || serviceName.includes(search);
    
    let matchesDate = true;
    if (selectedDate) {
      let bDate = "";
      if (b.booking?.scheduledAt) {
        const d = new Date(b.booking.scheduledAt);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        bDate = `${year}-${month}-${day}`;
      } else if (b.date) {
        // Handle formats like "2026/9/8" or "2026-09-08"
        const parts = b.date.split(/[-/]/);
        if (parts.length === 3) {
          const year = parts[0].length === 4 ? parts[0] : parts[2];
          const month = String(parts[1]).padStart(2, '0');
          const day = String(parts[0].length === 4 ? parts[2] : parts[0]).padStart(2, '0');
          bDate = `${year}-${month}-${day}`;
        }
      }
      matchesDate = bDate === selectedDate;
    }

    if (!matchesDate) return false;
    
    if (filter === "all") return matchesSearch;
    
    const status = (b.booking?.bookingStatus?.code || b.requestStatus?.code || b.status || "").toLowerCase();
    let displayStatus = status;
    if (status.includes('cancel')) displayStatus = 'cancelled';
    else if (status.includes('accept') || status.includes('confirm')) displayStatus = 'confirmed';
    else if (status.includes('complet')) displayStatus = 'completed';
    else if (status.includes('pend') || status.includes('request')) displayStatus = 'pending';
    
    return matchesSearch && displayStatus === filter;
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الحجوزات</h1>
          <p className="text-gray-500 mt-1">إدارة جميع الحجوزات الواردة</p>
        </div>
        <div className="flex items-center gap-1 text-sm bg-white border border-gray-200 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-gray-700 bg-transparent outline-none cursor-pointer border-none py-1 px-2 focus:ring-0 min-w-[130px] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-clear-button]:hidden"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
              title="إلغاء تصفية التاريخ"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث..."
            className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === s
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s === "all" ? "الكل" : statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="w-full overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-right px-4 py-3 font-medium text-gray-500 w-12">#</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">كود الحجز</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">العميل</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">تفاصيل الخدمة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">مُسند إلى</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">التاريخ والوقت</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">المبلغ والدفع</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">الحالة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">جارٍ التحميل...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400">لا توجد حجوزات</td>
                </tr>
              ) : filtered.map((b, index) => {
                const bookingCode = b.booking?.codeBooking || b.bookingId || `#BKG-${typeof b.id === 'string' ? b.id.substring(0, 8) : b.id}`;
                const customerName = b.booking?.customer?.fullName || b.customerName;
                const customerPhone = b.booking?.customer?.phone || b.customerPhone || "01000000000";
                const serviceName = b.booking?.items?.[0]?.serviceName || b.serviceName;
                const carTypeDetails = b.booking?.car ? `${b.booking.car.brand} ${b.booking.car.model}` : (b.booking?.items?.[0]?.carTypeName || b.carTypeDetails || "سيدان");
                const assignedTeamMember = b.targetedProviderMember?.name || b.assignedTeamMember || "غير محدد";
                const assignedRole = b.assignedRole || "عضو فريق";
                
                let dateStr = b.date;
                let timeStr = b.timeSlot;
                if (b.booking?.scheduledAt) {
                  const scheduled = new Date(b.booking.scheduledAt);
                  dateStr = scheduled.toLocaleDateString("ar-EG");
                  timeStr = scheduled.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' });
                } else if (!dateStr) {
                  dateStr = "غير محدد";
                  timeStr = "غير محدد";
                }
                
                const amount = b.booking?.items?.[0] ? `${b.booking.items[0].priceTotalCustomer} ${b.booking.items[0].currency}` : b.amount;
                const status = (b.booking?.bookingStatus?.code || b.requestStatus?.code || b.status || "").toLowerCase();
                const paymentStatus = b.paymentStatus || "الدفع عند الوصول";

                let displayStatus = status;
                if (status.includes('cancel')) displayStatus = 'cancelled';
                else if (status.includes('accept') || status.includes('confirm')) displayStatus = 'confirmed';
                else if (status.includes('complet')) displayStatus = 'completed';
                else if (status.includes('pend')) displayStatus = 'pending';

                return (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 font-medium">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{bookingCode}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{customerName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{serviceName}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Car className="w-3 h-3" />
                      {carTypeDetails}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{assignedTeamMember}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{assignedRole}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{dateStr}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {timeStr}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{amount}</div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {paymentStatus === 'Paid' ? 'مدفوع' : 'الدفع عند الوصول'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                      displayStatus === "confirmed" ? "text-emerald-600" :
                      displayStatus === "pending" ? "text-amber-600" :
                      displayStatus === "completed" ? "text-blue-600" : "text-red-600"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        displayStatus === "confirmed" ? "bg-emerald-500" :
                        displayStatus === "pending" ? "bg-amber-500" :
                        displayStatus === "completed" ? "bg-blue-500" : "bg-red-500"
                      }`} />
                      {statusLabels[displayStatus] || (b.booking?.bookingStatus?.label || b.requestStatus?.label || status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === b.id ? null : b.id);
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {openMenuId === b.id && (
                      <div 
                        ref={dropdownRef}
                        className="absolute left-4 top-10 mt-1 w-40 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50"
                      >
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            navigate(`/provider/bookings/${b.id}`);
                          }}
                          className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                          عرض التفاصيل
                        </button>
                        {/* We can add back the confirm/cancel actions here later if needed */}
                      </div>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">جارٍ التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400">لا توجد حجوزات</div>
          ) : filtered.map((b, index) => {
            const bookingCode = b.booking?.codeBooking || b.bookingId || `#BKG-${typeof b.id === 'string' ? b.id.substring(0, 8) : b.id}`;
            const customerName = b.booking?.customer?.fullName || b.customerName;
            const customerPhone = b.booking?.customer?.phone || b.customerPhone || "01000000000";
            const serviceName = b.booking?.items?.[0]?.serviceName || b.serviceName;
            const carTypeDetails = b.booking?.car ? `${b.booking.car.brand} ${b.booking.car.model}` : (b.booking?.items?.[0]?.carTypeName || b.carTypeDetails || "سيدان");
            const assignedTeamMember = b.targetedProviderMember?.name || b.assignedTeamMember || "غير محدد";
            
            let dateStr = b.date;
            let timeStr = b.timeSlot;
            if (b.booking?.scheduledAt) {
              const scheduled = new Date(b.booking.scheduledAt);
              dateStr = scheduled.toLocaleDateString("ar-EG");
              timeStr = scheduled.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' });
            } else if (!dateStr) {
              dateStr = "غير محدد";
              timeStr = "غير محدد";
            }
            
            const amount = b.booking?.items?.[0] ? `${b.booking.items[0].priceTotalCustomer} ${b.booking.items[0].currency}` : b.amount;
            const status = (b.booking?.bookingStatus?.code || b.requestStatus?.code || b.status || "").toLowerCase();

            let displayStatus = status;
            if (status.includes('cancel')) displayStatus = 'cancelled';
            else if (status.includes('accept') || status.includes('confirm')) displayStatus = 'confirmed';
            else if (status.includes('complet')) displayStatus = 'completed';
            else if (status.includes('pend')) displayStatus = 'pending';

            return (
              <div key={`mobile-${b.id}`} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{bookingCode}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{dateStr} • {timeStr}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    displayStatus === "confirmed" ? "bg-emerald-50 text-emerald-700" :
                    displayStatus === "pending" ? "bg-amber-50 text-amber-700" :
                    displayStatus === "completed" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                  }`}>
                    {statusLabels[displayStatus] || statusLabels.pending}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase mb-0.5">العميل</p>
                    <p className="text-sm font-medium text-gray-900">{customerName}</p>
                    <p className="text-xs text-gray-500">{customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase mb-0.5">الخدمة</p>
                    <p className="text-sm font-medium text-gray-900">{serviceName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Car className="w-3 h-3"/> {carTypeDetails}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase mb-0.5">مُسند إلى</p>
                    <p className="text-sm font-medium text-gray-900">{assignedTeamMember}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase mb-0.5">السعر</p>
                    <p className="text-sm font-bold text-gray-900">{amount}</p>
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-3">
                  <button
                    onClick={() => navigate(`/provider/bookings/${b.id}`)}
                    className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    <Eye className="w-4 h-4" />
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
