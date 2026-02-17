'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { themeClasses } from '@/lib/theme-classes';

const seasonSchema = z.object({
  name: z
    .string()
    .min(1, 'Season name is required')
    .regex(/^\d{2}-\d{2}$/, 'Season must be in format: 24-25'),
  isActive: z.boolean().optional(),
  isCurrent: z.boolean().optional(),
});

type SeasonInput = z.infer<typeof seasonSchema>;

interface SeasonFormProps {
  onSubmit: (data: SeasonInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SeasonForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: SeasonFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SeasonInput>({
    resolver: zodResolver(seasonSchema),
    defaultValues: {
      name: '',
      isActive: false,
      isCurrent: false,
    },
  });

  const isActiveValue = watch('isActive');
  const isCurrentValue = watch('isCurrent');

  const handleFormSubmit = async (data: SeasonInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className={`block text-sm font-medium ${themeClasses.text.label} mb-1`}
        >
          Season Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g., 25-26"
          {...register('name')}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.name
              ? 'border-red-500'
              : `border-gray-300 ${themeClasses.input.DEFAULT}`
          }`}
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register('isActive')}
            className="w-4 h-4 rounded border-gray-300 text-club-primary focus:ring-club-primary"
          />
          <span className={`text-sm font-medium ${themeClasses.text.label}`}>
            Mark as Active Season (allow editing data)
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register('isCurrent')}
            className="w-4 h-4 rounded border-gray-300 text-club-primary focus:ring-club-primary"
          />
          <span className={`text-sm font-medium ${themeClasses.text.label}`}>
            Mark as Current Season (show by default)
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="px-4 py-2 bg-club-primary text-white rounded-lg hover:bg-club-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Season'}
        </button>
      </div>
    </form>
  );
}
