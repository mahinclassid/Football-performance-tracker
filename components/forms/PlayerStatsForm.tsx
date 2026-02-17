'use client';

import { useState, useMemo } from 'react';
import { Player, Position } from '@prisma/client';
import { SearchBar } from '@/components/ui/SearchBar';
import { useSession } from 'next-auth/react';

interface PlayerWithStats extends Player {
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
}

interface PlayerStatsFormProps {
  players: Player[];
  onSubmit: (stats: Array<{
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
  }>) => Promise<void>;
  matchId: number;
  onCancel: () => void;
  isLoading?: boolean;
  existingStats?: Array<{
    playerId: number;
    started?: boolean;
    substituted?: boolean;
    minutes: number;
    goals: number;
    assists: number;
    yellow: number;
    red: number;
    tackles?: number | null;
    blocks?: number | null;
    saves?: number | null;
    rating?: number | null;
  }>;
}

export function PlayerStatsForm({
  players,
  onSubmit,
  matchId,
  onCancel,
  isLoading,
  existingStats = [],
}: PlayerStatsFormProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [searchQuery, setSearchQuery] = useState('');

  const [playerStats, setPlayerStats] = useState<Map<number, PlayerWithStats>>(() => {
    const map = new Map();
    players.forEach((player) => {
      const existing = existingStats.find((s) => s.playerId === player.id);
      map.set(player.id, {
        ...player,
        started: existing?.started || false,
        substituted: existing?.substituted || false,
        minutes: existing?.minutes ?? 0,
        goals: existing?.goals ?? 0,
        assists: existing?.assists ?? 0,
        yellow: existing?.yellow ?? 0,
        red: existing?.red ?? 0,
        tackles: existing?.tackles ?? null,
        blocks: existing?.blocks ?? null,
        saves: existing?.saves ?? null,
        rating: existing?.rating ?? null,
      });
    });
    return map;
  });

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) {
      return Array.from(playerStats.values());
    }
    const query = searchQuery.toLowerCase();
    return Array.from(playerStats.values()).filter(
      (player) =>
        player.firstName.toLowerCase().includes(query) ||
        player.lastName.toLowerCase().includes(query) ||
        player.position.toLowerCase().includes(query) ||
        (player.shirtNo && player.shirtNo.toString().includes(query))
    );
  }, [playerStats, searchQuery]);

  const updateStat = (playerId: number, field: keyof PlayerWithStats, value: number | boolean | null) => {
    setPlayerStats((prev) => {
      const newMap = new Map(prev);
      const player = newMap.get(playerId);
      if (player) {
        newMap.set(playerId, { ...player, [field]: value });
      }
      return newMap;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stats = Array.from(playerStats.values()).map((player) => {
        const stat = {
          playerId: player.id,
          matchId,
          started: player.started,
          substituted: player.substituted,
          minutes: Number(player.minutes) || 0,
          goals: Number(player.goals) || 0,
          assists: Number(player.assists) || 0,
          yellow: Number(player.yellow) || 0,
          red: Number(player.red) || 0,
          tackles: player.position === 'GK' ? null : (player.tackles ?? null),
          blocks: player.position === 'GK' ? null : (player.blocks ?? null),
          saves: player.position === 'GK' ? (player.saves ?? null) : null,
          rating: player.rating ?? null,
        };
        return stat;
      });
      
      // Validate all stats before submission
      const hasErrors = stats.some(stat => 
        typeof stat.minutes !== 'number' || 
        typeof stat.goals !== 'number' ||
        typeof stat.assists !== 'number' ||
        typeof stat.yellow !== 'number' ||
        typeof stat.red !== 'number'
      );
      
      if (hasErrors) {
        console.error('Invalid stats format:', stats);
        return;
      }
      
      await onSubmit(stats);
    } catch (error) {
      console.error('Error submitting stats:', error);
    }
  };

  const isEditable = (player: PlayerWithStats) => {
    // Allow editing if player started OR substituted and user is ADMIN (coach)
    return (player.started || player.substituted) && isAdmin;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <SearchBar
          placeholder="Search players by name, position, or shirt number..."
          onSearch={setSearchQuery}
          className="max-w-md"
        />
      </div>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Check "Started" or "Substituted" to enable editing individual player statistics. Started and Substituted are mutually exclusive. Only coaches (ADMIN) can edit stats for players who started or came on as substitutes.
        </p>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Started
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Substituted
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Player
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Pos
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Min
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Goals
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Assists
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Tackles
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Blocks
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Saves
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Rating
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Yellow
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                Red
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                  No players found matching your search.
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player) => {
                const editable = isEditable(player);
                const isGK = player.position === 'GK';
                return (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={player.started}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateStat(player.id, 'substituted', false);
                          }
                          updateStat(player.id, 'started', e.target.checked);
                        }}
                        className="w-5 h-5 text-club-primary border-gray-300 rounded focus:ring-club-primary"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={player.substituted}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateStat(player.id, 'started', false);
                          }
                          updateStat(player.id, 'substituted', e.target.checked);
                        }}
                        className="w-5 h-5 text-club-primary border-gray-300 rounded focus:ring-club-primary"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {player.firstName} {player.lastName}
                      {player.shirtNo && ` (#${player.shirtNo})`}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.position}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={player.minutes.toString()}
                        onChange={(e) => updateStat(player.id, 'minutes', e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                        disabled={!editable}
                        className="w-20 px-3 py-2 text-lg border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={player.goals.toString()}
                        onChange={(e) => updateStat(player.id, 'goals', e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                        disabled={!editable}
                        className="w-20 px-3 py-2 text-lg border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={player.assists.toString()}
                        onChange={(e) => updateStat(player.id, 'assists', e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                        disabled={!editable}
                        className="w-20 px-3 py-2 text-lg border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isGK ? (
                        <span className="text-gray-400 text-sm">N/A</span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={player.tackles ?? ''}
                          onChange={(e) => updateStat(player.id, 'tackles', e.target.value === '' ? null : parseInt(e.target.value, 10) || 0)}
                          disabled={!editable}
                          placeholder="0"
                          className="w-20 px-3 py-2 text-lg border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isGK ? (
                        <span className="text-gray-400 text-sm">N/A</span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={player.blocks ?? ''}
                          onChange={(e) => updateStat(player.id, 'blocks', e.target.value === '' ? null : parseInt(e.target.value, 10) || 0)}
                          disabled={!editable}
                          placeholder="0"
                          className="w-20 px-3 py-2 text-lg border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isGK ? (
                        <input
                          type="number"
                          min="0"
                          value={player.saves ?? ''}
                          onChange={(e) => updateStat(player.id, 'saves', e.target.value === '' ? null : parseInt(e.target.value, 10) || 0)}
                          disabled={!editable}
                          placeholder="0"
                          className="w-20 px-3 py-2 text-lg border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={player.rating ?? ''}
                        onChange={(e) => updateStat(player.id, 'rating', e.target.value === '' ? null : parseFloat(e.target.value) || null)}
                        disabled={!editable}
                        placeholder="0.0"
                        className="w-20 px-3 py-2 text-lg border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="2"
                        value={player.yellow.toString()}
                        onChange={(e) => updateStat(player.id, 'yellow', e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                        disabled={!editable}
                        className="w-20 px-3 py-2 text-lg border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="1"
                        value={player.red.toString()}
                        onChange={(e) => updateStat(player.id, 'red', e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                        disabled={!editable}
                        className="w-20 px-3 py-2 text-lg border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-club-primary text-white rounded-lg hover:bg-club-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Statistics'}
        </button>
      </div>
    </form>
  );
}
