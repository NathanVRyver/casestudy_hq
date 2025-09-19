type MessageHandler = (data: any) => void
type ConnectionHandler = () => void
type ErrorHandler = (error: Event) => void

class BinanceWebSocketService {
  private ws: WebSocket | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private messageHandlers: Set<MessageHandler> = new Set()
  private connectionHandlers: Set<ConnectionHandler> = new Set()
  private disconnectionHandlers: Set<ConnectionHandler> = new Set()
  private errorHandlers: Set<ErrorHandler> = new Set()
  private streams: string[] = []
  private isConnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private currentEndpointIndex = 0
  private endpoints = [
    'wss://stream.binance.us:9443',       // US streaming WebSocket for market data
    'wss://stream.binance.com:9443',      // International (more coins if accessible)
    'wss://stream.binance.com:443',       // Alternative port for international
    'wss://data-stream.binance.com:9443', // Alternative domain
  ]

  connect(streams: string[]) {
    // Check if actually connected (not just existing)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected")
      return
    }
    
    // Clean up any stale WebSocket
    if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
      console.log("Cleaning up stale WebSocket")
      this.ws.close()
      this.ws = null
      this.isConnecting = false
    }
    
    // If connecting, skip
    if (this.isConnecting) {
      console.log("WebSocket connection already in progress")
      return
    }

    this.streams = streams
    this.isConnecting = true
    console.log(`Starting WebSocket connection to ${this.endpoints[this.currentEndpointIndex]}`)

    const baseUrl = this.endpoints[this.currentEndpointIndex]
    const streamUrl =
      streams.length === 1
        ? `${baseUrl}/ws/${streams[0]}`
        : `${baseUrl}/stream?streams=${streams.join("/")}`
    
    console.log(`Connecting to: ${streamUrl}`)

    try {
      this.ws = new WebSocket(streamUrl)
      
      // Add a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.error('WebSocket connection timeout - closing')
          this.ws.close()
        }
      }, 10000) // 10 second timeout

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout)
        console.log(`WebSocket connected to ${this.endpoints[this.currentEndpointIndex]}`)
        this.isConnecting = false
        this.reconnectAttempts = 0
        
        if (this.currentEndpointIndex === 0) {
          console.log("Connected to Binance.US WebSocket")
        } else if (this.currentEndpointIndex === 1) {
          console.log("Connected to Binance.com WebSocket (International)")
        }
        
        this.connectionHandlers.forEach((handler) => handler())
        this.setupPing()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Only log for key coins to avoid console spam
          if (data && !data.result && data.s && ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'].includes(data.s)) {
            console.log(`Received ${data.e} event for ${data.s}`)
          }
          
          this.messageHandlers.forEach((handler) => handler(data))
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.error(`WebSocket error on ${this.endpoints[this.currentEndpointIndex]}:`, error)
        // Log the actual WebSocket URL for debugging
        if (this.ws) {
          console.error(`Failed URL: ${this.ws.url}, ReadyState: ${this.ws.readyState}`)
        }
        this.errorHandlers.forEach((handler) => handler(error))
      }

      this.ws.onclose = () => {
        console.log(`WebSocket disconnected from ${this.endpoints[this.currentEndpointIndex]}`)
        this.isConnecting = false
        
        // Try next endpoint if we haven't exhausted all options
        if (this.currentEndpointIndex < this.endpoints.length - 1 && this.reconnectAttempts === 0) {
          this.currentEndpointIndex++
          console.log(`Trying next endpoint: ${this.endpoints[this.currentEndpointIndex]}`)
          // Try next endpoint immediately
          this.connect(this.streams)
        } else {
          // All endpoints tried or this is a reconnect - cleanup and schedule reconnect
          this.cleanup()
          this.disconnectionHandlers.forEach((handler) => handler())
          
          // Reset to first endpoint for next reconnect cycle
          if (this.reconnectAttempts === 0) {
            this.currentEndpointIndex = 0
          }
          
          this.scheduleReconnect()
        }
      }
    } catch (error) {
      console.error("Error creating WebSocket:", error)
      this.isConnecting = false
      
      // Try next endpoint if available
      if (this.currentEndpointIndex < this.endpoints.length - 1) {
        this.currentEndpointIndex++
        console.log(`Error with ${this.endpoints[this.currentEndpointIndex - 1]}, trying ${this.endpoints[this.currentEndpointIndex]}`)
        this.connect(this.streams)
      } else {
        this.scheduleReconnect()
      }
    }
  }

  private setupPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: "ping" }))
      }
    }, 30000) // Send ping every 30 seconds
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached")
      this.currentEndpointIndex = 0
      return
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000,
    )

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
      if (this.reconnectAttempts === 1) {
        this.currentEndpointIndex = 0
      }
      this.connect(this.streams)
    }, delay)
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  disconnect() {
    this.cleanup()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.isConnecting = false // IMPORTANT: Reset connecting flag
    this.currentEndpointIndex = 0 // Start fresh next time
    this.reconnectAttempts = 0 // Reset attempts
    this.messageHandlers.clear()
    this.connectionHandlers.clear()
    this.disconnectionHandlers.clear()
    this.errorHandlers.clear()
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  onConnect(handler: ConnectionHandler) {
    this.connectionHandlers.add(handler)
    return () => this.connectionHandlers.delete(handler)
  }

  onDisconnect(handler: ConnectionHandler) {
    this.disconnectionHandlers.add(handler)
    return () => this.disconnectionHandlers.delete(handler)
  }

  onError(handler: ErrorHandler) {
    this.errorHandlers.add(handler)
    return () => this.errorHandlers.delete(handler)
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  subscribe(stream: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected")
      return
    }

    const message = {
      method: "SUBSCRIBE",
      params: [stream],
      id: Date.now(),
    }

    this.ws.send(JSON.stringify(message))
  }

  unsubscribe(stream: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected")
      return
    }

    const message = {
      method: "UNSUBSCRIBE",
      params: [stream],
      id: Date.now(),
    }

    this.ws.send(JSON.stringify(message))
  }
}

export const binanceWS = new BinanceWebSocketService()
