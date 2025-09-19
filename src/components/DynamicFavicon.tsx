"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

export function DynamicFavicon() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const updateFavicon = () => {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      const shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement
      
      if (favicon) {
        favicon.href = resolvedTheme === 'dark' ? '/favicon/light.png' : '/favicon/dark.png'
      }
      if (shortcutIcon) {
        shortcutIcon.href = resolvedTheme === 'dark' ? '/favicon/light.png' : '/favicon/dark.png'
      }
    }

    // Update favicon when theme changes
    updateFavicon()
  }, [resolvedTheme])

  return null
}