'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import DiplomacyGame from '@/components/gamePlay/GamePlayPage'

export default function PlayPage() {
    const params = useParams()
    const [gameId, setGameId] = useState<string | null>(null)

    useEffect(() => {
        // Handle the optional catch-all route parameter
        if (params.id && Array.isArray(params.id)) {
            setGameId(params.id[0] || null)
        }
    }, [params])

    return (
        <DiplomacyGame />
    )
}
