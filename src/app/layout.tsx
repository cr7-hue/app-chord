import type { Metadata } from "next"
import * as React from "react"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/Navigation"

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

export const metadata: Metadata = {
  title: "ChordFlash - Your Personal Song Collection",
  description: "Manage your song chords and lyrics in one place",
  icons: {
    icon: "/icons/icon-512x512.png",
    apple: "/icons/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="mx-auto min-h-screen max-w-lg bg-background text-foreground antialiased transition-colors">
            {children}
          </main>
          <Navigation />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
