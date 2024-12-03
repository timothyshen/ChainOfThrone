
import DiplomacyGame from '@/components/gamePlay/GamePlayPage'
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function PlayPage() {

    return (
        <ProtectedRoute>
            <DiplomacyGame />
        </ProtectedRoute>
    )
}
