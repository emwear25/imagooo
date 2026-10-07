import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { store as config } from '~/config/store'

/**
 * Read cart & wishlist from localStorage only after hydration has fully finished
 * (`onNuxtReady`), so the server HTML and the first client render match. Loading on
 * `app:mounted` is too early: page components inside <Suspense> may still be hydrating.
 * Also keeps several open tabs in sync.
 */
export default defineNuxtPlugin(() => {
  const cart = useCartStore()
  const wishlist = useWishlistStore()

  onNuxtReady(() => {
    cart.load()
    wishlist.load()
  })

  window.addEventListener('storage', (e) => {
    if (e.key === config.storage.cartKey) cart.load()
    if (e.key === config.storage.wishlistKey) wishlist.load()
  })
})
