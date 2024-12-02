'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === 'loading') return

        if (!session) {
            router.push('/')
        } else {
            setIsLoading(false)
        }
    }, [session, status, router])

    if (isLoading) {
        return <div>Loading...</div> // You can replace this with a proper loading component
    }

    return <>{children}</>
} 