import { useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import { ItemSearch } from '@/components/calculator/ItemSearch'
import { PriceComparisonTable } from '@/components/calculator/PriceComparisonTable'
import { ProfitBreakdown } from '@/components/calculator/ProfitBreakdown'
import { PriceHistoryChart } from '@/components/calculator/PriceHistoryChart'
import { ItemIcon } from '@/components/shared/ItemIcon'
import { EnchantmentBadge } from '@/components/shared/EnchantmentBadge'
import { QualityBadge } from '@/components/shared/QualityBadge'
import { SilverDisplay } from '@/components/shared/SilverDisplay'
import { CityBadge } from '@/components/shared/CityBadge'
import { TransportRiskBadge } from '@/components/shared/TransportRiskBadge'
import { useMarketPrices } from '@/hooks/useMarketPrices'
import { useSettingsStore } from '@/store/settingsStore'
import { useWatchlistStore } from '@/store/watchlistStore'
import { buildItemId } from '@/lib/itemUtils'
import { calculateBlackMarketProfit, calculateFlipProfit, isValidPrice } from '@/lib/profitCalculator'
import { CITIES, QUALITIES, QUALITY_NAMES } from '@/lib/constants'
import type { AlbionItem } from '@/types/items'
import type { CityName, QualityLevel } from '@/types/market'

export function CalculatorPage() {
  const [selectedItem, setSelectedItem] = useState<AlbionItem | null>(null)
  const [enchantment, setEnchantment] = useState(0)
  const [quality, setQuality] = useState<QualityLevel>(1)
  const [quantity, setQuantity] = useState(1)
  const [manualBuyPrice, setManualBuyPrice] = useState<number | null>(null)
  const [manualSellPrice, setManualSellPrice] = useState<number | null>(null)
  const [sellToBlackMarket, setSellToBlackMarket] = useState(true)
  const isPremium = useSettingsStore((state) => state.isPremium)
  const addWatch = useWatchlistStore((state) => state.addItem)

  const itemId = selectedItem ? buildItemId(selectedItem.id, enchantment) : ''
  const { data: prices = [] } = useMarketPrices(itemId ? [itemId] : [], CITIES, [quality])

  const bestFlip = useMemo(() => {
    if (!selectedItem) return null
    let best: null | { buyCity: CityName; sellCity: CityName; buyPrice: number; sellPrice: number; profit: number; margin: number } = null
    for (const buy of prices) {
      if (!isValidPrice(buy.sell_price_min, buy.sell_price_min_date)) continue
      for (const sell of prices) {
        if (buy.city === sell.city) continue
        if (sellToBlackMarket && sell.city !== 'Black Market') continue
        const sellPrice = sell.city === 'Black Market' ? sell.buy_price_max : sell.sell_price_min
        const sellDate = sell.city === 'Black Market' ? sell.buy_price_max_date : sell.sell_price_min_date
        if (!isValidPrice(sellPrice, sellDate)) continue
        const result = sell.city === 'Black Market'
          ? calculateBlackMarketProfit(buy.sell_price_min, sellPrice, isPremium, quantity)
          : calculateFlipProfit(buy.sell_price_min, sellPrice, isPremium, quantity)
        if (!best || result.profit > best.profit) {
          best = { buyCity: buy.city as CityName, sellCity: sell.city as CityName, buyPrice: buy.sell_price_min, sellPrice, profit: result.profit, margin: result.profitMargin }
        }
      }
    }
    return best
  }, [prices, selectedItem, sellToBlackMarket, isPremium, quantity])

  const buyPrice = manualBuyPrice ?? bestFlip?.buyPrice ?? 0
  const sellPrice = manualSellPrice ?? bestFlip?.sellPrice ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Flip Calculator</h1>
        <p className="mt-1 text-muted-foreground">Search an item, compare city prices, and calculate total flip profit.</p>
      </div>

      <ItemSearch onSelect={(item) => { setSelectedItem(item); setEnchantment(0) }} />

      {!selectedItem ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">Select an item to start calculating.</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-4">
              <ItemIcon itemId={itemId} quality={quality} size={64} />
              <div className="mr-auto">
                <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/15 px-1.5 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-300">
                    T{selectedItem.tier}
                  </span>
                  <EnchantmentBadge enchantment={enchantment} />
                  <QualityBadge quality={quality} />
                </div>
              </div>
              <button
                onClick={() => addWatch({ itemId: selectedItem.id, enchantment, quality, addedAt: Date.now() })}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-accent"
              >
                <Star className="h-4 w-4" /> Add to Watchlist
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Enchantment</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedItem.enchantments.map((level) => (
                    <button key={level} onClick={() => setEnchantment(level)} className={level === enchantment ? 'rounded bg-primary px-2 py-1 text-xs text-primary-foreground' : 'rounded bg-secondary px-2 py-1 text-xs'}>.{level}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Quality</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {QUALITIES.map((q) => (
                    <button key={q} onClick={() => setQuality(q)} title={QUALITY_NAMES[q]} className={q === quality ? 'rounded bg-primary px-2 py-1 text-xs text-primary-foreground' : 'rounded bg-secondary px-2 py-1 text-xs'}>{q}</button>
                  ))}
                </div>
              </div>
              <label className="text-xs font-medium text-muted-foreground">Quantity
                <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} className="mt-2 block h-9 w-full rounded border border-input bg-background px-3 text-sm text-foreground" />
              </label>
              <label className="flex items-end gap-2 text-sm">
                <input type="checkbox" checked={sellToBlackMarket} onChange={(event) => setSellToBlackMarket(event.target.checked)} /> Sell to Black Market only
              </label>
            </div>
          </div>

          {bestFlip && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
              <div className="mb-2 text-sm font-semibold text-green-600 dark:text-green-400">Best Flip</div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <CityBadge city={bestFlip.buyCity} /> <SilverDisplay amount={bestFlip.buyPrice} />
                <span className="text-muted-foreground">to</span>
                <CityBadge city={bestFlip.sellCity} /> <SilverDisplay amount={bestFlip.sellPrice} />
                <TransportRiskBadge fromCity={bestFlip.buyCity} toCity={bestFlip.sellCity} />
                <span className="ml-auto"><SilverDisplay amount={bestFlip.profit} showSign className="font-bold" /> <span className="text-muted-foreground">({bestFlip.margin.toFixed(1)}%)</span></span>
              </div>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <PriceComparisonTable itemId={itemId} quality={quality} />
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-3 font-semibold">Manual Override</h3>
                <div className="grid gap-3">
                  <input type="number" placeholder="Buy price" value={manualBuyPrice ?? ''} onChange={(event) => setManualBuyPrice(event.target.value ? Number(event.target.value) : null)} className="h-9 rounded border border-input bg-background px-3 text-sm" />
                  <input type="number" placeholder="Sell price" value={manualSellPrice ?? ''} onChange={(event) => setManualSellPrice(event.target.value ? Number(event.target.value) : null)} className="h-9 rounded border border-input bg-background px-3 text-sm" />
                </div>
              </div>
              <ProfitBreakdown buyPrice={buyPrice} sellPrice={sellPrice} isPremium={isPremium} quantity={quantity} isBlackMarket={sellToBlackMarket} />
            </div>
          </div>

          <PriceHistoryChart itemId={itemId} />
        </div>
      )}
    </div>
  )
}
