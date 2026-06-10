import { useEffect } from 'react'
import { Routes, Route } from 'react-router'
import { Layout } from '@/components/layout/Layout'
import { DashboardPage } from '@/components/dashboard/DashboardPage'
import { ScannerPage } from '@/components/scanner/ScannerPage'
import { CalculatorPage } from '@/components/calculator/CalculatorPage'
import { WatchlistPage } from '@/components/watchlist/WatchlistPage'
import { FlipHistoryPage } from '@/components/history/FlipHistoryPage'
import { useSettingsStore } from '@/store/settingsStore'

export default function App() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="scanner" element={<ScannerPage />} />
        <Route path="calculator" element={<CalculatorPage />} />
        <Route path="watchlist" element={<WatchlistPage />} />
        <Route path="history" element={<FlipHistoryPage />} />
      </Route>
    </Routes>
  )
}
