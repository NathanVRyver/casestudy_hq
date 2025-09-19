"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from "react"
import { CryptoAsset, Binance24hrTickerStream, MarketStats } from "@/types/crypto"
import { cryptoAPI } from "@/services/crypto-api"
import { binanceWS } from "@/services/websocket"

interface PriceDirection {
  direction: 'up' | 'down' | 'none'
  timestamp: number
  intensity: number // 0-1 for animation intensity
}


interface CryptoContextType {
  // Core data
  cryptoAssets: CryptoAsset[]
  isLoading: boolean
  isConnected: boolean
  
  // Price direction tracking
  priceDirections: Record<string, PriceDirection>
  
  // Market stats
  marketStats: MarketStats
  
  // Filtered/processed data
  topAssets: CryptoAsset[]
  topGainers: CryptoAsset[]
  topLosers: CryptoAsset[]
  highVolume: CryptoAsset[]
  trending: CryptoAsset[]
  
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredAssets: CryptoAsset[]
  
  // Utils
  formatPrice: (price: number) => string
  formatVolume: (volume: number) => string
  formatChange: (change: number) => string
  getPriceDirection: (symbol: string) => PriceDirection
  isRecentlyUpdated: (symbol: string) => boolean
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined)

export function useCrypto() {
  const context = useContext(CryptoContext)
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider')
  }
  return context
}

interface CryptoProviderProps {
  children: ReactNode
}

