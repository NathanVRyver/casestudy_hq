import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { Inter } from "next/font/google"
import "./globals.css"
import { siteConfig } from "./siteConfig"
import { CryptoProvider } from "@/contexts/CryptoContext"

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
    icon: "/favicon.ico",
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
        <div className="mx-auto max-w-screen-2xl">
          <SessionProvider>
            <ThemeProvider defaultTheme="system" attribute="class">
              <CryptoProvider>
                <main>{children}</main>
              </CryptoProvider>
            </ThemeProvider>
          </SessionProvider>
        </div>
      </body>
    </html>
  )
}
