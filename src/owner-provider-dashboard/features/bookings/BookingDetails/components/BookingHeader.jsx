import { ArrowRight } from "lucide-react";

export default function BookingHeader({ booking, requestStatus, onBack, id }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
        >
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">تفاصيل الحجز</h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-md border border-gray-200 tracking-wider">
              {booking?.codeBooking || id?.substring(0, 8)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Booking Status */}
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
          {booking?.bookingStatus?.label || "غير محدد"}
        </span>
        {/* Request Status */}
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-100">
          {requestStatus?.label || "غير محدد"}
        </span>
      </div>
    </div>
  );
}
