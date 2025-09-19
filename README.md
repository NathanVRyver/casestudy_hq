# Real-Time Cryptocurrency Dashboard

Displays live crypto prices, market data, and trading information using Binance WebSocket API.

## Technical Implementation

### Architecture

- Next.js 14.2.23 with TypeScript and App Router
- NextAuth v5 beta for authentication with credentials provider
- Binance WebSocket API for real-time data (!ticker@arr stream)
- React Context pattern for centralized state management
- Tailwind CSS with custom design system

### Data Flow

1. Binance WebSocket streams live ticker data
2. Data stored immediately in refs for instant access
3. UI updates throttled to 60fps using requestAnimationFrame
4. Price direction calculated by comparing current vs previous prices
5. Components consume data through centralized CryptoContext

### Performance Optimizations

- WebSocket data cached in refs to avoid state update delays
- Throttled UI rendering to maintain smooth 60fps
- Price direction tracking without triggering unnecessary re-renders
- Minimal DOM updates through selective component re-rendering

### Authentication

Demo accounts available:

- admin@athenahq.com / admin123
- demo@athenahq.com / demo123

## Development

Install dependencies:

```bash
pnpm install
```

Start development server:

```bash
pnpm run dev
```

Build for production:

```bash
pnpm run build
```

## Environment Variables

Required for deployment/development:
can just generate the secret key using: openssl rand -base64 32

```
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=your-production-url
```

## Technical Decisions

### Why React Context for State Management

- Centralized data source for all components
- Eliminates prop drilling
- Single WebSocket connection shared across components

### Why Throttled Updates

- Prevents UI blocking from high-frequency WebSocket messages
- Maintains smooth 60fps performance
- Reduces unnecessary re-renders

### Why Refs for Immediate Data Storage

- WebSocket data available instantly without waiting for state updates
- Price direction calculations use most recent data
- Prevents stale closures in event handlers
