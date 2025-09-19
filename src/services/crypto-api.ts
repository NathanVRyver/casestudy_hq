import {
  Binance24hrTickerStream,
  CryptoAsset,
  SYMBOL_MAP,
} from "@/types/crypto"

const API_ENDPOINTS = [
  "https://api.binance.us/api/v3", // US first (works in US)
  "https://api.binance.com/api/v3", // International (more coins if accessible)
  "https://api1.binance.com/api/v3", // Alternative international endpoint
  "https://api2.binance.com/api/v3", // Another alternative
]

const globalCache: Map<string, { data: any; timestamp: number }> = new Map()

export class CryptoAPIService {
  private cache = globalCache
  private cacheTimeout = 60000
  private currentEndpointIndex = 0

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T
    }
    return null
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async get24hrTickers(): Promise<Binance24hrTickerStream[]> {
    const cacheKey = "24hrTickers"
    const cached = this.getCached<Binance24hrTickerStream[]>(cacheKey)
    if (cached && cached.length > 0) {
      console.log(`Using cached data with ${cached.length} pairs`)
      return cached
    }

    // Try to fetch from multiple endpoints and merge results for best coverage
    let allTickers: Map<string, any> = new Map()
    let successfulFetch = false
    let lastSuccessfulEndpoint = ""

    for (let i = 0; i < API_ENDPOINTS.length; i++) {
      const endpointIndex =
        (this.currentEndpointIndex + i) % API_ENDPOINTS.length
      const endpoint = API_ENDPOINTS[endpointIndex]

      try {
        console.log(`Attempting to fetch from ${endpoint}`)
        const response = await fetch(`${endpoint}/ticker/24hr`, {
          signal: AbortSignal.timeout(5000), // 5 second timeout
        })

        if (!response.ok) {
          console.warn(
            `Failed to fetch from ${endpoint}, status: ${response.status}`,
          )
          continue
        }

        const data = await response.json()

        // Add all USDT pairs to our map (deduplicates automatically)
        data.forEach((ticker: any) => {
          if (ticker.symbol.endsWith("USDT")) {
            const volume = parseFloat(
              ticker.quoteVolume || ticker.volume || "0",
            )
            // Very low threshold to include all coins, we'll filter client-side if needed
            if (volume > 100) {
              allTickers.set(ticker.symbol, ticker)
            }
          }
        })

        successfulFetch = true
        lastSuccessfulEndpoint = endpoint
        this.currentEndpointIndex = endpointIndex
        console.log(
          `Successfully fetched ${data.length} pairs from ${endpoint}, filtered to ${allTickers.size} USDT pairs`,
        )

        // If we got a good amount of data from Binance.com, use it
        // Otherwise continue to try more endpoints to get better coverage
        if (
          allTickers.size > 200 &&
          endpoint.includes("binance.com") &&
          !endpoint.includes("binance.us")
        ) {
          break
        }
        // If we're on Binance.US and got data, that's good enough for US users
        if (allTickers.size > 100 && endpoint.includes("binance.us")) {
          break
        }
      } catch (error: any) {
        console.error(
          `Error fetching from ${endpoint}:`,
          error.message || error,
        )
      }
    }

    if (!successfulFetch || allTickers.size === 0) {
      console.error("Failed to fetch from all endpoints, returning empty array")
      // Don't cache empty results
      return []
    }

    const usdtPairs = Array.from(allTickers.values())
    console.log(
      `Total unique pairs collected: ${usdtPairs.length} from ${lastSuccessfulEndpoint}`,
    )

    // Only cache if we got meaningful data
    if (usdtPairs.length > 0) {
      this.setCache(cacheKey, usdtPairs)
    }

    return usdtPairs
  }

  transformTickersToAssets(tickers: any[]): CryptoAsset[] {
    return tickers.map((ticker, index) => ({
      symbol: ticker.symbol.replace("USDT", ""),
      name: SYMBOL_MAP[ticker.symbol] || ticker.symbol.replace("USDT", ""),
      price: parseFloat(ticker.lastPrice || ticker.c || "0"),
      change24h: parseFloat(ticker.priceChange || ticker.p || "0"),
      change24hPercent: parseFloat(
        ticker.priceChangePercent || ticker.P || "0",
      ),
      volume24h:
        parseFloat(ticker.volume || ticker.v || "0") *
        parseFloat(ticker.lastPrice || ticker.c || "0"),
      high24h: parseFloat(ticker.highPrice || ticker.h || "0"),
      low24h: parseFloat(ticker.lowPrice || ticker.l || "0"),
      lastUpdate: Date.now(),
      rank: index + 1,
    }))
  }

  getTopGainers(assets: CryptoAsset[], limit = 10): CryptoAsset[] {
    return [...assets]
      .sort((a, b) => b.change24hPercent - a.change24hPercent)
      .slice(0, limit)
  }

  getTopLosers(assets: CryptoAsset[], limit = 10): CryptoAsset[] {
    return [...assets]
      .sort((a, b) => a.change24hPercent - b.change24hPercent)
      .slice(0, limit)
  }

  getTopVolume(assets: CryptoAsset[], limit = 10): CryptoAsset[] {
    return [...assets].sort((a, b) => b.volume24h - a.volume24h).slice(0, limit)
  }

  getTrending(assets: CryptoAsset[], limit = 10): CryptoAsset[] {
    // Trending logic: combination of volume and positive price change
    return [...assets]
      .filter((a) => a.change24hPercent > 0)
      .sort((a, b) => {
        const scoreA = a.volume24h * (1 + a.change24hPercent / 100)
        const scoreB = b.volume24h * (1 + b.change24hPercent / 100)
        return scoreB - scoreA
      })
      .slice(0, limit)
  }
}

export const cryptoAPI = new CryptoAPIService()
