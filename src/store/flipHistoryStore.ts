import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FlipHistoryEntry } from '@/types/flip'

interface FlipHistoryState {
  entries: FlipHistoryEntry[]
  addEntry: (entry: Omit<FlipHistoryEntry, 'id' | 'timestamp'>) => void
  removeEntry: (id: string) => void
  clearAll: () => void
  getTotalProfit: () => number
}

export const useFlipHistoryStore = create<FlipHistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              ...entry,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),
      clearAll: () => set({ entries: [] }),
      getTotalProfit: () =>
        get().entries.reduce((sum, entry) => sum + entry.totalProfit, 0),
    }),
    {
      name: 'albion-flip-history',
    }
  )
)
