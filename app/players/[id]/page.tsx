import { getPlayer } from '@/app/actions/players';
import { getPlayerStats } from '@/app/actions/stats';
import { formatDate } from '@/lib/utils';
import { PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = parseInt(id);

  if (isNaN(playerId)) {
    notFound();
  }

  const player = await getPlayer(playerId);
  const statsData = await getPlayerStats(playerId);

  if (!player) {
    notFound();
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {player.firstName} {player.lastName}
          </h1>
          <Link
            href={`/players?edit=${player.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-club-primary text-white rounded-lg hover:bg-club-primary-dark transition-colors"
          >
            <PencilIcon className="h-5 w-5" />
            Edit
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Player Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-900">Position</dt>
                <dd className="mt-1 text-sm text-gray-900">{player.position}</dd>
              </div>
              {player.shirtNo && (
                <div>
                  <dt className="text-sm font-medium text-gray-700">Shirt Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{player.shirtNo}</dd>
                </div>
              )}
              {player.dob && (
                <div>
                  <dt className="text-sm font-medium text-gray-700">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(player.dob)}</dd>
                </div>
              )}
              {player.heightCm && (
                <div>
                  <dt className="text-sm font-medium text-gray-700">Height</dt>
                  <dd className="mt-1 text-sm text-gray-900">{player.heightCm} cm</dd>
                </div>
              )}
              {player.weightKg && (
                <div>
                  <dt className="text-sm font-medium text-gray-700">Weight</dt>
                  <dd className="mt-1 text-sm text-gray-900">{player.weightKg} kg</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-700">Status</dt>
                <dd className="mt-1">
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-club-accent text-club-primary-dark">
                    {player.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {statsData && (
            <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Season Totals</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-700">Matches</dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900">
                    {statsData.totals.matches}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Goals</dt>
                  <dd className="mt-1 text-2xl font-bold text-club-primary">
                    {statsData.totals.goals}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Assists</dt>
                  <dd className="mt-1 text-2xl font-bold text-club-primary">
                    {statsData.totals.assists}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Minutes</dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900">
                    {statsData.totals.minutes}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Yellow Cards</dt>
                  <dd className="mt-1 text-2xl font-bold text-amber-500">
                    {statsData.totals.yellow}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Red Cards</dt>
                  <dd className="mt-1 text-2xl font-bold text-rose-500">
                    {statsData.totals.red}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {statsData && statsData.stats.length > 0 && (
          <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Match Statistics</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Opponent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Minutes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Goals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Assists
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Cards
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statsData.stats.map((stat) => (
                    <tr key={stat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(stat.match.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.match.opponent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.minutes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-club-primary">
                        {stat.goals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-club-primary">
                        {stat.assists}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.yellow > 0 && (
                          <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs mr-1">
                            {stat.yellow}Y
                          </span>
                        )}
                        {stat.red > 0 && (
                          <span className="inline-block px-2 py-1 rounded bg-rose-100 text-rose-800 text-xs">
                            {stat.red}R
                          </span>
                        )}
                        {stat.yellow === 0 && stat.red === 0 && '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}

