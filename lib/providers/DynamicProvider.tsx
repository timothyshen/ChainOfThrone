'use client'

import {
    createConfig,
    WagmiProvider,
} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { monadTestnet } from 'viem/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

const config = createConfig({
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

interface WalletsProviderWrapperProps {
    children: React.ReactNode;
}

export default function DynamicProvider({ children }: WalletsProviderWrapperProps): JSX.Element {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}