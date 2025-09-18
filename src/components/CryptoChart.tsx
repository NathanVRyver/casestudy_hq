"use client"

import { Card } from "@/components/Card"
import { LineChart } from "@/components/LineChart"
import { cx } from "@/lib/utils"
import { cryptoAPI } from "@/services/crypto-api"
import { TimeFrame } from "@/types/crypto"
import { useCrypto } from "@/contexts/CryptoContext"
import { useEffect, useRef, useState } from "react"

interface CryptoChartProps {
  symbol: string
  name: string
  currentPrice: number
  change24hPercent: number
  className?: string
  height?: number
}

const timeFrames: { value: TimeFrame; label: string }[] = [
  { value: "15m", label: "15M" },
  { value: "1h", label: "1H" },
  { value: "4h", label: "4H" },
  { value: "1d", label: "1D" },
  { value: "1w", label: "1W" },
]

export function CryptoChart({
  symbol,
  name,
  currentPrice,
  change24hPercent,
  className,
  height = 300,
}: CryptoChartProps) {
  const { formatPrice, isPriceChanging } = useCrypto()
  const [chartData, setChartData] = useState<
    Array<{
      time: string
      price: number
      open: number
      high: number
      low: number
      volume: number
    }>
  >([])
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1h")
  const [isLoading, setIsLoading] = useState(true)
  const priceRef = useRef(currentPrice)

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true)
      try {
        const klines = await cryptoAPI.getKlines(`${symbol}USDT`, timeFrame, 50)

        const formattedData = klines.map((k, index) => ({
          time: new Date(k[0]).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: k[4], // Close price
          open: k[1],
          high: k[2],
          low: k[3],
          volume: k[5],
        }))

        // Add current price as the last point
        if (formattedData.length > 0) {
          formattedData.push({
            ...formattedData[formattedData.length - 1],
            time: "Now",
            price: currentPrice,
          })
        }

        setChartData(formattedData)
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [symbol, timeFrame, currentPrice])

  // Update chart when price changes in real-time
  useEffect(() => {
    if (chartData.length > 0 && currentPrice !== priceRef.current) {
      setChartData((prevData) => {
        const updatedData = [...prevData]
        updatedData[updatedData.length - 1] = {
          ...updatedData[updatedData.length - 1],
          price: currentPrice,
        }
        return updatedData
      })
      
      priceRef.current = currentPrice
    }
  }, [currentPrice])

  const formatChartPrice = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    if (value >= 1) return `$${value.toFixed(2)}`
    return `$${value.toFixed(4)}`
  }

  const chartColor = change24hPercent >= 0 ? "#10b981" : "#ef4444"

  return (
    <Card className={cx("p-4", className)}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1></h1>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {name} ({symbol})
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={cx(
                "text-2xl font-bold transition-colors duration-200",
                isPriceChanging(symbol) === 'up'
                  ? "text-green-600 dark:text-green-400"
                  : isPriceChanging(symbol) === 'down'
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-900 dark:text-gray-50",
              )}
            >
              ${formatPrice(currentPrice)}
            </span>
            <span
              className={cx(
                "text-sm font-medium",
                change24hPercent >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {change24hPercent >= 0 ? "+" : ""}
              {change24hPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
          {timeFrames.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeFrame(tf.value)}
              className={cx(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                timeFrame === tf.value
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-50"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
        </div>
      ) : (
        <LineChart
          data={chartData}
          index="time"
          categories={["price"]}
          colors={[chartColor]}
          valueFormatter={formatChartPrice}
          showLegend={false}
          showGridLines={true}
          showTooltip={true}
          showAnimation={true}
          curveType="monotone"
          className={`h-[${height}px]`}
        />
      )}
    </Card>
  )
}
