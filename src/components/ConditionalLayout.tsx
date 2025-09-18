"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { CryptoSidebar } from "@/components/CryptoSidebar"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Pages where sidebar should not be shown
  const noSidebarPages = [
    "/auth/signin",
    "/auth/signup",
    "/auth/error"
  ]

  const shouldShowSidebar = session?.user && !noSidebarPages.includes(pathname)

  if (status === "loading") {
    // Show loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {shouldShowSidebar && <CryptoSidebar />}
      <main className={shouldShowSidebar ? "lg:pl-72" : ""}>
        <div className={shouldShowSidebar ? "mx-auto max-w-screen-2xl" : ""}>
          {children}
        </div>
      </main>
    </>
  )
}