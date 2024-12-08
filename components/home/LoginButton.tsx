'use client'

import { Button } from "@/components/ui/button"
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { useAccount } from "wagmi";

export default function LoginButton() {
    const { isConnected } = useAccount();
    const { setShowAuthFlow } = useDynamicContext();

    return (
        <>
            {
                isConnected ? (
                    <DynamicWidget />
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
