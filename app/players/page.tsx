'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterPills } from '@/components/ui/FilterPills';
import { FormDialog } from '@/components/ui/FormDialog';
import { LoadingWrapper } from '@/components/ui/LoadingWrapper';
import { PlayerForm } from '@/components/forms/PlayerForm';
import { createPlayer, updatePlayer, deletePlayer, type ActionResult } from '@/app/actions/players';
import { useToast } from '@/components/ui/Toast';
import { Toast } from '@/components/ui/Toast';
import { Position, PlayerStatus } from '@prisma/client';
import type { PlayerInput } from '@/lib/zod-schemas';
import { useSession } from 'next-auth/react';

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: Position;
  shirtNo: number | null;
  status: PlayerStatus;
  totalGoals: number;
  totalAssists: number;
  totalMinutes: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const positionFilters = [
  { value: 'GK', label: 'GK' },
  { value: 'DF', label: 'DF' },
  { value: 'MF', label: 'MF' },
  { value: 'FW', label: 'FW' },
];

function PlayersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { showToast, toast, setToast } = useToast();

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

  // Build API URL with query params
  const apiUrl = `/api/players?q=${encodeURIComponent(searchQuery)}&sort=${sortKey}&dir=${sortDir}${
    positionFilter ? `&position=${positionFilter}` : ''
  }`;

  const { data: players = [], isLoading, mutate } = useSWR<Player[]>(apiUrl, fetcher, {
    revalidateOnFocus: true,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (positionFilter) params.set('position', positionFilter);
    if (sortKey !== 'lastName') params.set('sort', sortKey);
    if (sortDir !== 'asc') params.set('dir', sortDir);
    router.replace(`/players?${params.toString()}`, { scroll: false });
  }, [searchQuery, positionFilter, sortKey, sortDir, router]);

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

  const columns: Column<Player>[] = [
    {
      key: 'shirtNo',
      header: '#',
      render: (player) => player.shirtNo || '-',
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (player) => `${player.firstName} ${player.lastName}`,
    },
    {
      key: 'position',
      header: 'Position',
      sortable: true,
    },
    {
      key: 'totalGoals',
      header: 'Goals',
      sortable: true,
    },
    {
      key: 'totalAssists',
      header: 'Assists',
      sortable: true,
    },
    {
      key: 'totalMinutes',
      header: 'Minutes',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
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

      <div className="mb-6 space-y-4">
        <SearchBar
          placeholder="Search players by name..."
          onSearch={setSearchQuery}
          className="max-w-md"
        />
        <FilterPills
          filters={positionFilters}
          activeFilter={positionFilter}
          onFilterChange={setPositionFilter}
        />
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        <DataTable
          data={players}
          columns={columns}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDir}
          rowActions={rowActions}
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




