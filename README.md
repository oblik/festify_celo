# Festify 🎉

Festify is a decentralized application (dApp) that allows users to create and send personalized festival greeting cards as NFTs to their loved ones. Built on multiple blockchain networks including Celo and Optimism, Festify brings the traditional act of sending festival greetings into the Web3 era.

## Features ✨

- **NFT Greeting Cards**: Create and send unique greeting cards as NFTs
- **Multi-Festival Support**: Support for multiple festivals including Christmas, New Year, Eid, and Sallah
- **Cross-Chain Compatibility**: Works on multiple networks:
  - Celo Mainnet
  - Celo Alfajores Testnet
  - Optimism Mainnet
  - Optimism Goerli Testnet
- **Personalized Messages**: Add custom messages to your greeting cards
- **Beautiful UI**: Modern, responsive interface with gradient designs
- **Web3 Storage**: IPFS integration for storing greeting card metadata
- **Wallet Integration**: Seamless connection with Web3 wallets

## Tech Stack 🛠

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Solidity (Smart Contracts)
- **Web3 Integration**: 
  - RainbowKit (Wallet Connection)
  - Wagmi (Ethereum Hooks)
  - Viem (Ethereum Library)
- **Storage**: IPFS (Web3.Storage)
- **Development**: Hardhat (Smart Contract Development)

## Getting Started 🚀

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager
- A Web3 wallet (e.g., MetaMask)

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd festify
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn react-app:dev
   ```

The application will be available at `http://localhost:3000`.

## Usage 💝

1. Connect your Web3 wallet
2. Select a festival from the available options
3. Enter the recipient's wallet address
4. Write your personalized message
5. Mint your greeting card NFT
6. The recipient will receive the NFT in their wallet



### Important Notes
- **Private Keys**: Use valid hex private keys (0x... format) for distribution scripts
- **Network**: Scripts support both Celo and Lisk networks
- **Amounts**: Specify amounts in the native currency (CELO or ETH for Lisk)
- **Directory**: Always run scripts from `Testing_call/server` directory

## Smart Contract 📝

The Festify smart contract (`FestivalGreetings.sol`) implements:
- ERC721 standard for NFTs
- Custom metadata storage for festival types
- Tracking of sent and received greetings
- Optional minting fee mechanism

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Author ✍️

iabdulkarim.eth

## Acknowledgments 🙏

- Built with [Celo Composer](https://github.com/celo-org/celo-composer)
- Powered by Celo and Optimism networks

## Deployed Contracts 🚀
| Network        | Contract Address |
|---------------|------------------|
| Celo Mainnet  | `0xEbc79539af49e1Ee8fE7Ee8721bcA293441ED058` |
| Celo Alfajores| `0x2d31AA6Cf9C41800d2A34E5aA94289377cc43d4B` |
