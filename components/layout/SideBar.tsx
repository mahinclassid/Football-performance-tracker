'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Players', href: '/players', icon: UserGroupIcon },
  { name: 'Matches', href: '/matches', icon: CalendarDaysIcon },
  { name: 'Analysis', href: '/reports', icon: ChartBarIcon },
  { 
    name: 'Settings', 
    href: '/settings/users', 
    icon: Cog6ToothIcon,
    submenu: [
      { name: 'Users', href: '/settings/users' },
      { name: 'Club Info', href: '/settings/club' },
    ]
  },
];

interface SideBarProps {
  isOpen: boolean;
}

export function SideBar({ isOpen }: SideBarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 min-h-screen transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Navigation */}
      <nav className={cn('flex-1 space-y-1', isOpen ? 'p-3' : 'p-2')}>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const hasSubmenu = 'submenu' in item && item.submenu;
          
          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-club-primary text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
                  isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2'
                )}
                title={!isOpen ? item.name : undefined}
              >
                <item.icon className={cn('flex-shrink-0', isOpen ? 'h-5 w-5' : 'h-6 w-6')} />
                {isOpen && (
                  <span className="font-medium text-sm">
                    {item.name}
                  </span>
                )}
              </Link>
              
              {isOpen && hasSubmenu && (
                <div className="ml-3 mt-1 space-y-1">
                  {item.submenu.map((subitem) => {
                    const isSubActive = pathname === subitem.href;
                    return (
                      <Link
                        key={subitem.name}
                        href={subitem.href}
                        className={cn(
                          'flex items-center rounded-lg transition-colors whitespace-nowrap px-3 py-2 text-sm',
                          isSubActive
                            ? 'bg-club-primary text-white'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        {subitem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

