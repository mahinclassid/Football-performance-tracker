'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingWrapper } from '@/components/ui/LoadingWrapper';
import { PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);

  const apiUrl = shouldFetch
    ? `/api/reports?${startDate ? `startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`
    : null;

  const { data: reportData, isLoading } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
  });

  const handleGenerateReport = () => {
    setShouldFetch(true);
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    window.open(`/api/export/csv?${params.toString()}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const totals =
    reportData && Array.isArray(reportData)
      ? reportData.reduce(
          (acc, player) => ({
            matches: acc.matches + player.matches,
            goals: acc.goals + player.goals,
            assists: acc.assists + player.assists,
            minutes: acc.minutes + player.minutes,
            yellow: acc.yellow + player.yellow,
            red: acc.red + player.red,
          }),
          { matches: 0, goals: 0, assists: 0, minutes: 0, yellow: 0, red: 0 }
        )
      : null;

  return (
    <LoadingWrapper 
      isLoading={shouldFetch && isLoading} 
      message="Generating report..."
      minDisplayTime={2000}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <div className="flex gap-3">
            {reportData && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-club-primary text-white rounded-lg hover:bg-club-primary-dark transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Export CSV
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors print-button"
                >
                  <PrinterIcon className="h-5 w-5" />
                  Print
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-club-primary text-white rounded-lg hover:bg-club-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {totals && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Matches" value={totals.matches} />
            <StatCard title="Total Goals" value={totals.goals} />
            <StatCard title="Total Assists" value={totals.assists} />
            <StatCard title="Total Minutes" value={totals.minutes} />
            <StatCard title="Yellow Cards" value={totals.yellow} />
            <StatCard title="Red Cards" value={totals.red} />
          </div>
        )}

        {reportData && Array.isArray(reportData) && reportData.length > 0 && (
          <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Player Statistics</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Matches
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
                      Yellow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Red
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((player, index) => (
                    <tr key={player.playerId || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {player.playerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {player.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {player.matches}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {player.minutes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-club-primary">
                        {player.goals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-club-primary">
                        {player.assists}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                        {player.yellow}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-rose-600">
                        {player.red}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {shouldFetch && !isLoading && reportData && reportData.length === 0 && (
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 text-center text-gray-800">
            No data available for the selected date range.
          </div>
        )}

        {!shouldFetch && (
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 text-center text-gray-800">
            Click "Generate Report" to view statistics.
          </div>
        )}
      </div>
    </LoadingWrapper>
  );
}

