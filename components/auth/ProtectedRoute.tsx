'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAccount } from 'wagmi'
import { Shield } from 'lucide-react'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const { isConnected } = useAccount()

    useEffect(() => {
        if (status === 'loading') return

        if (!isConnected) {
            router.push('/')
        } else {
            setIsLoading(false)
        }
    }, [session, status, router])

    if (isLoading) {
        return <div className="min-h-screen bg-gradient-to-b flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-8">
                    <Shield className="h-16 w-16 animate-pulse" />
                    <h1 className="text-4xl font-bold font-medieval ml-4">Chain of Throne</h1>
                </div>
                <div className="relative">
                    <div className="h-2 w-48 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-white animate-loading-bar" />
                    </div>
                </div>
                <p className="text-gray-400 text-lg">Preparing the battlefield...</p>
            </div>
        </div>
    }

    return <>{children}</>
} 