import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Bell, Globe, Lock, Shield, Save } from "lucide-react";
import Card from "../../../shared/components/ui/Card";
import Toggle from "../../../shared/components/ui/Toggle";

export default function ProviderSettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newBookingAlert: true,
    cancellationAlert: true,
    weeklyReport: true,
    showOnline: true,
  });

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const { mutate: updateSettings, isPending } = useMutation({
    mutationFn: async (data) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 600));
      return data;
    },
    onSuccess: () => {
      toast.success("تم حفظ الإعدادات بنجاح");
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-500 mt-1">إعدادات الحساب والإشعارات</p>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          الإشعارات
        </h3>
        <div className="space-y-4">
          {[
            { key: "emailNotifications", label: "إشعارات البريد الإلكتروني" },
            { key: "smsNotifications", label: "إشعارات الرسائل النصية" },
            { key: "newBookingAlert", label: "تنبيهات الحجوزات الجديدة" },
            { key: "cancellationAlert", label: "تنبيهات الإلغاء" },
            { key: "weeklyReport", label: "التقرير الأسبوعي" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">{item.label}</span>
              <Toggle
                value={settings[item.key]}
                onChange={() => toggle(item.key)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          الظهور
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm text-gray-700">ظهور في نتائج البحث</span>
              <p className="text-xs text-gray-400">التحكم في ظهور متجرك في نتائج البحث</p>
            </div>
            <Toggle
              value={settings.showOnline}
              onChange={() => toggle("showOnline")}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          الأمان
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm text-gray-700">تغيير كلمة المرور</span>
              <p className="text-xs text-gray-400">آخر تغيير منذ 30 يوماً</p>
            </div>
            <button 
              onClick={() => toast.success("سيتم توفير ميزة تغيير كلمة المرور قريباً")}
              className="px-4 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              تغيير
            </button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <button 
          onClick={() => updateSettings(settings)}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>
    </div>
  );
}
