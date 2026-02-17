'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { ClubSettingsForm } from '@/components/forms/ClubSettingsForm';
import { LoadingWrapper } from '@/components/ui/LoadingWrapper';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const clubFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch club data');
  }
  return res.json();
};

export default function ClubSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (session && session.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);

  const { data: club, isLoading, mutate } = useSWR('/api/club', clubFetcher, {
    revalidateOnFocus: true,
  });

  const handleSuccess = () => {
    mutate();
  };

  return (
    <LoadingWrapper isLoading={isLoading || !club} message="Loading club settings...">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Club Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your club's information including name, manager, and logo
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
          {club && (
            <ClubSettingsForm club={club} onSuccess={handleSuccess} />
          )}
        </div>
      </div>
    </LoadingWrapper>
  );
}
