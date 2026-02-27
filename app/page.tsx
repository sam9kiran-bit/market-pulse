"use client"

import { AppProvider } from "@/lib/app-context"
import { AppHeader } from "@/components/app-header"
import { NewsFeed } from "@/components/news-feed"
import { AIForecast } from "@/components/ai-forecast"

export default function HomePage() {
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <NewsFeed />
            </div>
            <div className="lg:col-span-3">
              <AIForecast />
            </div>
          </div>
        </main>
      </div>
    </AppProvider>
  )
}
