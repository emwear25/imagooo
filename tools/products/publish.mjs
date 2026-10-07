/**
 * Publish one Imagoo product to the shared backend (store "imagoo").
 *
 *   ADMIN_USERNAME=… ADMIN_PASSWORD=… node tools/products/publish.mjs <folder> [--apply]
 *
 * <folder> holds product.json and the photos (1.jpg, 2.jpg, … in display order).
 * Dry run by default. Creates missing categories, uploads the photos through
 * the API (they land in Cloudinary under imagoo/products) and creates the
 * product - or skips it when a product with that name already exists.
 * Credentials come from the environment only; nothing is stored.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, extname } from 'node:path'

const API = (process.env.API_BASE || 'https://api.emwear.bg').replace(/\/$/, '')
const STORE = 'imagoo'
const [folder] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const APPLY = process.argv.includes('--apply')
if (!folder) throw new Error('usage: node tools/products/publish.mjs <folder> [--apply]')

const product = JSON.parse(readFileSync(join(folder, 'product.json'), 'utf8'))
const photos = readdirSync(folder)
  .filter((f) => /^\d+\.(jpe?g|png|webp)$/i.test(f))
  .sort((a, b) => parseInt(a) - parseInt(b))
if (!photos.length) throw new Error(`no photos (1.jpg, 2.jpg, …) in ${folder}`)

const base = { 'X-Store': STORE }
async function api(path, { method = 'GET', token, json, form } = {}) {
  const headers = { ...base, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  if (json) headers['Content-Type'] = 'application/json'
  const r = await fetch(`${API}${path}`, { method, headers, body: json ? JSON.stringify(json) : form })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${body.message || ''} ${JSON.stringify(body.errors || '')}`)
  return body
}

console.log(`${APPLY ? 'PUBLISHING' : 'DRY RUN'} „${product.name}“ → ${API} (store ${STORE}), ${photos.length} photo(s)`)

const login = await api('/api/admin/auth/login', {
  method: 'POST',
  json: { email: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD },
})
const token = login.data.token

const { data: categories } = await api('/api/categories', { token })
async function ensureCategory({ slug, name }) {
  const found = categories.find((c) => c.slug === slug)
  if (found) return found
  console.log(`  + category ${slug} (${name})`)
  if (!APPLY) return { _id: null, slug }
  const { data } = await api('/api/categories', {
    method: 'POST',
    token,
    json: { name: slug, displayName: name, sizes: ['Стандартен'], defaultWeight: 0.5, defaultDimensions: { length: 30, width: 30, height: 15 } },
  })
  categories.push(data)
  return data
}

const main = await ensureCategory(product.category)
const also = []
for (const c of product.alsoInSlugs || []) also.push(await ensureCategory(c))

const { data: existing } = await api('/api/products?showAll=true&limit=500', { token })
if (existing.some((p) => p.name === product.name)) {
  console.log('  = product already exists - nothing to do')
  process.exit(0)
}

const form = new FormData()
form.append('name', product.name)
form.append('description', product.description)
form.append('price', String(product.price))
form.append('category', main.slug)
form.append('stock', String(product.stockPerColor))
form.append('sizes', JSON.stringify(product.sizes))
form.append('colors', JSON.stringify(product.colors))
form.append('storefront', JSON.stringify({ ...product.storefront, alsoIn: also.map((c) => c._id).filter(Boolean) }))
for (const f of photos) {
  const type = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[extname(f).toLowerCase()]
  form.append('images', new Blob([readFileSync(join(folder, f))], { type }), f)
}

if (!APPLY) {
  console.log(`  + product „${product.name}“: ${product.price} €, ${product.colors.length} colours, category ${main.slug}`)
  console.log('Dry run - re-run with --apply to publish.')
  process.exit(0)
}
const { data: created } = await api('/api/products', { method: 'POST', token, form })
console.log(`  ✓ created ${created.slug} (${created._id}) with ${created.images.length} photo(s)`)
console.log(`  https://imagoo.bg/produkti/${created.slug}`)
