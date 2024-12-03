'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const router = useRouter()
    const { isConnected, isConnecting } = useAccount()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Short delay to prevent flash of loading state for quick connections
        const timer = setTimeout(() => {
            if (!isConnecting) {
                setIsLoading(false)
                if (!isConnected) {
                    router.push('/')
                }
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [isConnected, isConnecting, router])

    if (isLoading || isConnecting) {
        return <LoadingScreen />
    }

    if (!isConnected) {
        return null // Router will handle redirect
    }

    return <>{children}</>
} 