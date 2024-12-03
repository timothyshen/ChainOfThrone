import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DiplomacyGame from '@/components/gamePlay/GamePlayPage';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function GamePage({ params }: { params: { address: string } }) {
  
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingScreen />}>
        <DiplomacyGame />
      </Suspense>
    </ProtectedRoute>
  );
} 