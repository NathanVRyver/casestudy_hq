"use client"

import { cx } from "@/lib/utils"

interface Tab {
  value: string
  label: string
}

interface CryptoTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (value: string) => void
  className?: string
}

export function CryptoTabs({ tabs, activeTab, onTabChange, className }: CryptoTabsProps) {
  return (
    <div className={cx("flex items-center justify-start overflow-x-auto border-b border-gray-200 dark:border-gray-800", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={cx(
            "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === tab.value
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-500"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}