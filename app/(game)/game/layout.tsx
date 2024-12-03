import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
} 