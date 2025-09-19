"use client"

import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { CryptoTabs } from "@/components/CryptoTabs"
import { MarketOverview } from "@/components/MarketOverview"
import { PriceTicker } from "@/components/PriceTicker"
import { Searchbar } from "@/components/Searchbar"
import { useCrypto } from "@/contexts/CryptoContext"
import { cx } from "@/lib/utils"
import { TabCategory } from "@/types/crypto"
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiDashboardLine,
  RiSearchLine,
} from "@remixicon/react"
import { useMemo, useState, useEffect, useRef } from "react"
import { CryptoAsset } from "@/types/crypto"

export default function DashboardPage() {
  const {
    topAssets,
    topGainers,
    topLosers,
    highVolume,
    trending,
    isLoading,
    isConnected,
    searchQuery,
    setSearchQuery,
    filteredAssets,
    formatPrice,
    formatVolume,
    formatChange,
    isPriceChanging,
    isRecentlyUpdated,
  } = useCrypto()

  const [activeTab, setActiveTab] = useState<TabCategory>("trending")
  const [showOverview, setShowOverview] = useState(false)
  
  // Lock the order of assets on first load for each tab
  const lockedPositions = useRef<Record<TabCategory, string[]>>({
    trending: [],
    gainers: [],
    losers: [],
    volume: [],
    all: []
  })
  
  // Initialize locked positions once when data first loads
  useEffect(() => {
    if (!isLoading && topAssets.length > 0) {
      if (lockedPositions.current.trending.length === 0) {
        lockedPositions.current = {
          trending: trending.map(a => a.symbol),
          gainers: topGainers.map(a => a.symbol),
          losers: topLosers.map(a => a.symbol),
          volume: highVolume.map(a => a.symbol),
          all: topAssets.map(a => a.symbol)
        }
      }
    }
  }, [isLoading, topAssets.length]) // Only depend on loading state and if we have data

  const tabs = [
    { value: "trending" as TabCategory, label: "Trending" },
    { value: "gainers" as TabCategory, label: "Top Gainers" },
    { value: "losers" as TabCategory, label: "Top Losers" },
    { value: "volume" as TabCategory, label: "High Volume" },
    { value: "all" as TabCategory, label: "All Coins" },
  ]

  // Get the right assets based on active tab with locked positions
  const displayedAssets = useMemo(() => {
    if (searchQuery) return filteredAssets
    
    // Get the locked order for current tab
    const lockedOrder = lockedPositions.current[activeTab] || []
    
    // Get the current data based on tab
    let currentData: CryptoAsset[] = []
    switch (activeTab) {
      case "trending":
        currentData = trending
        break
      case "gainers":
        currentData = topGainers
        break
      case "losers":
        currentData = topLosers
        break
      case "volume":
        currentData = highVolume
        break
      case "all":
        currentData = topAssets
        break
      default:
        currentData = topAssets
    }
    
    // If we have locked positions, sort the current data to match the locked order
    if (lockedOrder.length > 0) {
      const dataMap = new Map(currentData.map(asset => [asset.symbol, asset]))
      const sortedAssets: CryptoAsset[] = []
      
      // Add assets in the locked order
      for (const symbol of lockedOrder) {
        const asset = dataMap.get(symbol)
        if (asset) {
          sortedAssets.push(asset)
        }
      }
      
      return sortedAssets
    }
    
    // If no locked positions yet, return current data as-is
    return currentData
  }, [activeTab, topAssets, topGainers, topLosers, highVolume, trending, filteredAssets, searchQuery])

  return (
    <div className="min-h-screen bg-cream bg-texture dark:bg-stone-950 page-transition">
      {/* Header - shows overview toggle */}
      <div className="sticky top-16 lg:top-0 z-30 border-b border-stone-200 bg-cream/95 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/95">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 lg:h-16 items-center justify-between lg:justify-end">
            <h2 className="text-display text-lg font-semibold text-stone-900 dark:text-stone-50 lg:hidden">
              Dashboard
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowOverview(!showOverview)}
                className={cx(
                  "rounded-lg p-2 transition-all duration-200",
                  showOverview
                    ? "bg-stone-200 text-stone-900 dark:bg-stone-700 dark:text-stone-50"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-50",
                )}
              >
                <RiDashboardLine className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Price Ticker */}
      {topAssets.length > 0 && (
        <div className="border-b border-stone-200 bg-stone-100/50 py-2 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/50">
          <PriceTicker assets={topAssets.slice(0, 20)} />
        </div>
      )}

      {/* Search and Tabs */}
      <div className="border-b border-stone-200 bg-stone-50/80 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Searchbar
              placeholder="Search cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          <CryptoTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(value) => setActiveTab(value as TabCategory)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Market Overview */}
        {showOverview && !isLoading && (
          <div className="mb-8">
            <MarketOverview />
          </div>
        )}

        {/* Crypto Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-stone-900 dark:border-stone-800 dark:border-t-stone-50"></div>
              <p className="mt-4 text-stone-500 dark:text-stone-400">
                Loading crypto data...
              </p>
            </div>
          </div>
        ) : displayedAssets.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <RiSearchLine className="mx-auto h-12 w-12 text-stone-400" />
              <p className="mt-4 text-stone-500 dark:text-stone-400">
                No cryptocurrencies found
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedAssets.map((asset) => (
              <Card
                key={asset.symbol}
                className="group relative overflow-hidden animate-fade-in-up"
                style={{
                  animationDelay: `${displayedAssets.indexOf(asset) * 50}ms`,
                }}
              >
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-display font-semibold text-stone-900 dark:text-stone-50">
                        {asset.symbol}
                      </h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {asset.name}
                      </p>
                    </div>
                    <Badge
                      variant={
                        asset.change24hPercent >= 0 ? "success" : "error"
                      }
                      className="flex items-center gap-1"
                    >
                      {asset.change24hPercent >= 0 ? (
                        <RiArrowUpLine className="h-3 w-3" />
                      ) : (
                        <RiArrowDownLine className="h-3 w-3" />
                      )}
                      {Math.abs(asset.change24hPercent).toFixed(2)}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p
                        className={cx(
                          "text-2xl font-bold text-mono tabular-nums transition-all duration-300",
                          isPriceChanging(asset.symbol) === "up"
                            ? "price-up animate-count-up"
                            : isPriceChanging(asset.symbol) === "down"
                              ? "price-down animate-count-up"
                              : "text-stone-900 dark:text-stone-50",
                        )}
                      >
                        ${formatPrice(asset.price)}
                      </p>
                      <p
                        className={cx(
                          "text-sm text-mono tabular-nums",
                          asset.change24h >= 0
                            ? "price-up"
                            : "price-down",
                        )}
                      >
                        {asset.change24h >= 0 ? "+" : ""}$
                        {formatChange(Math.abs(asset.change24h))}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-stone-200 dark:border-stone-700 pt-3 mt-3">
                      <div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                          24h Volume
                        </p>
                        <p className="text-sm text-mono font-medium text-stone-900 dark:text-stone-50 tabular-nums">
                          {formatVolume(asset.volume24h)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                          24h Range
                        </p>
                        <p className="text-sm text-mono font-medium text-stone-900 dark:text-stone-50 tabular-nums">
                          ${formatPrice(asset.low24h)} - $
                          {formatPrice(asset.high24h)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live indicator */}
                  <div className="absolute right-3 top-3">
                    <div
                      className={cx(
                        "h-2 w-2 rounded-full transition-all duration-200",
                        isRecentlyUpdated(asset.symbol)
                          ? "bg-profit animate-data-pulse"
                          : "bg-stone-300 dark:bg-stone-600",
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
