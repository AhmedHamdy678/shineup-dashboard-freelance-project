import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { providerMainNav, providerBusinessNav, providerSettingsNav } from '../../constants/providerNavigation';
import useProviderAuthStore from '../../store/providerAuthStore';

export default function ProviderSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { user, logout, profileStatus } = useProviderAuthStore();
  const isComplete = profileStatus !== 'INCOMPLETE';
  const isPending = profileStatus === 'PENDING_REVIEW' || profileStatus === 'PENDING';
  const isRejected = profileStatus === 'REJECTED';

  return (
    <aside className={`fixed top-0 ltr:left-0 rtl:right-0 h-screen w-60 bg-gray-900 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:ltr:translate-x-0 lg:rtl:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}`}>
      <div className="h-16 flex items-center px-5 border-b border-gray-700">
        <h1 className="text-lg font-bold tracking-wide">مزود ShineUp</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {isComplete && (
          <>
            <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">الرئيسية</p>
            {providerMainNav.map((item) => {
              const Icon = item.icon;
              const isRestricted = (isPending && item.path !== '/provider') || (isRejected && item.path !== '/provider' && item.path !== '/provider/profile');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/provider'}
                  onClick={(e) => isRestricted && e.preventDefault()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${isRestricted ? 'opacity-50 pointer-events-none cursor-not-allowed grayscale' : ''}`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}

            <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mt-6 mb-2">الأعمال</p>
            {providerBusinessNav.map((item) => {
              const Icon = item.icon;
              const isRestricted = (isPending && item.path !== '/provider') || (isRejected && item.path !== '/provider' && item.path !== '/provider/profile');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => isRestricted && e.preventDefault()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${isRestricted ? 'opacity-50 pointer-events-none cursor-not-allowed grayscale' : ''}`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}

            <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mt-6 mb-2">الإعدادات</p>
            {providerSettingsNav.map((item) => {
              const Icon = item.icon;
              const isRestricted = (isPending && item.path !== '/provider') || (isRejected && item.path !== '/provider' && item.path !== '/provider/profile');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => isRestricted && e.preventDefault()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${isRestricted ? 'opacity-50 pointer-events-none cursor-not-allowed grayscale' : ''}`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      <div className="border-t border-gray-700 p-4">
        <p className="text-xs text-gray-400 truncate" dir="ltr">{user?.phone || '05xxxxxxxx'}</p>
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
