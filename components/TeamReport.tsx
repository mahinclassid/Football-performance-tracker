'use client';

import React from 'react';
import { themeClasses } from '@/lib/theme-classes';

interface TeamReportProps {
  data: {
    season: {
      id: number;
      name: string;
    };
    club: {
      name: string;
      logo: string | null;
      stadium: string;
      manager: string;
      league: string;
    } | null;
    matches: Array<{
      id: number;
      date: string;
      opponent: string;
      venue: string | null;
      result: string | null;
      playersCount: number;
    }>;
    stats: {
      matchesPlayed: number;
      totalGoals: number;
      totalGoalsConceded: number;
      totalAssists: number;
      totalTackles: number;
      totalBlocks: number;
      totalSaves: number;
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

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const TeamReport = React.forwardRef<HTMLDivElement, TeamReportProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        id="team-report"
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Team Season Report</h1>
              <p className="text-gray-600">Season: {data.season.name}</p>
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

        {/* Matches Information Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FootballShoe className="w-6 h-6 text-club-primary" />
            Season Matches
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-club-primary/10 border-b-2 border-club-primary">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Opponent</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Venue</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">Result</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">Players</th>
                </tr>
              </thead>
              <tbody>
                {data.matches.map((match, index) => (
                  <tr key={match.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="px-4 py-3 text-gray-900">{formatDate(match.date)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{match.opponent}</td>
                    <td className="px-4 py-3 text-gray-700">{match.venue || 'N/A'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full font-semibold text-white ${
                        match.result
                          ? (() => {
                              const [ourGoals, oppGoals] = match.result.split('-').map(Number);
                              if (ourGoals > oppGoals) return 'bg-green-600';
                              if (ourGoals < oppGoals) return 'bg-red-600';
                              return 'bg-yellow-600';
                            })()
                          : 'bg-gray-400'
                      }`}>
                        {match.result || 'TBD'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">{match.playersCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p>Total Matches Played: <span className="font-bold text-gray-900">{data.stats.matchesPlayed}</span></p>
          </div>
        </div>

        {/* Team Statistics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Statistics</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total Goals */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-600">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Goals</p>
              <p className="text-3xl font-bold text-green-700">{data.stats.totalGoals}</p>
            </div>

            {/* Goals Conceded */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-l-4 border-red-600">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Goals Conceded</p>
              <p className="text-3xl font-bold text-red-700">{data.stats.totalGoalsConceded}</p>
            </div>

            {/* Total Assists */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-600">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Assists</p>
              <p className="text-3xl font-bold text-blue-700">{data.stats.totalAssists}</p>
            </div>

            {/* Average Rating */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border-l-4 border-amber-600">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Avg Rating</p>
              <p className="text-3xl font-bold text-amber-700">
                {data.stats.avgRating !== null ? data.stats.avgRating.toFixed(1) : 'N/A'}/10
              </p>
            </div>

            {/* Total Tackles */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-l-4 border-purple-600">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Tackles</p>
              <p className="text-3xl font-bold text-purple-700">{data.stats.totalTackles}</p>
            </div>

            {/* Total Blocks */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border-l-4 border-indigo-600">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Blocks</p>
              <p className="text-3xl font-bold text-indigo-700">{data.stats.totalBlocks}</p>
            </div>

            {/* Total Saves */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border-l-4 border-cyan-600">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Saves (GK)</p>
              <p className="text-3xl font-bold text-cyan-700">{data.stats.totalSaves}</p>
            </div>

            {/* Goal Difference */}
            <div className="bg-gradient-to-br from-club-primary/10 to-club-primary/20 p-4 rounded-lg border-l-4 border-club-primary">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Goal Difference</p>
              <p className={`text-3xl font-bold ${
                data.stats.totalGoals - data.stats.totalGoalsConceded >= 0
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                {data.stats.totalGoals - data.stats.totalGoalsConceded > 0 ? '+' : ''}
                {data.stats.totalGoals - data.stats.totalGoalsConceded}
              </p>
            </div>
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

TeamReport.displayName = 'TeamReport';
