"""Compose the 1200x630 social preview (public/images/brand/og-image.png) from the logo and demo renders."""
import json
import os

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PUB = os.path.join(ROOT, "public")
cut = json.load(open(os.path.join(ROOT, "app", "data", "generated", "product-cutouts.json")))

W, H = 1200, 630
og = Image.new("RGB", (W, H), "#fbf7f1")
d = ImageDraw.Draw(og)

# tiles with products (multiply over pastel tints, like the site)
tiles = [("vaza-valna", "#fde4dc", (640, 40, 900, 590)), ("oktopod-osmi", "#ece4fb", (920, 40, 1160, 305)),
         ("klyuchodarzhatel-ime", "#fbefd2", (920, 325, 1160, 590))]
for slug, tint, (x0, y0, x1, y1) in tiles:
    tw, th = x1 - x0, y1 - y0
    src = Image.open(os.path.join(PUB, cut[slug]["src"].lstrip("/") + "-1200.webp")).convert("RGB")
    scale = max(tw / src.width, th / src.height) * (1.08 if slug == "vaza-valna" else 1.0)
    im = src.resize((round(src.width * scale), round(src.height * scale)), Image.LANCZOS)
    ox, oy = (im.width - tw) // 2, int((im.height - th) * 0.6)
    im = im.crop((ox, oy, ox + tw, oy + th))
    tile = ImageChops.multiply(im, Image.new("RGB", (tw, th), tint))
    mask = Image.new("L", (tw, th), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, tw - 1, th - 1), radius=34, fill=255)
    og.paste(tile, (x0, y0), mask)

logo = Image.open(os.path.join(PUB, "images/brand/imagoo-logo-960.png")).convert("RGBA")
lw = 300
logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
og.paste(logo, (60, 70), logo)

font = ImageFont.truetype(os.path.join(os.path.dirname(__file__), "fonts", "Unbounded.ttf"), 50)
body = ImageFont.truetype(os.path.join(os.path.dirname(__file__), "fonts", "Nunito.ttf"), 22)
y = 230
for line in ["Въображение,", "което влиза", "в ежедневието."]:
    d.text((60, y), line, font=font, fill="#23103f")
    y += 64
d.rounded_rectangle((60, y + 24, 560, y + 30), radius=3, fill="#ee6b62")
d.text((60, y + 50), "Декорации, играчки и подаръци с 3D печат", font=body, fill="#65597a")
og.save(os.path.join(PUB, "images/brand/og-image.png"), optimize=True)
print("ok")
