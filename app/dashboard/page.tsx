'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { StatCard } from '@/components/ui/StatCard';
import { KpiBadge } from '@/components/ui/KpiBadge';
import { LoadingWrapper } from '@/components/ui/LoadingWrapper';
import { ClubInfoCard } from '@/components/ui/ClubInfoCard';
import { SeasonFilter } from '@/components/ui/SeasonFilter';
import { FormDialog } from '@/components/ui/FormDialog';
import { SeasonForm } from '@/components/forms/SeasonForm';
import { createSeason, deleteSeason, type ActionResult } from '@/app/actions/seasons';
import { useToast } from '@/components/ui/Toast';
import { Toast } from '@/components/ui/Toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { themeClasses } from '@/lib/theme-classes';
import {
  TrophyIcon,
  FireIcon,
  XCircleIcon,
  CalendarDaysIcon,
  UserGroupIcon,
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
    totalGoalsConceded: 0,
    totalPlayers: 0,
    topScorers: [],
    recentMatches: [],
    matchCount: 0,
    goalsOverTime: [],
    topScorersComparison: [],
    matchPerformance: [],
  };
};

const clubFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch club data');
  }
  return res.json();
};

export default function DashboardPage() {
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [isAddSeasonDialogOpen, setIsAddSeasonDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const { showToast, toast, setToast } = useToast();

  const statsUrl = selectedSeason
    ? `/api/stats?season=${encodeURIComponent(selectedSeason)}`
    : '/api/stats';

  const { data: stats, isLoading, error, mutate } = useSWR(statsUrl, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  const { data: club, isLoading: isLoadingClub } = useSWR('/api/club', clubFetcher, {
    revalidateOnFocus: true,
  });

  const handleSeasonSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const result: ActionResult = await createSeason(data);
      if (result.ok) {
        showToast(result.message || 'Season created successfully');
        setIsAddSeasonDialogOpen(false);
        // Refresh to get new season
        setTimeout(() => window.location.reload(), 500);
      } else {
        showToast(result.message || 'Failed to create season', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeason = async () => {
    if (!selectedSeason) return;

    if (!confirm(`Are you sure you want to delete season ${selectedSeason}? This will also delete all matches and statistics associated with this season.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await deleteSeason(selectedSeason);
      if (result.ok) {
        showToast(result.message);
        // Reset selected season and reload
        setSelectedSeason('');
        setTimeout(() => window.location.reload(), 500);
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      showToast('An error occurred while deleting the season', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    totalGoalsConceded: 0,
    totalPlayers: 0,
    topScorers: [],
    recentMatches: [],
    matchCount: 0,
    goalsOverTime: [],
    topScorersComparison: [],
    matchPerformance: [],
  };

  return (
    <LoadingWrapper
      isLoading={isLoading || !stats}
      message="Loading your football data..."
      minDisplayTime={2000}
    >

      <div className="space-y-6">
        <h1 className={`text-3xl font-bold ${themeClasses.text.heading}`}>Dashboard</h1>

        {/* Season Filter with Add Button */}
        <div className="flex items-center gap-4">
          <SeasonFilter
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
          />
          <button
            onClick={() => setIsAddSeasonDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-club-primary text-white rounded-lg hover:bg-club-primary-dark transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Season
          </button>
          {session?.user?.role === 'ADMIN' && (
            <button
              onClick={handleDeleteSeason}
              disabled={!selectedSeason || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete currently selected season"
            >
              <TrashIcon className="h-5 w-5" />
              Delete Season
            </button>
          )}
        </div>

        {/* Club Information Card */}
        {!isLoadingClub && club && (
          <ClubInfoCard
            club={club}
          />
        )}

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
            title="Goals Conceded"
            value={safeStats.totalGoalsConceded || 0}
            icon={<XCircleIcon className="h-8 w-8" />}
          />
          <StatCard
            title="Total Players"
            value={safeStats.totalPlayers || 0}
            icon={<UserGroupIcon className="h-8 w-8" />}
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
                    <p className={`font-medium ${themeClasses.text.primary}`}>{match.opponent}</p>
                    <p className="font-semibold text-club-primary">{match.result || 'vs'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={themeClasses.text.primary}>No matches available</p>
            )}
          </div>
        </div>
      </div>

      <FormDialog
        open={isAddSeasonDialogOpen}
        onOpenChange={setIsAddSeasonDialogOpen}
        title="Create New Season"
      >
        <SeasonForm
          onSubmit={handleSeasonSubmit}
          onCancel={() => setIsAddSeasonDialogOpen(false)}
          isLoading={isSubmitting}
        />
      </FormDialog>

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        title={toast.title}
        description={toast.description}
        variant={toast.variant}
      />
    </LoadingWrapper>
  );
}

