import { useMemo } from 'react'
import { MapPin, RefreshCw } from 'lucide-react'
import type { FlipResult } from '@/types/flip'
import { getDataAgeMs } from '@/lib/formatters'
import { CityBadge } from '@/components/shared/CityBadge'
import { EnchantmentBadge } from '@/components/shared/EnchantmentBadge'

interface RefreshHelperProps {
  results: FlipResult[]
  staleThresholdHours: number
  onRescan: () => void
}

type RefreshGroup = {
  city: string
  items: { name: string; tier: number; enchantment: number; category: string }[]
}

export function RefreshHelper({ results, staleThresholdHours, onRescan }: RefreshHelperProps) {
  const groups = useMemo(() => {
    const maxAgeMs = staleThresholdHours * 60 * 60 * 1000
    const staleFlips = results.filter((flip) => {
      const buyAge = getDataAgeMs(flip.buyDate)
      const sellAge = getDataAgeMs(flip.sellDate)
      return buyAge > maxAgeMs || sellAge > maxAgeMs
    })

    if (staleFlips.length === 0) return []

    const cityItems = new Map<string, Map<string, { name: string; tier: number; enchantment: number; category: string }>>()

    staleFlips.forEach((flip) => {
      const cities = [flip.buyCity, flip.sellCity]
      cities.forEach((city) => {
        if (!cityItems.has(city)) cityItems.set(city, new Map())
        const itemMap = cityItems.get(city)!
        const key = `${flip.item.id}|${flip.enchantment}`
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            name: flip.item.name,
            tier: flip.item.tier,
            enchantment: flip.enchantment,
            category: flip.item.category,
          })
        }
      })
    })

    const result: RefreshGroup[] = []
    cityItems.forEach((itemMap, city) => {
      result.push({ city, items: Array.from(itemMap.values()) })
    })

    result.sort((a, b) => b.items.length - a.items.length)
    return result
  }, [results, staleThresholdHours])

  if (groups.length === 0) return null

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0)

  return (
    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-yellow-600 dark:text-yellow-400">
            <MapPin className="h-4 w-4" />
            Manual Refresh Helper
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalItems} stale item{totalItems !== 1 ? 's' : ''} across {groups.length} cit{groups.length !== 1 ? 'ies' : 'y'}.
            Open these markets in-game so the Albion Data Client can capture fresh prices.
          </p>
        </div>
        <button
          onClick={onRescan}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700"
        >
          <RefreshCw className="h-4 w-4" />
          Recheck Freshness
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {groups.map((group) => (
          <div key={group.city}>
            <div className="mb-2 flex items-center gap-2">
              <CityBadge city={group.city as any} />
              <span className="text-sm text-muted-foreground">
                {group.items.length} item{group.items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-1 pl-2">
              {group.items.slice(0, 15).map((item) => (
                <div key={`${item.name}-${item.enchantment}`} className="flex items-center gap-2 text-sm">
                  <span className="inline-flex rounded border border-sky-500/30 bg-sky-500/15 px-1 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-300">T{item.tier}</span>
                  <EnchantmentBadge enchantment={item.enchantment} />
                  <span>{item.name}</span>
                  <span className="text-xs text-muted-foreground">{categoryToMarketPath(item.category)}</span>
                </div>
              ))}
              {group.items.length > 15 && (
                <div className="text-xs text-muted-foreground">
                  +{group.items.length - 15} more items...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded bg-background/50 p-3 text-xs text-muted-foreground">
        <strong>How to refresh:</strong> In Albion, open the market in each city listed above.
        Navigate to the item category shown (e.g. Weapons → Frost Staff), select the tier and enchantment,
        then browse through the listings. The Albion Data Client will capture what the game loads.
        Once done, click <strong>Recheck Freshness</strong> to re-scan with updated prices.
      </div>
    </div>
  )
}

function categoryToMarketPath(category: string): string {
  const map: Record<string, string> = {
    weapon: 'Weapons',
    armor: 'Armor',
    head: 'Head',
    shoes: 'Shoes',
    offhand: 'Off-hand',
    cape: 'Capes',
    bag: 'Bags',
    mount: 'Mounts',
    resource: 'Resources',
    refined: 'Refined',
    raw: 'Raw Resources',
    potion: 'Consumables → Potions',
    meal: 'Consumables → Food',
    journal: 'Journals',
    other: 'Other',
  }
  return map[category] ?? category
}
