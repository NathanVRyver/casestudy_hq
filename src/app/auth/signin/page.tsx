"use client"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { RiEyeLine, RiEyeOffLine, RiLoginBoxLine } from "@remixicon/react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream bg-texture px-4 dark:bg-stone-950">
      <div className="mono-card w-full max-w-md p-8 page-transition">
        <div className="mb-8 text-center">
          <h1 className="text-display text-3xl font-semibold text-stone-900 dark:text-stone-50 mb-2">
            AthenaCrypto
          </h1>
          <h2 className="text-xl font-normal text-stone-700 dark:text-stone-300 mb-2">
            Welcome back
          </h2>
          <p className="text-stone-500 dark:text-stone-400">
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="mono-input w-full"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="mono-input w-full pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-200"
              >
                {showPassword ? (
                  <RiEyeOffLine className="h-5 w-5" />
                ) : (
                  <RiEyeLine className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-center text-sm text-loss bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg p-3">{error}</div>
          )}

          <button type="submit" disabled={isLoading} className="mono-button-primary w-full">
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4">
          <h3 className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
            Demo Accounts
          </h3>
          <div className="space-y-3 text-xs text-stone-500 dark:text-stone-400">
            <div className="border-l-2 border-stone-300 dark:border-stone-600 pl-3">
              <div className="font-mono text-stone-700 dark:text-stone-300">admin@athenahq.com</div>
              <div className="text-stone-500 dark:text-stone-400">admin123</div>
            </div>
            <div className="border-l-2 border-stone-300 dark:border-stone-600 pl-3">
              <div className="font-mono text-stone-700 dark:text-stone-300">demo@athenahq.com</div>
              <div className="text-stone-500 dark:text-stone-400">demo123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
