import { useCatalogStore } from '~/stores/catalog'

/** Load the catalogue once on the server; the client reuses the hydrated Pinia state. */
export default defineNuxtPlugin(async () => {
  const catalog = useCatalogStore()
  await callOnce('imagoo-catalog', () => catalog.load())
})
