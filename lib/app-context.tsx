"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { fetchNewsServer, fetchGeminiServer } from "./actions"
import type { WatchlistItem, StockQuote, NewsArticle, AIAnalysis, ApiKeys, TimePeriod } from "./types"

interface AppState {
  apiKeys: ApiKeys
  setApiKeys: (keys: ApiKeys) => void
  watchlist: WatchlistItem[]
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (symbol: string) => void
  quotes: Map<string, StockQuote>
  news: NewsArticle[]
  aiAnalysis: AIAnalysis | null
  isLoadingQuotes: boolean
  isLoadingNews: boolean
  isLoadingAI: boolean
  selectedPeriod: TimePeriod
  setSelectedPeriod: (p: TimePeriod) => void
  fetchAllData: () => Promise<void>
  fetchAIAnalysis: () => Promise<void>
  error: string | null
  setError: (e: string | null) => void
}

const AppContext = createContext<AppState | null>(null)

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppState must be used within AppProvider")
  return ctx
}

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { symbol: "RELIANCE.BSE", name: "Reliance Industries", type: "stock" },
  { symbol: "TCS.BSE", name: "Tata Consultancy Services", type: "stock" },
  { symbol: "INFY.BSE", name: "Infosys", type: "stock" },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apiKeys, setApiKeysState] = useState<ApiKeys>({
    gnewsApiKey: "",
    alphaVantageKey: "",
    geminiKey: "",
  })
  const apiKeysRef = useRef(apiKeys)

  const setApiKeys = useCallback((keys: ApiKeys) => {
    apiKeysRef.current = keys
    setApiKeysState(keys)
  }, [])
  
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [quotes, setQuotes] = useState<Map<string, StockQuote>>(new Map())
  const [news, setNews] = useState<NewsArticle[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false)
  const [isLoadingNews, setIsLoadingNews] = useState(false)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1D")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("marketpulse-watchlist")
      if (saved) setWatchlist(JSON.parse(saved))
      else setWatchlist(DEFAULT_WATCHLIST)
    } catch {
      setWatchlist(DEFAULT_WATCHLIST)
    }
  }, [])

  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem("marketpulse-watchlist", JSON.stringify(watchlist))
    }
  }, [watchlist])

  useEffect(() => {
    try {
      const cached = localStorage.getItem("marketpulse-quotes-cache")
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 12 * 60 * 60 * 1000 && data) {
          setQuotes(new Map(Object.entries(data)))
        }
      }
    } catch {}
  }, [])

  const fetchQuotes = useCallback(async () => {
    const keys = apiKeysRef.current
    if (!keys.alphaVantageKey || watchlist.length === 0) return

    setIsLoadingQuotes(true)
    setError(null)

    const newQuotes = new Map<string, StockQuote>()
    let rateLimited = false

    for (const item of watchlist) {
      try {
        const res = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${item.symbol}&apikey=${keys.alphaVantageKey}`
        )
        const data = await res.json()

        if (data["Note"] || data["Information"]) {
          rateLimited = true
          break
        }

        const gq = data["Global Quote"]
        if (gq && gq["05. price"]) {
          newQuotes.set(item.symbol, {
            symbol: item.symbol,
            name: item.name,
            price: parseFloat(gq["05. price"]),
            change: parseFloat(gq["09. change"]),
            changePercent: parseFloat(gq["10. change percent"]?.replace("%", "") || "0"),
            previousClose: parseFloat(gq["08. previous close"]),
            open: parseFloat(gq["02. open"]),
            high: parseFloat(gq["03. high"]),
            low: parseFloat(gq["04. low"]),
            volume: parseInt(gq["06. volume"]),
          })
        }
      } catch (err) {}
    }

    if (rateLimited) setError("Alpha Vantage API limit reached. Showing partial data.")
    
    if (newQuotes.size > 0) {
      setQuotes(newQuotes)
      localStorage.setItem("marketpulse-quotes-cache", JSON.stringify({
        data: Object.fromEntries(newQuotes),
        timestamp: Date.now(),
      }))
    }

    setIsLoadingQuotes(false)
  }, [watchlist])

  const fetchNews = useCallback(async () => {
    const gnewsApiKey = apiKeysRef.current.gnewsApiKey
    if (!gnewsApiKey) return

    setIsLoadingNews(true)
    setError(null)

    try {
      const data = await fetchNewsServer(gnewsApiKey);

      if (data.error) throw new Error(data.error);

      if (data.articles && data.articles.length > 0) {
        setNews(
          data.articles.slice(0, 15).map((article: any) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source,
            publishedAt: article.publishedAt,
          }))
        )
      } else {
        setNews([])
      }
    } catch (error) {
      console.error("News Fetch Error:", error)
      setError("Failed to fetch news. Please check your API key or try again later.")
    }

    setIsLoadingNews(false)
  }, [])

  const fetchAllData = useCallback(async () => {
    await Promise.all([fetchQuotes(), fetchNews()])
  }, [fetchQuotes, fetchNews])

  const fetchAIAnalysis = useCallback(async () => {
    const keys = apiKeysRef.current
    if (!keys.geminiKey) {
      setError("Please enter your Gemini API Key to run AI analysis.")
      return
    }
    if (watchlist.length === 0) {
      setError("Add assets to your watchlist first.")
      return
    }

    setIsLoadingAI(true)
    setError(null)

    const quoteSummaries = Array.from(quotes.entries()).map(([sym, q]) => (
      `${q.name} (${sym}): Price ${q.price.toFixed(2)}, Change ${q.change >= 0 ? "+" : ""}${q.change.toFixed(2)} (${q.changePercent.toFixed(2)}%)`
    ))

    const newsSummaries = news.slice(0, 10).map((n) => (
      `- "${n.title}" (Source: ${n.source.name}, ${new Date(n.publishedAt).toLocaleDateString()})`
    ))

    const prompt = `You are a market analyst assistant for an Indian investor. Analyze the following portfolio and recent news to provide actionable insights.

PORTFOLIO:
${quoteSummaries.join("\n")}

RECENT NEWS:
${newsSummaries.join("\n")}

WATCHLIST ASSETS:
${watchlist.map((w) => `${w.name} (${w.symbol})`).join(", ")}

Please provide:
1. A brief overall market sentiment summary (2-3 sentences)
2. For EACH asset in the watchlist, provide:
   - Whether the outlook is bullish, bearish, or neutral
   - A brief reasoning (2-3 sentences) explaining your assessment
   - Cite the specific news headline(s) that influenced your assessment

Format your response as JSON matching this schema:
{
  "summary": "Overall market summary...",
  "impacts": [
    {
      "asset": "Asset Name (SYMBOL)",
      "sentiment": "bullish|bearish|neutral",
      "reasoning": "Brief explanation...",
      "citedHeadlines": ["Headline 1", "Headline 2"]
    }
  ]
}

Return ONLY the JSON, no markdown fences or extra text.`

    try {
      const data = await fetchGeminiServer(prompt, keys.geminiKey);
      
      if (data.error) throw new Error(data.error);
      
      const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (textContent) {
        let cleaned = textContent;
        const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) cleaned = jsonMatch[1];
        
        const parsed = JSON.parse(cleaned) as Omit<AIAnalysis, "generatedAt">
        setAiAnalysis({
          ...parsed,
          generatedAt: new Date().toISOString(),
        })
      } else {
        throw new Error("Invalid response format from Gemini");
      }
    } catch (err) {
      console.error("Gemini API error:", err)
      setError("AI analysis failed. Please check your API key and try again.");
    }

    setIsLoadingAI(false)
  }, [watchlist, quotes, news])

  return (
    <AppContext.Provider
      value={{
        apiKeys, setApiKeys, watchlist, addToWatchlist, removeFromWatchlist, quotes, news, aiAnalysis,
        isLoadingQuotes, isLoadingNews, isLoadingAI, selectedPeriod, setSelectedPeriod,
        fetchAllData, fetchAIAnalysis, error, setError,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
