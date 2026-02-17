'use client';

import { useState } from 'react';
import { NavBar } from './NavBar';
import { SideBar } from './SideBar';
import { SessionProvider } from 'next-auth/react';

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <NavBar onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex">
          <SideBar isOpen={isSidebarOpen} />
          <main className="flex-1 p-6 transition-all duration-300 min-w-0">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}




