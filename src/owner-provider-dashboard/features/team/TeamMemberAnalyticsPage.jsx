import { useParams, useNavigate } from "react-router-dom";
import { useMemberAnalytics } from "./useTeam";
import { ArrowRight, Clock, Calendar, CheckCircle, XCircle, Briefcase, Activity } from "lucide-react";
import Card from "../../../shared/components/ui/Card";

export default function TeamMemberAnalyticsPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useMemberAnalytics(memberId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-red-500">
        فشل في تحميل بيانات العضو. تأكد من صحة الرابط.
      </div>
    );
  }

  const { member, period, summary, dailyBreakdown, recentSessions } = data;
  const isActive = member?.user?.isActive ?? (member?.statusCode === 'ACTIVE');

  // Format period securely
  const fromDate = period?.from ? new Date(period.from).toLocaleDateString("ar-EG") : "غير محدد";
  const toDate = period?.to ? new Date(period.to).toLocaleDateString("ar-EG") : "غير محدد";

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/provider/team")}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للفريق
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-sm">
              {getInitials(member?.displayName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {member?.displayName}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {isActive ? "نشط" : "موقوف"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                <span>{member?.user?.email}</span>
                {member?.user?.phone && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>{member?.user?.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-100 self-start sm:self-auto">
            <p className="text-xs text-gray-400 font-medium">فترة التقرير</p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">
              {fromDate} - {toDate}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Work Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-700">ساعات العمل</h3>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-900">
              {summary?.totalWorkHours || 0}
            </span>
            <span className="text-gray-500 font-medium ml-1">ساعة</span>
          </div>
          <p className="text-sm text-gray-400 mt-2 font-medium">
            متوسط {summary?.averageHoursPerWorkedDay || 0} ساعات يومياً
          </p>
        </div>

        {/* Card 2: Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-700">الحضور والجلسات</h3>
          </div>
          <div className="mt-2 flex items-end gap-2">
            <div>
              <span className="text-3xl font-bold text-gray-900">{summary?.workedDays || 0}</span>
              <span className="text-gray-500 font-medium ml-1 mr-1">يوم عمل</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 text-sm font-medium">
            <span className="text-gray-500">إجمالي الجلسات:</span>
            <span className="text-gray-900">{summary?.totalWorkSessions || 0}</span>
          </div>
          {summary?.lastWorkedAt && (
            <p className="text-xs text-gray-400 mt-2">
              آخر يوم عمل: {new Date(summary.lastWorkedAt).toLocaleDateString("ar-EG")}
            </p>
          )}
        </div>

        {/* Card 3: Bookings Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-700">أداء المهام (الحجوزات)</h3>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-900">{summary?.assignedBookings || 0}</span>
            <span className="text-gray-500 font-medium ml-1">مهمة موكلة</span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              <span>{summary?.completedBookings || 0} مكتملة</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-red-600">
              <XCircle className="w-4 h-4" />
              <span>{summary?.cancelledBookings || 0} ملغاة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lists (Empty States) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">النشاط اليومي</h3>
          </div>
          <div className="p-8 text-center flex flex-col items-center justify-center">
            {(!dailyBreakdown || dailyBreakdown.length === 0) ? (
              <>
                <Calendar className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">لا توجد بيانات متاحة لهذه الفترة</p>
                <p className="text-sm text-gray-400 mt-1">لم يتم تسجيل أي نشاط يومي للعضو خلال هذه المدة.</p>
              </>
            ) : (
              <p className="text-gray-500">سيتم عرض المخططات هنا لاحقاً.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">الجلسات الأخيرة</h3>
          </div>
          <div className="p-8 text-center flex flex-col items-center justify-center">
            {(!recentSessions || recentSessions.length === 0) ? (
              <>
                <Clock className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">لا توجد بيانات متاحة لهذه الفترة</p>
                <p className="text-sm text-gray-400 mt-1">لم يقم العضو بأي جلسات عمل مسجلة بعد.</p>
              </>
            ) : (
              <p className="text-gray-500">سيتم عرض قائمة الجلسات هنا لاحقاً.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
