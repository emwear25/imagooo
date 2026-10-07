import { defineStore } from 'pinia'
import type { Category, Product } from '~/types/catalog'
import { mapApiCatalog, type ApiProduct } from '~/utils/catalog-source'

/**
 * Catalogue loaded from the shared backend (store "imagoo"). There is no
 * bundled catalogue: products and categories are managed in the dashboard.
 * When the backend cannot be reached the shop shows an empty catalogue and
 * checkout is disabled until it is back.
 */
export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    products: [] as Product[],
    categories: [] as Category[],
    /** 'api' = loaded; 'unavailable' = backend could not be reached */
    source: null as 'api' | 'unavailable' | null,
    loadedAt: 0,
  }),

  getters: {
    canOrder: (state) => state.source === 'api' && state.products.length > 0,
    bySlug: (state) => {
      const map = new Map(state.products.map((p) => [p.slug, p]))
      return (slug: string) => map.get(slug)
    },
    categoryBySlug: (state) => {
      const map = new Map(state.categories.map((c) => [c.slug, c]))
      return (slug: string) => map.get(slug)
    },
  },

  actions: {
    async load() {
      try {
        // Same-origin route with a short server cache (server/api/catalog.get.ts)
        const data = await $fetch<{ categories: Parameters<typeof mapApiCatalog>[0]; products: ApiProduct[] }>('/api/catalog')
        const catalog = mapApiCatalog(data.categories ?? [], data.products ?? [])
        this.products = catalog.products
        this.categories = catalog.categories
        this.source = 'api'
      } catch (error) {
        console.warn('[catalog] backend unreachable:', (error as Error).message)
        this.products = []
        this.categories = []
        this.source = 'unavailable'
      }
      this.loadedAt = Date.now()
    },
  },
})
