import type { CityName, ServerRegion } from '@/types/market'

export const CITIES: CityName[] = [
  'Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock',
  'Thetford', 'Caerleon', 'Brecilien', 'Black Market'
]

export const ROYAL_CITIES: CityName[] = [
  'Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock', 'Thetford'
]

export const TIERS = [4, 5, 6, 7, 8] as const
export const ENCHANTMENTS = [0, 1, 2, 3, 4] as const
export const QUALITIES = [1, 2, 3, 4, 5] as const

export const QUALITY_NAMES: Record<number, string> = {
  1: 'Normal', 2: 'Good', 3: 'Outstanding', 4: 'Excellent', 5: 'Masterpiece'
}

export const CITY_COLORS: Record<CityName, string> = {
  'Fort Sterling': '#7dd3fc',
  'Lymhurst': '#4ade80',
  'Bridgewatch': '#fb923c',
  'Martlock': '#a8a29e',
  'Thetford': '#c084fc',
  'Caerleon': '#f87171',
  'Brecilien': '#22c55e',
  'Black Market': '#fbbf24',
}

export const SERVER_URLS: Record<ServerRegion, string> = {
  europe: 'https://europe.albion-online-data.com',
  americas: 'https://west.albion-online-data.com',
  asia: 'https://east.albion-online-data.com',
}

export const SETUP_FEE_RATE = 0.025 // 2.5%
export const PREMIUM_TAX_RATE = 0.04 // 4%
export const NON_PREMIUM_TAX_RATE = 0.08 // 8%

export const ITEM_IMAGE_BASE = 'https://render.albiononline.com/v1/item'

// Null date from API indicating no data
export const NULL_DATE = '0001-01-01T00:00:00'

export const RATE_LIMIT_PER_SEC = 2.5 // Safe for both 180/min AND 300/5min
