import { useMemo, useState } from 'react'
import equipmentItems from '@/data/equipment-items.json'
import resourceItems from '@/data/resource-items.json'
import otherItems from '@/data/other-items.json'
import { ScanFilters } from '@/components/scanner/ScanFilters'
import { ScanProgress } from '@/components/scanner/ScanProgress'
import { FlipResultsTable } from '@/components/scanner/FlipResultsTable'
import { RefreshHelper } from '@/components/scanner/RefreshHelper'
import { CITIES } from '@/lib/constants'
import { buildItemId } from '@/lib/itemUtils'
import { useFlipScanner } from '@/hooks/useFlipScanner'
import { useSettingsStore } from '@/store/settingsStore'
import type { AlbionItem, ItemCategory } from '@/types/items'
import type { CityName, QualityLevel } from '@/types/market'

const itemData: Record<ItemCategory, AlbionItem[]> = {
  equipment: equipmentItems as AlbionItem[],
  resource: resourceItems as AlbionItem[],
  other: otherItems as AlbionItem[],
}

export function ScannerPage() {
  const [activeTab, setActiveTab] = useState<ItemCategory>('equipment')
  const [buyCities, setBuyCities] = useState<CityName[]>(CITIES.filter((city) => city !== 'Black Market'))
  const [sellCities, setSellCities] = useState<CityName[]>(['Black Market'])
  const [tiers, setTiers] = useState<number[]>([4, 5, 6, 7, 8])
  const [enchantments, setEnchantments] = useState<number[]>([0, 1, 2, 3, 4])
  const [qualities, setQualities] = useState<QualityLevel[]>([1])
  const [minProfit, setMinProfit] = useState(1000)
  const [minMargin, setMinMargin] = useState(5)
  const [maxDataAgeHours, setMaxDataAgeHours] = useState<number | null>(6)
  const isPremium = useSettingsStore((state) => state.isPremium)
  const { results, progress, startScan, cancelScan } = useFlipScanner()

  const selectedItems = useMemo(() => itemData[activeTab].filter((item) => tiers.includes(item.tier)), [activeTab, tiers])

  const handleScan = () => {
    const itemIds: string[] = []
    const itemsById = new Map<string, AlbionItem>()
    selectedItems.forEach((item) => {
      itemsById.set(item.id, item)
      item.enchantments.filter((level) => enchantments.includes(level)).forEach((level) => itemIds.push(buildItemId(item.id, level)))
    })
    startScan({ itemIds, itemsById, buyCities, sellCities, qualities, isPremium, minProfit, minMargin, maxDataAgeHours })
  }

  const exportJson = () => download('albion-flips.json', JSON.stringify(results, null, 2), 'application/json')
  const exportCsv = () => {
    const header = 'Item,Tier,Enchantment,Quality,Buy City,Buy Price,Sell City,Sell Price,Profit,Margin%,Risk,Updated'
    const rows = results.map((r) => [r.item.name, r.item.tier, r.enchantment, r.quality, r.buyCity, r.buyPrice, r.sellCity, r.sellPrice, r.profit.toFixed(0), r.profitMargin.toFixed(2), r.transportRisk, r.sellDate].join(','))
    download('albion-flips.csv', [header, ...rows].join('\n'), 'text/csv')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">Top Flips Scanner</h1><p className="mt-1 text-muted-foreground">Scan live Albion markets by category, tier, enchantment, quality, and route.</p></div>
        <button onClick={handleScan} disabled={progress.status === 'scanning'} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">Start Scan</button>
      </div>

      <div className="flex gap-2">
        {(['equipment', 'resource', 'other'] as ItemCategory[]).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'rounded-lg bg-primary px-4 py-2 text-sm capitalize text-primary-foreground' : 'rounded-lg bg-secondary px-4 py-2 text-sm capitalize'}>{tab}</button>)}
      </div>

      <ScanFilters buyCities={buyCities} setBuyCities={setBuyCities} sellCities={sellCities} setSellCities={setSellCities} tiers={tiers} setTiers={setTiers} enchantments={enchantments} setEnchantments={setEnchantments} qualities={qualities} setQualities={setQualities} minProfit={minProfit} setMinProfit={setMinProfit} minMargin={minMargin} setMinMargin={setMinMargin} maxDataAgeHours={maxDataAgeHours} setMaxDataAgeHours={setMaxDataAgeHours} />
      <ScanProgress progress={progress} onCancel={cancelScan} />

      <div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">Scanning {selectedItems.length.toLocaleString()} base items in {activeTab}.</div><div className="flex gap-2"><button onClick={exportCsv} disabled={results.length === 0} className="rounded bg-secondary px-3 py-1 text-xs disabled:opacity-50">Export CSV</button><button onClick={exportJson} disabled={results.length === 0} className="rounded bg-secondary px-3 py-1 text-xs disabled:opacity-50">Export JSON</button></div></div>
      <FlipResultsTable results={results} />
      {results.length > 0 && (
        <RefreshHelper
          results={results}
          staleThresholdHours={maxDataAgeHours ?? 6}
          onRescan={handleScan}
        />
      )}
    </div>
  )
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
