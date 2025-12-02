import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
    mode: 'sidebar' | 'dock'
    favorites: string[] // array of hrefs
    toggleMode: () => void
    setMode: (mode: 'sidebar' | 'dock') => void
    toggleFavorite: (href: string) => void
    isFavorite: (href: string) => boolean
}

export const useNavigation = create<NavigationState>()(
    persist(
        (set, get) => ({
            mode: 'sidebar',
            favorites: ['/dashboard', '/projects', '/tasks', '/calendar'], // Default favorites
            toggleMode: () => set((state) => ({ mode: state.mode === 'sidebar' ? 'dock' : 'sidebar' })),
            setMode: (mode) => set({ mode }),
            toggleFavorite: (href) => set((state) => {
                const isFav = state.favorites.includes(href)
                return {
                    favorites: isFav
                        ? state.favorites.filter(h => h !== href)
                        : [...state.favorites, href]
                }
            }),
            isFavorite: (href) => get().favorites.includes(href)
        }),
        {
            name: 'navigation-storage',
        }
    )
)
