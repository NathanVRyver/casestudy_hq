"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { CryptoSidebar } from "@/components/CryptoSidebar"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // Pages where sidebar should not be shown
  const noSidebarPages = [
    "/auth/signin",
    "/auth/signup",
    "/auth/error"
  ]

  const shouldShowSidebar = !noSidebarPages.some(page => pathname.startsWith(page))

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