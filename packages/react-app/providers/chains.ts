import { defineChain } from 'viem';

// Celo Mainnet
export const celo = defineChain({
  id: 42220,
  name: 'Celo',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://forno.celo.org'],
    },
    public: {
      http: ['https://forno.celo.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Celo Explorer', url: 'https://explorer.celo.org' },
    celoscan: { name: 'CeloScan', url: 'https://celoscan.io' },
  },
});

// Celo Alfajores Testnet
export const alfajores = defineChain({
  id: 44787,
  name: 'Alfajores',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
    public: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Alfajores Explorer', url: 'https://explorer.celo.org/alfajores' },
    celoscan: { name: 'CeloScan Alfajores', url: 'https://alfajores.celoscan.io' },
  },
  testnet: true,
});

// Optimism Mainnet
export const optimism = defineChain({
  id: 10,
  name: 'Optimism',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.optimism.io'],
    },
    public: {
      http: ['https://mainnet.optimism.io'],
    },
  },
  blockExplorers: {
    default: { name: 'Optimism Explorer', url: 'https://explorer.optimism.io' },
    etherscan: { name: 'Optimism Etherscan', url: 'https://optimistic.etherscan.io' },
  },
});

// Optimism Goerli Testnet
export const optimismGoerli = defineChain({
  id: 420,
  name: 'Optimism Goerli',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://goerli.optimism.io'],
    },
    public: {
      http: ['https://goerli.optimism.io'],
    },
  },
  blockExplorers: {
    default: { name: 'Optimism Explorer', url: 'https://goerli-explorer.optimism.io' },
    etherscan: { name: 'Optimism Etherscan', url: 'https://goerli-optimistic.etherscan.io' },
  },
  testnet: true,
});

// Lisk Mainnet
export const lisk = defineChain({
  id: 1135,
  name: 'Lisk Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.api.lisk.com'],
    },
    public: {
      http: ['https://rpc.api.lisk.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Lisk Explorer', url: 'https://explorer.lisk.com' },
  },
});

// Base Mainnet
export const base = defineChain({
  id: 8453,
  name: 'Base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
    public: {
      http: ['https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Base Explorer', url: 'https://basescan.org' },
    etherscan: { name: 'Base Etherscan', url: 'https://basescan.org' },
  },
});

// Export all chains as an array for easy access
export const allChains = [
  celo,
  optimism,
  lisk,
  base
];

// Helper function to get chain by ID
export const getChainById = (chainId: number) => {
  return allChains.find(chain => chain.id === chainId);
};
