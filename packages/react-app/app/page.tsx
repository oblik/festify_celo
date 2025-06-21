"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";
import { useFestify } from "@/contexts/useFestify";
import { Container } from "@/components/ui/container";
import MintGreetingForm from "@/components/MintGreetingForm";
import GreetingStats from "@/components/GreetingStats";
import GreetingCardGallery from "@/components/GreetingCardGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SelfVerification } from "@/components/SelfVerification";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
    const {
        address,
        sentGreetings,
        receivedGreetings,
        fetchGreetingCards
    } = useFestify();

    const [isClient, setIsClient] = useState(false);
    const [isVerificationOpen, setIsVerificationOpen] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        setIsClient(true);
        sdk.actions.ready();
    }, []);

    useEffect(() => {
        if (address) {
            fetchGreetingCards();
        }
    }, [address]);

    const handleVerificationSuccess = () => {
        setIsVerified(true);
        setIsVerificationOpen(false);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-transparent">
            <Container>
                {isClient && (
                  <>
                    {/* HERO: Welcome Panel at the very top */}
                    <div className="w-full mb-10">
                      <div className="rounded-2xl bg-gradient-to-br from-[#7F5AF0] to-[#2CB67D] text-white shadow-xl p-10 animate-fade-in w-full text-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Welcome to Festify!</h1>
                        <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto mb-6">
                          Create and send personalized festival greeting cards as NFTs to your loved ones. Choose from different festivals, add your message, and mint your unique greeting card.
                        </p>
                        {/* Verification Section */}
                        {address && (
                          <div className="bg-white/10 rounded-xl p-6 mt-4 flex flex-col items-center max-w-lg mx-auto shadow-md">
                            <h2 className="text-xl font-semibold mb-2 text-white">Why Get Verified?</h2>
                            <ul className="text-base text-white/90 mb-4 list-disc list-inside text-left">
                              <li>Unlock exclusive features and benefits</li>
                              <li>Prove your identity for a safer experience</li>
                              <li>Stand out as a trusted community member</li>
                            </ul>
                            {isVerified ? (
                              <div className="flex items-center gap-2 mt-2">
                                <CheckCircle2 className="h-6 w-6 text-green-400" />
                                <span className="text-green-100 font-semibold">Verified</span>
                              </div>
                            ) : (
                              <Button
                                className="bg-purple-600 text-white hover:bg-purple-700 font-bold px-6 py-2 rounded-lg shadow transition-colors"
                                title="Get Verified with Self"
                                onClick={() => setIsVerificationOpen(true)}
                              >
                                Get Verified with Self
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* View Cards Panel */}
                    {address && (
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-5 rounded-2xl mb-8 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
                            <div>
                                <h3 className="font-bold text-xl mb-1">View Your NFT Greeting Cards</h3>
                                <p className="opacity-90">Check all greeting cards you've sent and received</p>
                            </div>
                            <Link href="/cards" className="bg-white text-purple-600 px-6 py-2 rounded-xl font-semibold shadow hover:bg-gray-100 transition-colors text-base">
                                View Cards
                            </Link>
                        </div>
                    )}
                    <Tabs defaultValue="create" className="w-full mb-10">
                        <TabsList className="grid w-full grid-cols-2 mb-8 rounded-xl overflow-hidden shadow">
                            <TabsTrigger value="create" className="text-lg py-3">Create Greeting Card</TabsTrigger>
                            <TabsTrigger value="view" className="text-lg py-3">View Your Cards</TabsTrigger>
                        </TabsList>
                        <TabsContent value="create">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
                                {/* Main Form */}
                                <div className="lg:col-span-2 flex flex-col justify-center">
                                    <MintGreetingForm />
                                </div>
                                {/* Info Panels */}
                                <div className="flex flex-col gap-8 w-full max-w-md mx-auto lg:mx-0">
                                    <div className="rounded-2xl bg-white shadow-xl p-7 border border-gray-100 animate-fade-in">
                                        <h3 className="text-lg font-semibold mb-4 text-gray-900">How It Works</h3>
                                        <ol className="list-decimal list-inside text-gray-700 space-y-2 text-base">
                                            <li>Connect your wallet</li>
                                            <li>Select a festival</li>
                                            <li>Enter recipient's address</li>
                                            <li>Write your personal message</li>
                                            <li>Mint your greeting card as an NFT</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            {address && (
                                <GreetingStats 
                                    sentGreetings={sentGreetings} 
                                    receivedGreetings={receivedGreetings} 
                                />
                            )}
                        </TabsContent>
                        <TabsContent value="view">
                            <GreetingCardGallery />
                        </TabsContent>
                    </Tabs>
                  </>
                )}
            </Container>
            <SelfVerification 
                isOpen={isVerificationOpen}
                onClose={() => setIsVerificationOpen(false)}
                onVerificationSuccess={handleVerificationSuccess}
            />
        </main>
    );
}
