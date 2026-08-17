import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ProviderSidebar from './ProviderSidebar';
import ProviderTopbar from './ProviderTopbar';
import { useChatSocket } from '../../../admin-dashboard/features/chat/useChatSocket';

export default function ProviderLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useChatSocket();

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <ProviderSidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      <div className="flex-1 ltr:lg:ml-60 rtl:lg:mr-60 flex flex-col min-h-screen w-full transition-all duration-300">
        <ProviderTopbar setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
