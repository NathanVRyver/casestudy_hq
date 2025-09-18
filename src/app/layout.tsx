import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { Inter } from "next/font/google"
import "./globals.css"
import { siteConfig } from "./siteConfig"
import { CryptoProvider } from "@/contexts/CryptoContext"
import { ConditionalLayout } from "@/components/ConditionalLayout"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://yoururl.com"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: [],
  authors: [
    {
      name: "yourname",
      url: "",
    },
  ],
  creator: "yourname",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: "/athenacrypto.png",
    shortcut: "/athenacrypto.png",
    apple: "/athenacrypto.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} overflow-y-scroll scroll-auto antialiased selection:bg-indigo-100 selection:text-indigo-700 dark:bg-gray-950`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <ThemeProvider defaultTheme="system" attribute="class">
            <CryptoProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </CryptoProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
