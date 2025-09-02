"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FestivalSelector from './FestivalSelector';
import { Loader2 } from 'lucide-react';
import { useFestify } from '@/contexts/useFestify';
import { useAccount } from 'wagmi';

const MintGreetingForm: React.FC = () => {
  const { 
    address, 
    mintGreetingCard, 
    isLoading, 
    chainId,
    isNetworkSupported,
    getNetworkName
  } = useFestify();
  const { address: wagmiAddress } = useAccount();
  
  // Form state
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [festival, setFestival] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [networkName, setNetworkName] = useState('');
  
  // Get network name when chainId changes
  useEffect(() => {
    if (chainId) {
      // Get network name based on chain ID
      let network;
      switch (chainId) {
        case 42220:
          network = 'Celo Mainnet';
          break;
        case 44787:
          network = 'Celo Alfajores Testnet';
          break;
        case 10:
          network = 'Optimism';
          break;
        case 420:
          network = 'Optimism Goerli Testnet';
          break;
        default:
          network = `Unsupported Network (Chain ID: ${chainId})`;
      }
      console.log("Network Detection:", {
        chainId,
        networkName: network,
        isSupported: [42220, 44787, 10, 420].includes(chainId)
      });
      setNetworkName(network);
    }
  }, [chainId]);

  // Get wallet address directly from localStorage or provider
  const [localWalletAddress, setLocalWalletAddress] = useState<string | null>(null);
  
  useEffect(() => {
    const getWalletAddress = async () => {
      // First check localStorage
      if (typeof window !== "undefined") {
        const savedAddress = window.localStorage.getItem('walletAddress');
        if (savedAddress) {
          console.log("MintGreetingForm: Using wallet address from localStorage:", savedAddress);
          setLocalWalletAddress(savedAddress);
          return;
        }
      }
      
      // Then check wagmi address
      if (wagmiAddress) {
        console.log("MintGreetingForm: Using wallet address from wagmi:", wagmiAddress);
        setLocalWalletAddress(wagmiAddress);
        window.localStorage.setItem('walletAddress', wagmiAddress);
      }
    };
    
    getWalletAddress();
  }, [wagmiAddress]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!recipient) {
      setError('Recipient address is required');
      return;
    }
    
    if (!message) {
      setError('Message is required');
      return;
    }
    
    if (!festival) {
      setError('Please select a festival');
      return;
    }
    
    console.log('Minting greeting card with:', { recipient, message, festival, imageUrl });
    console.log('Using wallet address:', localWalletAddress || wagmiAddress);
    
    // Set local loading state
    setLocalLoading(true);
    
    try {
      // Check if we have a wallet address from any source
      if (!localWalletAddress && !wagmiAddress) {
        throw new Error('Please connect your wallet first. Click the Connect Wallet button in the top right corner.');
      }
      
      // Validate recipient address format
      if (!recipient.startsWith('0x') || recipient.length !== 42) {
        throw new Error('Invalid recipient address. Please enter a valid Ethereum address.');
      }
      
      // Use the wallet address we found
      const effectiveAddress = localWalletAddress || wagmiAddress;
      console.log("Proceeding with minting using address:", effectiveAddress);
      
      if (effectiveAddress) {
        window.localStorage.setItem('walletAddress', effectiveAddress);
      }
      
      // Call the mintGreetingCard function from useFestify context
      const receipt = await mintGreetingCard(recipient, message, festival, imageUrl);
      
      console.log('Transaction receipt:', receipt);
      
      // Reset form and show success message
      setSuccess(true);
      setStep(1);
      setRecipient('');
      setMessage('');
      setFestival('');
      setImageUrl('');
      
      setTimeout(() => {
        setSuccess(false);
      }, 8000);
    } catch (error: any) {
      console.error('Error in form submission:', error);
      
      if (error.message.includes('insufficient funds')) {
        setError('Insufficient funds to pay for the mint fee. Please make sure you have enough ETH.');
      } else if (error.message.includes('user rejected')) {
        setError('Transaction was rejected. Please try again.');
      } else {
        setError(error.message || 'Failed to mint greeting card');
      }
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Note: Using getDefaultImageForFestival from useFestify context

  // Handle next step
  const handleNextStep = () => {
    if (step === 1 && !festival) {
      setError('Please select a festival');
      return;
    }
    
    if (step === 2 && !recipient) {
      setError('Recipient address is required');
      return;
    }
    
    console.log('Moving to next step:', step + 1);
    setError('');
    setStep(step + 1);
  };

  // Handle previous step
  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };
  
  // Show supported networks in the UI
  const renderSupportedNetworks = () => (
    <div className="mt-4 p-4 bg-yellow-50 rounded-md">
      <h3 className="text-sm font-medium text-yellow-800">Supported Networks:</h3>
      <ul className="mt-2 text-sm text-yellow-700">
        <li>• Celo Mainnet</li>
        <li>• Lisk Mainnet</li>
        <li>• Base Mainnet</li>
        <li>• Optimism Mainnet</li>
      </ul>
    </div>
  );

  // Network warning banner
  const NetworkWarning = () => {
    if (!chainId) return null;
    if (!isNetworkSupported(chainId)) {
      return (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">
            Unsupported Network Detected
          </h3>
          <p className="mt-2 text-sm text-yellow-700">
            You are currently on {getNetworkName(chainId)}. Please switch to one of our supported networks:
          </p>
          <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
            <li>Celo Mainnet</li>
            <li>Lisk Mainnet</li>
            <li>Base Mainnet</li>
            <li>Optimism</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  // Show success message
  if (success) {
    return (
      <Card className="max-w-lg mx-auto mt-8 animate-fade-in">
        <CardHeader>
          <CardTitle>Success!</CardTitle>
          <CardDescription>
            Your festival greeting card has been minted and sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8">
            <div className="text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-green-700">Your greeting card has been sent successfully!</p>
            <p className="text-gray-500 mt-2">The recipient will be able to view it in their wallet on {networkName}.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button title="Create Another Greeting" className="w-full" onClick={() => setSuccess(false)}>
            Create Another Greeting
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Stepper UI
  const Stepper = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`w-8 h-2 mx-1 rounded-full transition-all duration-300 ${
            step === s ? 'bg-primary-700 w-12' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );

  return (
    <Card className="max-w-lg mx-auto mt-8 animate-fade-in">
      <CardHeader>
        <CardTitle>Create a Festival Greeting</CardTitle>
        <CardDescription>
          Send a personalized festival greeting card as an NFT
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper />
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Select Festival */}
          {step === 1 && (
            <div className="space-y-6">
              <FestivalSelector
                selectedFestival={festival}
                onSelectFestival={setFestival}
              />
              <div className="pt-2">
                <p className="text-sm text-gray-500">
                  Select the festival for which you want to create a greeting card
                </p>
                {renderSupportedNetworks()}
              </div>
            </div>
          )}
          {/* Step 2: Enter Recipient */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium">
                  Recipient Address
                </label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="bg-gray-50 border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
                <p className="text-xs text-gray-500">
                  Enter the Ethereum address of the recipient
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="image-url" className="text-sm font-medium">
                  Image URL (Optional)
                </label>
                <Input
                  id="image-url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-gray-50 border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
                <p className="text-xs text-gray-500">
                  Optionally provide a custom image URL for your greeting card
                </p>
              </div>
            </div>
          )}
          {/* Step 3: Enter Message */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Your Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Write your festival greeting message here..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-gray-50 border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-500">
                  Write a personal message to be included in your greeting card
                </p>
                {networkName && (
                  <p className="text-sm text-gray-500 mt-2">
                    You will be minting on {networkName}
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-500 text-sm rounded-lg border border-red-200">
              {error}
              {!error.includes("supported network") && renderSupportedNetworks()}
            </div>
          )}
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button type="button" title="Back" variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
            ) : (
              <div></div>
            )}
            {step < 3 ? (
              <Button type="button" title="Next" onClick={handleNextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" title="Mint Greeting Card" disabled={isLoading || localLoading} loading={isLoading || localLoading} onClick={() => {}}>
                Mint Greeting Card
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MintGreetingForm;
