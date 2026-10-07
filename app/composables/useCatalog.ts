import { storeToRefs } from 'pinia'
import { useCatalogStore } from '~/stores/catalog'

/** Catalogue access for pages and components (data comes from the backend). */
export function useCatalog() {
  const store = useCatalogStore()
  const { products, categories } = storeToRefs(store)
  return {
    products,
    categories,
    productBySlug: (slug: string) => store.bySlug(slug),
    categoryBySlug: (slug: string) => store.categoryBySlug(slug),
    /** False while showing the demo catalogue (products that don't exist in the backend). */
    canOrder: computed(() => store.canOrder),
  }
}
