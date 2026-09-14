import { NavLink, Outlet } from 'react-router-dom';
import { Settings, Shield, Users, Lock, Key, ClipboardList } from 'lucide-react';

const tabs = [
  { name: 'نظرة عامة', path: 'access/overview', icon: Shield },
  { name: 'المشرفين', path: 'access/admins', icon: Users },
  { name: 'الأدوار', path: 'access/roles', icon: Lock },
  { name: 'الصلاحيات', path: 'access/permissions', icon: Key },
  { name: 'سجل التدقيق', path: 'access/audit-log', icon: ClipboardList },
  { name: 'إعدادات النظام', path: 'system', icon: Settings },
];

export default function SettingsLayout() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الإعدادات والصلاحيات</h1>
        <p className="text-gray-500 mt-1">إدارة إعدادات النظام وصلاحيات المشرفين</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
