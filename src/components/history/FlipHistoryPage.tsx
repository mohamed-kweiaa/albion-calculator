import { FlipHistoryEntry } from '@/components/history/FlipHistoryEntry'
import { SilverDisplay } from '@/components/shared/SilverDisplay'
import { useFlipHistoryStore } from '@/store/flipHistoryStore'

export function FlipHistoryPage() {
  const entries = useFlipHistoryStore((state) => state.entries)
  const removeEntry = useFlipHistoryStore((state) => state.removeEntry)
  const clearAll = useFlipHistoryStore((state) => state.clearAll)
  const totalProfit = useFlipHistoryStore((state) => state.getTotalProfit())
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">Flip History</h1><p className="mt-1 text-muted-foreground">Track past flips with a running profit and loss total.</p></div>{entries.length > 0 && <button onClick={clearAll} className="rounded bg-secondary px-3 py-2 text-sm">Clear All</button>}</div>
      <div className="rounded-lg border border-border bg-card p-4"><div className="text-sm text-muted-foreground">Running P/L</div><SilverDisplay amount={totalProfit} showSign className="mt-2 block text-3xl font-bold" /></div>
      {entries.length === 0 ? <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">No flips logged yet. Log one from scanner results.</div> : <div className="grid gap-3">{entries.slice().reverse().map((entry) => <FlipHistoryEntry key={entry.id} entry={entry} onRemove={removeEntry} />)}</div>}
    </div>
  )
}
