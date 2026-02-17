'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/components/ui/Toast';
import Image from 'next/image';
import { themeClasses } from '@/lib/theme-classes';

const clubSchema = z.object({
  name: z.string().min(1, 'Club name is required'),
  country: z.string().min(1, 'Country is required'),
  manager: z.string().min(1, 'Manager name is required'),
  stadium: z.string().min(1, 'Stadium name is required'),
  league: z.string().min(1, 'League is required'),
  location: z.string().optional(),
});

type ClubSettingsInput = z.infer<typeof clubSchema>;

interface ClubSettingsFormProps {
  club: {
    id?: number;
    name: string;
    country: string;
    manager: string;
    stadium: string;
    league: string;
    logo?: string | null;
    location?: string | null;
  };
  onSuccess?: () => void;
}

export function ClubSettingsForm({ club, onSuccess }: ClubSettingsFormProps) {
  const { showToast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(club.logo || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ClubSettingsInput>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: club.name,
      country: club.country,
      manager: club.manager,
      stadium: club.stadium,
      league: club.league,
      location: club.location || '',
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ClubSettingsInput) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('country', data.country);
      formData.append('manager', data.manager);
      formData.append('stadium', data.stadium);
      formData.append('league', data.league);
      formData.append('location', data.location || '');
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      console.log('Submitting club settings...');
      const response = await fetch('/api/club', {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();
      console.log('API Response:', { status: response.status, ok: response.ok, result });

      if (!response.ok) {
        showToast(result.message || 'Failed to update club settings', 'error');
        return;
      }

      // Update form fields with the response data
      if (result.data) {
        setValue('name', result.data.name);
        setValue('country', result.data.country);
        setValue('manager', result.data.manager);
        setValue('stadium', result.data.stadium);
        setValue('league', result.data.league);
        setValue('location', result.data.location || '');
        
        if (result.data.logo) {
          setLogoPreview(result.data.logo);
        }
        setLogoFile(null);
      }

      showToast('Club settings updated successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Club Name */}
        <div>
          <label htmlFor="name" className={themeClasses.form.label}>
            Club Name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm outline-none ${themeClasses.input.DEFAULT}`}
            placeholder="Enter club name"
          />
          {errors.name && (
            <p className={themeClasses.form.error}>{errors.name.message}</p>
          )}
        </div>

        {/* Manager Name */}
        <div>
          <label htmlFor="manager" className={themeClasses.form.label}>
            Manager Name
          </label>
          <input
            {...register('manager')}
            type="text"
            id="manager"
            className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm outline-none ${themeClasses.input.DEFAULT}`}
            placeholder="Enter manager name"
          />
          {errors.manager && (
            <p className={themeClasses.form.error}>{errors.manager.message}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className={themeClasses.form.label}>
            Country
          </label>
          <input
            {...register('country')}
            type="text"
            id="country"
            className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm outline-none ${themeClasses.input.DEFAULT}`}
            placeholder="Enter country"
          />
          {errors.country && (
            <p className={themeClasses.form.error}>{errors.country.message}</p>
          )}
        </div>

        {/* Stadium */}
        <div>
          <label htmlFor="stadium" className={themeClasses.form.label}>
            Stadium Name
          </label>
          <input
            {...register('stadium')}
            type="text"
            id="stadium"
            className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm outline-none ${themeClasses.input.DEFAULT}`}
            placeholder="Enter stadium name"
          />
          {errors.stadium && (
            <p className={themeClasses.form.error}>{errors.stadium.message}</p>
          )}
        </div>

        {/* League */}
        <div>
          <label htmlFor="league" className={themeClasses.form.label}>
            League
          </label>
          <input
            {...register('league')}
            type="text"
            id="league"
            className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm outline-none ${themeClasses.input.DEFAULT}`}
            placeholder="Enter league"
          />
          {errors.league && (
            <p className={themeClasses.form.error}>{errors.league.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className={themeClasses.form.label}>
            Location (City)
          </label>
          <input
            {...register('location')}
            type="text"
            id="location"
            className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm outline-none ${themeClasses.input.DEFAULT}`}
            placeholder="Enter location"
          />
          {errors.location && (
            <p className={themeClasses.form.error}>{errors.location.message}</p>
          )}
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <label htmlFor="logo" className={themeClasses.form.label}>
          Club Logo
        </label>
        <div className="mt-2 flex items-center gap-6">
          {logoPreview ? (
            <div className="w-24 h-24 rounded-lg bg-gray-100 p-2 flex items-center justify-center border-2 border-gray-300">
              <Image
                src={logoPreview}
                alt="Logo preview"
                width={96}
                height={96}
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
              <span className="text-gray-400 text-sm">No logo</span>
            </div>
          )}
          <div>
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
              className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-club-primary file:text-white hover:file:bg-club-primary-dark"
            />
            <p className="mt-2 text-sm text-gray-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-club-primary text-white rounded-lg hover:bg-club-primary-dark disabled:opacity-50 transition-colors font-medium"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
