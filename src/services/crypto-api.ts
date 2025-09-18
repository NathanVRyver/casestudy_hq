import { CryptoAsset, Binance24hrTickerStream, SYMBOL_MAP, TimeFrame } from "@/types/crypto"

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
        parseFloat(ticker.volume) > 1000000
      )
      
      this.setCache(cacheKey, usdtPairs)
      return usdtPairs
    } catch (error) {
      console.error("Error fetching 24hr tickers:", error)
      return []
    }
  }

  async getKlines(symbol: string, interval: TimeFrame, limit = 100): Promise<number[][]> {
    const cacheKey = `klines_${symbol}_${interval}_${limit}`
    const cached = this.getCached<number[][]>(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(
        `${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      )
      if (!response.ok) throw new Error("Failed to fetch klines")
      
      const data = await response.json()
      const klines = data.map((k: any[]) => [
        k[0], // Open time
        parseFloat(k[1]), // Open
        parseFloat(k[2]), // High
        parseFloat(k[3]), // Low
        parseFloat(k[4]), // Close
        parseFloat(k[5]), // Volume
      ])
      
      this.setCache(cacheKey, klines)
      return klines
    } catch (error) {
      console.error("Error fetching klines:", error)
      return []
    }
  }

  async searchSymbols(query: string): Promise<CryptoAsset[]> {
    try {
      const tickers = await this.get24hrTickers()
      const searchTerm = query.toUpperCase()
      
      const filtered = tickers.filter((ticker: any) => {
        const symbol = ticker.symbol.replace("USDT", "")
        const name = SYMBOL_MAP[ticker.symbol] || symbol
        return symbol.includes(searchTerm) || name.toUpperCase().includes(searchTerm)
      })

      return this.transformTickersToAssets(filtered)
    } catch (error) {
      console.error("Error searching symbols:", error)
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