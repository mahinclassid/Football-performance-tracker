'use client';

import { signOut } from 'next-auth/react';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useSession } from 'next-auth/react';
import { themeClasses } from '@/lib/theme-classes';

export function NavBar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-club-primary">Football Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${themeClasses.text.primary}`}>{session?.user?.name}</span>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <UserCircleIcon className="h-6 w-6 text-gray-600" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="bg-white rounded-lg shadow-lg p-1 min-w-[200px] border border-gray-200">
                  <DropdownMenu.Item className={`px-3 py-2 text-sm ${themeClasses.text.primary} hover:bg-gray-100 rounded cursor-pointer`}>
                    <div className="flex flex-col">
                      <span className={`font-medium ${themeClasses.text.primary}`}>{session?.user?.name}</span>
                      <span className={`text-xs ${themeClasses.text.primary}`}>{session?.user?.email}</span>
                      <span className="text-xs mt-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-club-primary text-white text-xs">
                          {session?.user?.role}
                        </span>
                      </span>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                  <DropdownMenu.Item
                    className={`px-3 py-2 text-sm ${themeClasses.text.primary} hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2`}
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Sign Out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </nav>
  );
}

