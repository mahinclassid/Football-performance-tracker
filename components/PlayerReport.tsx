'use client';

import React from 'react';
import { themeClasses } from '@/lib/theme-classes';

interface PlayerReportProps {
  data: {
    player: {
      id: number;
      firstName: string;
      lastName: string;
      position: string;
      shirtNo: number | null;
      dob: string | null;
    };
    club: {
      name: string;
      logo: string | null;
      stadium: string;
      manager: string;
      league: string;
    } | null;
    stats: {
      matches: number;
      matchesStarted: number;
      goals: number;
      assists: number;
      minutes: number;
      tackles: number;
      blocks: number;
      saves: number;
      avgRating: number | null;
    };
    generatedAt: string;
  };
}

// Football doodles SVG components
const FootballDoodle = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
    <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="8" fill="currentColor" />
    <path d="M 35 50 Q 50 35 65 50" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

const FootballShoe = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 60 Q 30 40 50 35 Q 70 40 80 60 Q 75 75 60 80 Q 40 82 20 60" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" />
    <circle cx="35" cy="55" r="3" fill="currentColor" />
    <circle cx="50" cy="50" r="3" fill="currentColor" />
    <circle cx="65" cy="55" r="3" fill="currentColor" />
  </svg>
);

const calculateAge = (dob: string | null): number | null => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (date: string | null): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const positionFullName: Record<string, string> = {
  'GK': 'Goalkeeper',
  'DF': 'Defender',
  'MF': 'Midfielder',
  'FW': 'Forward',
};

export const PlayerReport = React.forwardRef<HTMLDivElement, PlayerReportProps>(
  ({ data }, ref) => {
    const age = calculateAge(data.player.dob);

    return (
      <div
        ref={ref}
        id="player-report"
        className="w-full bg-white p-8 print-friendly"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Header with decorative elements */}
        <div className="mb-8 pb-6 border-b-4 border-club-primary relative">
          <div className="absolute top-0 right-0 opacity-10">
            <FootballDoodle className="w-24 h-24 text-club-primary" />
          </div>
          
          {/* Club Info */}
          {data.club && (
            <div className="mb-6 flex items-center gap-4 bg-club-primary/5 p-4 rounded-lg">
              {data.club.logo && (
                <img src={data.club.logo} alt={data.club.name} className="h-16 w-16 object-contain" />
              )}
              <div>
                <h3 className="text-2xl font-bold text-club-primary">{data.club.name}</h3>
                <p className="text-sm text-gray-600">{data.club.league} • {data.club.stadium}</p>
                {data.club.manager && (
                  <p className="text-sm text-gray-600">Manager: {data.club.manager}</p>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Player Report</h1>
              <p className="text-gray-600">Season Performance Analysis</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Generated: {new Date(data.generatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}</p>
            </div>
          </div>
        </div>

        {/* Player Personal Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FootballShoe className="w-6 h-6 text-club-primary" />
            Player Information
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Name */}
            <div className="bg-gradient-to-br from-club-primary/5 to-club-primary/10 p-4 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Name</p>
              <p className="text-xl font-bold text-gray-900">
                {data.player.firstName} {data.player.lastName}
              </p>
            </div>

            {/* Date of Birth */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Date of Birth</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(data.player.dob)}</p>
            </div>

            {/* Age */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Age</p>
              <p className="text-xl font-bold text-green-700">{age ?? 'N/A'}</p>
            </div>

            {/* Position */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Position</p>
              <p className="text-lg font-semibold text-purple-700">
                {data.player.position}
              </p>
              <p className="text-xs text-gray-600 mt-1">{positionFullName[data.player.position] || 'Unknown'}</p>
            </div>

            {/* Jersey Number */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Jersey Number</p>
              <p className="text-4xl font-bold text-amber-700 text-center">
                {data.player.shirtNo ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Season Statistics</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {/* Matches Row */}
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Matches Played</td>
                  <td className="py-4 px-4">
                    <span className="text-2xl font-bold text-club-primary">{data.stats.matches}</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Matches Started</td>
                  <td className="py-4 px-4">
                    <span className="text-2xl font-bold text-blue-600">{data.stats.matchesStarted}</span>
                  </td>
                </tr>

                {/* Goals Row */}
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Total Goals</td>
                  <td className="py-4 px-4">
                    <span className="text-2xl font-bold text-green-600">{data.stats.goals}</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Total Assists</td>
                  <td className="py-4 px-4">
                    <span className="text-2xl font-bold text-green-600">{data.stats.assists}</span>
                  </td>
                </tr>

                {/* Minutes Row */}
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Minutes Played</td>
                  <td className="py-4 px-4">
                    <span className="text-2xl font-bold text-purple-600">{data.stats.minutes}</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Average Rating</td>
                  <td className="py-4 px-4">
                    <span className="text-2xl font-bold text-amber-600">
                      {data.stats.avgRating !== null ? data.stats.avgRating.toFixed(1) : 'N/A'}/10
                    </span>
                  </td>
                </tr>

                {/* Position-specific stats */}
                {data.player.position !== 'GK' ? (
                  <>
                    {/* Tackles Row */}
                    <tr className="border-b border-gray-200">
                      <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Tackles</td>
                      <td className="py-4 px-4">
                        <span className="text-2xl font-bold text-red-600">{data.stats.tackles}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Blocks</td>
                      <td className="py-4 px-4">
                        <span className="text-2xl font-bold text-red-600">{data.stats.blocks}</span>
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {/* Saves Row for Goalkeeper */}
                    <tr className="border-b border-gray-200">
                      <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Total Saves</td>
                      <td className="py-4 px-4">
                        <span className="text-2xl font-bold text-indigo-600">{data.stats.saves}</span>
                      </td>
                      <td className="py-4 px-4"></td>
                      <td className="py-4 px-4"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-club-primary/20 text-center relative">
          <div className="absolute bottom-0 left-0 opacity-5">
            <FootballDoodle className="w-20 h-20 text-club-primary" />
          </div>
          <p className="text-sm text-gray-600">
            This report was automatically generated by the Football Management System
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }
);

PlayerReport.displayName = 'PlayerReport';
