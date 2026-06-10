import { useQuery } from '@tanstack/react-query'
import { fetchPrices } from '@/lib/api'
import { useSettingsStore } from '@/store/settingsStore'
import type { CityName } from '@/types/market'

export function useMarketPrices(
  itemIds: string[],
  locations: CityName[] = ['Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock', 'Thetford', 'Caerleon', 'Brecilien', 'Black Market'],
  qualities: number[] = [1]
) {
  const serverRegion = useSettingsStore((s) => s.serverRegion)

  return useQuery({
    queryKey: ['market-prices', itemIds, locations, qualities, serverRegion],
    queryFn: () => fetchPrices(itemIds, locations, qualities, serverRegion),
    enabled: itemIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
