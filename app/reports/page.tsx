'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { themeClasses } from '@/lib/theme-classes';
import { PrinterIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { PlayerReport } from '@/components/PlayerReport';
import { TeamReport } from '@/components/TeamReport';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  shirtNo: number | null;
}

interface Season {
  id: number;
  name: string;
  isCurrent: boolean;
}

export default function ReportsPage() {
  const playerReportRef = useRef<HTMLDivElement>(null);
  const teamReportRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<'player' | 'team'>('player');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedTeamSeason, setSelectedTeamSeason] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTeamReport, setShowTeamReport] = useState(false);

  // Fetch players on mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setIsLoadingPlayers(true);
        const response = await fetch('/api/players');
        const data = await response.json();
        setPlayers(data || []);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    const fetchSeasons = async () => {
      try {
        const response = await fetch('/api/seasons');
        const data = await response.json();
        setSeasons(data || []);
        
        // Set default season to current or first available
        const currentSeason = data?.find((s: Season) => s.isCurrent);
        if (currentSeason) {
          setSelectedSeason(currentSeason.name);
          setSelectedTeamSeason(currentSeason.name);
        } else if (data && data.length > 0) {
          setSelectedSeason(data[0].name);
          setSelectedTeamSeason(data[0].name);
        }
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    };

    fetchPlayers();
    fetchSeasons();
  }, []);

  // Fetch player report data
  const playerReportUrl = selectedPlayerId && selectedSeason 
    ? `/api/reports/player/${selectedPlayerId}?season=${selectedSeason}`
    : null;

  const { data: playerReportData, isLoading: isLoadingPlayerReport } = useSWR(playerReportUrl, fetcher, {
    revalidateOnFocus: false,
  });

  // Fetch team report data
  const teamReportUrl = showTeamReport && selectedTeamSeason
    ? `/api/reports/team?season=${selectedTeamSeason}`
    : null;

  const { data: teamReportData, isLoading: isLoadingTeamReport } = useSWR(teamReportUrl, fetcher, {
    revalidateOnFocus: false,
  });

  // Filter players based on search term
  const filteredPlayers = players.filter((player) => {
    const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleGenerateReport = (playerId: number) => {
    setSelectedPlayerId(playerId);
  };

  const handlePrintPlayerReport = () => {
    window.print();
  };

  const handleGenerateTeamReport = () => {
    setShowTeamReport(true);
  };

  const handlePrintTeamReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${themeClasses.text.heading}`}>Analysis</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('player')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'player'
                ? 'border-club-primary text-club-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Player Report
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'team'
                ? 'border-club-primary text-club-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Team Report
          </button>
        </nav>
      </div>

      {/* Main Layout: Full Width Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: Selection Panel - Shown for both tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 sticky top-20">
            {activeTab === 'player' ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Players</h2>

                {/* Season Filter */}
                <div className="mb-4">
                  <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Season
                  </label>
                  <select
                    id="season"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className={`block w-full px-3 py-2 rounded-lg ${themeClasses.input.DEFAULT}`}
                  >
                    <option value="">-- Choose Season --</option>
                    {seasons.map((season) => (
                      <option key={season.id} value={season.name}>
                        {season.name} {season.isCurrent ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Players */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search player..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`block w-full px-3 py-2 rounded-lg ${themeClasses.input.DEFAULT}`}
                  />
                </div>

                {/* Players List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {isLoadingPlayers ? (
                    <p className="text-center text-gray-600 py-4">Loading players...</p>
                  ) : filteredPlayers.length === 0 ? (
                    <p className="text-center text-gray-600 py-4">No players found</p>
                  ) : (
                    filteredPlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleGenerateReport(player.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                          selectedPlayerId === player.id
                            ? 'bg-club-primary text-white shadow-md'
                            : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className={`text-xs ${selectedPlayerId === player.id ? 'text-club-primary-light' : 'text-gray-600'}`}>
                            {player.position} #{player.shirtNo || '-'}
                          </p>
                        </div>
                        {selectedPlayerId === player.id && (
                          <SparklesIcon className="h-5 w-5" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Season Selection</h2>

                {/* Season Filter for Team Report */}
                <div className="mb-4">
                  <label htmlFor="team-season" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Season
                  </label>
                  <select
                    id="team-season"
                    value={selectedTeamSeason}
                    onChange={(e) => setSelectedTeamSeason(e.target.value)}
                    className={`block w-full px-3 py-2 rounded-lg ${themeClasses.input.DEFAULT}`}
                  >
                    <option value="">-- Choose Season --</option>
                    {seasons.map((season) => (
                      <option key={season.id} value={season.name}>
                        {season.name} {season.isCurrent ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generate Report Button */}
                <button
                  onClick={handleGenerateTeamReport}
                  disabled={!selectedTeamSeason}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-club-primary text-white rounded-lg hover:bg-club-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <SparklesIcon className="h-5 w-5" />
                  Generate Report
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Report Display - Full Width */}
        <div className="lg:col-span-3">
          {activeTab === 'player' ? (
            // Player Report Content
            <>
              {selectedPlayerId && selectedSeason ? (
                <>
                  {isLoadingPlayerReport ? (
                    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin">
                          <SparklesIcon className="h-8 w-8 text-club-primary" />
                        </div>
                        <p className="text-gray-600">Generating report...</p>
                      </div>
                    </div>
                  ) : playerReportData ? (
                    <>
                      {/* Action Buttons */}
                      <div className="flex gap-3 mb-4 flex-wrap">
                        <button
                          onClick={handlePrintPlayerReport}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors print-button"
                        >
                          <PrinterIcon className="h-5 w-5" />
                          Print
                        </button>
                      </div>

                      {/* Report */}
                      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
                        <PlayerReport ref={playerReportRef} data={playerReportData} />
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-12 text-center">
                      <p className="text-gray-600">No data available for this player in the selected season.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-card border border-gray-100 p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <SparklesIcon className="h-12 w-12 text-club-primary/30" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Select a Player</h3>
                      <p className="text-gray-600">
                        Choose a player from the list on the left and select a season to generate their performance report.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Team Report Content
            <>
              {showTeamReport ? (
                <>
                  {isLoadingTeamReport ? (
                    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin">
                          <SparklesIcon className="h-8 w-8 text-club-primary" />
                        </div>
                        <p className="text-gray-600">Generating team report...</p>
                      </div>
                    </div>
                  ) : teamReportData ? (
                    <>
                      {/* Action Buttons */}
                      <div className="flex gap-3 mb-4 flex-wrap">
                        <button
                          onClick={handlePrintTeamReport}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors print-button"
                        >
                          <PrinterIcon className="h-5 w-5" />
                          Print
                        </button>
                      </div>

                      {/* Report */}
                      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
                        <TeamReport ref={teamReportRef} data={teamReportData} />
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-12 text-center">
                      <p className="text-gray-600">No data available for the selected season.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-card border border-gray-100 p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <SparklesIcon className="h-12 w-12 text-club-primary/30" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Generate Team Report</h3>
                      <p className="text-gray-600">
                        Select a season and click the Generate button to view the team's performance analysis for that season.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
