/**
 * Publish one Imagoo product to the shared backend (store "imagoo").
 *
 *   ADMIN_USERNAME=… ADMIN_PASSWORD=… node tools/products/publish.mjs <folder> [--apply] [--update]
 *
 * <folder> holds:
 *   product.json          name, price, colours, description, storefront details
 *   1.jpg, 2.jpg, …       main gallery, in display order
 *   colors/<slug>/1.jpg…  optional photos per colour; the colour entry in
 *                         product.json names its folder with "photos": "<slug>"
 *
 * Dry run by default. Creates missing categories, uploads photos through the
 * API (Cloudinary, imagoo/products) and creates the product. With --update an
 * existing product (same name) is updated instead: details, colours and
 * colour photos; its main gallery is kept unless new main photos are given.
 * Credentials come from the environment only; nothing is stored.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, extname } from 'node:path'

const API = (process.env.API_BASE || 'https://api.emwear.bg').replace(/\/$/, '')
const STORE = 'imagoo'
const [folder] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const APPLY = process.argv.includes('--apply')
const UPDATE = process.argv.includes('--update')
if (!folder) throw new Error('usage: node tools/products/publish.mjs <folder> [--apply] [--update]')

const product = JSON.parse(readFileSync(join(folder, 'product.json'), 'utf8'))
const photosIn = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => /^\d+\.(jpe?g|png|webp)$/i.test(f))
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((f) => join(dir, f))
    : []
const mainPhotos = photosIn(folder)
const colourPhotos = product.colors.map((c) => ({ color: c.name, files: c.photos ? photosIn(join(folder, 'colors', c.photos)) : [] }))

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }
const blob = (file) => new Blob([readFileSync(file)], { type: MIME[extname(file).toLowerCase()] })

async function api(path, { method = 'GET', token, json, form } = {}) {
  const headers = { 'X-Store': STORE, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  if (json) headers['Content-Type'] = 'application/json'
  const r = await fetch(`${API}${path}`, { method, headers, body: json ? JSON.stringify(json) : form })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${body.message || ''} ${JSON.stringify(body.errors || '')}`)
  return body
}

console.log(`${APPLY ? 'PUBLISHING' : 'DRY RUN'} „${product.name}“ → ${API} (store ${STORE})`)
console.log(`  main photos: ${mainPhotos.length}; colour photos: ${colourPhotos.map((c) => `${c.color} ${c.files.length}`).join(', ')}`)

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

const { data: existingList } = await api('/api/products?showAll=true&limit=500', { token })
const existing = existingList.find((p) => p.name === product.name)
if (existing && !UPDATE) {
  console.log('  = product already exists - re-run with --update to update it')
  process.exit(0)
}
if (!existing && !mainPhotos.length) throw new Error(`no main photos (1.jpg, 2.jpg, …) in ${folder}`)

if (!APPLY) {
  console.log(`  ${existing ? '~ update' : '+ create'} „${product.name}“: ${product.price} €, ${product.colors.length} colours, category ${main.slug}`)
  console.log('Dry run - re-run with --apply.')
  process.exit(0)
}

// Colour photos are uploaded first and referenced by Cloudinary id
const colorImages = []
for (const { color, files } of colourPhotos) {
  if (!files.length) continue
  const images = []
  for (const file of files) {
    const form = new FormData()
    form.append('file', blob(file), file.split('/').pop())
    const { data } = await api('/api/uploads/product-image', { method: 'POST', token, form })
    images.push({ url: data.url, publicId: data.publicId })
  }
  colorImages.push({ color, images })
  console.log(`  ↑ ${color}: ${images.length} photo(s)`)
}
// On update, keep colour galleries that were not replaced this time
for (const entry of existing?.colorImages || []) {
  if (!colorImages.some((c) => c.color === entry.color) && product.colors.some((c) => c.name === entry.color)) {
    colorImages.push({ color: entry.color, images: entry.images.map(({ url, publicId }) => ({ url, publicId })) })
  }
}

const form = new FormData()
form.append('name', product.name)
form.append('description', product.description)
form.append('price', String(product.price))
form.append('category', main.slug)
form.append('sizes', JSON.stringify(product.sizes))
form.append('colors', JSON.stringify(product.colors.map(({ name, hex }) => ({ name, hex }))))
form.append('colorImages', JSON.stringify(colorImages))
form.append('storefront', JSON.stringify({ ...product.storefront, alsoIn: also.map((c) => c._id).filter(Boolean) }))
if (!existing) form.append('stock', String(product.stockPerColor))
for (const f of mainPhotos) form.append('images', blob(f), f.split('/').pop())

if (existing) {
  if (mainPhotos.length) form.append('removedImageIds', JSON.stringify(existing.images.map((i) => i.publicId)))
  else form.append('keepExistingImages', 'true')
  const { data } = await api(`/api/products/${existing._id}`, { method: 'PUT', token, form })
  console.log(`  ✓ updated ${data.slug} (${data.images.length} main photo(s), ${data.colorImages?.length ?? 0} colour galleries)`)
  console.log(`  https://imagoo.bg/produkti/${data.slug}`)
} else {
  const { data } = await api('/api/products', { method: 'POST', token, form })
  console.log(`  ✓ created ${data.slug} (${data._id}) with ${data.images.length} photo(s), ${data.colorImages?.length ?? 0} colour galleries`)
  console.log(`  https://imagoo.bg/produkti/${data.slug}`)
}
