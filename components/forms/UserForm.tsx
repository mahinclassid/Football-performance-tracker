'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserInput } from '@/lib/zod-schemas';
import { Role } from '@prisma/client';
import { useEffect } from 'react';

interface UserFormProps {
  onSubmit: (data: UserInput) => Promise<void>;
  defaultValues?: Partial<UserInput> & { id?: number };
  onCancel: () => void;
  isLoading?: boolean;
  isPasswordReset?: boolean;
}

export function UserForm({
  onSubmit,
  defaultValues,
  onCancel,
  isLoading,
  isPasswordReset = false,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues || {
      role: 'STAFF',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'password') {
          setValue(key as keyof UserInput, value as any);
        }
      });
    }
  }, [defaultValues, setValue]);

  if (isPasswordReset) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            New Password *
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>
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
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
        />
        {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email *
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
        />
        {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>}
      </div>

      {!defaultValues?.id && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            Password *
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role *
        </label>
        <select
          {...register('role')}
          id="role"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-club-primary focus:border-club-primary outline-none"
        >
          {Object.values(Role).map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        {errors.role && <p className="mt-1 text-sm text-rose-600">{errors.role.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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

