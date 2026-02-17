'use client';

interface TeamStats {
  totalGoals: number;
  goalsConceded: number;
  totalAssists: number;
  totalTackles: number;
  totalBlocks: number;
  totalSaves: number;
  avgRating: number | null;
}

interface TeamStatsCardProps {
  stats: TeamStats;
  matchResult?: string | null;
}

export function TeamStatsCard({ stats, matchResult }: TeamStatsCardProps) {
  // Parse goals conceded from result string (format: "X-Y" where X is our goals, Y is opponent goals)
  let goalsConceded = stats.goalsConceded;
  if (matchResult && !goalsConceded) {
    const matchResultParsed = matchResult.match(/^(\d+)-(\d+)$/);
    if (matchResultParsed) {
      goalsConceded = parseInt(matchResultParsed[2], 10);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-club-primary/5 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Total Goals</div>
          <div className="text-2xl font-bold text-club-primary">{stats.totalGoals}</div>
        </div>
        <div className="bg-rose-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Goals Conceded</div>
          <div className="text-2xl font-bold text-rose-600">{goalsConceded}</div>
        </div>
        <div className="bg-club-primary/5 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Total Assists</div>
          <div className="text-2xl font-bold text-club-primary">{stats.totalAssists}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Total Tackles</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalTackles}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Total Blocks</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalBlocks}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Total Saves (GK)</div>
          <div className="text-2xl font-bold text-green-600">{stats.totalSaves}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 col-span-2 md:col-span-2">
          <div className="text-sm font-medium text-gray-700 mb-1">Average Player Rating</div>
          <div className="text-2xl font-bold text-amber-600">
            {stats.avgRating !== null ? stats.avgRating.toFixed(1) : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}

