import { CryptoAsset, Binance24hrTickerStream, SYMBOL_MAP } from "@/types/crypto"

const BINANCE_API_BASE = "https://api.binance.com/api/v3"

export class CryptoAPIService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 60000 // 1 minute cache

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
    if (cached) return cached

    try {
      const response = await fetch(`${BINANCE_API_BASE}/ticker/24hr`)
      if (!response.ok) throw new Error("Failed to fetch tickers")
      
      const data = await response.json()
      const usdtPairs = data.filter((ticker: any) => 
        ticker.symbol.endsWith("USDT") && 
        parseFloat(ticker.quoteVolume) > 100000 // Use quote volume (USDT) instead of base volume
      )
      
      this.setCache(cacheKey, usdtPairs)
      return usdtPairs
    } catch (error) {
      console.error("Error fetching 24hr tickers:", error)
      return []
    }
  }


  transformTickersToAssets(tickers: any[]): CryptoAsset[] {
    return tickers.map((ticker, index) => ({
      symbol: ticker.symbol.replace("USDT", ""),
      name: SYMBOL_MAP[ticker.symbol] || ticker.symbol.replace("USDT", ""),
      price: parseFloat(ticker.lastPrice || ticker.c || "0"),
      change24h: parseFloat(ticker.priceChange || ticker.p || "0"),
      change24hPercent: parseFloat(ticker.priceChangePercent || ticker.P || "0"),
      volume24h: parseFloat(ticker.volume || ticker.v || "0") * parseFloat(ticker.lastPrice || ticker.c || "0"),
      high24h: parseFloat(ticker.highPrice || ticker.h || "0"),
      low24h: parseFloat(ticker.lowPrice || ticker.l || "0"),
      lastUpdate: Date.now(),
      rank: index + 1
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
    return [...assets]
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, limit)
  }

  getTrending(assets: CryptoAsset[], limit = 10): CryptoAsset[] {
    // Trending logic: combination of volume and positive price change
    return [...assets]
      .filter(a => a.change24hPercent > 0)
      .sort((a, b) => {
        const scoreA = a.volume24h * (1 + a.change24hPercent / 100)
        const scoreB = b.volume24h * (1 + b.change24hPercent / 100)
        return scoreB - scoreA
      })
      .slice(0, limit)
  }
}

export const cryptoAPI = new CryptoAPIService()