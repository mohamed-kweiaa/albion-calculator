import type { AlbionItem } from './items';
import type { CityName, QualityLevel } from './market';

export interface FlipResult {
  item: AlbionItem;
  /** Full item ID with enchantment suffix, e.g., "T4_MAIN_SWORD@1" */
  itemId: string;
  enchantment: number;
  quality: QualityLevel;
  buyCity: CityName;
  sellCity: CityName;
  buyPrice: number;
  sellPrice: number;
  /** ISO date string of the buy price data */
  buyDate: string;
  /** ISO date string of the sell price data */
  sellDate: string;
  profit: number;
  /** Profit margin as a percentage */
  profitMargin: number;
  totalBuyCost: number;
  totalSellIncome: number;
  /** Estimated profit per hour, null if not calculable */
  profitPerHour: number | null;
  transportRisk: 'safe' | 'moderate' | 'high';
}

export interface FlipHistoryEntry {
  id: string;
  itemId: string;
  itemName: string;
  buyCity: CityName;
  sellCity: CityName;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  profit: number;
  totalProfit: number;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  notes?: string;
}

export interface ScanPreset {
  id: string;
  name: string;
  description?: string;
  buyCities: CityName[];
  sellCities: CityName[];
  tiers: number[];
  enchantments: number[];
  qualities: QualityLevel[];
  minProfit: number;
  minMargin: number;
  itemCategory: 'equipment' | 'resource' | 'other';
  isBuiltIn: boolean;
}

export interface ScanProgress {
  total: number;
  scanned: number;
  found: number;
  status: 'idle' | 'scanning' | 'complete' | 'cancelled';
  startTime: number | null;
  estimatedEndTime: number | null;
}
