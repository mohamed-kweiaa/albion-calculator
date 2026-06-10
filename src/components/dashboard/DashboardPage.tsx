import equipmentItems from '@/data/equipment-items.json'
import resourceItems from '@/data/resource-items.json'
import otherItems from '@/data/other-items.json'
import { QuickFlipMode } from '@/components/dashboard/QuickFlipMode'
import { useFlipHistoryStore } from '@/store/flipHistoryStore'
import { useWatchlistStore } from '@/store/watchlistStore'
import { useSettingsStore } from '@/store/settingsStore'
import { SilverDisplay } from '@/components/shared/SilverDisplay'

export function DashboardPage() {
  const watchCount = useWatchlistStore((state) => state.items.length)
  const entries = useFlipHistoryStore((state) => state.entries)
  const totalProfit = useFlipHistoryStore((state) => state.getTotalProfit())
  const serverRegion = useSettingsStore((state) => state.serverRegion)
  const totalItems = (equipmentItems as unknown[]).length + (resourceItems as unknown[]).length + (otherItems as unknown[]).length

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Dashboard</h1><p className="mt-1 text-muted-foreground">Europe-ready Albion market flipping with live data, @4 equipment support, and route risk awareness.</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Items Tracked" value={totalItems.toLocaleString()} />
        <Stat label="Server Region" value={serverRegion.toUpperCase()} />
        <Stat label="Watchlist" value={String(watchCount)} />
        <div className="rounded-lg border border-border bg-card p-4"><div className="text-sm text-muted-foreground">Logged P/L</div><SilverDisplay amount={totalProfit} showSign className="mt-2 block text-2xl font-bold" /></div>
      </div>
      <QuickFlipMode />
      <div className="rounded-lg border border-border bg-card p-4"><h2 className="mb-3 font-semibold">Recent Flip History</h2>{entries.slice(-5).reverse().map((entry) => <div key={entry.id} className="flex justify-between border-t border-border py-2 text-sm"><span>{entry.itemName}</span><SilverDisplay amount={entry.totalProfit} showSign /></div>)}{entries.length === 0 && <div className="text-sm text-muted-foreground">No logged flips yet.</div>}</div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-card p-4"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-2 text-2xl font-bold">{value}</div></div>
}
