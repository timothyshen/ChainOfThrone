'use client'

import {
    createConfig,
    WagmiProvider,
} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { monadTestnet } from 'viem/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Export wagmi config for use in actions (multicall, etc.)
export const wagmiConfig = createConfig({
    chains: [monadTestnet],
    connectors: [
        injected(),
        metaMask(),
    ],
    transports: {
        [monadTestnet.id]: http(),
    },
});

const queryClient = new QueryClient();

export default function GeneralProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};