'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterPills } from '@/components/ui/FilterPills';
import { SeasonFilter } from '@/components/ui/SeasonFilter';
import { FormDialog } from '@/components/ui/FormDialog';
import { LoadingWrapper } from '@/components/ui/LoadingWrapper';
import { PlayerForm } from '@/components/forms/PlayerForm';
import { createPlayer, updatePlayer, deletePlayer, type ActionResult } from '@/app/actions/players';
import { useToast } from '@/components/ui/Toast';
import { Toast } from '@/components/ui/Toast';
import { Position, PlayerStatus } from '@prisma/client';
import type { PlayerInput } from '@/lib/zod-schemas';
import { useSession } from 'next-auth/react';
import { calculateAge, formatDate } from '@/lib/utils';

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: Position;
  shirtNo: number | null;
  dob: string | null;
  heightCm: number | null;
  weightKg: number | null;
  status: PlayerStatus;
  totalGoals: number;
  totalAssists: number;
  totalMinutes: number;
  totalTackles: number;
  totalBlocks: number;
  totalSaves: number;
  totalPlayers: number;
  matchesStarted: number;
  avgRating: number | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch players');
  }
  const data = await res.json();
  // Ensure we always return an array
  return Array.isArray(data) ? data : [];
};

const positionFilters = [
  { value: 'GK', label: 'GK' },
  { value: 'DF', label: 'DF' },
  { value: 'MF', label: 'MF' },
  { value: 'FW', label: 'FW' },
];

type TabType = 'general' | 'detailed';

function PlayersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { showToast, toast, setToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get('tab') as TabType) || 'general'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [positionFilter, setPositionFilter] = useState<string | null>(
    searchParams.get('position')
  );
  const [sortKey, setSortKey] = useState(searchParams.get('sort') || 'lastName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(
    (searchParams.get('dir') as 'asc' | 'desc') || 'asc'
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize search handler to prevent unnecessary re-renders
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const [selectedSeason, setSelectedSeason] = useState<string>('');

  // Build API URL with query params - removed search query since we filter client-side
  const apiUrl = `/api/players?sort=${sortKey}&dir=${sortDir}${positionFilter ? `&position=${positionFilter}` : ''
    }${selectedSeason ? `&season=${encodeURIComponent(selectedSeason)}` : ''}`;

  const { data: players = [], isLoading, mutate } = useSWR<Player[]>(apiUrl, fetcher, {
    revalidateOnFocus: true,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'general') params.set('tab', activeTab);
    if (searchQuery) params.set('q', searchQuery);
    if (positionFilter) params.set('position', positionFilter);
    if (sortKey !== 'lastName') params.set('sort', sortKey);
    if (sortDir !== 'asc') params.set('dir', sortDir);
    router.replace(`/players?${params.toString()}`, { scroll: false });
  }, [activeTab, searchQuery, positionFilter, sortKey, sortDir, router]);

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDir(direction);
  };

  const handleCreate = () => {
    setEditingPlayer(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this player?')) return;

    const result: ActionResult = await deletePlayer(id);
    if (result.ok) {
      showToast(result.message || 'Player deleted successfully');
      mutate();
    } else {
      showToast(result.message || 'Failed to delete player', 'error');
    }
  };

  const handleSubmit = async (data: PlayerInput) => {
    setIsSubmitting(true);
    try {
      let result: ActionResult;
      if (editingPlayer) {
        result = await updatePlayer(editingPlayer.id, data);
      } else {
        result = await createPlayer(data);
      }

      if (result.ok) {
        showToast(result.message || 'Player saved successfully');
        setIsDialogOpen(false);
        setEditingPlayer(null);
        mutate();
      } else {
        showToast(result.message || 'Failed to save player', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ensure players is always an array
  const safePlayers = Array.isArray(players) ? players : [];

  // Filter players based on active tab and search query
  const filteredPlayers = searchQuery
    ? safePlayers.filter((player) => {
      const query = searchQuery.toLowerCase();
      const name = `${player.firstName} ${player.lastName}`.toLowerCase();
      const position = player.position.toLowerCase();
      const shirtNo = player.shirtNo?.toString() || '';
      const dob = player.dob ? formatDate(player.dob).toLowerCase() : '';
      const age = player.dob ? (calculateAge(player.dob)?.toString() ?? '') : '';

      // Common fields for both tabs
      let commonMatches =
        name.includes(query) ||
        position.includes(query) ||
        shirtNo.includes(query) ||
        dob.includes(query) ||
        age.includes(query);

      // Additional fields for detailed tab
      if (activeTab === 'detailed') {
        const goals = player.totalGoals.toString();
        const assists = player.totalAssists.toString();
        const matchesStarted = player.matchesStarted.toString();
        const minutes = player.totalMinutes.toString();
        const tackles = player.totalTackles.toString();
        const blocks = player.totalBlocks.toString();
        const saves = player.totalSaves.toString();
        const rating = player.avgRating?.toFixed(2) || '';

        return (
          commonMatches ||
          goals.includes(query) ||
          assists.includes(query) ||
          matchesStarted.includes(query) ||
          minutes.includes(query) ||
          tackles.includes(query) ||
          blocks.includes(query) ||
          saves.includes(query) ||
          rating.includes(query)
        );
      }

      return commonMatches;
    })
    : safePlayers;

  const generalColumns: Column<Player>[] = [
    {
      key: 'shirtNo',
      header: 'Jersey Number',
      sortable: false,
      render: (player) => (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-medium">
          {player.shirtNo || '-'}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: false,
      render: (player) => `${player.firstName} ${player.lastName}`,
    },
    {
      key: 'dob',
      header: 'Date of Birth',
      sortable: false,
      render: (player) => player.dob ? formatDate(player.dob) : '-',
    },
    {
      key: 'position',
      header: 'Position',
      sortable: false,
    },
    {
      key: 'age',
      header: 'Age',
      sortable: false,
      render: (player) => {
        const age = player.dob ? calculateAge(player.dob) : null;
        return age !== null ? `${age} yrs` : '-';
      },
    },
  ];

  const detailedStatsColumns: Column<Player>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: false,
      render: (player) => `${player.firstName} ${player.lastName}`,
    },
    {
      key: 'totalGoals',
      header: 'Total Goals',
      sortable: false,
    },
    {
      key: 'totalAssists',
      header: 'Total Assist',
      sortable: false,
    },
    {
      key: 'matchesStarted',
      header: 'Match Started',
      sortable: false,
    },
    {
      key: 'totalMinutes',
      header: 'Minutes Played',
      sortable: false,
    },
    {
      key: 'totalTackles',
      header: 'Tackles',
      sortable: false,
      render: (player) => player.position === 'GK' ? 'N/A' : player.totalTackles,
    },
    {
      key: 'totalBlocks',
      header: 'Blocks',
      sortable: false,
      render: (player) => player.position === 'GK' ? 'N/A' : player.totalBlocks,
    },
    {
      key: 'totalSaves',
      header: 'Saves by GK',
      sortable: false,
      render: (player) => player.position === 'GK' ? player.totalSaves : 'N/A',
    },
    {
      key: 'avgRating',
      header: 'Avg Player Rating',
      sortable: false,
      render: (player) => player.avgRating ? player.avgRating.toFixed(2) : '-',
    },
  ];

  const rowActions = (player: Player) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleEdit(player)}
        className="text-club-primary hover:text-club-primary-dark"
        aria-label="Edit player"
      >
        <PencilIcon className="h-5 w-5" />
      </button>
      {session?.user?.role === 'ADMIN' && (
        <button
          onClick={() => handleDelete(player.id)}
          className="text-rose-500 hover:text-rose-600"
          aria-label="Delete player"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  const displayPlayers = filteredPlayers;
  const columns = activeTab === 'general' ? generalColumns : detailedStatsColumns;

  return (
    <LoadingWrapper
      isLoading={isLoading || !players}
      message="Loading players..."
      minDisplayTime={2000}
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Players</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-club-primary text-white rounded-lg hover:bg-club-primary-dark transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Player
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'general'
                ? 'border-club-primary text-club-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'detailed'
                ? 'border-club-primary text-club-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Detailed Statistics
            </button>
          </nav>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4">
            <SearchBar
              placeholder={
                activeTab === 'general'
                  ? 'Search players...'
                  : 'Search player statistics...'
              }
              onSearch={handleSearch}
              className="max-w-md"
            />
            <SeasonFilter
              selectedSeason={selectedSeason}
              onSeasonChange={setSelectedSeason}
            />
          </div>
          <FilterPills
            filters={positionFilters}
            activeFilter={positionFilter}
            onFilterChange={setPositionFilter}
          />
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
          <DataTable
            data={displayPlayers}
            columns={columns}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDir}
            rowActions={activeTab === 'general' ? rowActions : undefined}
          />
        </div>

        <FormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingPlayer ? 'Edit Player' : 'Create Player'}
        >
          <PlayerForm
            onSubmit={handleSubmit}
            defaultValues={editingPlayer ? {
              id: editingPlayer.id,
              firstName: editingPlayer.firstName,
              lastName: editingPlayer.lastName,
              position: editingPlayer.position,
              shirtNo: editingPlayer.shirtNo,
              dob: editingPlayer.dob ? new Date(editingPlayer.dob) : null,
              heightCm: editingPlayer.heightCm,
              weightKg: editingPlayer.weightKg,
              status: editingPlayer.status as PlayerInput['status'],
            } : undefined}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingPlayer(null);
            }}
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
      </div>
    </LoadingWrapper>
  );
}

export default function PlayersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading players...</div>
      </div>
    }>
      <PlayersPageContent />
    </Suspense>
  );
}
