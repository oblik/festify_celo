// Contract addresses for different networks
export const CONTRACT_ADDRESSES: Record<number, string> = {
  // Celo Mainnet
  42220: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CELO || "0xEbc79539af49e1Ee8fE7Ee8721bcA293441ED058",
  // Alfajores Testnet
  44787: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ALFAJORES || "0x2d31AA6Cf9C41800d2A34E5aA94289377cc43d4B",
  // Optimism Mainnet
  10: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_OPTIMISM || "",
  // Optimism Goerli Testnet
  420: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_OPTIMISM_GOERLI || "",
  // Lisk Mainnet
  1135: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LISK || "0xEbc79539af49e1Ee8fE7Ee8721bcA293441ED058",
};