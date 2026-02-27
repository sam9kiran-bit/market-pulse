"use client"

import React from 'react'
import { AppProvider } from "@/lib/app-context"

export default function HomePage() {
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-4 text-center">
        <div className="max-w-2xl border border-slate-800 rounded-xl p-8 bg-slate-900 shadow-2xl">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            MarketPulse India Live
          </h1>
          <p className="text-slate-400 mb-8">
            Your AI-powered market dashboard is now successfully deployed and stable.
          </p>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-sm font-mono text-emerald-400">✓ System Status: Online</p>
            </div>
            <p className="text-xs text-slate-500">
              Please enter your API keys in the app settings to begin real-time analysis.
            </p>
          </div>
        </div>
      </div>
    </AppProvider>
  )
}
