import sys, os, traceback, time
from PIL import Image
from lib import render, VIEWS
from products import BUILDERS, VARIANTS
OUT = sys.argv[1]
only = sys.argv[2:] or list(BUILDERS)
os.makedirs(OUT, exist_ok=True)
tiles = []
for slug in only:
    try:
        t = time.time()
        b = BUILDERS[slug]
        vid, var = next(iter(VARIANTS[slug].items()))
        model = b(vid) if getattr(b, "per_variant", False) else b()
        fn = f"{OUT}/{slug}.png"
        from render_all import HERO
        from lib import VIEWS as V
        render(model, var, fn, size=(320, 400), spp=48, view=HERO.get(slug, V["hero"]))
        tiles.append((slug, fn)); print(slug, round(time.time() - t, 1), flush=True)
    except Exception:
        print("FAIL", slug); traceback.print_exc()
cols = 6
rows = (len(tiles) + cols - 1) // cols
sheet = Image.new("RGB", (cols * 320, rows * 400), "white")
for i, (s, fn) in enumerate(tiles):
    sheet.paste(Image.open(fn), ((i % cols) * 320, (i // cols) * 400))
sheet.save(f"{OUT}/_sheet.png")
