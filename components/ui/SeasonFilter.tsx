'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { themeClasses } from '@/lib/theme-classes';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Season {
  id: number;
  name: string;
  isActive: boolean;
  isCurrent: boolean;
}

interface SeasonFilterProps {
  selectedSeason?: string;
  onSeasonChange: (season: string) => void;
  className?: string;
}

export function SeasonFilter({
  selectedSeason,
  onSeasonChange,
  className,
}: SeasonFilterProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch seasons from database
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('/api/seasons');
        if (response.ok) {
          const data = await response.json();
          setSeasons(data);
          
          // If no season selected, set default to current season
          if (!selectedSeason) {
            const currentSeason = data.find((s: Season) => s.isCurrent);
            if (currentSeason) {
              onSeasonChange(currentSeason.name);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch seasons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, [selectedSeason, onSeasonChange]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  const currentSeason = seasons.find((s) => s.isCurrent);
  const defaultValue = selectedSeason || currentSeason?.name || '';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <label
        htmlFor="season-filter"
        className={`text-sm font-medium ${themeClasses.text.label}`}
      >
        Filter by season:
      </label>
      <div className="relative">
        <select
          id="season-filter"
          value={defaultValue}
          onChange={(e) => onSeasonChange(e.target.value)}
          className={cn(
            'appearance-none px-4 py-2 pr-10 rounded-lg border',
            themeClasses.input.DEFAULT,
            'cursor-pointer focus:outline-none focus:ring-2 focus:ring-club-primary focus:ring-offset-2'
          )}
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.name}>
              {season.name}
              {season.isCurrent ? ' (Current)' : ''}
              {season.isActive ? ' - Active' : ''}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

