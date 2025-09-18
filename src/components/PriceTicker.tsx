"use client"

import { CryptoAsset } from "@/types/crypto"
import { cx } from "@/lib/utils"
import { RiArrowUpLine, RiArrowDownLine } from "@remixicon/react"
import { useCrypto } from "@/contexts/CryptoContext"

interface PriceTickerProps {
  assets: CryptoAsset[]
  className?: string
}

export function PriceTicker({ assets, className }: PriceTickerProps) {
  const { formatPrice, isPriceChanging } = useCrypto()

  return (
    <div className={cx("overflow-hidden", className)}>
      <div className="animate-scroll flex gap-6 whitespace-nowrap">
        {assets.concat(assets).map((asset, index) => (
          <div
            key={`${asset.symbol}-${index}`}
            className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-50">
                {asset.symbol}
              </span>
              <span className={cx(
                "transition-all duration-200 font-medium",
                isPriceChanging(asset.symbol) === 'up'
                  ? "text-green-600 dark:text-green-400"
                  : isPriceChanging(asset.symbol) === 'down'
                  ? "text-red-600 dark:text-red-400"
                  : asset.change24hPercent >= 0 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
              )}>
                ${formatPrice(asset.price)}
              </span>
            </div>
            
            <div className={cx(
              "flex items-center gap-1 text-sm",
              asset.change24hPercent >= 0 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            )}>
              {asset.change24hPercent >= 0 ? (
                <RiArrowUpLine className="h-3 w-3" />
              ) : (
                <RiArrowDownLine className="h-3 w-3" />
              )}
              {Math.abs(asset.change24hPercent).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}