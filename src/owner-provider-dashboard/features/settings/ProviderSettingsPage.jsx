import { useState } from 'react';
import toast from "react-hot-toast";
import { Shield } from "lucide-react";
import Card from "../../../shared/components/ui/Card";
import ChangePasswordModal from "./ChangePasswordModal";

export default function ProviderSettingsPage() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-500 mt-1">إعدادات الحساب والأمان</p>
      </div>

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
              onClick={() => setIsChangePasswordOpen(true)}
              className="px-4 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              تغيير
            </button>
          </div>
        </div>
      </Card>

      {isChangePasswordOpen && (
        <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />
      )}
    </div>
  );
}

