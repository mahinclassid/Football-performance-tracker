'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { StatCard } from '@/components/ui/StatCard';
import { KpiBadge } from '@/components/ui/KpiBadge';
import { LoadingWrapper } from '@/components/ui/LoadingWrapper';
import { formatDate } from '@/lib/utils';
import { themeClasses } from '@/lib/theme-classes';
import {
  TrophyIcon,
  FireIcon,
  ClockIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }
  const data = await res.json();
  // Ensure we always return a valid stats object
  return data || {
    totalGoals: 0,
    totalAssists: 0,
    totalMinutes: 0,
    topScorers: [],
    recentMatches: [],
    matchCount: 0,
  };
};

export default function DashboardPage() {
  const { data: stats, isLoading, error, mutate } = useSWR('/api/stats', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  useEffect(() => {
    // Refresh on mount and when window regains focus
    const handleFocus = () => mutate();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [mutate]);

  // Default stats object to prevent undefined errors
  const safeStats = stats || {
    totalGoals: 0,
    totalAssists: 0,
    totalMinutes: 0,
    topScorers: [],
    recentMatches: [],
    matchCount: 0,
  };

  return (
    <LoadingWrapper 
      isLoading={isLoading || !stats} 
      message="Loading your football data..."
      minDisplayTime={2000}
    >

      <div className="space-y-6">
        <h1 className={`text-3xl font-bold ${themeClasses.text.heading}`}>Dashboard</h1>

        {error && (
          <div className={`p-4 rounded-lg ${themeClasses.bg.secondary} ${themeClasses.form.error}`}>
            Failed to load statistics. Please try refreshing the page.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Goals"
            value={safeStats.totalGoals || 0}
            icon={<FireIcon className="h-8 w-8" />}
          />
          <StatCard
            title="Total Assists"
            value={safeStats.totalAssists || 0}
            icon={<TrophyIcon className="h-8 w-8" />}
          />
          <StatCard
            title="Total Minutes"
            value={safeStats.totalMinutes || 0}
            icon={<ClockIcon className="h-8 w-8" />}
          />
          <StatCard
            title="Matches Played"
            value={safeStats.matchCount || 0}
            icon={<CalendarDaysIcon className="h-8 w-8" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${themeClasses.card.container} p-6`}>
            <h2 className={`text-xl font-semibold ${themeClasses.card.header} mb-4`}>Top Scorers</h2>
            {safeStats.topScorers && safeStats.topScorers.length > 0 ? (
              <div className="space-y-3">
                {safeStats.topScorers.map((scorer: any, index: number) => (
                  <div
                    key={scorer.playerId}
                    className={`flex items-center justify-between p-3 ${themeClasses.bg.secondary} rounded-lg`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-club-primary text-white font-bold">
                        {index + 1}
                      </span>
                      <span className={`font-medium ${themeClasses.text.primary}`}>{scorer.playerName}</span>
                    </div>
                    <KpiBadge label="Goals" value={scorer.goals} variant="success" />
                  </div>
                ))}
              </div>
            ) : (
              <p className={themeClasses.text.primary}>No statistics available</p>
            )}
          </div>

          <div className={`${themeClasses.card.container} p-6`}>
            <h2 className={`text-xl font-semibold ${themeClasses.card.header} mb-4`}>Recent Matches</h2>
            {safeStats.recentMatches && safeStats.recentMatches.length > 0 ? (
              <div className="space-y-3">
                {safeStats.recentMatches.map((match: any) => (
                  <div
                    key={match.id}
                    className={`flex items-center justify-between p-3 ${themeClasses.bg.secondary} rounded-lg`}
                  >
                    <div>
                      <p className={`font-medium ${themeClasses.text.primary}`}>{match.opponent}</p>
                      <p className={`text-sm ${themeClasses.text.secondary}`}>{formatDate(match.date)}</p>
                    </div>
                    <div className="text-right">
                      {match.result && (
                        <p className="font-semibold text-club-primary">{match.result}</p>
                      )}
                      {match.venue && (
                        <p className={`text-sm ${themeClasses.text.secondary}`}>{match.venue}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={themeClasses.text.primary}>No matches available</p>
            )}
          </div>
        </div>
      </div>
    </LoadingWrapper>
  );
}

