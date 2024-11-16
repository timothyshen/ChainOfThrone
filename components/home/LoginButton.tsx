'use client'

import { Button } from "@/components/ui/button"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { useAccount } from "wagmi";
import Link from "next/link";
import { Wallet } from "lucide-react";
interface LoginButtonProps {
    className?: string
}

export default function LoginButton({ className }: LoginButtonProps) {
    const { isConnected } = useAccount();
    const { setShowAuthFlow } = useDynamicContext();
    return (
        <>
            {
                isConnected ? (
                    <Link href="/explore">
                        <Button
                            size="sm"
                        >
                            Lets play
                        </Button>
                    </Link>
                ) : (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowAuthFlow(true)}
                    >
                        Get Started
                    </Button>
                )}
        </>
    )
}
