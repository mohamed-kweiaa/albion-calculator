import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ServerRegion } from '@/types/market'

interface SettingsState {
  theme: 'light' | 'dark'
  isPremium: boolean
  serverRegion: ServerRegion
  useLocalMarketData: boolean
  localApiUrl: string
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  togglePremium: () => void
  setServerRegion: (region: ServerRegion) => void
  toggleLocalMarketData: () => void
  setLocalApiUrl: (url: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      isPremium: true,
      serverRegion: 'europe',
      useLocalMarketData: false,
      localApiUrl: 'http://localhost:8787',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.classList.toggle('dark', newTheme === 'dark')
          return { theme: newTheme }
        }),
      setTheme: (theme) =>
        set(() => {
          document.documentElement.classList.toggle('dark', theme === 'dark')
          return { theme }
        }),
      togglePremium: () => set((state) => ({ isPremium: !state.isPremium })),
      setServerRegion: (region) => set({ serverRegion: region }),
      toggleLocalMarketData: () => set((state) => ({ useLocalMarketData: !state.useLocalMarketData })),
      setLocalApiUrl: (url) => set({ localApiUrl: url }),
    }),
    {
      name: 'albion-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.theme === 'dark')
        }
      },
    }
  )
)
