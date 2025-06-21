import type { Metadata } from 'next';
import '@/styles/globals.css';

import { AppProvider } from '@/providers/AppProvider';

const frameMetadata = {
  version: "next",
  // TODO: Replace this with an absolute URL to your app's OG image
  imageUrl: "https://festify.vercel.app/og-image.png",
  button: {
    title: "Create on Festify",
    action: {
      type: "launch_frame" as const,
      name: "Festify",
    }
  }
};

export const metadata: Metadata = {
  title: 'Festify - NFT Greeting Cards',
  description: 'Create and send personalized festival greeting cards as NFTs to your loved ones.',
  other: {
    'fc:frame': JSON.stringify(frameMetadata),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
