/**
 * Main layout wrapper for authenticated pages.
 * Renders Sidebar + Topbar + a scrollable content area.
 */
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ltr:ml-60 rtl:mr-60 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
