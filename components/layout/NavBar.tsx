'use client';

import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { UserCircleIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, Squares2X2Icon, HomeIcon } from '@heroicons/react/24/outline';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { themeClasses } from '@/lib/theme-classes';

interface NavBarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

function getBreadcrumbs(pathname: string) {
  const pathMap: Record<string, { title: string; breadcrumb: string }> = {
    '/dashboard': { title: 'Dashboard', breadcrumb: 'Home / Dashboard' },
    '/players': { title: 'Players', breadcrumb: 'Home / Players' },
    '/matches': { title: 'Matches', breadcrumb: 'Home / Matches' },
    '/reports': { title: 'Reports', breadcrumb: 'Home / Reports' },
    '/settings/users': { title: 'Settings', breadcrumb: 'Home / Settings' },
  };

  // Check for exact match first
  if (pathMap[pathname]) {
    return pathMap[pathname];
  }

  // Handle nested routes
  if (pathname.startsWith('/players/')) {
    return { title: 'Player Details', breadcrumb: 'Home / Players / Details' };
  }
  if (pathname.startsWith('/matches/')) {
    return { title: 'Match Details', breadcrumb: 'Home / Matches / Details' };
  }
  if (pathname.startsWith('/settings/')) {
    return { title: 'Settings', breadcrumb: 'Home / Settings' };
  }

  // Check for paths that start with a known path
  for (const [path, value] of Object.entries(pathMap)) {
    if (pathname.startsWith(path + '/')) {
      return value;
    }
  }

  // Default
  return { title: 'Dashboard', breadcrumb: 'Home / Dashboard' };
}

export function NavBar({ onMenuToggle, isSidebarOpen }: NavBarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { title, breadcrumb } = getBreadcrumbs(pathname);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-[70px] py-3">
          {/* Left side: Menu, Title, Breadcrumb */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? (
                <XMarkIcon className="h-5 w-5 text-gray-700" />
              ) : (
                <Bars3Icon className="h-5 w-5 text-gray-700" />
              )}
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-pink-600">{title}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{breadcrumb}</p>
            </div>
          </div>

          {/* Right side: Icons */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Apps">
              <Squares2X2Icon className="h-5 w-5 text-gray-700" />
            </button>
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Home">
              <HomeIcon className="h-5 w-5 text-gray-700" />
            </Link>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <UserCircleIcon className="h-8 w-8 text-gray-700" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="bg-white rounded-lg shadow-lg p-1 min-w-[200px] border border-gray-200 z-50">
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

