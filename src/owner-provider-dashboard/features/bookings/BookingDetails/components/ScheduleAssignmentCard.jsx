import { Calendar, Clock } from "lucide-react";

export default function ScheduleAssignmentCard({ scheduledAt, bookingTimeMode, targetedProviderMember }) {
  const dateObj = scheduledAt ? new Date(scheduledAt) : new Date();

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">الجدولة والتعيين</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">وقت التنفيذ</h4>
          <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 text-gray-900">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="font-medium">{dateObj.toLocaleDateString("ar-EG")}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-900">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="font-medium" dir="ltr">{dateObj.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <span className="mr-auto px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-md">
              {bookingTimeMode}
            </span>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">الفني المعين</h4>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0 border border-amber-200">
              <span className="text-amber-700 font-bold text-sm">
                {targetedProviderMember?.name?.substring(0, 2) || "فني"}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{targetedProviderMember?.name || "غير محدد"}</p>
              <p className="text-xs text-gray-500 mt-0.5">فني تنظيف</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
