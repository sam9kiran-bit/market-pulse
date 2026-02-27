"use client"

import { AppProvider } from "@/lib/app-context"
import { AppHeader } from "@/components/app-header"
import { ErrorBanner } from "@/components/error-banner"
import { LeadersBleeders } from "@/components/leaders-bleeders"
import { NewsFeed } from "@/components/news-feed"
import { AIForecast, Disclaimer } from "@/components/ai-forecast"
import { Separator } from "@/components/ui/separator"

export default function HomePage() {
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />

        <div className="flex flex-col gap-4 py-4">
          <ErrorBanner />

          <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6">
            {/* Leaders & Bleeders */}
            <LeadersBleeders />

            <Separator className="bg-border/50" />

            {/* Two-column: News + AI */}
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <NewsFeed />
              </div>
              <div className="lg:col-span-3">
                <AIForecast />
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Disclaimer */}
            <Disclaimer />
          </main>

          <footer className="mt-auto border-t border-border/30 py-4">
            <p className="text-center text-xs text-muted-foreground/50">
              MarketPulse India - For personal informational use only. Not financial advice.
            </p>
          </footer>
        </div>
      </div>
    </AppProvider>
  )
}
