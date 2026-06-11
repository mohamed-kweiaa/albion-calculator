import { Moon, Sun, Crown } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { cn } from '@/lib/utils'

const REGION_LABELS: Record<string, string> = {
  europe: 'EU',
  americas: 'US',
  asia: 'AS',
}

export function Header() {
  const serverRegion = useSettingsStore((s) => s.serverRegion)
  const isPremium = useSettingsStore((s) => s.isPremium)
  const theme = useSettingsStore((s) => s.theme)
  const useLocalMarketData = useSettingsStore((s) => s.useLocalMarketData)
  const togglePremium = useSettingsStore((s) => s.togglePremium)
  const toggleTheme = useSettingsStore((s) => s.toggleTheme)
  const toggleLocalMarketData = useSettingsStore((s) => s.toggleLocalMarketData)

  return (
    <header className="sticky top-0 z-50 w-full h-14 flex items-center justify-between px-4 bg-background border-b border-border">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold tracking-tight">Albion Flipper</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {REGION_LABELS[serverRegion] ?? serverRegion}
        </span>

        <button
          onClick={togglePremium}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
            isPremium
              ? 'bg-green-500/15 text-green-600 dark:text-green-400'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Crown className="h-3.5 w-3.5" />
          {isPremium ? 'Premium' : 'Non-Premium'}
        </button>

        <button
          onClick={toggleLocalMarketData}
          className={cn(
            'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
            useLocalMarketData
              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
              : 'bg-muted text-muted-foreground',
          )}
          title="Use local market cache first, then public API fallback"
        >
          {useLocalMarketData ? 'Local Data' : 'Public API'}
        </button>

        <button
          onClick={toggleTheme}
          className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  )
}
