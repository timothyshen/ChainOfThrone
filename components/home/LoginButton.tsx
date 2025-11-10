'use client'

import { Button } from "@/components/ui/button"
import { monadTestnet } from "viem/chains";
import {
    useAccount,
    useConnect,
    useDisconnect,
    useSwitchChain,
} from "wagmi";
import { injected, metaMask } from "wagmi/connectors";


export default function LoginButton() {
    const { isConnected, chainId } = useAccount();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const { connect, connectors } = useConnect();

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
                </div>
            ) : (
                <div className="flex flex-col space-y-2">

                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => connect({ connector: metaMask() })}
                    // disabled={!metaMask().ready}
                    >
                        Connect
                    </Button>
                </div>
            )}
        </>
    )
}
