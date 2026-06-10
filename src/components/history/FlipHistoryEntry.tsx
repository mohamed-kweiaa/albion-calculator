import { CityBadge } from '@/components/shared/CityBadge'
import { SilverDisplay } from '@/components/shared/SilverDisplay'
import type { FlipHistoryEntry as Entry } from '@/types/flip'

export function FlipHistoryEntry({ entry, onRemove }: { entry: Entry; onRemove: (id: string) => void }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="font-medium">{entry.itemName}</div><div className="mt-1 text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</div></div><SilverDisplay amount={entry.totalProfit} showSign className="text-lg font-bold" /></div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><span>Bought {entry.quantity}x in</span><CityBadge city={entry.buyCity} /><span>for</span><SilverDisplay amount={entry.buyPrice} /><span>sold in</span><CityBadge city={entry.sellCity} /><span>for</span><SilverDisplay amount={entry.sellPrice} /></div>
      {entry.notes && <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>}
      <button onClick={() => onRemove(entry.id)} className="mt-3 rounded bg-secondary px-3 py-1 text-xs hover:bg-accent">Remove</button>
    </div>
  )
}
