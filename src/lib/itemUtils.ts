import { ITEM_IMAGE_BASE } from '@/lib/constants'

/**
 * Parses a full item ID into its base ID and enchantment level.
 * e.g., "T4_MAIN_SWORD@2" -> { baseId: "T4_MAIN_SWORD", enchantment: 2 }
 *       "T4_MAIN_SWORD"   -> { baseId: "T4_MAIN_SWORD", enchantment: 0 }
 */
export function parseItemId(fullId: string): {
  baseId: string
  enchantment: number
} {
  const atIndex = fullId.indexOf('@')
  if (atIndex === -1) {
    return { baseId: fullId, enchantment: 0 }
  }
  return {
    baseId: fullId.substring(0, atIndex),
    enchantment: parseInt(fullId.substring(atIndex + 1), 10) || 0,
  }
}

/**
 * Builds a full item ID from a base ID and enchantment level.
 * e.g., ("T4_MAIN_SWORD", 2) -> "T4_MAIN_SWORD@2"
 *       ("T4_MAIN_SWORD", 0) -> "T4_MAIN_SWORD"
 */
export function buildItemId(baseId: string, enchantment: number): string {
  return enchantment > 0 ? `${baseId}@${enchantment}` : baseId
}

/**
 * Extracts the tier number from an item ID.
 * e.g., "T4_MAIN_SWORD@2" -> 4
 */
export function getItemTier(itemId: string): number {
  const match = itemId.match(/^T(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

/**
 * Returns the Albion Online render URL for an item image.
 * e.g., "https://render.albiononline.com/v1/item/T4_MAIN_SWORD@2.png?count=1&quality=2"
 */
export function getItemImageUrl(itemId: string, quality: number = 1): string {
  return `${ITEM_IMAGE_BASE}/${itemId}.png?count=1&quality=${quality}`
}

/**
 * Generates all enchanted variants of a base item ID up to maxEnchantment.
 * e.g., ("T4_MAIN_SWORD", 3) -> ["T4_MAIN_SWORD", "T4_MAIN_SWORD@1", "T4_MAIN_SWORD@2", "T4_MAIN_SWORD@3"]
 */
export function generateEnchantedVariants(
  baseId: string,
  maxEnchantment: number
): string[] {
  const variants: string[] = [baseId]
  for (let e = 1; e <= maxEnchantment; e++) {
    variants.push(`${baseId}@${e}`)
  }
  return variants
}
