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
    'wss://stream.binance.com:9443',
    'wss://stream.binance.us:9443',
    'wss://stream.binance.com:443',
    'wss://data-stream.binance.com:9443'
  ]

  connect(streams: string[]) {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      console.log("WebSocket already connected or connecting")
      return
    }

    this.streams = streams
    this.isConnecting = true

    const baseUrl = this.endpoints[this.currentEndpointIndex]
    const streamUrl =
      streams.length === 1
        ? `${baseUrl}/ws/${streams[0]}`
        : `${baseUrl}/stream?streams=${streams.join("/")}`

    try {
      this.ws = new WebSocket(streamUrl)

      this.ws.onopen = () => {
        console.log(`WebSocket connected to ${this.endpoints[this.currentEndpointIndex]}`)
        this.isConnecting = false
        this.reconnectAttempts = 0
        if (this.currentEndpointIndex !== 0) {
          console.log("Successfully connected to fallback endpoint")
        }
        this.connectionHandlers.forEach((handler) => handler())
        this.setupPing()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.messageHandlers.forEach((handler) => handler(data))
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.error(`WebSocket error on ${this.endpoints[this.currentEndpointIndex]}:`, error)
        this.errorHandlers.forEach((handler) => handler(error))
      }

      this.ws.onclose = () => {
        console.log(`WebSocket disconnected from ${this.endpoints[this.currentEndpointIndex]}`)
        this.isConnecting = false
        this.cleanup()
        this.disconnectionHandlers.forEach((handler) => handler())
        
        if (this.reconnectAttempts === 0 && this.currentEndpointIndex < this.endpoints.length - 1) {
          this.currentEndpointIndex++
          console.log(`Trying next endpoint: ${this.endpoints[this.currentEndpointIndex]}`)
          this.connect(this.streams)
        } else {
          this.scheduleReconnect()
        }
      }
    } catch (error) {
      console.error("Error creating WebSocket:", error)
      this.isConnecting = false
      this.scheduleReconnect()
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
