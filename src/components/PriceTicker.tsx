"use client"

import { useCrypto } from "@/contexts/CryptoContext"
import { cx } from "@/lib/utils"
import { CryptoAsset } from "@/types/crypto"
import { RiArrowDownLine, RiArrowUpLine } from "@remixicon/react"

interface PriceTickerProps {
  assets: CryptoAsset[]
  className?: string
}

export function PriceTicker({ assets, className }: PriceTickerProps) {
  const { formatPrice, getPriceDirection } = useCrypto()

  return (
    <div className={cx("overflow-hidden", className)}>
      <div className="animate-scroll flex gap-6 whitespace-nowrap">
        {assets.concat(assets).map((asset, index) => (
          <div
            key={`${asset.symbol}-${index}`}
            className="hover:bg-stone-150 dark:hover:bg-stone-750 flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-100 px-4 py-2 transition-all duration-200 dark:border-stone-700 dark:bg-stone-800"
          >
            <div className="flex items-center gap-3">
              <span className="text-mono text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                {asset.symbol}
              </span>
              <span
                className={cx(
                  "text-mono font-semibold tabular-nums price-direction",
                  getPriceDirection(asset.symbol).direction === 'up' && "price-direction-up",
                  getPriceDirection(asset.symbol).direction === 'down' && "price-direction-down",
                  getPriceDirection(asset.symbol).direction === 'none' && "price-direction-none",
                  asset.change24hPercent >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                ${formatPrice(asset.price)}
              </span>
            </div>

            <div
              className={cx(
                "text-mono flex items-center gap-1 font-medium tabular-nums",
                asset.change24hPercent >= 0 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400",
              )}
            >
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
          animation: scroll 40s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }

        .animate-scroll > div {
          transition: all 0.2s ease;
        }

        .animate-scroll > div:hover {
          background-color: rgba(120, 113, 108, 0.1);
        }
      `}</style>
    </div>
  )
}
