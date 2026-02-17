'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { PlusIcon, PencilIcon, TrashIcon, ChartBarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { LoadingWrapper } from '@/components/ui/LoadingWrapper';
import { MatchForm } from '@/components/forms/MatchForm';
import { PlayerStatsForm } from '@/components/forms/PlayerStatsForm';
import { TeamStatsCard } from '@/components/ui/TeamStatsCard';
import { SeasonFilter } from '@/components/ui/SeasonFilter';
import { createMatch, updateMatch, deleteMatch, upsertPlayerMatchStat, type ActionResult } from '@/app/actions/matches';
import { useToast } from '@/components/ui/Toast';
import { Toast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { useSession } from 'next-auth/react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Match {
  id: number;
  opponent: string;
  date: string;
  venue: string | null;
  result: string | null;
  seasonId?: number;
  stats: Array<{
    playerId: number;
    started: boolean;
    substituted: boolean;
    minutes: number;
    goals: number;
    assists: number;
    yellow: number;
    red: number;
    tackles: number | null;
    blocks: number | null;
    saves: number | null;
    rating: number | null;
    player: {
      id: number;
      firstName: string;
      lastName: string;
      position: string;
    };
  }>;
}

export default function MatchesPage() {
  const { data: session } = useSession();
  const { showToast, toast, setToast } = useToast();

  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [isTeamStatsDialogOpen, setIsTeamStatsDialogOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  const matchesUrl = selectedSeason
    ? `/api/matches?season=${encodeURIComponent(selectedSeason)}`
    : '/api/matches';

  const { data: matches = [], isLoading: isLoadingMatches, mutate } = useSWR<Match[]>(matchesUrl, fetcher, {
    revalidateOnFocus: true,
  });

  const { data: players = [], isLoading: isLoadingPlayers } = useSWR('/api/players', fetcher);
  
  const isLoading = isLoadingMatches || isLoadingPlayers;

  const handleCreateMatch = () => {
    setSelectedMatchId(null);
    setIsMatchDialogOpen(true);
  };

  const handleEditMatch = (match: Match) => {
    setSelectedMatchId(match.id);
    setIsMatchDialogOpen(true);
  };

  const handleAddStats = (matchId: number) => {
    setSelectedMatchId(matchId);
    setIsStatsDialogOpen(true);
  };

  const handleDeleteMatch = async (id: number) => {
    if (!confirm('Are you sure you want to delete this match?')) return;

    const result: ActionResult = await deleteMatch(id);
    if (result.ok) {
      showToast(result.message || 'Match deleted successfully');
      mutate();
    } else {
      showToast(result.message || 'Failed to delete match', 'error');
    }
  };

  const handleMatchSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let result: ActionResult<{ id: number }> | ActionResult;
      
      if (selectedMatchId) {
        // Update existing match
        result = await updateMatch(selectedMatchId, data);
        if (result.ok) {
          showToast(result.message || 'Match updated successfully');
          setIsMatchDialogOpen(false);
          setSelectedMatchId(null);
          mutate();
        } else {
          showToast(result.message || 'Failed to update match', 'error');
          console.error('Update match error:', result);
        }
      } else {
        // Create new match
        result = await createMatch(data);
        if (result.ok && result.data) {
          showToast(result.message || 'Match created successfully');
          setIsMatchDialogOpen(false);
          mutate();
          // Open stats dialog for the new match
          setTimeout(() => {
            setSelectedMatchId((result as ActionResult<{ id: number }>).data!.id);
            setIsStatsDialogOpen(true);
          }, 100);
        } else {
          // Show more detailed error info if available
          const errorMsg = result.message || JSON.stringify(result) || 'Failed to create match';
          showToast(errorMsg, 'error');
          console.error('Create match error:', result);
        }
      }
    } catch (error: any) {
      showToast(error?.message || 'An error occurred', 'error');
      console.error('Match submit exception:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatsSubmit = async (stats: Array<{
    playerId: number;
    matchId: number;
    started: boolean;
    substituted: boolean;
    minutes: number;
    goals: number;
    assists: number;
    yellow: number;
    red: number;
    tackles?: number | null;
    blocks?: number | null;
    saves?: number | null;
    rating?: number | null;
  }>) => {
    if (!selectedMatchId) return;

    setIsSubmitting(true);
    try {
      const result: ActionResult = await upsertPlayerMatchStat(stats);
      if (result.ok) {
        showToast(result.message || 'Statistics saved successfully');
        setIsStatsDialogOpen(false);
        setSelectedMatchId(null);
        mutate();
      } else {
        showToast(result.message || 'Failed to save statistics', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTeamStats = (matchId: number) => {
    setSelectedMatchId(matchId);
    setIsTeamStatsDialogOpen(true);
  };

  const selectedMatch = selectedMatchId
    ? matches.find((m) => m.id === selectedMatchId)
    : null;

  const existingStats = selectedMatch
    ? selectedMatch.stats.map((stat) => ({
        playerId: stat.playerId,
        started: stat.started,
        substituted: stat.substituted,
        minutes: stat.minutes,
        goals: stat.goals,
        assists: stat.assists,
        yellow: stat.yellow,
        red: stat.red,
        tackles: stat.tackles,
        blocks: stat.blocks,
        saves: stat.saves,
        rating: stat.rating,
      }))
    : [];

  // Calculate team statistics for a match
  const calculateTeamStats = (match: Match) => {
    const stats = match.stats.filter((stat) => stat.started || stat.substituted); // Count all players who played (started or came on as substitute)
    const totalGoals = stats.reduce((sum, stat) => sum + stat.goals, 0);
    const totalAssists = stats.reduce((sum, stat) => sum + stat.assists, 0);
    const totalTackles = stats.reduce((sum, stat) => sum + (stat.tackles || 0), 0);
    const totalBlocks = stats.reduce((sum, stat) => sum + (stat.blocks || 0), 0);
    const totalSaves = stats.reduce((sum, stat) => sum + (stat.saves || 0), 0);
    
    // Parse goals conceded from result string
    let goalsConceded = 0;
    if (match.result) {
      const matchResult = match.result.match(/^(\d+)-(\d+)$/);
      if (matchResult) {
        goalsConceded = parseInt(matchResult[2], 10);
      }
    }

    // Calculate average rating (only for players who played and have a rating)
    const ratingsWithValues = stats
      .filter((stat) => stat.rating !== null && stat.rating !== undefined)
      .map((stat) => stat.rating!);
    const avgRating = ratingsWithValues.length > 0
      ? ratingsWithValues.reduce((sum, rating) => sum + rating, 0) / ratingsWithValues.length
      : null;

    return {
      totalGoals,
      goalsConceded,
      totalAssists,
      totalTackles,
      totalBlocks,
      totalSaves,
      avgRating,
    };
  };

  const columns: Column<Match>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (match) => formatDate(match.date),
    },
    {
      key: 'opponent',
      header: 'Opponent',
    },
    {
      key: 'venue',
      header: 'Venue',
      render: (match) => match.venue || '-',
    },
    {
      key: 'result',
      header: 'Result',
      render: (match) => match.result || '-',
    },
    {
      key: 'stats',
      header: 'Players',
      render: (match) => `${match.stats.length} players`,
    },
  ];

  const rowActions = (match: Match) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleViewTeamStats(match.id)}
        className="text-blue-600 hover:text-blue-700"
        aria-label="View team stats"
        title="View team statistics"
      >
        <EyeIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleAddStats(match.id)}
        className="text-club-primary hover:text-club-primary-dark"
        aria-label="Add/Edit stats"
        title="Add/Edit statistics"
      >
        <ChartBarIcon className="h-5 w-5" />
      </button>
      {session?.user?.role === 'ADMIN' && (
        <>
          <button
            onClick={() => handleEditMatch(match)}
            className="text-club-primary hover:text-club-primary-dark"
            aria-label="Edit match"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteMatch(match.id)}
            className="text-rose-500 hover:text-rose-600"
            aria-label="Delete match"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <LoadingWrapper 
      isLoading={isLoading || !matches || !players} 
      message="Loading matches..."
      minDisplayTime={2000}
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
          <button
            onClick={handleCreateMatch}
            className="flex items-center gap-2 px-4 py-2 bg-club-primary text-white rounded-lg hover:bg-club-primary-dark transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Match
          </button>
        </div>

        {/* Season Filter */}
        <div className="mb-6">
          <SeasonFilter
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
          />
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
          <DataTable
            data={matches}
            columns={columns}
            rowActions={rowActions}
          />
        </div>

      <FormDialog
        open={isMatchDialogOpen}
        onOpenChange={setIsMatchDialogOpen}
        title={selectedMatchId ? 'Edit Match' : 'Create Match'}
      >
        <MatchForm
          onSubmit={handleMatchSubmit}
          defaultValues={selectedMatch ? {
            id: selectedMatch.id,
            opponent: selectedMatch.opponent,
            date: new Date(selectedMatch.date),
            venue: selectedMatch.venue,
            result: selectedMatch.result,
            seasonId: selectedMatch.seasonId,
          } : undefined}
          onCancel={() => {
            setIsMatchDialogOpen(false);
            setSelectedMatchId(null);
          }}
          isLoading={isSubmitting}
          selectedSeasonName={selectedSeason}
        />
      </FormDialog>

      <FormDialog
        open={isStatsDialogOpen}
        onOpenChange={setIsStatsDialogOpen}
        title="Player Statistics"
      >
        {selectedMatchId && (
          <PlayerStatsForm
            players={players}
            onSubmit={handleStatsSubmit}
            matchId={selectedMatchId}
            onCancel={() => {
              setIsStatsDialogOpen(false);
              setSelectedMatchId(null);
            }}
            isLoading={isSubmitting}
            existingStats={existingStats}
          />
        )}
      </FormDialog>

      <FormDialog
        open={isTeamStatsDialogOpen}
        onOpenChange={setIsTeamStatsDialogOpen}
        title="Team Statistics"
      >
        {selectedMatchId && (() => {
          const match = matches.find((m) => m.id === selectedMatchId);
          if (!match) return null;
          const teamStats = calculateTeamStats(match);
          return (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Match:</strong> vs {match.opponent} on {formatDate(match.date)}
                </p>
                {match.result && (
                  <p className="text-sm text-gray-600">
                    <strong>Result:</strong> {match.result}
                  </p>
                )}
              </div>
              <TeamStatsCard stats={teamStats} matchResult={match.result} />
            </div>
          );
        })()}
      </FormDialog>

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        title={toast.title}
        description={toast.description}
        variant={toast.variant}
      />
      </div>
    </LoadingWrapper>
  );
}

