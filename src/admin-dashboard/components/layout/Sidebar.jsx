import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { generalNav, settingsNav } from '../../constants/navigation';
import useAuth from '../../hooks/useAuth';

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="fixed top-0 ltr:left-0 rtl:right-0 h-screen w-60 bg-gray-900 text-white flex flex-col z-40">
      <div className="h-16 flex items-center px-5 border-b border-gray-700">
        <h1 className="text-lg font-bold tracking-wide">مشرف ShineUp</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">عام</p>
        {generalNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}

        <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mt-6 mb-2">الإعدادات</p>
        {settingsNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-700 p-4">
        <p className="text-xs text-gray-400 truncate" dir="ltr">{user?.phone || '0512345678'}</p>
        <button
          onClick={logout}
          className="mt-2 w-full flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
