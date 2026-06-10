import { WatchlistItem } from '@/components/watchlist/WatchlistItem'
import { useWatchlistStore } from '@/store/watchlistStore'

export function WatchlistPage() {
  const items = useWatchlistStore((state) => state.items)
  const clearAll = useWatchlistStore((state) => state.clearAll)
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">Watchlist</h1><p className="mt-1 text-muted-foreground">Saved items for quick market checks and future alerts.</p></div>{items.length > 0 && <button onClick={clearAll} className="rounded bg-secondary px-3 py-2 text-sm">Clear All</button>}</div>
      {items.length === 0 ? <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">No watched items yet. Add one from the scanner or calculator.</div> : <div className="grid gap-3">{items.map((item) => <WatchlistItem key={`${item.itemId}-${item.enchantment}-${item.quality}`} {...item} />)}</div>}
    </div>
  )
}
