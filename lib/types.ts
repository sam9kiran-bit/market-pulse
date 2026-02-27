export interface WatchlistItem {
  symbol: string
  name: string
  type: "stock" | "mf"
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  previousClose: number
  open: number
  high: number
  low: number
  volume: number
}

export interface NewsArticle {
  title: string
  description: string | null
  url: string
  source: { name: string }
  publishedAt: string
}

export interface AIAnalysis {
  summary: string
  impacts: {
    asset: string
    sentiment: "bullish" | "bearish" | "neutral"
    reasoning: string
    citedHeadlines: string[]
  }[]
  generatedAt: string
}

export interface ApiKeys {
  gnewsApiKey: string
  alphaVantageKey: string
  geminiKey: string
}

export type TimePeriod = "1D" | "1W" | "1M" | "1Y" | "3Y"
