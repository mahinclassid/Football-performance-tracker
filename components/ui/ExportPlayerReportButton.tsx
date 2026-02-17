'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ExportPlayerReportButtonProps {
  playerId: number;
  variant?: 'default' | 'compact';
}

export function ExportPlayerReportButton({ playerId, variant = 'default' }: ExportPlayerReportButtonProps) {
  const handleExport = () => {
    window.open(`/api/export/player/${playerId}`, '_blank');
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleExport}
        className="flex items-center gap-1 px-2 py-1 text-club-primary hover:text-club-primary-dark hover:bg-club-primary/10 rounded transition-colors"
        title="Export Player Report"
        aria-label="Export Player Report"
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
        <span className="text-xs">Export</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      title="Export Player Report"
    >
      <ArrowDownTrayIcon className="h-5 w-5" />
      Export Report
    </button>
  );
}

