"use client"

import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { CryptoChart } from "@/components/CryptoChart"
import { CryptoTabs } from "@/components/CryptoTabs"
import { Dialog } from "@/components/Dialog"
import { MarketOverview } from "@/components/MarketOverview"
import { PriceTicker } from "@/components/PriceTicker"
import { Searchbar } from "@/components/Searchbar"
import { cx } from "@/lib/utils"
import { useCrypto } from "@/contexts/CryptoContext"
import { TabCategory, CryptoAsset } from "@/types/crypto"
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiDashboardLine,
  RiSearchLine,
  RiWifiLine,
  RiWifiOffLine,
} from "@remixicon/react"
import { useState, useMemo } from "react"

export default function DashboardPage() {
  const {
    topAssets,
    isLoading,
    isConnected,
    searchQuery,
    setSearchQuery,
    filteredAssets,
    formatPrice,
    formatVolume,
    isPriceChanging,
    isRecentlyUpdated,
  } = useCrypto()
  
  const [activeTab, setActiveTab] = useState<TabCategory>("trending")
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null)
  const [showOverview, setShowOverview] = useState(false)

  const tabs = [
    { value: "trending" as TabCategory, label: "Trending" },
    { value: "gainers" as TabCategory, label: "Top Gainers" },
    { value: "losers" as TabCategory, label: "Top Losers" },
    { value: "volume" as TabCategory, label: "High Volume" },
    { value: "all" as TabCategory, label: "All Coins" },
  ]

  // Get the right assets based on active tab, maintaining stable positions
  const displayedAssets = useMemo(() => {
    if (searchQuery) return filteredAssets
    // Always show the same top 50 assets regardless of tab for stable positioning
    return topAssets
  }, [topAssets, filteredAssets, searchQuery])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                AthenaCrypto
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowOverview(!showOverview)}
                className={cx(
                  "rounded-lg p-2 transition-colors",
                  showOverview
                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300",
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
        <div className="border-b border-gray-200 bg-white py-2 dark:border-gray-800 dark:bg-gray-900">
          <PriceTicker assets={topAssets.slice(0, 20)} />
        </div>
      )}

      {/* Search and Tabs */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
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
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Loading crypto data...
              </p>
            </div>
          </div>
        ) : displayedAssets.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <RiSearchLine className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                No cryptocurrencies found
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedAssets.map((asset) => (
              <Card
                key={asset.symbol}
                className="group relative cursor-pointer overflow-hidden transition-all hover:shadow-lg"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                        {asset.symbol}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
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
                          "text-2xl font-bold transition-colors duration-200",
                          isPriceChanging(asset.symbol) === "up"
                            ? "text-green-600 dark:text-green-400"
                            : isPriceChanging(asset.symbol) === "down"
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-900 dark:text-gray-50",
                        )}
                      >
                        ${formatPrice(asset.price)}
                      </p>
                      <p
                        className={cx(
                          "text-sm",
                          asset.change24h >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {asset.change24h >= 0 ? "+" : ""}$
                        {Math.abs(asset.change24h).toFixed(2)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          24h Volume
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          {formatVolume(asset.volume24h)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          24h Range
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          ${formatPrice(asset.low24h)} - $
                          {formatPrice(asset.high24h)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live indicator */}
                  <div className="absolute right-2 top-2">
                    <div
                      className={cx(
                        "h-2 w-2 rounded-full",
                        isRecentlyUpdated(asset.symbol)
                          ? "bg-green-500"
                          : "bg-gray-300 dark:bg-gray-600",
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Chart Dialog */}
      <Dialog
        open={!!selectedAsset}
        onOpenChange={(open) => !open && setSelectedAsset(null)}
      >
        {selectedAsset && (
          <div className="p-6">
            <CryptoChart
              symbol={selectedAsset.symbol}
              name={selectedAsset.name}
              currentPrice={selectedAsset.price}
              change24hPercent={selectedAsset.change24hPercent}
              height={400}
            />
          </div>
        )}
      </Dialog>
    </div>
  )
}
