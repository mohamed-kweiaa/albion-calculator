import { useQuery } from '@tanstack/react-query'
import { fetchPriceHistory } from '@/lib/api'
import { useSettingsStore } from '@/store/settingsStore'
import type { CityName } from '@/types/market'

export function usePriceHistory(
  itemIds: string[],
  locations: CityName[] = ['Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock', 'Thetford', 'Caerleon'],
  timeScale: number = 6
) {
  const serverRegion = useSettingsStore((s) => s.serverRegion)
  const useLocalMarketData = useSettingsStore((s) => s.useLocalMarketData)
  const localApiUrl = useSettingsStore((s) => s.localApiUrl)

  return useQuery({
    queryKey: ['price-history', itemIds, locations, timeScale, serverRegion, useLocalMarketData, localApiUrl],
    queryFn: () => fetchPriceHistory(itemIds, locations, serverRegion, timeScale, { useLocalMarketData, localApiUrl }),
    enabled: itemIds.length > 0,
    staleTime: 10 * 60 * 1000,
  })
}
