'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RainbowKitProvider,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { celo, alfajores, optimism, optimismGoerli, allChains } from '../providers/chains';
import { type Chain } from 'viem';
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector'


import Layout from '../components/Layout';
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { FestifyProvider } from './FestifyProvider';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [injectedWallet],
    },
  ],
  {
    appName: 'Celo Composer',
    projectId: process.env.WC_PROJECT_ID ?? '044601f65212332475a09bc14ceb3c34',
  }
);

// Ensure we have at least one chain in the array
const chains = [celo, ...allChains.filter(chain => chain.id !== celo.id)] as [Chain, ...Chain[]];

const config = createConfig({
  connectors: [miniAppConnector()],
  chains,
  transports: {
    [celo.id]: http(),
    [alfajores.id]: http(),
    [optimism.id]: http(),
    [optimismGoerli.id]: http(),
  },
});

const queryClient = new QueryClient();

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <FestifyProvider>
            <Layout>{children}</Layout>
          </FestifyProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
