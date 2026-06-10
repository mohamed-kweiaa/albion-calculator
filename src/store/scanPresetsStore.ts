import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ScanPreset } from '@/types/flip'
import type { CityName, QualityLevel } from '@/types/market'

const ROYAL_CITIES: CityName[] = [
  'Fort Sterling',
  'Lymhurst',
  'Bridgewatch',
  'Martlock',
  'Thetford',
]

const ALL_CITIES: CityName[] = [
  ...ROYAL_CITIES,
  'Caerleon',
  'Brecilien',
  'Black Market',
]

const builtInPresets: ScanPreset[] = [
  {
    id: 'builtin-black-market-sniper',
    name: 'Black Market Sniper',
    description: 'Equipment only, all cities vs Black Market, all tiers/enchantments/qualities',
    buyCities: [...ROYAL_CITIES, 'Brecilien'],
    sellCities: ['Black Market'],
    tiers: [4, 5, 6, 7, 8],
    enchantments: [0, 1, 2, 3, 4],
    qualities: [1, 2, 3, 4, 5] as QualityLevel[],
    minProfit: 5000,
    minMargin: 5,
    itemCategory: 'equipment',
    isBuiltIn: true,
  },
  {
    id: 'builtin-city-trader',
    name: 'City Trader',
    description: 'All categories, royal cities only, T4-T8, broad quality range',
    buyCities: [...ROYAL_CITIES],
    sellCities: [...ROYAL_CITIES],
    tiers: [4, 5, 6, 7, 8],
    enchantments: [0, 1, 2, 3, 4],
    qualities: [1, 2, 3, 4, 5] as QualityLevel[],
    minProfit: 2000,
    minMargin: 3,
    itemCategory: 'other',
    isBuiltIn: true,
  },
  {
    id: 'builtin-budget-flipper',
    name: 'Budget Flipper',
    description: 'All categories, royal cities, T4-T5 only, low enchantments',
    buyCities: [...ROYAL_CITIES],
    sellCities: [...ROYAL_CITIES],
    tiers: [4, 5],
    enchantments: [0, 1, 2],
    qualities: [1, 2, 3] as QualityLevel[],
    minProfit: 500,
    minMargin: 5,
    itemCategory: 'other',
    isBuiltIn: true,
  },
  {
    id: 'builtin-whale-flips',
    name: 'Whale Flips',
    description: 'Equipment only, all cities, T7-T8 only, high enchantments and quality',
    buyCities: [...ALL_CITIES],
    sellCities: [...ALL_CITIES],
    tiers: [7, 8],
    enchantments: [2, 3, 4],
    qualities: [3, 4, 5] as QualityLevel[],
    minProfit: 50000,
    minMargin: 8,
    itemCategory: 'equipment',
    isBuiltIn: true,
  },
]

interface ScanPresetsState {
  presets: ScanPreset[]
  activePresetId: string | null
  addPreset: (preset: Omit<ScanPreset, 'id' | 'isBuiltIn'>) => void
  removePreset: (id: string) => void
  setActivePreset: (id: string | null) => void
  getActivePreset: () => ScanPreset | null
}

export const useScanPresetsStore = create<ScanPresetsState>()(
  persist(
    (set, get) => ({
      presets: [...builtInPresets],
      activePresetId: null,
      addPreset: (preset) =>
        set((state) => ({
          presets: [
            ...state.presets,
            {
              ...preset,
              id: crypto.randomUUID(),
              isBuiltIn: false,
            },
          ],
        })),
      removePreset: (id) =>
        set((state) => {
          const preset = state.presets.find((p) => p.id === id)
          if (!preset || preset.isBuiltIn) return state
          return {
            presets: state.presets.filter((p) => p.id !== id),
            activePresetId:
              state.activePresetId === id ? null : state.activePresetId,
          }
        }),
      setActivePreset: (id) => set({ activePresetId: id }),
      getActivePreset: () => {
        const { presets, activePresetId } = get()
        if (!activePresetId) return null
        return presets.find((p) => p.id === activePresetId) ?? null
      },
    }),
    {
      name: 'albion-scan-presets',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ScanPresetsState>
        const userPresets = (persisted.presets ?? []).filter(
          (p) => !p.isBuiltIn
        )
        return {
          ...currentState,
          ...persisted,
          presets: [...builtInPresets, ...userPresets],
        }
      },
    }
  )
)
