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
          "group flex w-full items-center justify-between rounded-md p-2 text-sm font-medium transition-all duration-200",
          "text-stone-900 hover:bg-stone-100 data-[state=open]:bg-stone-100",
          "dark:text-stone-50 dark:hover:bg-stone-800 dark:data-[state=open]:bg-stone-800",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-cream text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 font-mono font-medium"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="truncate">{displayName}</span>
        </span>
        <RiMore2Fill
          className="size-4 shrink-0 text-stone-500 group-hover:text-stone-700 group-hover:dark:text-stone-400 transition-colors duration-200"
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
        <aside className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-stone-200 bg-cream p-4 dark:border-stone-800 dark:bg-stone-950 bg-texture">
          {/* App Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-display text-2xl font-semibold text-stone-900 dark:text-stone-50 tracking-tight">
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
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-cream/95 backdrop-blur-sm px-4 shadow-soft lg:hidden dark:border-stone-800 dark:bg-stone-950/95">
        <div className="flex items-center">
          <h1 className="text-display text-xl font-semibold text-stone-900 dark:text-stone-50 tracking-tight">
            AthenaCrypto
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status for mobile */}
          {isConnected ? (
            <RiWifiLine className="size-5 text-profit" />
          ) : (
            <RiWifiOffLine className="size-5 text-loss" />
          )}

          {/* Mobile User Profile */}
          <UserProfileDropdown>
            <Button
              aria-label="User settings"
              variant="ghost"
              className="group flex items-center rounded-md p-1 text-sm font-medium text-stone-900 hover:bg-stone-100 data-[state=open]:bg-stone-100 dark:text-stone-50 dark:hover:bg-stone-800 dark:data-[state=open]:bg-stone-800 transition-colors duration-200"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-cream text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 font-mono font-medium"
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
