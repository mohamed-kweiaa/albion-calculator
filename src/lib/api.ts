import type { CityName, ServerRegion, MarketPrice, PriceHistory } from '@/types/market'
import { SERVER_URLS } from '@/lib/constants'
import { rateLimitedFetch } from '@/lib/rateLimiter'

/**
 * Returns the Albion Data Project API base URL for the given server region.
 */
export function getApiBaseUrl(region: ServerRegion): string {
  return SERVER_URLS[region]
}

/**
 * Fetches current market prices for the given items, locations, and qualities.
 *
 * Calls: GET /api/v2/stats/prices/{itemIds}.json?locations={locations}&qualities={qualities}
 *
 * @param itemIds   - Array of item IDs (e.g., ["T4_MAIN_SWORD", "T4_MAIN_SWORD@1"])
 * @param locations - Array of city names to query
 * @param qualities - Array of quality levels (1-5)
 * @param region    - Server region to query
 * @returns Array of MarketPrice entries, or empty array on failure
 */
export async function fetchPrices(
  itemIds: string[],
  locations: CityName[],
  qualities: number[],
  region: ServerRegion
): Promise<MarketPrice[]> {
  if (itemIds.length === 0 || locations.length === 0) return []

  const baseUrl = getApiBaseUrl(region)
  const ids = itemIds.join(',')
  const locs = locations.join(',')
  const qs = qualities.join(',')

  const url = `${baseUrl}/api/v2/stats/prices/${ids}.json?locations=${locs}&qualities=${qs}`

  try {
    const response = await rateLimitedFetch(url)

    if (!response.ok) {
      console.error(
        `[api] fetchPrices failed: ${response.status} ${response.statusText}`
      )
      return []
    }

    const data: MarketPrice[] = await response.json()
    return data
  } catch (error) {
    console.error('[api] fetchPrices error:', error)
    return []
  }
}

/**
 * Fetches price history for the given items and locations.
 *
 * Calls: GET /api/v2/stats/history/{itemIds}.json?locations={locations}&time-scale={timeScale}
 *
 * @param itemIds   - Array of item IDs
 * @param locations - Array of city names to query
 * @param region    - Server region to query
 * @param timeScale - Time scale in hours (default: 6). Controls granularity of data points.
 * @returns Array of PriceHistory entries, or empty array on failure
 */
export async function fetchPriceHistory(
  itemIds: string[],
  locations: CityName[],
  region: ServerRegion,
  timeScale: number = 6
): Promise<PriceHistory[]> {
  if (itemIds.length === 0 || locations.length === 0) return []

  const baseUrl = getApiBaseUrl(region)
  const ids = itemIds.join(',')
  const locs = locations.join(',')

  const url = `${baseUrl}/api/v2/stats/history/${ids}.json?locations=${locs}&time-scale=${timeScale}`

  try {
    const response = await rateLimitedFetch(url)

    if (!response.ok) {
      console.error(
        `[api] fetchPriceHistory failed: ${response.status} ${response.statusText}`
      )
      return []
    }

    const data: PriceHistory[] = await response.json()
    return data
  } catch (error) {
    console.error('[api] fetchPriceHistory error:', error)
    return []
  }
}
