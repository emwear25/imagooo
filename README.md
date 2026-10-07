# Imagoo — storefront prototype

This is the frontend prototype for **imagoo.bg**, a Bulgarian store for 3D-printed decorations, toys, personalised gifts and practical everyday objects.

> **Demo build.** No backend exists yet, and no real orders, payments or messages are processed. Indexing is blocked with `noindex`, `X-Robots-Tag` and `robots.txt`.

## Run

```bash
npm install
npm run dev          # http://localhost:3001 (emWear Client uses :3000)
npm run build && npm run preview
npm run typecheck
```

Nuxt 4.6 recommends Node 22/24 LTS. Node 25 works, but Nuxt prints a warning.

## Stack

- Nuxt 4, Vue 3, TypeScript (strict) and SCSS
- Pinia for cart, wishlist and UI state. Cart and wishlist persist to `localStorage` only after hydration, see `plugins/storage.client.ts`.
- Self-hosted Unbounded (display) and Onest (body) variable fonts, both with full Cyrillic. Headings use the Bulgarian Cyrillic letterforms through `lang="bg"`.
- No other runtime dependencies, no trackers and no cookies.

## Structure

```
app/
  config/store.ts          ← brand, site, currency, company, shipping settings (verified vs pending)
  types/catalog.ts         ← Product, Category, ColorVariant, CartLine models
  data/                    ← products, categories, filaments, FAQ, generated image manifests
  utils/                   ← price formatting, search/sort/filter helpers, text helpers, icons
  composables/             ← useSeo, useDialog (focus trap/Escape/scroll lock), useCatalogFilters (URL-synced)
  stores/                  ← cart, wishlist, ui (drawers, toasts)
  components/              ← UI building blocks (ProductCard, CatalogView, AppDrawer, …)
  pages/                   ← all routes (Bulgarian slugs)
tools/render/              ← Python + Mitsuba pipeline that generates every product image
docs/                      ← ASSET-SOURCES.md, LAUNCH-CHECKLIST.md
```

## Routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/produkti` | Catalogue: search, filters, sort. Query keys: `q`, `kategoriya`, `cena`, `cvyat`, `ime`, `sort`. |
| `/produkti/[slug]` | Product page. `?cvyat=` selects a variant; `?nadpis=` pre-fills the personalisation. |
| `/kategorii`, `/kategorii/[slug]` | Category overview and category page |
| `/lyubimi`, `/kolichka`, `/porachka` | Wishlist, cart, demo checkout |
| `/za-nas`, `/kontakti`, `/vuprosi` | About, contact, FAQ |
| `/dostavka-i-plashtane`, `/vrashtane-i-reklamacii`, `/obshti-usloviya`, `/poveritelnost`, `/biskvitki` | Policy drafts |

## Integrating a real backend later

The backend is the shared emWear/Imagoo server in `../server`. Read `../server/MULTI_STORE.md` first.
- `useApi()` (`app/composables/useApi.ts`) already sends `X-Store: imagoo`, so every request is scoped to Imagoo data.
- Set the API URL with `NUXT_PUBLIC_API_BASE` (see `.env.example`).
- Products and categories are managed in the shared dashboard after switching it to **Imagoo**.
- **Catalogue:**
  - Loaded through `server/api/catalog.get.ts`, which proxies the backend with a 60 s cache, into `stores/catalog.ts`.
  - `utils/catalog-source.ts` maps backend products to the storefront types.
  - Without backend products, the bundled demo catalogue (`app/data`) is shown and checkout is disabled.
- **Checkout:**
  - `/porachka` creates orders (cash on delivery) or a Stripe Checkout session (card).
  - Офис, автомат and address delivery are available with Еконт and Спиди, with live price estimates.
  - Stripe returns to `/porachka/uspeshna` or `/porachka/otkazana`.
- **Contact and newsletter:** the contact form and the footer newsletter post to the backend.
- **Demo catalogue import:** run `npx tsx tools/catalog/export.ts`, then `server/scripts/seed-imagoo-catalog.js`.

- **Catalogue:** replace `app/data/products.ts` with an API call that returns the same `Product` type. Filtering is pure, in `utils/catalog.ts` and `useCatalogFilters`, and can move server-side.
- **Cart:** `stores/cart.ts` is the single integration point. Lines are keyed by product, variant and personalisation.
- **Checkout:** `pages/porachka.vue` already validates and collects a typed form. Replace the demo `onSubmit` with an order API and a payment redirect.
- **Contact:** `pages/kontakti.vue` uses the same pattern.

Before launch, work through `docs/LAUNCH-CHECKLIST.md`.
