'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import DiplomacyGame from '@/components/gamePlay/GamePlayPage'
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function PlayPage() {
    const params = useParams()
    const [gameId, setGameId] = useState<string | null>(null)

    useEffect(() => {
        if (params.id && Array.isArray(params.id)) {
            setGameId(params.id[0] || null)
            console.log(gameId)
        }
    }, [params])

    return (
        <ProtectedRoute>
            <DiplomacyGame />
        </ProtectedRoute>
    )
}
