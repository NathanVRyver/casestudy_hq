"use client"

import { Button } from "@/components/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuTrigger,
} from "@/components/Dropdown"
import { useCrypto } from "@/contexts/CryptoContext"
import { cx, focusRing } from "@/lib/utils"
import {
  RiComputerLine,
  RiDashboardLine,
  RiLoginBoxLine,
  RiLogoutBoxLine,
  RiMoonLine,
  RiMore2Fill,
  RiSunLine,
  RiWifiLine,
  RiWifiOffLine,
} from "@remixicon/react"
import { signIn, signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

function UserProfileDropdown({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/dashboard" })
  }

  const handleSignIn = async () => {
    await signIn()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {session?.user ? (
          <>
            <DropdownMenuLabel>
              {session.user.email || session.user.name || "User"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : (
          <>
            <DropdownMenuLabel>Not signed in</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuSubMenu>
            <DropdownMenuSubMenuTrigger>Theme</DropdownMenuSubMenuTrigger>
            <DropdownMenuSubMenuContent>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value)}
              >
                <DropdownMenuRadioItem
                  aria-label="Switch to Light Mode"
                  value="light"
                  iconType="check"
                >
                  <RiSunLine className="size-4 shrink-0" aria-hidden="true" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  aria-label="Switch to Dark Mode"
                  value="dark"
                  iconType="check"
                >
                  <RiMoonLine className="size-4 shrink-0" aria-hidden="true" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  aria-label="Switch to System Mode"
                  value="system"
                  iconType="check"
                >
                  <RiComputerLine
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubMenuContent>
          </DropdownMenuSubMenu>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {session?.user ? (
            <DropdownMenuItem onClick={handleSignOut}>
              <RiLogoutBoxLine className="size-4 shrink-0" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleSignIn}>
              <RiLoginBoxLine className="size-4 shrink-0" aria-hidden="true" />
              Sign in
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserProfile() {
  const { data: session } = useSession()

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const displayName = session?.user?.name || session?.user?.email || "Guest"
  const initials = getInitials(session?.user?.name, session?.user?.email)

  return (
    <UserProfileDropdown>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cx(
          focusRing,
          "group flex w-full items-center justify-between rounded-md p-2 text-sm font-medium text-gray-900 hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 dark:text-gray-50 hover:dark:bg-gray-400/10",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="truncate">{displayName}</span>
        </span>
        <RiMore2Fill
          className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-hover:dark:text-gray-400"
          aria-hidden="true"
        />
      </Button>
    </UserProfileDropdown>
  )
}

export function CryptoSidebar() {
  const { isConnected } = useCrypto()

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <aside className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          {/* App Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              AthenaCrypto
            </h1>
          </div>

          {/* User Profile */}
          <div className="mt-auto">
            <UserProfile />
          </div>
        </aside>
      </nav>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            AthenaCrypto
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status for mobile */}
          {isConnected ? (
            <RiWifiLine className="size-5 text-green-600 dark:text-green-400" />
          ) : (
            <RiWifiOffLine className="size-5 text-red-600 dark:text-red-400" />
          )}

          {/* Mobile User Profile */}
          <UserProfileDropdown>
            <Button
              aria-label="User settings"
              variant="ghost"
              className="group flex items-center rounded-md p-1 text-sm font-medium text-gray-900 hover:bg-gray-100 data-[state=open]:bg-gray-100 dark:text-gray-50"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                aria-hidden="true"
              >
                {(() => {
                  const { data: session } = useSession()
                  const getInitials = (
                    name?: string | null,
                    email?: string | null,
                  ) => {
                    if (name) {
                      return name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    }
                    if (email) {
                      return email.slice(0, 2).toUpperCase()
                    }
                    return "U"
                  }
                  return getInitials(session?.user?.name, session?.user?.email)
                })()}
              </span>
            </Button>
          </UserProfileDropdown>
        </div>
      </div>
    </>
  )
}
