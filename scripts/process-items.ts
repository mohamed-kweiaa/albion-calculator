import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Types ---
interface ParsedLine {
  itemId: string;
  name: string;
}

interface ItemEntry {
  id: string;
  name: string;
  tier: number;
  enchantments: number[];
  maxEnchantment: number;
  category: string;
}

// --- Configuration ---
const INPUT_FILE = path.resolve(
  "C:/Users/Koya/.local/share/kilo/tool-output/tool_ea60b59ec0017BdoPhBdlsPSH7"
);
const OUTPUT_DIR = path.resolve(__dirname, "../src/data");

const EQUIPMENT_PATTERNS = [
  "MAIN_",
  "2H_",
  "HEAD_",
  "ARMOR_",
  "SHOES_",
  "OFF_",
  "CAPE",
  "BAG",
  "MOUNT_",
  "_TOOL_",
];

const RESOURCE_PATTERNS = [
  "_METALBAR",
  "_PLANKS",
  "_LEATHER",
  "_CLOTH",
  "_BAR",
  "_ORE",
  "_WOOD",
  "_HIDE",
  "_FIBER",
  "_ROCK",
  "_RUNE",
  "_SOUL",
  "_RELIC",
  "_SHARD",
  "_ARTEFACT",
];

const SKIP_PREFIXES = ["QUESTITEM_", "UNIQUE_"];

// --- Helpers ---

/**
 * Parse a single line from items.txt.
 * Format: `  123: T4_MAIN_SWORD                  : Broadsword`
 * The line number prefix from the tool output must also be handled.
 */
function parseLine(rawLine: string): ParsedLine | null {
  const trimmed = rawLine.trim();
  if (!trimmed) return null;

  // Match: optional line-number prefix, then index: ITEM_ID : Name
  // The data has format: `  123: ITEM_ID                          : Name`
  const match = trimmed.match(
    /^\d+:\s+([A-Za-z0-9_@]+)\s*(?::\s*(.*))?$/
  );
  if (!match) return null;

  const itemId = match[1].trim();
  const name = (match[2] || "").trim();

  return { itemId, name };
}

/**
 * Extract tier number from item ID (T1 through T8).
 * Returns 0 if no tier prefix found.
 */
