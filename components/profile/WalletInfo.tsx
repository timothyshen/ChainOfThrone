'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDisconnect } from 'wagmi'
import { Copy, CheckCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WalletInfoProps {
    address: `0x${string}`
}

export default function WalletInfo({ address }: WalletInfoProps) {
    const { disconnect } = useDisconnect()
    const [copied, setCopied] = useState(false)

    const sliceAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const copyAddress = () => {
        navigator.clipboard.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const openInExplorer = () => {
        window.open(`https://monad-testnet.explorer.caldera.xyz/address/${address}`, '_blank')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Wallet</CardTitle>
                <CardDescription>Your connected wallet</CardDescription>
            </CardHeader>
            <CardContent>
                <div className={cn("flex flex-col space-y-4")}>
                    <div className={cn("flex items-center justify-between bg-muted/50 p-3 rounded-lg")}>
                        <span className={cn("text-sm font-mono truncate")}>
                            {address ? sliceAddress(address) : 'Not connected'}
                        </span>
                        <div className={cn("flex space-x-2")}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={copyAddress}
                                className={cn("h-8 w-8")}
                                title="Copy address"
                            >
                                {copied ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={openInExplorer}
                                className={cn("h-8 w-8")}
                                title="View in explorer"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => disconnect()}
                        className={cn("w-full")}
                    >
                        Disconnect Wallet
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
} 