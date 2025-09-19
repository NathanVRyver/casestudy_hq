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
            className="flex items-center gap-3 rounded-lg bg-stone-100 border border-stone-200 px-4 py-2 transition-all duration-200 hover:bg-stone-150 dark:bg-stone-800 dark:border-stone-700 dark:hover:bg-stone-750"
          >
            <div className="flex items-center gap-3">
              <span className="text-display font-semibold text-stone-900 dark:text-stone-50 text-sm tracking-tight">
                {asset.symbol}
              </span>
              <span className={cx(
                "transition-all duration-300 text-mono font-semibold tabular-nums",
                isPriceChanging(asset.symbol) === 'up'
                  ? "price-up animate-count-up"
                  : isPriceChanging(asset.symbol) === 'down'
                  ? "price-down animate-count-up"
                  : asset.change24hPercent >= 0 
                    ? "price-up" 
                    : "price-down"
              )}>
                ${formatPrice(asset.price)}
              </span>
            </div>
            
            <div className={cx(
              "flex items-center gap-1 text-sm text-mono tabular-nums font-medium",
              asset.change24hPercent >= 0 
                ? "price-up" 
                : "price-down"
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
          animation: scroll 40s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        
        .animate-scroll > div {
          transition: all 0.2s ease;
        }
        
        .animate-scroll > div:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}