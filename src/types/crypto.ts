// Binance WebSocket API Types - Exact match with API responses

export interface Binance24hrTickerStream {
  e: string     // Event type: "24hrTicker"
  E: number     // Event time
  s: string     // Symbol
  p: string     // Price change
  P: string     // Price change percent
  w: string     // Weighted average price
  x: string     // First trade(F)-1 price (first trade before the 24hr rolling window)
  c: string     // Last price
  Q: string     // Last quantity
  b: string     // Best bid price
  B: string     // Best bid quantity
  a: string     // Best ask price
  A: string     // Best ask quantity
  o: string     // Open price
  h: string     // High price
  l: string     // Low price
  v: string     // Total traded base asset volume
  q: string     // Total traded quote asset volume
  O: number     // Statistics open time
  C: number     // Statistics close time
  F: number     // First trade ID
  L: number     // Last trade Id
  n: number     // Total number of trades
}

export interface BinanceMiniTickerStream {
  e: string     // Event type: "24hrMiniTicker"
  E: number     // Event time
  s: string     // Symbol
  c: string     // Close price
  o: string     // Open price
  h: string     // High price
  l: string     // Low price
  v: string     // Total traded base asset volume
  q: string     // Total traded quote asset volume
}

export interface BinanceKlineStream {
  e: string     // Event type: "kline"
  E: number     // Event time
  s: string     // Symbol
  k: {
    t: number   // Kline start time
    T: number   // Kline close time
    s: string   // Symbol
    i: string   // Interval
    f: number   // First trade ID
    L: number   // Last trade ID
    o: string   // Open price
    c: string   // Close price
    h: string   // High price
    l: string   // Low price
    v: string   // Base asset volume
    n: number   // Number of trades
    x: boolean  // Is this kline closed?
    q: string   // Quote asset volume
    V: string   // Taker buy base asset volume
    Q: string   // Taker buy quote asset volume
    B: string   // Ignore
  }
}

// Transformed data for UI display
export interface CryptoAsset {
  symbol: string
  name: string
  price: number
  change24h: number
  change24hPercent: number
  volume24h: number
  high24h: number
  low24h: number
  lastUpdate: number
  sparkline?: number[]
  rank?: number
}

export interface MarketStats {
  totalMarketCap: number
  totalVolume24h: number
  btcDominance: number
  marketChange24h: number
  activeCoins: number
}

export type TimeFrame = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w"
export type TabCategory = "trending" | "gainers" | "losers" | "volume" | "all"

// Symbol mapping for common cryptocurrencies
export const SYMBOL_MAP: Record<string, string> = {
  BTCUSDT: "Bitcoin",
  ETHUSDT: "Ethereum",
  BNBUSDT: "BNB",
  SOLUSDT: "Solana",
  XRPUSDT: "XRP",
  ADAUSDT: "Cardano",
  AVAXUSDT: "Avalanche",
  DOGEUSDT: "Dogecoin",
  DOTUSDT: "Polkadot",
  MATICUSDT: "Polygon",
  SHIBUSDT: "Shiba Inu",
  LTCUSDT: "Litecoin",
  LINKUSDT: "Chainlink",
  ATOMUSDT: "Cosmos",
  UNIUSDT: "Uniswap",
  XLMUSDT: "Stellar",
  NEARUSDT: "NEAR Protocol",
  ALGOUSDT: "Algorand",
  FILUSDT: "Filecoin",
  APTUSDT: "Aptos",
  ARBUSDT: "Arbitrum",
  OPUSDT: "Optimism",
}