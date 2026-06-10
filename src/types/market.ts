/** Matches the Albion Data Project API v2 response for /api/v2/stats/prices */
export interface MarketPrice {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

/** Single data point in a price history response */
export interface PriceHistoryEntry {
  item_count: number;
  avg_price: number;
  timestamp: string;
}

/** Matches the Albion Data Project API v2 response for price history */
export interface PriceHistory {
  location: string;
  item_id: string;
  quality: number;
  data: PriceHistoryEntry[];
  timestamps: string[];
}

export type ServerRegion = 'europe' | 'americas' | 'asia';

export type QualityLevel = 1 | 2 | 3 | 4 | 5;

export type CityName =
  | 'Fort Sterling'
  | 'Lymhurst'
  | 'Bridgewatch'
  | 'Martlock'
  | 'Thetford'
  | 'Caerleon'
  | 'Brecilien'
  | 'Black Market';
