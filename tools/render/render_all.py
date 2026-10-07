"""Render the Imagoo demo catalogue.

usage: python render_all.py [--quick] [slug ...]
Outputs WebP files to public/images/products/<slug>/ and writes
app/data/generated/product-images.json (consumed by the storefront).
"""
import json
import os
import sys
import time
from dataclasses import replace

from PIL import Image

from lib import VIEWS, View, render
from products import BUILDERS, VARIANTS

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "images", "products")
MANIFEST = os.path.join(ROOT, "app", "data", "generated", "product-images.json")
WIDTHS = (480, 800, 1200)
SIZE = (1200, 1500)

# camera tweaks so every product reads well in a 4:5 frame
HERO = {
    "kupa-listo": View(el=34, fill=0.86),
    "shtipki-zahapka": View(el=40, fill=0.88),
    "organizer-modul": View(el=46, fill=0.84),
    "stoyka-etazh": View(el=26, fill=0.86),
    "organizer-kapka": View(el=30, fill=0.84),
    "drakon-iskra": View(el=34, fill=0.9, az=-24),
    "oktopod-osmi": View(el=26, fill=0.86),
    "fidget-mehanizam": View(el=46, fill=0.88),
    "ribka-luna": View(el=44, fill=0.9),
    "klyuchodarzhatel-ime": View(el=46, fill=0.92, az=-10),
    "klyuchodarzhatel-bezkraynost": View(el=44, fill=0.9, az=-14),
    "zheton-kolichka": View(el=48, fill=0.88, az=-12),
    "klips-kabeli": View(el=40, fill=0.9),
    "organizer-terasa": View(el=28, fill=0.84),
    "kuki-stena": View(el=14, fill=0.84, az=-24),
    "tabelka-ime": View(el=14, fill=0.86, az=-10),
    "molivnik-ime": View(el=16, fill=0.78, az=-6),
    "stoyka-naklon": View(el=16, fill=0.8, az=-38),
    "komplekt-pasta": View(el=24, fill=0.9),
    "komplekt-burger": View(el=30, fill=0.92),
    "komplekt-otvari": View(el=22, fill=0.9),
    "chaen-komplekt": View(el=24, fill=0.9),
    "shah-prizma": View(el=40, fill=0.92),
    "drakon-vihar": View(el=38, fill=0.92, az=-24),
    "skulptura-bezkraynost": View(el=10, fill=0.82, az=-20),
    "ogranichiteli-arka": View(el=16, fill=0.86, az=-28),
    "pano-vulni": View(el=52, fill=0.86),
    "klyuchodarzhatel-geroi": View(el=48, fill=0.9, az=-8),
    "etiket-lyubimets": View(el=48, fill=0.9, az=-8),
    "koledna-igrachka-ime": View(el=12, fill=0.8, az=-8),
    "tabela-semeystvo": View(el=12, fill=0.84, az=-10),
    "obemni-bukvi": View(el=14, fill=0.92, az=-14),
    "drakon-kristal": View(el=50, fill=0.92, az=-18),
    "flexi-reks": View(el=58, fill=0.9, az=-12),
    "klyuchodarzhatel-skript": View(el=46, fill=0.92, az=-10),
    "medalion-sarce": View(el=46, fill=0.9, az=-10),
    "ornament-ime": View(el=10, fill=0.8, az=-6),
    "shah-heksagon": View(el=30, fill=0.92),
    "kutiya-pazel": View(el=32, fill=0.9),
    "pano-bonsai": View(el=8, fill=0.82, az=-14),
    "ogranichiteli-kristal": View(el=14, fill=0.88, az=-22),
}
SIDE = {
    "klyuchodarzhatel-ime": View(az=30, el=30, fill=0.95),
    "klyuchodarzhatel-bezkraynost": View(az=30, el=28, fill=0.92),
    "zheton-kolichka": View(az=30, el=30, fill=0.92),
    "ribka-luna": View(az=30, el=26, fill=0.92),
    "molivnik-ime": View(az=32, el=12, fill=0.74),
    "tabelka-ime": View(az=30, el=10, fill=0.82),
    "klyuchodarzhatel-geroi": View(az=30, el=30, fill=0.95),
    "etiket-lyubimets": View(az=30, el=30, fill=0.95),
    "klyuchodarzhatel-skript": View(az=30, el=30, fill=0.95),
    "medalion-sarce": View(az=30, el=30, fill=0.95),
    "flexi-reks": View(az=30, el=34, fill=0.92),
}


def views_for(slug, default_variant, variant):
    hero = HERO.get(slug, VIEWS["hero"])
    out = [("hero", hero)]
    if variant == default_variant:
        out.append(("side", SIDE.get(slug, VIEWS["side"])))
        out.append(("top", VIEWS["top"]))
    return out


def export(png, base):
    im = Image.open(png).convert("RGB")
    for w in WIDTHS:
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(f"{base}-{w}.webp", quality=84, method=6)
    os.remove(png)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    quick = "--quick" in sys.argv
    slugs = args or list(BUILDERS)
    manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}
    for slug in slugs:
        t0 = time.time()
        builder = BUILDERS[slug]
        variants = VARIANTS[slug]
        per_variant = getattr(builder, "per_variant", False)
        model = None if per_variant else builder()
        default = next(iter(variants))
        entry = {}
        for vid, colors in variants.items():
            imgs = []
            for vname, view in views_for(slug, default, vid):
                d = os.path.join(OUT, slug)
                os.makedirs(d, exist_ok=True)
                base = os.path.join(d, f"{vid}-{vname}")
                mdl = builder(vid) if per_variant else model
                render(mdl, colors, base + ".png", view=view, size=SIZE, spp=48 if quick else 224)
                export(base + ".png", base)
                imgs.append({"view": vname, "src": f"/images/products/{slug}/{vid}-{vname}",
                             "width": SIZE[0], "height": SIZE[1]})
            entry[vid] = imgs
        manifest[slug] = entry
        os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
        json.dump(manifest, open(MANIFEST, "w"), indent=1, ensure_ascii=False)
        print(f"{slug}: {time.time() - t0:.1f}s", flush=True)


if __name__ == "__main__":
    main()
