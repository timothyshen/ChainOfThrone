'use client'

import { Button } from "@/components/ui/button"
import { monadTestnet } from "viem/chains";
import {
    useAccount,
    useConnect,
    useDisconnect,
    useSwitchChain,
} from "wagmi";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { useMiniAppContext } from "@/lib/hooks/use-miniapp-context";


export default function LoginButton() {
    const { isConnected, chainId } = useAccount();
    const { isEthProviderAvailable } = useMiniAppContext();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const { connect } = useConnect();

    return (
        <>
            {isConnected ? (
                <div className="flex flex-col space-y-4 justify-start">
                    {chainId !== monadTestnet.id ? (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => switchChain({ chainId: monadTestnet.id })}
                        >
                            Switch to Monad Testnet
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => disconnect()}
                        >
                            Disconnect Wallet
                        </Button>
                    )}
                </div >
            ) : (
                isEthProviderAvailable ? (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => connect({ connector: farcasterFrame() })}
                    >
                        Connect Wallet
                    </Button>
                ) : (
                    <p className="text-sm text-left">
                        Wallet connection only via Warpcast
                    </p>
                )
            )}

        </>
    )
}
