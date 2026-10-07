# Asset sources

Last updated: 2026-10-07

## Status legend

| Status | Meaning |
| --- | --- |
| **DEMO** | Created for the prototype. Must not be presented as a photo of a real, manufactured product. |
| **APPROVED** | Cleared for commercial use at launch (none yet). |

## Brand

| Asset | Path | Source | Status |
| --- | --- | --- | --- |
| imagoo logo (colour) | `public/images/brand/imagoo-logo-{480,960}.{webp,png}` | Original artwork supplied by the owner (`37d968fd-…png`). The white background was removed and the canvas trimmed. Shapes and proportions are unchanged. | Owner-supplied |
| imagoo logo (light) | `public/images/brand/imagoo-logo-light-*.webp` | Derived from the logo above: the purple ink is recoloured to warm white for dark backgrounds, and the coral loop is unchanged. | Owner-supplied (derived) |
| Favicon / touch icon / mark | `public/favicon.png`, `public/apple-touch-icon.png`, `public/images/brand/mark-512.png` | Crop of the „oo“ loop from the original logo. | Owner-supplied (derived) |
| Social preview | `public/images/brand/og-image.png` | Composed from the logo and the demo renders below. | DEMO |

## Product imagery: all DEMO

Every product image in `public/images/products/**` is a **procedural 3D concept render** made for this prototype:

- Geometry is generated in code: `tools/render/products.py`, built on trimesh and shapely.
- Rendering uses the open-source Mitsuba 3 renderer in one shared virtual studio (`tools/render/lib.py`).
- The text in the personalised renders uses **Nunito** and the display font **Unbounded**. Both are under the SIL Open Font License (Google Fonts) and stored in `tools/render/fonts/`.
- **Exception: community designs.** Twelve products (see `app/data/products-community.ts`) are renders of third-party model files licensed CC0, CC BY or CC BY-SA. The files were downloaded from Printables and Thingiverse on 2026-10-07 with the owner's approval and are stored in `tools/render/community/`; they are not published. The designer is credited on each product page. No third-party photos are used.
- Nothing was downloaded from MakerWorld, because downloads there require a login.

Images are concept visualisations, and the site says so on every product page. Before launch, replace them with photos of the actual printed products, or keep renders but clearly label them as visualisations.

Regenerate the images with:

```bash
python3 -m venv .venv && .venv/bin/pip install mitsuba trimesh shapely scipy numpy pillow matplotlib mapbox_earcut manifold3d
cd tools/render
../../.venv/bin/python render_all.py            # studio shots: all variants + side/top views
../../.venv/bin/python render_white.py          # white-ground cut-outs for tinted tiles
```

## MakerWorld (inspiration only)

The product types in the catalogue (twisted vases, articulated dragon and octopus, flexi fish, bag clips, gear fidget, cable clips, headphone stand, name keychains) are common genres on MakerWorld and other model platforms. **No MakerWorld images or model files are used.**

These findings were checked on 2026-10-07. MakerWorld's official terms page returned HTTP 403, so they come from secondary sources:

- Models under MakerWorld's **Standard Digital File License** may **not** be sold as physical prints. Source: forum.bambulab.com/t/understanding-makerworlds-standard-digital-file-license/257609
- Creative Commons licences without **NC** allow commercial use of prints, subject to attribution. Any NC variant forbids it.
- Some creators sell a **Commercial License Membership** that allows selling prints (blog.bambulab.com).
- No source confirmed that a seller may reuse a designer's photos. Assume they **cannot** without the designer's written permission.

### Second-wave genre references (checked 2026-10-07, inspiration only)

The second wave of demo products was designed from scratch. It was inspired by **genres** that were popular in MakerWorld search results on the date below. No geometry, images or text were copied.

| Imagoo demo product | MakerWorld genre seen | Search used |
| --- | --- | --- |
| Комплект „Паста“ | Pasta playsets ("Pasta Playset: Pasta Box, Noodles, Bowl & Funny Fork", "Fidget Toy Pasta Fusilli") | makerworld.com/en/search/models?keyword=pasta%20toy%20set |
| Комплект „Бургер“, „Чаен комплект“, „Магически отвари“ | Pretend-play sets (burger meal sets, teapot & teacup sets, potion play sets) | …?keyword=toy%20set%20kids |
| Скулптура „Безкрайност“, Слон „Полигон“ | Abstract and low-poly sculptures ("Infinite Flow", low-poly elephant statues) | …?keyword=home%20decor%20sculpture |
| Тиква „Ребро“ | Fine-rib autumn pumpkins | …?keyword=home%20decor%20sculpture |
| Ключодържател „Герой с име“, Обемни букви, Табела „Семейство“, Медальон за любимец, Коледна играчка с име | Customisable name keychains, name signs and tags | …?keyword=personalized%20name |
| Голям дракон, писта за топчета, шах | Articulated dragons, marble runs, chess sets (common genres) | general browsing |

If Imagoo later prints a **specific** MakerWorld model instead of an in-house design, record the model URL, the designer and the licence. Also record proof of commercial rights, for example a non-NC Creative Commons licence or a Commercial License Membership.

### The owner's own keychain projects (not used)

The owner's existing multi-colour character keychains on the Desktop (lion, bunny, car, astronaut and others) were **not** used for the storefront. They contain customer names from real orders. Using them needs the owner's explicit decision, and the names should be replaced with demo names before publishing.

**Before launch, for every real product:** record the model source, its licence (or proof that the model is an in-house design), and confirmation that it may be printed and sold. The photo source must also be recorded. Do not imply that Imagoo designed a model it did not design.

## Fonts (website)

| Font | Package | Licence |
| --- | --- | --- |
| Unbounded (variable) | `@fontsource-variable/unbounded` | SIL OFL 1.1 |
| Onest (variable) | `@fontsource-variable/onest` | SIL OFL 1.1 |

Both fonts are self-hosted through the npm packages, so no requests go to Google.
