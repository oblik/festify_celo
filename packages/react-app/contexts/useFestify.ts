import { useEffect, useState, useCallback } from "react";
import FestifyABI from "./festify-abi.json";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
  parseEther,
  PublicClient,
  GetContractReturnType,
  Chain,
  encodeFunctionData,
} from "viem";
import { useAccount, usePublicClient, useWalletClient, useChainId } from "wagmi";
import { allChains } from "../providers/chains";
import { generateGreetingCardSVG } from "../utils/cardGenerator";
import { utf8ToBase64, parseBase64Metadata } from "../utils/base64Utils";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { initializeWeb3Storage, createAndUploadMetadata } from "../utils/web3Storage";
import { getDataSuffix, submitReferral } from '@divvi/referral-sdk';

// Define supported networks
export const SUPPORTED_NETWORKS = {
  CELO_MAINNET: 42220,
  CELO_TESTNET: 44787,
  OPTIMISM_MAINNET: 10,
  OPTIMISM_TESTNET: 420,
} as const;

type SupportedChainId = typeof SUPPORTED_NETWORKS[keyof typeof SUPPORTED_NETWORKS];

// Type for our contract
type FestifyContract = GetContractReturnType<typeof FestifyABI.abi, PublicClient>;

export const useFestify = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [sentGreetings, setSentGreetings] = useState<any[]>([]);
  const [receivedGreetings, setReceivedGreetings] = useState<any[]>([]);
  const [web3StorageInitialized, setWeb3StorageInitialized] = useState(false);

  // Check if current network is supported
  const isNetworkSupported = useCallback((chainId: number): chainId is SupportedChainId => {
    return Object.values(SUPPORTED_NETWORKS).includes(chainId as SupportedChainId);
  }, []);

  // Get network name
  const getNetworkName = useCallback((chainId: number): string => {
    switch (chainId) {
      case SUPPORTED_NETWORKS.CELO_MAINNET:
        return 'Celo Mainnet';
      case SUPPORTED_NETWORKS.CELO_TESTNET:
        return 'Celo Alfajores Testnet';
      case SUPPORTED_NETWORKS.OPTIMISM_MAINNET:
        return 'Optimism';
      case SUPPORTED_NETWORKS.OPTIMISM_TESTNET:
        return 'Optimism Goerli Testnet';
      default:
        return 'Unsupported Network';
    }
  }, []);

  // Get the contract address for the current chain
  const getContractAddress = useCallback((): string => {
    if (!chainId || !isNetworkSupported(chainId)) return "";
    return CONTRACT_ADDRESSES[chainId] || "";
  }, [chainId, isNetworkSupported]);

  // Fetch greeting cards (sent/received)
  const fetchGreetingCards = useCallback(async () => {
    if (!address || !chainId || !publicClient) return;
    setIsLoading(true);
    try {
      const contractAddress = getContractAddress();
      console.log("contractAddress", contractAddress);
      if (!contractAddress) {
        setSentGreetings([]);
        setReceivedGreetings([]);
        return;
      }

      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: FestifyABI.abi,
        client: publicClient,
      });

      // Sent
      let sentTokensResult: bigint[] = [];
      try {
        const result = await contract.read.getSentGreetings([address as `0x${string}`]);
        if (Array.isArray(result)) {
          sentTokensResult = result as bigint[];
          console.log("Sent greetings found:", sentTokensResult.length);
        }
      } catch (error) {
        console.error("Error fetching sent greetings:", error);
        sentTokensResult = [];
      }

      // Received
      let receivedTokensResult: bigint[] = [];
      try {
        const result = await contract.read.getReceivedGreetings([address as `0x${string}`]);
        if (Array.isArray(result)) {
          receivedTokensResult = result as bigint[];
          console.log("Received greetings found:", receivedTokensResult.length);
        }
      } catch (error) {
        console.error("Error fetching received greetings:", error);
        receivedTokensResult = [];
      }

      // Sent details
      const sentTokenDetails = await Promise.all(
        sentTokensResult.map(async (tokenId) => {
          try {
            const [tokenURI, festival, recipient] = await Promise.all([
              contract.read.tokenURI([tokenId]),
              contract.read.getGreetingFestival([tokenId]),
              contract.read.ownerOf([tokenId])
            ]);

            const metadata = parseBase64Metadata(tokenURI as string);
            return {
              tokenId: tokenId.toString(),
              tokenURI: tokenURI as string,
              festival: festival as string,
              recipient: recipient as string,
              metadata
            };
          } catch (error) {
            console.error(`Error fetching details for sent token ${tokenId}:`, error);
            return null;
          }
        })
      );

      // Received details
      const receivedTokenDetails = await Promise.all(
        receivedTokensResult.map(async (tokenId) => {
          try {
            const [tokenURI, festival, sender] = await Promise.all([
              contract.read.tokenURI([tokenId]),
              contract.read.getGreetingFestival([tokenId]),
              contract.read.getGreetingSender([tokenId])
            ]);

            const metadata = parseBase64Metadata(tokenURI as string);
            return {
              tokenId: tokenId.toString(),
              tokenURI: tokenURI as string,
              festival: festival as string,
              sender: sender as string,
              metadata
            };
          } catch (error) {
            console.error(`Error fetching details for received token ${tokenId}:`, error);
            return null;
          }
        })
      );

      const validSentDetails = sentTokenDetails.filter((item): item is NonNullable<typeof item> => item !== null);
      const validReceivedDetails = receivedTokenDetails.filter((item): item is NonNullable<typeof item> => item !== null);

      console.log("Setting sent greetings:", validSentDetails.length);
      console.log("Setting received greetings:", validReceivedDetails.length);

      setSentGreetings(validSentDetails);
      setReceivedGreetings(validReceivedDetails);
    } catch (error) {
      console.error("Error in fetchGreetingCards:", error);
      setSentGreetings([]);
      setReceivedGreetings([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId, publicClient, getContractAddress]);

  // Auto-refresh greetings when a new one is minted
  const refreshGreetings = useCallback(async () => {
    console.log("Refreshing greetings...");
    await fetchGreetingCards();
  }, [fetchGreetingCards]);

  // Mint a new greeting card
  const mintGreetingCard = async (
    recipient: string,
    message: string,
    festival: string,
    imageUrl?: string
  ) => {
    try {
      if (!chainId) {
        throw new Error("Please connect your wallet to continue.");
      }

      if (!isNetworkSupported(chainId)) {
        throw new Error(`Please switch to a supported network (${Object.values(SUPPORTED_NETWORKS).map(id => getNetworkName(id)).join(', ')}).`);
      }

      const contractAddress = getContractAddress();
      if (!contractAddress) {
        throw new Error(`No contract deployed on ${getNetworkName(chainId)}. Please switch to a supported network.`);
      }

      if (!walletClient) {
        throw new Error("Wallet not connected. Please connect your wallet to continue.");
      }

      setIsLoading(true);
      
      // Generate SVG and metadata
      const svgDataUrl = generateGreetingCardSVG(festival, message, address || "", recipient);
      let metadataUri;
      try {
        if (!web3StorageInitialized) {
          await initializeWeb3Storage();
          setWeb3StorageInitialized(true);
        }
        metadataUri = await createAndUploadMetadata(
          message,
          festival,
          address || "",
          recipient,
          svgDataUrl
        );
      } catch (ipfsError) {
        const metadata = {
          name: `${festival.charAt(0).toUpperCase() + festival.slice(1)} Greeting`,
          description: message,
          image: svgDataUrl,
          attributes: [
            { trait_type: "Festival", value: festival },
            { trait_type: "Sender", value: address },
            { trait_type: "Recipient", value: recipient },
            { trait_type: "Created", value: new Date().toISOString() },
          ],
        };
        metadataUri = `data:application/json;base64,${utf8ToBase64(JSON.stringify(metadata))}`;
      }

      const mintFee = parseEther("0.01");
      const formattedAddress = address as `0x${string}`;

      // Get Divvi data suffix for referral tracking
      const dataSuffix = getDataSuffix({
        consumer: '0x4eA48e01F1314Db0925653e30617B254D1cf5366', // Your Divvi Identifier
        providers: ['0x0423189886d7966f0dd7e7d256898daeee625dca','0xc95876688026be9d6fa7a7c33328bd013effa2bb','0x7beb0e14f8d2e6f6678cc30d867787b384b19e20'],
      });

      // First prepare the contract call
      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: FestifyABI.abi,
        client: walletClient,
      });

      // Execute transaction with Divvi data suffix
      const tx = await contract.write.mintGreetingCard(
        [recipient as `0x${string}`, metadataUri, festival],
        {
          account: formattedAddress,
          value: mintFee,
          dataSuffix,
        }
      );

      if (!publicClient) throw new Error("Failed to initialize public client");
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      
      // Submit referral to Divvi
      await submitReferral({
        txHash: tx,
        chainId,
      });
      
      // Refresh the greetings list after minting
      await refreshGreetings();
      
      return receipt;
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when address/chain changes
  useEffect(() => {
    fetchGreetingCards();
  }, [fetchGreetingCards]);

  return {
    address,
    isConnected,
    isLoading,
    sentGreetings,
    receivedGreetings,
    chainId,
    isNetworkSupported,
    getNetworkName,
    getContractAddress,
    mintGreetingCard,
    fetchGreetingCards,
  };
};
