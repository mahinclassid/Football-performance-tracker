'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { playerSchema, type PlayerInput } from '@/lib/zod-schemas';
import { Position, PlayerStatus } from '@prisma/client';
import { useEffect } from 'react';

interface PlayerFormProps {
  onSubmit: (data: PlayerInput) => Promise<void>;
  defaultValues?: Partial<PlayerInput> & { id?: number };
  onCancel: () => void;
  isLoading?: boolean;
}

export function PlayerForm({ onSubmit, defaultValues, onCancel, isLoading }: PlayerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PlayerInput>({
    resolver: zodResolver(playerSchema),
    defaultValues: defaultValues || {
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          setValue(key as keyof PlayerInput, value as any);
        }
      });
    }
  }, [defaultValues, setValue]);

  const onSubmitHandler: SubmitHandler<PlayerInput> = onSubmit;

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-900">
            First Name *
          </label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-rose-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name *
          </label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-rose-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">
            Position *
          </label>
          <select
            {...register('position')}
            id="position"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
          >
            <option value="">Select position</option>
            {Object.values(Position).map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
          {errors.position && (
            <p className="mt-1 text-sm text-rose-600">{errors.position.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="shirtNo" className="block text-sm font-medium text-gray-700">
            Shirt Number
          </label>
          <input
            {...register('shirtNo', { valueAsNumber: true })}
            type="number"
            id="shirtNo"
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
          />
          {errors.shirtNo && (
            <p className="mt-1 text-sm text-rose-600">{errors.shirtNo.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
          Date of Birth
        </label>
        <input
          {...register('dob', { valueAsDate: true })}
          type="date"
          id="dob"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
        />
        {errors.dob && <p className="mt-1 text-sm text-rose-600">{errors.dob.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="heightCm" className="block text-sm font-medium text-gray-700">
            Height (cm)
          </label>
          <input
            {...register('heightCm', { valueAsNumber: true })}
            type="number"
            id="heightCm"
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
          />
          {errors.heightCm && (
            <p className="mt-1 text-sm text-rose-600">{errors.heightCm.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700">
            Weight (kg)
          </label>
          <input
            {...register('weightKg', { valueAsNumber: true })}
            type="number"
            id="weightKg"
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
          />
          {errors.weightKg && (
            <p className="mt-1 text-sm text-rose-600">{errors.weightKg.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          {...register('status')}
          id="status"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
        >
          {Object.values(PlayerStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-rose-600">{errors.status.message}</p>
        )}
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

