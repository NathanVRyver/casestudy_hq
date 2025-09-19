"use client"

import { RiEyeLine, RiEyeOffLine } from "@remixicon/react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"

function SignInForm() {
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
    <div className="bg-cream flex min-h-screen dark:bg-stone-950">
      {/* Left Column - Abstract Image (2/3 width) */}
      <div className="relative hidden lg:flex lg:w-2/3">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/wallpaper.png)",
          }}
        />
        <div className="absolute inset-0 bg-stone-900/20 dark:bg-stone-950/40" />
      </div>

      {/* Right Column - Login Form (1/3 width) */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/3">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-display mb-2 text-3xl font-semibold text-stone-900 dark:text-stone-50">
              AthenaCrypto
            </h1>
            <h2 className="mb-2 text-xl font-normal text-stone-700 dark:text-stone-300">
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
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-stone-400 transition-colors duration-200 hover:text-stone-600 dark:hover:text-stone-300"
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
              <div className="text-loss rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm dark:border-red-800/30 dark:bg-red-950/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mono-button-primary w-full"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
            <h3 className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
              Demo Accounts
            </h3>
            <div className="space-y-3 text-xs text-stone-500 dark:text-stone-400">
              <div className="border-l-2 border-stone-300 pl-3 dark:border-stone-600">
                <div className="font-mono text-stone-700 dark:text-stone-300">
                  admin@athenahq.com
                </div>
                <div className="text-stone-500 dark:text-stone-400">
                  admin123
                </div>
              </div>
              <div className="border-l-2 border-stone-300 pl-3 dark:border-stone-600">
                <div className="font-mono text-stone-700 dark:text-stone-300">
                  demo@athenahq.com
                </div>
                <div className="text-stone-500 dark:text-stone-400">
                  demo123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}
