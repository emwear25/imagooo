# Launch checklist: what must be confirmed before going live

All values below live in `app/config/store.ts`. Anything left as `pending` renders as a visible „предстои“ placeholder on the site.

## 1. Company and contact details

Confirmed on 2026-10-07: Imagoo is operated by the same company as emWear. The details come from the emWear storefront (`../Client/pages/terms.vue`, `privacy-policy.vue`, `contact.vue`) and are shown on the site.

| Field | Value | Status |
| --- | --- | --- |
| Legal name | Хас 93 ЕООД | ✅ |
| ЕИК | 207849969 | ✅ |
| Address | гр. Варна, ул. „Арх. Георги Ганев“ 37, мол „Хасан Хасанов“ | ✅ |
| Phone | +359 89 092 7520 | ✅ (the emWear FAQ still shows +359 894 366 008, which is inconsistent) |
| Hours | Пон–Пет 9–18, Съб 10–14 | ✅ |
| Email | info@imagoo.bg | ⚠️ The mailbox must exist and the domain must be verified in AWS SES |
| VAT number | not published | ❓ Prices include VAT; add the number if it should be shown |
| Return address | not published | Sent to the customer on request (as emWear does) |

## 2. Commerce settings

- [ ] Couriers. EmWear uses Еконт and Спиди; confirm for Imagoo.
- [ ] Free-shipping threshold. EmWear uses €60; confirm whether it applies to Imagoo.
- [ ] Production and delivery times. Currently indicative: 2–4 working days, +1–2 for personalised items, 1–3 for delivery.
- [ ] Payment methods and provider. EmWear lists cash on delivery, Stripe cards and Apple Pay.
- [ ] Real prices, VAT treatment and the final catalogue.
- [x] Currency: EUR only.

## 3. Legal review (all legal pages are DRAFTS)

- [ ] Общи условия, Поверителност, Връщане и рекламации, Доставка и плащане: lawyer review.
- [ ] Right of withdrawal: confirm that the **чл. 57, т. 3 ЗЗП** exception (goods made to the consumer's specification) applies **only to genuinely personalised items** (name/text), not to standard catalogue items printed after an order. Also confirm how a colour choice from the standard palette is treated.
- [ ] Note that EmWear's FAQ says „всички продукти са персонализирани … връщане не е възможно“, which conflicts with its own terms. **Do not copy this to Imagoo.**
- [ ] Add the standard withdrawal form (образец за отказ).
- [ ] Out-of-court dispute resolution: EmWear still links the EU ODR platform, which **was discontinued in July 2025** (verify). Update the wording to cover КЗП / помирителни комисии.
- [ ] Legal guarantee of conformity (2 years) and the complaints procedure.
- [ ] Toys: safety requirements (EN 71 / CE), age labelling and warnings **before** selling the articulated figures as toys. Otherwise, market them as decorative or desk items for adults.
- [ ] Play sets (pasta, burger, tea set, potions, marble run): these are toys for children. They need EN 71 / CE assessment, age labelling and small-parts warnings before sale. The marble run's marbles are a choking hazard.
- [ ] LED lantern „Корона“: sell for LED tealights only and state this on the product and packaging. No electrical parts are included.
- [ ] Pet tag: wording on durability and safe use on collars.
- [ ] Food contact: no product currently claims suitability. Keep it that way unless the material and process are certified.
- [ ] Privacy: data processors (hosting, courier, payments, email), retention periods, DPO (if needed).
- [ ] Cookies: if analytics, payments or chat are added, update `/biskvitki` and implement a real consent mechanism **before** loading them.

## 4. Product rights and imagery

- [ ] For each product: in-house design, or a licence that permits commercial prints (see `docs/ASSET-SOURCES.md`).
- [ ] Replace the concept renders with photos of real products, or keep them clearly labelled as visualisations.
- [ ] Real dimensions, weights and materials per product.

## 5. Technical

- [ ] Set `site.isDemo = false`. This removes the demo banners and turns indexing on in `useSeo`.
- [ ] Remove the `X-Robots-Tag` rule in `nuxt.config.ts` and replace `public/robots.txt` with an allowing version plus a sitemap.
- [ ] Add structured data (Product/Offer) **only** with real prices and availability.
- [ ] Connect the catalogue, cart and checkout to the shared backend (`../server`). Use `useApi()` (`app/composables/useApi.ts`), which already sends `X-Store: imagoo`. Stripe returns to `/porachka/uspeshna` and `/porachka/otkazana`; both pages still need to be built. See `../server/MULTI_STORE.md`.
- [ ] Run the server migration once: `node migrations/multistore.js --apply`. Verify `info@imagoo.bg` in AWS SES.
- [ ] Connect the contact form to a mail service and add spam protection.
- [ ] Set up a courier office picker through the courier API.
- [ ] Use Node 22 or 24 LTS in production (Nuxt 4.6 warns on Node 25).
