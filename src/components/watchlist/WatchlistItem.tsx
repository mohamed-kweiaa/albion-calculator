import equipmentItems from '@/data/equipment-items.json'
import resourceItems from '@/data/resource-items.json'
import otherItems from '@/data/other-items.json'
import { ItemIcon } from '@/components/shared/ItemIcon'
import { QualityBadge } from '@/components/shared/QualityBadge'
import { EnchantmentBadge } from '@/components/shared/EnchantmentBadge'
import { useWatchlistStore } from '@/store/watchlistStore'
import { buildItemId } from '@/lib/itemUtils'
import type { AlbionItem } from '@/types/items'

const allItems = [...(equipmentItems as AlbionItem[]), ...(resourceItems as AlbionItem[]), ...(otherItems as AlbionItem[])]

export function WatchlistItem({ itemId, enchantment, quality }: { itemId: string; enchantment: number; quality: number }) {
  const removeItem = useWatchlistStore((state) => state.removeItem)
  const item = allItems.find((candidate) => candidate.id === itemId)
  const fullId = buildItemId(itemId, enchantment)
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <ItemIcon itemId={fullId} quality={quality} size={44} />
      <div className="mr-auto"><div className="font-medium">{item?.name ?? itemId}</div><div className="mt-1 flex gap-2"><EnchantmentBadge enchantment={enchantment} /><QualityBadge quality={quality} /></div></div>
      <button onClick={() => removeItem(itemId, enchantment, quality)} className="rounded bg-secondary px-3 py-1 text-xs hover:bg-accent">Remove</button>
    </div>
  )
}
