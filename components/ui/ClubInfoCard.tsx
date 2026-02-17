'use client';

import { cn } from '@/lib/utils';
import { themeClasses } from '@/lib/theme-classes';
import Image from 'next/image';

interface ClubInfoCardProps {
  club: {
    id?: number;
    name: string;
    country: string;
    manager: string;
    stadium: string;
    league: string;
    logo?: string | null;
    location?: string | null;
  };
  className?: string;
}

export function ClubInfoCard({
  club,
  className,
}: ClubInfoCardProps) {

  // Get country flag emoji (simplified - you can enhance this)
  const getCountryFlag = (country: string): string => {
    const flagMap: Record<string, string> = {
      Spain: '🇪🇸',
      'United Kingdom': '🇬🇧',
      England: '🇬🇧',
      France: '🇫🇷',
      Germany: '🇩🇪',
      Italy: '🇮🇹',
      Bahrain: '🇧🇭',
      'Saudi Arabia': '🇸🇦',
    };
    return flagMap[country] || '🏴';
  };

  // Check if manager is Xabi Alonso to use his image
  const isXabiAlonso = club.manager.toLowerCase().includes('xabi') || club.manager.toLowerCase().includes('alonso');
  const managerImage = isXabiAlonso 
    ? '/images/Xabi_Alonso_Training_2017-03_FC_Bayern_Muenchen-3_(cropped).jpg'
    : null;

  return (
    <div
      className={cn(
        'bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6',
        className
      )}
    >
      <div className="flex items-start gap-6">
        {/* Left side - Logo and Club Info */}
        <div className="flex items-start gap-6 flex-1">
          {/* Club Logo */}
          <div className="flex-shrink-0">
            {club.logo ? (
              <div className="w-20 h-20 rounded-lg bg-white p-2 flex items-center justify-center border-2 border-gray-700">
                <Image
                  src={club.logo}
                  alt={`${club.name} logo`}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-club-primary flex items-center justify-center border-2 border-gray-700">
                <span className="text-white text-2xl font-bold">
                  {club.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Club Details */}
          <div className="flex-1 min-w-0">
            {/* Club Name */}
            <h2 className="text-2xl font-bold text-white mb-3">{club.name}</h2>

            {/* Country */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{getCountryFlag(club.country)}</span>
              <span className="text-gray-300 text-sm">{club.country}</span>
            </div>

            {/* Manager */}
            <div className="flex items-center gap-3 mb-4">
              {managerImage ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
                  <Image
                    src={managerImage}
                    alt={club.manager}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {club.manager
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white font-medium">{club.manager}</p>
                <p className="text-gray-400 text-xs">Manager</p>
              </div>
            </div>

            {/* Stadium and League */}
            <div className="flex items-center gap-6 flex-wrap">
              {/* Stadium */}
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="text-gray-300 text-sm">{club.stadium}</span>
              </div>

              {/* League */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">L</span>
                </div>
                <span className="text-gray-300 text-sm">{club.league}</span>
              </div>

              {/* Location (if available) */}
              {club.location && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm">{club.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