export function CryptoProvider({ children }: CryptoProviderProps) {
  // UI State - throttled updates for smooth rendering
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [priceDirections, setPriceDirections] = useState<Record<string, PriceDirection>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredAssets, setFilteredAssets] = useState<CryptoAsset[]>([])

  // Refs for immediate data storage (WebSocket → ref/store)
  const liveDataRef = useRef<Map<string, CryptoAsset>>(new Map())
  const priceDirectionsRef = useRef<Map<string, PriceDirection>>(new Map())
  const updateQueueRef = useRef<Set<string>>(new Set())
  const animationFrameRef = useRef<number>()

  // Throttled UI update using requestAnimationFrame
  const scheduleUIUpdate = useCallback(() => {
    if (animationFrameRef.current) return // Already scheduled
    
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = undefined
      
      // Update crypto assets from live data
      const assetsToUpdate = Array.from(updateQueueRef.current)
      if (assetsToUpdate.length > 0) {
        setCryptoAssets(prevAssets => {
          const updated = [...prevAssets]
          
          assetsToUpdate.forEach(symbol => {
            const liveAsset = liveDataRef.current.get(symbol)
            if (liveAsset) {
              const index = updated.findIndex(a => a.symbol === symbol)
              if (index !== -1) {
                updated[index] = liveAsset
              }
            }
          })
          
          return updated
        })
        
        // Update price directions for UI
        setPriceDirections(prev => {
          const newDirections = { ...prev }
          assetsToUpdate.forEach(symbol => {
            const direction = priceDirectionsRef.current.get(symbol)
            if (direction) {
              newDirections[symbol] = direction
            }
          })
          return newDirections
        })
        
        updateQueueRef.current.clear()
      }
    })
  }, [])

  // Handle ticker updates from WebSocket (immediate storage)
  const handleTickerUpdate = useCallback((ticker: Binance24hrTickerStream) => {
    const symbol = ticker.s.replace('USDT', '')
    const currentAsset = liveDataRef.current.get(symbol)
    
    if (currentAsset) {
      const oldPrice = currentAsset.price
      const newPrice = parseFloat(ticker.c)
      
      // Update live data immediately
      const updatedAsset: CryptoAsset = {
        ...currentAsset,
        price: newPrice,
        change24h: parseFloat(ticker.p),
        change24hPercent: parseFloat(ticker.P),
        volume24h: parseFloat(ticker.v) * parseFloat(ticker.c),
        high24h: parseFloat(ticker.h),
        low24h: parseFloat(ticker.l),
        lastUpdate: Date.now()
      }
      
      liveDataRef.current.set(symbol, updatedAsset)
      
      // Track price direction with intensity based on change magnitude
      if (oldPrice !== newPrice) {
        const direction = newPrice > oldPrice ? 'up' : 'down'
        const changePercent = Math.abs((newPrice - oldPrice) / oldPrice)
        const intensity = Math.min(changePercent * 100, 1) // Cap at 1
        
        const priceDirection: PriceDirection = {
          direction,
          timestamp: Date.now(),
          intensity
        }
        
        priceDirectionsRef.current.set(symbol, priceDirection)
        
        // Auto-reset direction after 3 seconds
        setTimeout(() => {
          const currentDirection = priceDirectionsRef.current.get(symbol)
          if (currentDirection && currentDirection.timestamp === priceDirection.timestamp) {
            priceDirectionsRef.current.set(symbol, {
              ...currentDirection,
              direction: 'none'
            })
            updateQueueRef.current.add(symbol)
            scheduleUIUpdate()
          }
        }, 3000)
      }
      
      // Queue for UI update
      updateQueueRef.current.add(symbol)
      scheduleUIUpdate()
    }
  }, [scheduleUIUpdate])

  // Initialize data and WebSocket
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      try {
        const tickers = await cryptoAPI.get24hrTickers()
        const assets = cryptoAPI.transformTickersToAssets(tickers)
        
        // Populate refs with initial data
        liveDataRef.current.clear()
        priceDirectionsRef.current.clear()
        
        assets.forEach(asset => {
          liveDataRef.current.set(asset.symbol, asset)
          priceDirectionsRef.current.set(asset.symbol, {
            direction: 'none',
            timestamp: Date.now(),
            intensity: 0
          })
        })
        
        setCryptoAssets(assets)
        setFilteredAssets(assets)
        
        // Connect to WebSocket
        binanceWS.connect(["!ticker@arr"])
      } catch (error) {
        console.error("Error initializing crypto data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()

    // WebSocket event handlers
    const unsubscribeMessage = binanceWS.onMessage((data) => {
      if (Array.isArray(data)) {
        data.forEach((ticker: any) => {
          if (ticker.e === "24hrTicker" || ticker.e === "24hrMiniTicker") {
            handleTickerUpdate(ticker as Binance24hrTickerStream)
          }
        })
      } else if (data.e === "24hrTicker" || data.e === "24hrMiniTicker") {
        handleTickerUpdate(data as Binance24hrTickerStream)
      }
    })

    const unsubscribeConnect = binanceWS.onConnect(() => setIsConnected(true))
    const unsubscribeDisconnect = binanceWS.onDisconnect(() => setIsConnected(false))

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      unsubscribeMessage()
      unsubscribeConnect()
      unsubscribeDisconnect()
      binanceWS.disconnect()
    }
  }, [handleTickerUpdate])

  // Handle search
  useEffect(() => {
    const searchAssets = () => {
      if (!searchQuery.trim()) {
        setFilteredAssets(cryptoAssets)
        return
      }

      const searchTerm = searchQuery.toUpperCase()
      
      const exactMatches = cryptoAssets.filter(asset => 
        asset.symbol === searchTerm
      )
      
      const partialMatches = cryptoAssets.filter(asset => 
        asset.symbol !== searchTerm && (
          asset.symbol.includes(searchTerm) || 
          asset.name.toUpperCase().includes(searchTerm)
        )
      )
      
      const results = [...exactMatches, ...partialMatches]
      setFilteredAssets(results)
    }

    const timeoutId = setTimeout(searchAssets, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, cryptoAssets])

  // Compute derived data
  const topAssets = cryptoAssets.slice(0, 50)
  const topGainers = cryptoAPI.getTopGainers(cryptoAssets, 20)
  const topLosers = cryptoAPI.getTopLosers(cryptoAssets, 20)
  const highVolume = cryptoAPI.getTopVolume(cryptoAssets, 20)
  const trending = cryptoAPI.getTrending(cryptoAssets, 20)

  // Market statistics
  const marketStats: MarketStats = {
    totalMarketCap: cryptoAssets.slice(0, 20).reduce((sum, asset) => sum + (asset.price * asset.volume24h / asset.price), 0) * 1000,
    totalVolume24h: cryptoAssets.reduce((sum, asset) => sum + asset.volume24h, 0),
    btcDominance: (() => {
      const btc = cryptoAssets.find(a => a.symbol === "BTC")
      const totalMcap = cryptoAssets.slice(0, 20).reduce((sum, asset) => sum + (asset.price * asset.volume24h / asset.price), 0) * 1000
      return btc && totalMcap > 0 ? (btc.price * 19000000 / totalMcap) * 100 : 0
    })(),
    marketChange24h: cryptoAssets.reduce((sum, asset) => sum + asset.change24hPercent, 0) / cryptoAssets.length,
    activeCoins: cryptoAssets.length
  }

  // Utility functions - max precision for crypto
  const formatPrice = (price: number): string => {
    // For very small numbers, show up to 8 decimal places
    if (price < 0.00001) return price.toFixed(8)
    if (price < 0.0001) return price.toFixed(6)
    if (price < 0.01) return price.toFixed(5)
    if (price < 1) return price.toFixed(4)
    if (price < 100) return price.toFixed(3)
    if (price < 10000) return price.toFixed(2)
    return price.toFixed(2)
  }
  
  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(3)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(3)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(3)}K`
    // For small volumes, show actual value with proper decimals
    if (volume < 1) return `$${volume.toFixed(4)}`
    if (volume < 100) return `$${volume.toFixed(2)}`
    return `$${volume.toFixed(2)}`
  }

  const getPriceDirection = (symbol: string): PriceDirection => {
    const direction = priceDirections[symbol]
    if (!direction) {
      return { direction: 'none', timestamp: Date.now(), intensity: 0 }
    }
    return direction
  }

  const isRecentlyUpdated = (symbol: string): boolean => {
    const asset = cryptoAssets.find(a => a.symbol === symbol)
    if (!asset) return false
    return Date.now() - asset.lastUpdate < 3000
  }
  
  const formatChange = (change: number): string => {
    // Format price changes with appropriate precision
    if (Math.abs(change) < 0.00001) return change.toFixed(8)
    if (Math.abs(change) < 0.0001) return change.toFixed(6)
    if (Math.abs(change) < 0.01) return change.toFixed(5)
    if (Math.abs(change) < 1) return change.toFixed(4)
    if (Math.abs(change) < 100) return change.toFixed(3)
    return change.toFixed(2)
  }

  const contextValue: CryptoContextType = {
    // Core data
    cryptoAssets,
    isLoading,
    isConnected,
    
    // Price direction tracking
    priceDirections,
    
    // Market stats
    marketStats,
    
    // Filtered/processed data
    topAssets,
    topGainers,
    topLosers,
    highVolume,
    trending,
    
    // Search
    searchQuery,
    setSearchQuery,
    filteredAssets,
    
    // Utils
    formatPrice,
    formatVolume,
    formatChange,
    getPriceDirection,
    isRecentlyUpdated,
  }

  return (
    <CryptoContext.Provider value={contextValue}>
      {children}
    </CryptoContext.Provider>
  )
}