import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ChordFlash',
  description: 'Your personal song chord flashcards app. Displays song chords for musicians, designed for live performances and rehearsals.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/apple-touch-icon.png', // You'll need to provide these actual icon files
  },
};

export const viewport: Viewport = {
  themeColor: '#E67700',
  initialScale: 1,
  width: 'device-width',
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
