import { defineStore } from 'pinia'
import { store as config } from '~/config/store'
import { productBySlug } from '~/data/products'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    slugs: [] as string[],
    hydrated: false,
  }),

  getters: {
    count: (state) => state.slugs.length,
    has: (state) => (slug: string) => state.slugs.includes(slug),
    products: (state) => state.slugs.map((s) => productBySlug(s)).filter((p) => !!p),
  },

  actions: {
    /** Returns true when the product is now in the wishlist. */
    toggle(slug: string): boolean {
      if (!this.hydrated) this.load()
      const on = !this.slugs.includes(slug)
      this.slugs = on ? [slug, ...this.slugs] : this.slugs.filter((s) => s !== slug)
      this.persist()
      return on
    },
    remove(slug: string) {
      this.slugs = this.slugs.filter((s) => s !== slug)
      this.persist()
    },
    clear() {
      this.slugs = []
      this.persist()
    },
    load() {
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem(config.storage.wishlistKey)
        const parsed = raw ? (JSON.parse(raw) as string[]) : []
        this.slugs = Array.isArray(parsed) ? parsed.filter((s) => productBySlug(s)) : []
      } catch {
        this.slugs = []
      }
      this.hydrated = true
    },
    persist() {
      if (!import.meta.client) return
      try {
        localStorage.setItem(config.storage.wishlistKey, JSON.stringify(this.slugs))
      } catch {
        /* ignore */
      }
    },
  },
})