function extractTier(itemId: string): number {
  const baseId = itemId.replace(/@\d+$/, "");
  const match = baseId.match(/^T(\d+)_/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Extract enchantment level from item ID.
 * Returns 0 if no @N suffix.
 */
function extractEnchantment(itemId: string): number {
  const match = itemId.match(/@(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Get the base item ID (without @N suffix).
 */
function getBaseId(itemId: string): string {
  return itemId.replace(/@\d+$/, "");
}

/**
 * Determine if an item should be skipped.
 */
function shouldSkip(itemId: string, name: string): boolean {
  // No name = non-tradable/internal
  if (!name) return true;

  const baseId = getBaseId(itemId);

  // Skip quest items and unique items
  for (const prefix of SKIP_PREFIXES) {
    if (baseId.startsWith(prefix)) return true;
  }

  // Skip non-tradable items
  if (baseId.includes("_NONTRADABLE")) return true;

  return false;
}

/**
 * Categorize an item based on its ID patterns.
 * Returns 'equipment', 'resource', or 'other'.
 */
function categorizeItem(baseId: string): "equipment" | "resource" | "other" {
  // Strip tier prefix for pattern matching
  const idWithoutTier = baseId.replace(/^T\d+_/, "");

  // Check equipment patterns
  for (const pattern of EQUIPMENT_PATTERNS) {
    if (idWithoutTier.includes(pattern) || idWithoutTier.startsWith(pattern.replace("_", ""))) {
      return "equipment";
    }
  }

  // Special check: items starting with CAPE or BAG without underscore prefix
  if (idWithoutTier.startsWith("CAPE") || idWithoutTier.startsWith("BAG")) {
    return "equipment";
  }

  // Check resource patterns - match against full baseId (with tier) to catch patterns like T4_METALBAR
  for (const pattern of RESOURCE_PATTERNS) {
    if (baseId.includes(pattern)) {
      return "resource";
    }
  }

  // Also check if the idWithoutTier starts with a resource keyword
  const resourceStarts = [
    "METALBAR",
    "PLANKS",
    "LEATHER",
    "CLOTH",
    "ORE",
    "WOOD",
    "HIDE",
    "FIBER",
    "ROCK",
    "STONEBLOCK",
    "ARTEFACT",
  ];
  for (const rs of resourceStarts) {
    if (idWithoutTier.startsWith(rs)) {
      return "resource";
    }
  }

  return "other";
}

/**
 * Derive a more specific category label for the output.
 */
function getCategoryLabel(baseId: string, generalCategory: string): string {
  const idWithoutTier = baseId.replace(/^T\d+_/, "");

  if (generalCategory === "equipment") {
    if (idWithoutTier.includes("MAIN_") || idWithoutTier.includes("2H_")) return "weapon";
    if (idWithoutTier.includes("HEAD_")) return "head";
    if (idWithoutTier.includes("ARMOR_")) return "armor";
    if (idWithoutTier.includes("SHOES_")) return "shoes";
    if (idWithoutTier.includes("OFF_")) return "offhand";
    if (idWithoutTier.startsWith("CAPE")) return "cape";
    if (idWithoutTier.startsWith("BAG")) return "bag";
    if (idWithoutTier.includes("MOUNT_")) return "mount";
    if (idWithoutTier.includes("_TOOL_") || idWithoutTier.includes("TOOL_")) return "tool";
    return "equipment";
  }

  if (generalCategory === "resource") {
    if (idWithoutTier.startsWith("ARTEFACT")) return "artefact";
    if (baseId.includes("_METALBAR") || idWithoutTier.startsWith("METALBAR")) return "refined";
    if (baseId.includes("_PLANKS") || idWithoutTier.startsWith("PLANKS")) return "refined";
    if (baseId.includes("_LEATHER") || idWithoutTier.startsWith("LEATHER")) return "refined";
    if (baseId.includes("_CLOTH") || idWithoutTier.startsWith("CLOTH")) return "refined";
    if (baseId.includes("_STONEBLOCK") || idWithoutTier.startsWith("STONEBLOCK")) return "refined";
    if (baseId.includes("_ORE") || idWithoutTier.startsWith("ORE")) return "raw";
    if (baseId.includes("_WOOD") || idWithoutTier.startsWith("WOOD")) return "raw";
    if (baseId.includes("_HIDE") || idWithoutTier.startsWith("HIDE")) return "raw";
    if (baseId.includes("_FIBER") || idWithoutTier.startsWith("FIBER")) return "raw";
    if (baseId.includes("_ROCK") || idWithoutTier.startsWith("ROCK")) return "raw";
    return "resource";
  }

  // Other category
  if (idWithoutTier.startsWith("POTION_")) return "potion";
  if (idWithoutTier.startsWith("MEAL_")) return "meal";
  if (idWithoutTier.startsWith("FURNITURE_")) return "furniture";
  if (idWithoutTier.startsWith("JOURNAL_")) return "journal";
  if (idWithoutTier.startsWith("FARM_")) return "farming";
  if (idWithoutTier.startsWith("FISH_")) return "fish";
  if (idWithoutTier.startsWith("SKILLBOOK_")) return "skillbook";
  return "other";
}

// --- Main Processing ---
function main() {
  console.log("Reading items file...");
  const raw = fs.readFileSync(INPUT_FILE, "utf-8");
  const lines = raw.split("\n");
  console.log(`Total lines in file: ${lines.length}`);

  // First pass: parse all lines and collect valid items
  const allParsed: { baseId: string; enchantment: number; name: string }[] = [];
  let skippedNoName = 0;
  let skippedPrefix = 0;
  let skippedNontradable = 0;
  let unparseable = 0;

  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) {
      unparseable++;
      continue;
    }

    const { itemId, name } = parsed;

    // Skip items with no name
    if (!name) {
      skippedNoName++;
      continue;
    }

    const baseId = getBaseId(itemId);

    // Skip quest items and unique items
    if (SKIP_PREFIXES.some((p) => baseId.startsWith(p))) {
      skippedPrefix++;
      continue;
    }

    // Skip non-tradable items
    if (baseId.includes("_NONTRADABLE")) {
      skippedNontradable++;
      continue;
    }

    const enchantment = extractEnchantment(itemId);
    allParsed.push({ baseId, enchantment, name });
  }

  console.log(`\nParsed ${allParsed.length} valid item entries`);
  console.log(`Skipped: ${skippedNoName} (no name), ${skippedPrefix} (QUESTITEM_/UNIQUE_), ${skippedNontradable} (NONTRADABLE), ${unparseable} (unparseable)`);

  // Second pass: group by base ID and collect enchantment levels
  const baseItemMap = new Map<
    string,
    { name: string; enchantments: Set<number> }
  >();

  for (const { baseId, enchantment, name } of allParsed) {
    if (!baseItemMap.has(baseId)) {
      baseItemMap.set(baseId, {
        name,
        enchantments: new Set([enchantment]),
      });
    } else {
      baseItemMap.get(baseId)!.enchantments.add(enchantment);
    }
  }

  console.log(`\nUnique base items (before tier filter): ${baseItemMap.size}`);

  // Third pass: build final items, filter by tier >= 2, categorize
  const equipmentItems: ItemEntry[] = [];
  const resourceItems: ItemEntry[] = [];
  const otherItems: ItemEntry[] = [];
  let skippedLowTier = 0;

  for (const [baseId, data] of baseItemMap) {
    const tier = extractTier(baseId);

    // Skip T1 and non-tiered items
    if (tier < 2) {
      skippedLowTier++;
      continue;
    }

    const enchantments = Array.from(data.enchantments).sort((a, b) => a - b);
    const maxEnchantment = Math.max(...enchantments);
    const generalCategory = categorizeItem(baseId);
    const category = getCategoryLabel(baseId, generalCategory);

    const entry: ItemEntry = {
      id: baseId,
      name: data.name,
      tier,
      enchantments,
      maxEnchantment,
      category,
    };

    switch (generalCategory) {
      case "equipment":
        equipmentItems.push(entry);
        break;
      case "resource":
        resourceItems.push(entry);
        break;
      default:
        otherItems.push(entry);
        break;
    }
  }

  console.log(`Skipped ${skippedLowTier} items with tier < 2`);

  // Sort each category by tier then by id
  const sortFn = (a: ItemEntry, b: ItemEntry) =>
    a.tier - b.tier || a.id.localeCompare(b.id);
  equipmentItems.sort(sortFn);
  resourceItems.sort(sortFn);
  otherItems.sort(sortFn);

  // Write output files
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const equipmentPath = path.join(OUTPUT_DIR, "equipment-items.json");
  const resourcePath = path.join(OUTPUT_DIR, "resource-items.json");
  const otherPath = path.join(OUTPUT_DIR, "other-items.json");

  fs.writeFileSync(equipmentPath, JSON.stringify(equipmentItems, null, 2));
  fs.writeFileSync(resourcePath, JSON.stringify(resourceItems, null, 2));
  fs.writeFileSync(otherPath, JSON.stringify(otherItems, null, 2));

  // Log stats
  console.log("\n=== Output Stats ===");
  console.log(`Equipment items: ${equipmentItems.length} → ${equipmentPath}`);
  console.log(`Resource items:  ${resourceItems.length} → ${resourcePath}`);
  console.log(`Other items:     ${otherItems.length} → ${otherPath}`);
  console.log(`Total output:    ${equipmentItems.length + resourceItems.length + otherItems.length} base items`);

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  for (const item of [...equipmentItems, ...resourceItems, ...otherItems]) {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  }
  console.log("\n=== Category Breakdown ===");
  for (const [cat, count] of Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`  ${cat}: ${count}`);
  }

  // Sample output
  console.log("\n=== Sample Items ===");
  console.log("Equipment:", JSON.stringify(equipmentItems[0], null, 2));
  console.log("Resource:", JSON.stringify(resourceItems[0], null, 2));
  console.log("Other:", JSON.stringify(otherItems[0], null, 2));
}

main();
