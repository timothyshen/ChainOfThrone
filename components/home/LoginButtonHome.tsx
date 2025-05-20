'use client'

import { Button } from "@/components/ui/button"
import { useAccount, useConnect } from "wagmi";
import Link from "next/link";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

export default function LoginButtonHome() {
    const { isConnected } = useAccount();
    const { connect } = useConnect();

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
                        onClick={() => connect({ connector: farcasterFrame() })}
                    >
                        Get Started
                    </Button>
                )}
        </>
    )
}
