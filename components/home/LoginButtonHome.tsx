'use client'

import { Button } from "@/components/ui/button"
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { useAccount } from "wagmi";
import Link from "next/link";

export default function LoginButtonHome() {
    const { isConnected } = useAccount();
    const { setShowAuthFlow } = useDynamicContext();
    return (
        <>
            {
                isConnected ? (
                    <Button size="sm" variant="secondary" >
                        <Link href="/explore">
                            Explore
                        </Link>
                    </Button>
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
