'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { PlusIcon, PencilIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { LoadingWrapper } from '@/components/ui/LoadingWrapper';
import { MatchForm } from '@/components/forms/MatchForm';
import { PlayerStatsForm } from '@/components/forms/PlayerStatsForm';
import { createMatch, deleteMatch, upsertPlayerMatchStat, type ActionResult } from '@/app/actions/matches';
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
  stats: Array<{
    playerId: number;
    minutes: number;
    goals: number;
    assists: number;
    yellow: number;
    red: number;
    player: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function MatchesPage() {
  const { data: session } = useSession();
  const { showToast, toast, setToast } = useToast();

  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: matches = [], isLoading: isLoadingMatches, mutate } = useSWR<Match[]>('/api/matches', fetcher, {
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
      const result: ActionResult<{ id: number }> = await createMatch(data);
      if (result.ok && result.data) {
        showToast(result.message || 'Match created successfully');
        setIsMatchDialogOpen(false);
        mutate();
        // Open stats dialog for the new match
        setTimeout(() => {
          setSelectedMatchId(result.data!.id);
          setIsStatsDialogOpen(true);
        }, 100);
      } else {
        showToast(result.message || 'Failed to create match', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatsSubmit = async (stats: Array<{
    playerId: number;
    matchId: number;
    minutes: number;
    goals: number;
    assists: number;
    yellow: number;
    red: number;
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

  const selectedMatch = selectedMatchId
    ? matches.find((m) => m.id === selectedMatchId)
    : null;

  const existingStats = selectedMatch
    ? selectedMatch.stats.map((stat) => ({
        playerId: stat.playerId,
        minutes: stat.minutes,
        goals: stat.goals,
        assists: stat.assists,
        yellow: stat.yellow,
        red: stat.red,
      }))
    : [];

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
        title="Create Match"
      >
        <MatchForm
          onSubmit={handleMatchSubmit}
          onCancel={() => {
            setIsMatchDialogOpen(false);
            setSelectedMatchId(null);
          }}
          isLoading={isSubmitting}
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

