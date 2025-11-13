'use client';

import { NavBar } from './NavBar';
import { SideBar } from './SideBar';
import { SessionProvider } from 'next-auth/react';

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex">
          <SideBar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}




