// Contract addresses for different networks
export const CONTRACT_ADDRESSES: Record<number, string> = {
  // Celo Mainnet
  42220: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CELO || "0xEbc79539af49e1Ee8fE7Ee8721bcA293441ED058",
 
  // Optimism Mainnet
  10: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_OPTIMISM || "0xAE4a3cCb094B1E475CA8b83BCBA5508a30EBF1C0",
 
  // Lisk Mainnet
  1135: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LISK || "0xf9Dd4b5003aeaB126cdBc89c0D04fC10e9160fBd",
  // Base Mainnet
  8453: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE || "0x6a613CABCFDc03541614272DfE9519e8d183752b",
};