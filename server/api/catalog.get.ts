/**
 * Catalogue proxy with a short server-side cache.
 *
 * Every page render needs the whole Imagoo catalogue; caching it here (60 s)
 * keeps page loads fast and spares the shared backend. No stale-while-revalidate:
 * on Vercel the background refresh is cut off when the function freezes, which
 * left the old catalogue cached indefinitely. New products appear within a minute.
 */
export default defineCachedEventHandler(
  async () => {
    const { apiBase, storeId } = useRuntimeConfig().public
    const headers = { 'X-Store': storeId }
    const [categories, products] = await Promise.all([
      $fetch<{ data: unknown[] }>('/api/categories', { baseURL: apiBase, headers, query: { active: 'true' } }),
      $fetch<{ data: unknown[] }>('/api/products', { baseURL: apiBase, headers, query: { active: 'true', limit: 500, sortBy: 'newest' } }),
    ])
    return { categories: categories.data ?? [], products: products.data ?? [] }
  },
  { name: 'imagoo-catalog', maxAge: 60, swr: false },
)
