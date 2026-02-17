'use client';

import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { matchSchema, type MatchInput } from '@/lib/zod-schemas';
import { formatDate } from '@/lib/utils';

interface Season {
  id: number;
  name: string;
  isActive: boolean;
  isCurrent: boolean;
}

interface MatchFormProps {
  onSubmit: (data: MatchInput) => Promise<void>;
  defaultValues?: Partial<MatchInput> & { id?: number };
  onCancel: () => void;
  isLoading?: boolean;
  selectedSeasonName?: string;
}

export function MatchForm({ onSubmit, defaultValues, onCancel, isLoading, selectedSeasonName }: MatchFormProps) {
  const isEditing = !!defaultValues?.id;
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  
  // Fetch seasons on mount
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('/api/seasons');
        if (response.ok) {
          const data = await response.json();
          setSeasons(data);
        }
      } catch (error) {
        console.error('Failed to fetch seasons:', error);
      } finally {
        setLoadingSeasons(false);
      }
    };
    fetchSeasons();
  }, []);
  
  // Format the date for the input field if it exists
  const formattedDate = defaultValues?.date 
    ? defaultValues.date instanceof Date 
      ? defaultValues.date.toISOString().split('T')[0]
      : typeof defaultValues.date === 'string'
      ? (defaultValues.date as string).split('T')[0]
      : ''
    : '';

  // Get the seasonId from defaultValues or find it from selectedSeasonName
  let defaultSeasonId = defaultValues?.seasonId;
  if (!defaultSeasonId && selectedSeasonName) {
    const season = seasons.find(s => s.name === selectedSeasonName);
    defaultSeasonId = season?.id;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MatchInput>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      opponent: defaultValues?.opponent || '',
      date: defaultValues?.date instanceof Date ? defaultValues.date : new Date(),
      venue: defaultValues?.venue || '',
      result: defaultValues?.result || '',
      seasonId: defaultSeasonId,
    },
  });

  const onSubmitHandler: SubmitHandler<MatchInput> = (data) => {
    // Convert date string to Date object if necessary
    if (typeof data.date === 'string') {
      data.date = new Date(data.date);
    }
    return onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <div>
        <label htmlFor="season" className="block text-sm font-medium text-gray-900">
          Season *
        </label>
        <select
          {...register('seasonId', { valueAsNumber: true })}
          id="season"
          disabled={loadingSeasons}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none disabled:bg-gray-100"
        >
          <option value="">Select a season</option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
              {season.isCurrent ? ' (Current)' : ''}
              {season.isActive ? ' - Active' : ''}
            </option>
          ))}
        </select>
        {errors.seasonId && (
          <p className="mt-1 text-sm text-rose-600">{errors.seasonId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="opponent" className="block text-sm font-medium text-gray-900">
          Opponent *
        </label>
        <input
          {...register('opponent')}
          type="text"
          id="opponent"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
        />
        {errors.opponent && (
          <p className="mt-1 text-sm text-rose-600">{errors.opponent.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date *
        </label>
        <input
          {...register('date', { valueAsDate: true })}
          type="date"
          id="date"
          defaultValue={formattedDate}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
        />
        {errors.date && <p className="mt-1 text-sm text-rose-600">{errors.date.message}</p>}
      </div>

      <div>
        <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
          Venue
        </label>
        <input
          {...register('venue')}
          type="text"
          id="venue"
          placeholder="Home / Away / Stadium name"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
        />
        {errors.venue && <p className="mt-1 text-sm text-rose-600">{errors.venue.message}</p>}
      </div>

      <div>
        <label htmlFor="result" className="block text-sm font-medium text-gray-700">
          Result
        </label>
        <input
          {...register('result')}
          type="text"
          id="result"
          placeholder="e.g., 2-1"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
        />
        {errors.result && <p className="mt-1 text-sm text-rose-600">{errors.result.message}</p>}
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
          {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

