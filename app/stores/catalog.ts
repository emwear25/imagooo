import { defineStore } from 'pinia'
import type { Category, Product } from '~/types/catalog'
import { buildDemoCatalog, mapApiCatalog, type ApiProduct } from '~/utils/catalog-source'

/**
 * Catalogue loaded from the shared backend (store "imagoo").
 *
 * Falls back to the bundled demo catalogue only when the backend has no Imagoo
 * products yet or cannot be reached - the shop then stays browsable, but
 * checkout is disabled (`canOrder`), because demo products don't exist in the
 * backend.
 */
export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    products: [] as Product[],
    categories: [] as Category[],
    source: null as 'api' | 'demo' | null,
    loadedAt: 0,
  }),

  getters: {
    canOrder: (state) => state.source === 'api',
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
        if (catalog.products.length > 0) {
          this.products = catalog.products
          this.categories = catalog.categories
          this.source = 'api'
          this.loadedAt = Date.now()
          return
        }
        console.warn('[catalog] backend has no Imagoo products yet - showing the demo catalogue')
      } catch (error) {
        console.warn('[catalog] backend unreachable - showing the demo catalogue:', (error as Error).message)
      }
      const demo = buildDemoCatalog()
      this.products = demo.products
      this.categories = demo.categories
      this.source = 'demo'
      this.loadedAt = Date.now()
    },
  },
})
