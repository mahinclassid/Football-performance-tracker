'use client';

import { useState, useMemo } from 'react';
import { Player, Position } from '@prisma/client';
import { SearchBar } from '@/components/ui/SearchBar';

interface PlayerWithStats extends Player {
  minutes: number;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
}

interface PlayerStatsFormProps {
  players: Player[];
  onSubmit: (stats: Array<{
    playerId: number;
    matchId: number;
    minutes: number;
    goals: number;
    assists: number;
    yellow: number;
    red: number;
  }>) => Promise<void>;
  matchId: number;
  onCancel: () => void;
  isLoading?: boolean;
  existingStats?: Array<{
    playerId: number;
    minutes: number;
    goals: number;
    assists: number;
    yellow: number;
    red: number;
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
  const [searchQuery, setSearchQuery] = useState('');

  const [playerStats, setPlayerStats] = useState<Map<number, PlayerWithStats>>(() => {
    const map = new Map();
    players.forEach((player) => {
      const existing = existingStats.find((s) => s.playerId === player.id);
      map.set(player.id, {
        ...player,
        minutes: existing?.minutes || 0,
        goals: existing?.goals || 0,
        assists: existing?.assists || 0,
        yellow: existing?.yellow || 0,
        red: existing?.red || 0,
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

  const updateStat = (playerId: number, field: keyof PlayerWithStats, value: number) => {
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
    const stats = Array.from(playerStats.values()).map((player) => ({
      playerId: player.id,
      matchId,
      minutes: player.minutes,
      goals: player.goals,
      assists: player.assists,
      yellow: player.yellow,
      red: player.red,
    }));
    await onSubmit(stats);
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Player
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Position
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Minutes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Goals
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Assists
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Yellow
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                Red
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No players found matching your search.
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {player.firstName} {player.lastName}
                  {player.shirtNo && ` (#${player.shirtNo})`}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {player.position}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={player.minutes}
                    onChange={(e) => updateStat(player.id, 'minutes', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    value={player.goals}
                    onChange={(e) => updateStat(player.id, 'goals', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    value={player.assists}
                    onChange={(e) => updateStat(player.id, 'assists', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    max="2"
                    value={player.yellow}
                    onChange={(e) => updateStat(player.id, 'yellow', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    value={player.red}
                    onChange={(e) => updateStat(player.id, 'red', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-club-primary focus:border-club-primary outline-none"
                  />
                </td>
              </tr>
              ))
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

