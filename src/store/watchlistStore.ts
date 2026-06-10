import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WatchlistItem {
  itemId: string
  enchantment: number
  quality: number
  addedAt: number
  notes?: string
}

interface WatchlistState {
  items: WatchlistItem[]
  addItem: (item: WatchlistItem) => void
  removeItem: (itemId: string, enchantment: number, quality: number) => void
  isWatched: (itemId: string, enchantment: number, quality: number) => boolean
  clearAll: () => void
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const alreadyExists = state.items.some(
            (i) =>
              i.itemId === item.itemId &&
              i.enchantment === item.enchantment &&
              i.quality === item.quality
          )
          if (alreadyExists) return state
          return { items: [...state.items, item] }
        }),
      removeItem: (itemId, enchantment, quality) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.itemId === itemId &&
                i.enchantment === enchantment &&
                i.quality === quality
              )
          ),
        })),
      isWatched: (itemId, enchantment, quality) =>
        get().items.some(
          (i) =>
            i.itemId === itemId &&
            i.enchantment === enchantment &&
            i.quality === quality
        ),
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'albion-watchlist',
    }
  )
)
