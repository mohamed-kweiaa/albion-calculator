export interface AlbionItem {
  /** Unique item identifier, e.g., "T4_MAIN_SWORD" */
  id: string;
  /** Display name, e.g., "Broadsword" */
  name: string;
  /** Item tier, 1-8 */
  tier: number;
  /** Available enchantment levels, e.g., [0, 1, 2, 3, 4] for equipment, [0, 1, 2, 3] for consumables */
  enchantments: number[];
  /** Maximum enchantment level (3 or 4) */
  maxEnchantment: number;
  /** Weapon type, armor slot, resource type, etc. */
  category: string;
}

export type ItemCategory = 'equipment' | 'resource' | 'other';

export interface ItemSearchResult {
  item: AlbionItem;
  category: ItemCategory;
}
