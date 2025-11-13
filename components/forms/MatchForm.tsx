'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { matchSchema, type MatchInput } from '@/lib/zod-schemas';

interface MatchFormProps {
  onSubmit: (data: MatchInput) => Promise<void>;
  defaultValues?: Partial<MatchInput> & { id?: number };
  onCancel: () => void;
  isLoading?: boolean;
}

export function MatchForm({ onSubmit, defaultValues, onCancel, isLoading }: MatchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MatchInput>({
    resolver: zodResolver(matchSchema),
    defaultValues: defaultValues || {
      date: new Date(),
    },
  });

  const onSubmitHandler: SubmitHandler<MatchInput> = onSubmit;

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
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
          {isLoading ? 'Saving...' : defaultValues?.id ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

