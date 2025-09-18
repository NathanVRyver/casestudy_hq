"use client"

import { useMemo } from "react"
import { CryptoAsset, MarketStats } from "@/types/crypto"
import { Card } from "@/components/Card"
import { ProgressBar } from "@/components/ProgressBar"
import { cx } from "@/lib/utils"
import { useCrypto } from "@/contexts/CryptoContext"
import {
  RiStockLine,
  RiExchangeDollarLine,
  RiLineChartLine,
  RiCoinLine,
  RiArrowUpLine,
  RiArrowDownLine
} from "@remixicon/react"

interface MarketOverviewProps {
  className?: string
}

export function MarketOverview({ className }: MarketOverviewProps) {
  const { cryptoAssets, marketStats, topGainers, topLosers, formatPrice } = useCrypto()

  const formatValue = (value: number, type: "currency" | "percent" | "number"): string => {
    switch (type) {
      case "currency":
        if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
        return `$${value.toFixed(2)}`
      case "percent":
        return `${value.toFixed(2)}%`
      case "number":
        return value.toLocaleString()
      default:
        return value.toString()
    }
  }

  const statCards = [
    {
      title: "Market Cap",
      value: formatValue(marketStats.totalMarketCap, "currency"),
      change: marketStats.marketChange24h,
      icon: RiStockLine,
      color: "indigo"
    },
    {
      title: "24h Volume",
      value: formatValue(marketStats.totalVolume24h, "currency"),
      change: 0,
      icon: RiExchangeDollarLine,
      color: "purple"
    },
    {
      title: "BTC Dominance",
      value: formatValue(marketStats.btcDominance, "percent"),
      change: 0,
      icon: RiLineChartLine,
      color: "orange"
    },
    {
      title: "Active Coins",
      value: marketStats.activeCoins.toString(),
      change: 0,
      icon: RiCoinLine,
      color: "green"
    }
  ]

  const topMovers = {
    gainers: topGainers.slice(0, 3),
    losers: topLosers.slice(0, 3)
  }

  return (
    <div className={cx("space-y-6", className)}>
      {/* Market Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
                    {stat.value}
                  </p>
                  {stat.change !== 0 && (
                    <div className={cx(
                      "mt-1 flex items-center gap-1 text-sm",
                      stat.change >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}>
                      {stat.change >= 0 ? (
                        <RiArrowUpLine className="h-3 w-3" />
                      ) : (
                        <RiArrowDownLine className="h-3 w-3" />
                      )}
                      {Math.abs(stat.change).toFixed(2)}%
                    </div>
                  )}
                </div>
                <div className={cx(
                  "rounded-lg p-2",
                  stat.color === "indigo" && "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
                  stat.color === "purple" && "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
                  stat.color === "orange" && "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
                  stat.color === "green" && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Top Movers */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Gainers */}
        <Card className="p-4">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
            <RiArrowUpLine className="h-5 w-5 text-green-600 dark:text-green-400" />
            Top Gainers
          </h3>
          <div className="space-y-3">
            {topMovers.gainers.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-50">
                      {asset.symbol}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {asset.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-50">
                    ${formatPrice(asset.price)}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    +{asset.change24hPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Losers */}
        <Card className="p-4">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
            <RiArrowDownLine className="h-5 w-5 text-red-600 dark:text-red-400" />
            Top Losers
          </h3>
          <div className="space-y-3">
            {topMovers.losers.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-50">
                      {asset.symbol}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {asset.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-50">
                    ${formatPrice(asset.price)}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {asset.change24hPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Market Sentiment */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
          Market Sentiment
        </h3>
        <div className="space-y-3">
          {(() => {
            const bullish = cryptoAssets.filter(a => a.change24hPercent > 0).length
            const bearish = cryptoAssets.filter(a => a.change24hPercent < 0).length
            const neutral = cryptoAssets.filter(a => a.change24hPercent === 0).length
            const total = cryptoAssets.length

            return (
              <>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">
                      Bullish ({bullish})
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {((bullish / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar value={(bullish / total) * 100} className="bg-green-600" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400">
                      Bearish ({bearish})
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {((bearish / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar value={(bearish / total) * 100} className="bg-red-600" />
                </div>
                {neutral > 0 && (
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Neutral ({neutral})
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {((neutral / total) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar value={(neutral / total) * 100} className="bg-gray-600" />
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </Card>
    </div>
  )
}