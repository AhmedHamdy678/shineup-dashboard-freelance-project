import { useState } from "react";
import { useGetAuthorizationOverview, useCheckPermission } from "./useAuthorizationOverview";
import { useGetAdmins } from "./useAdmins";
import { useGetPermissions } from "./useRolesAndPermissions";
import StatCard from "../../../shared/components/ui/StatCard";
import { Users, Lock, Key, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

export default function AuthorizationOverview() {
  const { data, isLoading, isError } = useGetAuthorizationOverview();
  
  // Data for dropdowns
  const { data: admins, isLoading: isLoadingAdmins } = useGetAdmins();
  const { data: permissions, isLoading: isLoadingPermissions } = useGetPermissions();

  // Permission Tester State
  const [testUserId, setTestUserId] = useState("");
  const [testPermission, setTestPermission] = useState("");
  const [testResult, setTestResult] = useState(null); // null = not tested, true = allowed, false = denied

  const { mutate: checkPermission, isPending } = useCheckPermission();

  const handleTestSubmit = (e) => {
    e.preventDefault();
    setTestResult(null);
    checkPermission(
      {
        userId: testUserId,
        permission: testPermission,
        scopeType: null,
        scopeId: null,
      },
      {
        onSuccess: (res) => {
          // If the backend directly returns a boolean or an object with allowed/success
          setTestResult(res?.allowed ?? res?.success ?? res === true);
        },
        onError: () => {
          setTestResult(false);
        },
      }
    );
  };

  if (isLoading) return <div className="p-6 text-gray-500">جارٍ التحميل...</div>;
  if (isError) return <div className="p-6 text-red-500">حدث خطأ في تحميل البيانات</div>;

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي الموظفين" 
          value={data.platformUsersCount ?? data.totalStaff ?? 0} 
          icon={Users} 
          color="blue" 
        />
        <StatCard 
          title="الموظفين النشطين" 
          value={data.activePlatformUsersCount ?? data.activeStaff ?? 0} 
          icon={CheckCircle2} 
          color="green" 
        />
        <StatCard 
          title="الأدوار النشطة" 
          value={data.rolesCount ?? data.totalRoles ?? 0} 
          icon={Lock} 
          color="indigo" 
        />
        <StatCard 
          title="الصلاحيات المتاحة" 
          value={data.permissionsCount ?? data.totalPermissions ?? 0} 
          icon={Key} 
          color="yellow" 
        />
      </div>

      {/* Permission Tester Widget */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">أداة فحص الصلاحيات (Permission Tester)</h3>
            <p className="text-sm text-gray-500">تحقق مما إذا كان مستخدم معين يمتلك صلاحية محددة</p>
          </div>
        </div>

        <form onSubmit={handleTestSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مُعرّف المستخدم (User)</label>
              {isLoadingAdmins ? (
                <div className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm">جارٍ جلب المستخدمين...</div>
              ) : (
                <select
                  required
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                >
                  <option value="" disabled>-- اختر المستخدم --</option>
                  {admins?.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.fullName || admin.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الصلاحية (Permission)</label>
              {isLoadingPermissions ? (
                <div className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm">جارٍ جلب الصلاحيات...</div>
              ) : (
                <select
                  required
                  value={testPermission}
                  onChange={(e) => setTestPermission(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
                  dir="ltr"
                >
                  <option value="" disabled>-- Select Permission --</option>
                  {permissions?.map((perm) => (
                    <option key={perm.id} value={perm.name}>
                      {perm.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isPending || !testUserId || !testPermission}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-sm shadow-blue-600/20"
            >
              {isPending ? 'جاري الفحص...' : 'فحص الصلاحية'}
            </button>

            {/* Test Result Display */}
            {testResult !== null && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                  testResult
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {testResult ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">مسموح (Allowed)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-bold">مرفوض (Denied)</span>
                  </>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
