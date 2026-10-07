"""White-ground ("cutout") hero renders for tinted tiles. usage: python render_white.py [slug ...]"""
import json
import os
import sys
import time

from PIL import Image

from lib import render
from products import BUILDERS, VARIANTS
from render_all import HERO, OUT, ROOT, SIZE, WIDTHS, VIEWS

MANIFEST = os.path.join(ROOT, "app", "data", "generated", "product-cutouts.json")


def main():
    slugs = sys.argv[1:] or list(BUILDERS)
    manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}
    for slug in slugs:
        t0 = time.time()
        vid, colors = next(iter(VARIANTS[slug].items()))
        d = os.path.join(OUT, slug)
        os.makedirs(d, exist_ok=True)
        tmp, white = os.path.join(d, "_tmp.png"), os.path.join(d, "_white.png")
        b = BUILDERS[slug]
        render(b(vid) if getattr(b, "per_variant", False) else b(), colors, tmp, view=HERO.get(slug, VIEWS["hero"]), size=SIZE, spp=224, white_png=white)
        im = Image.open(white).convert("RGB")
        for w in WIDTHS:
            im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(
                os.path.join(d, f"{vid}-cutout-{w}.webp"), quality=86, method=6)
        os.remove(tmp); os.remove(white)
        manifest[slug] = {"src": f"/images/products/{slug}/{vid}-cutout", "variantId": vid, "width": SIZE[0], "height": SIZE[1]}
        json.dump(manifest, open(MANIFEST, "w"), indent=1)
        print(f"{slug}: {time.time() - t0:.1f}s", flush=True)


if __name__ == "__main__":
    main()
