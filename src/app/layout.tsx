import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { siteConfig } from "./siteConfig"
import { CryptoProvider } from "@/contexts/CryptoContext"
import { ConditionalLayout } from "@/components/ConditionalLayout"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ['400', '500', '600', '700'],
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
        className={`${inter.variable} ${playfair.variable} font-sans overflow-y-scroll scroll-auto antialiased selection:bg-stone-200 selection:text-stone-900 dark:selection:bg-stone-700 dark:selection:text-stone-50 bg-cream dark:bg-stone-950`}
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
