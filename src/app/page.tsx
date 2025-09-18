"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (session?.user) {
      router.push("/dashboard")
    } else {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  )
}