import { ProtectedLayout } from '@/components/layout/ProtectedLayout';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}




