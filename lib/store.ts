import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  isFree: boolean;
  category: string;
  instructor: {
    id: string;
    name: string;
    avatar: string | null;
  };
  rating?: number;
  students?: number;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  isFree: boolean;
  price: number;
  memberCount: number;
  category: string;
}

interface AppState {
  // Cart
  cart: { type: 'COURSE' | 'COMMUNITY'; id: string }[];
  addToCart: (type: 'COURSE' | 'COMMUNITY', id: string) => void;
  removeFromCart: (type: 'COURSE' | 'COMMUNITY', id: string) => void;
  clearCart: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filters
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  priceFilter: 'all' | 'free' | 'paid';
  setPriceFilter: (filter: 'all' | 'free' | 'paid') => void;

  // UI State
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Cart
      cart: [],
      addToCart: (type, id) => {
        const currentCart = get().cart;
        const exists = currentCart.some((item) => item.type === type && item.id === id);
        if (!exists) {
          set({ cart: [...currentCart, { type, id }] });
        }
      },
      removeFromCart: (type, id) => {
        set({
          cart: get().cart.filter((item) => !(item.type === type && item.id === id)),
        });
      },
      clearCart: () => set({ cart: [] }),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Filters
      categoryFilter: 'all',
      setCategoryFilter: (category) => set({ categoryFilter: category }),
      priceFilter: 'all',
      setPriceFilter: (filter) => set({ priceFilter: filter }),

      // UI State
      isMobileMenuOpen: false,
      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }),
    {
      name: 'wayfinders-storage',
      partialize: (state) => ({
        cart: state.cart,
        categoryFilter: state.categoryFilter,
        priceFilter: state.priceFilter,
      }),
    }
  )
);
