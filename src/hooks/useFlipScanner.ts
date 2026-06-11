import { useState, useRef, useCallback } from 'react'
import { fetchPrices } from '@/lib/api'
import { useSettingsStore } from '@/store/settingsStore'
import {
  calculateFlipProfit,
  calculateBlackMarketProfit,
  isValidPrice,
} from '@/lib/profitCalculator'
import { getTransportRisk } from '@/lib/transportRisk'
import { parseItemId } from '@/lib/itemUtils'
import { getDataAgeMs } from '@/lib/formatters'
import type { AlbionItem } from '@/types/items'
import type { FlipResult, ScanProgress } from '@/types/flip'
import type { CityName, MarketPrice, QualityLevel } from '@/types/market'

const BATCH_SIZE = 50

interface ScanParams {
  itemIds: string[]
  itemsById: Map<string, AlbionItem>
  buyCities: CityName[]
  sellCities: CityName[]
  qualities: QualityLevel[]
  isPremium: boolean
  minProfit: number
  minMargin: number
  maxDataAgeHours: number | null
}

function batchItems<T>(items: T[], size: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size))
  return batches
}

export function useFlipScanner() {
  const [results, setResults] = useState<FlipResult[]>([])
  const [progress, setProgress] = useState<ScanProgress>({
    total: 0,
    scanned: 0,
    found: 0,
    status: 'idle',
    startTime: null,
    estimatedEndTime: null,
  })
  const cancelRef = useRef(false)
  const serverRegion = useSettingsStore((s) => s.serverRegion)
  const useLocalMarketData = useSettingsStore((s) => s.useLocalMarketData)
  const localApiUrl = useSettingsStore((s) => s.localApiUrl)

  const startScan = useCallback(
    async ({
      itemIds,
      itemsById,
      buyCities,
      sellCities,
      qualities,
      isPremium,
      minProfit,
      minMargin,
      maxDataAgeHours,
    }: ScanParams) => {
      cancelRef.current = false
      setResults([])

      const batches = batchItems(itemIds, BATCH_SIZE)

      setProgress({
        total: itemIds.length,
        scanned: 0,
        found: 0,
        status: 'scanning',
        startTime: Date.now(),
        estimatedEndTime: null,
      })

      const allLocations = Array.from(
        new Set([...buyCities, ...sellCities])
      ) as CityName[]

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        if (cancelRef.current) break

        const batch = batches[batchIndex]
        let priceData: MarketPrice[]

        try {
          priceData = await fetchPrices(
            batch,
            allLocations,
            qualities,
            serverRegion,
            { useLocalMarketData, localApiUrl }
          )
        } catch {
          setProgress((prev) => ({
            ...prev,
            scanned: Math.min(prev.total, prev.scanned + batch.length),
          }))
          continue
        }

        const batchResults: FlipResult[] = []

        for (const itemId of batch) {
          const itemPrices = priceData.filter((p) => p.item_id === itemId)
          const { baseId, enchantment } = parseItemId(itemId)
          const item = itemsById.get(baseId)
          if (!item) continue

          for (const buyCity of buyCities) {
            const buyEntries = itemPrices.filter((p) => p.city === buyCity)

            for (const buyEntry of buyEntries) {
              if (!isValidPrice(buyEntry.sell_price_min, buyEntry.sell_price_min_date)) continue

              const buyPrice = buyEntry.sell_price_min

              for (const sellCity of sellCities) {
                if (buyCity === sellCity) continue

                const sellEntries = itemPrices.filter(
                  (p) => p.city === sellCity && p.quality === buyEntry.quality,
                )

                for (const sellEntry of sellEntries) {
                  const isBlackMarket = sellCity === 'Black Market'
                  const sellPrice = isBlackMarket
                    ? sellEntry.buy_price_max
                    : sellEntry.sell_price_min
                  const sellDate = isBlackMarket
                    ? sellEntry.buy_price_max_date
                    : sellEntry.sell_price_min_date

                  if (!isValidPrice(sellPrice, sellDate)) continue

                  if (maxDataAgeHours !== null) {
                    const maxAgeMs = maxDataAgeHours * 60 * 60 * 1000
                    if (
                      getDataAgeMs(buyEntry.sell_price_min_date) > maxAgeMs ||
                      getDataAgeMs(sellDate) > maxAgeMs
                    ) {
                      continue
                    }
                  }

                  const profitInfo = isBlackMarket
                    ? calculateBlackMarketProfit(buyPrice, sellPrice, isPremium)
                    : calculateFlipProfit(buyPrice, sellPrice, isPremium)

                  if (
                    profitInfo.profit >= minProfit &&
                    profitInfo.profitMargin >= minMargin
                  ) {
                    batchResults.push({
                      item,
                      itemId,
                      enchantment,
                      quality: buyEntry.quality as QualityLevel,
                      buyCity,
                      sellCity,
                      buyPrice,
                      sellPrice,
                      buyDate: buyEntry.sell_price_min_date,
                      sellDate,
                      profit: profitInfo.profit,
                      profitMargin: profitInfo.profitMargin,
                      totalBuyCost: profitInfo.totalBuyCost,
                      totalSellIncome: profitInfo.totalSellIncome,
                      profitPerHour: null,
                      transportRisk: getTransportRisk(buyCity, sellCity),
                    })
                  }
                }
              }
            }
          }
        }

        if (batchResults.length > 0) {
          setResults((prev) => [...prev, ...batchResults])
        }

        setProgress((prev) => ({
          ...prev,
          scanned: Math.min(prev.total, prev.scanned + batch.length),
          found: prev.found + batchResults.length,
        }))
      }

      // Sort final results by profit descending
      setResults((prev) =>
        [...prev].sort((a, b) => b.profit - a.profit)
      )

      setProgress((prev) => ({
        ...prev,
        status: cancelRef.current ? 'cancelled' : 'complete',
        scanned: cancelRef.current ? prev.scanned : prev.total,
      }))
    },
    [serverRegion, useLocalMarketData, localApiUrl]
  )

  const cancelScan = useCallback(() => {
    cancelRef.current = true
    setProgress((prev) => ({ ...prev, status: 'cancelled' }))
  }, [])

  return { results, progress, startScan, cancelScan }
}
