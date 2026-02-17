import { ProtectedLayout } from '@/components/layout/ProtectedLayout';

export default function ClubSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
