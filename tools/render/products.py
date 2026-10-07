"""Procedural concept models for the Imagoo demo catalogue (cm, Z-up, front = -Y)."""
from __future__ import annotations

import math

import numpy as np
import trimesh
from shapely.geometry import LineString, Polygon
from shapely import affinity
from shapely.ops import unary_union

from lib import (FILAMENT as F, Model, T, bevel_extrude, circle, cone, cylinder, ellipsoid, extrude,
                 gear_poly, rrect, text_poly, torus, tube, vessel, FONT_ROUND)

TAU = 2 * math.pi


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def side_extrude(poly_yz, width):
    """Extrude a profile drawn in (y, z) along X, centred on x=0."""
    m = extrude(poly_yz, width)
    M = np.array([[0, 0, 1, -width / 2], [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1]], float)
    m.apply_transform(M)
    return m


def front_extrude(poly_xz, depth, y0=0.0):
    """Extrude a profile drawn in (x, z) along -Y starting at y0 (towards the camera)."""
    m = extrude(poly_xz, depth)
    m.apply_transform(trimesh.transformations.rotation_matrix(math.pi / 2, [1, 0, 0]))
    m.apply_translation([0, y0, 0])
    return m


def split_ring(center, R=1.15, tilt=62, rz=0):
    return T(torus(R, 0.085, major=128, minor=16), rx=tilt, rz=rz, t=center)


def pencil(length=17, r=0.38, mat="pencil"):
    body = cylinder(r, length, center=(0, 0, length / 2), sections=6)
    wood = cone(r, 1.6, base=(0, 0, length))
    return [(body, mat, False), (wood, "lead", True), (cone(r * 0.32, 0.5, base=(0, 0, length + 1.1)), "ink", True)]


def add_pencils(model, items):
    for (pos, rx, ry, rz, mat, length) in items:
        for mesh, m, sm in pencil(length=length, mat=mat):
            model.add(T(mesh, rx=rx, ry=ry, rz=rz, t=pos), m, sm)


# ============================================================ Дом и декорация
def vaza_valna():
    H = 24.0

    def r(th, t):
        prof = 3.5 + 2.6 * np.exp(-((t - 0.33) / 0.27) ** 2) + 0.75 * smoothstep(0.82, 1.0, t)
        rib = 1 + 0.05 * np.cos(14 * (th + 1.5 * t))
        return prof * rib

    return Model().add(vessel(r, H, wall=0.28, base=0.4, nt=280, nz=180))


def kashpa_oblak():
    m = Model()
    H = 11.0

    def lobes(th):
        return 0.88 + 0.13 * np.abs(np.cos(3 * th)) ** 0.5

    def r(th, t):
        return (6.0 + 1.3 * t - 0.4 * t ** 2) * lobes(th)

    m.add([T(p, t=(0, 0, 0.45)) for p in vessel(r, H, wall=0.32, base=0.5, nt=240, nz=80)])

    def rs(th, t):
        return (6.6 + 0.6 * t) * lobes(th)

    m.add(vessel(rs, 1.3, wall=0.3, base=0.3, nt=240, nz=8))
    m.add(cylinder(5.2, 0.3, center=(0, 0, H - 1.0)), "soil")
    # succulent rosette (decoration, not included)
    z0 = H - 0.9
    for k in range(4):
        n = 9 - k
        for i in range(n):
            a = 360 * i / n + k * 19
            L = 3.4 - 0.62 * k
            leaf = ellipsoid(L, 1.15 - 0.15 * k, 0.5, sub=3)
            leaf = T(leaf, t=(L * 0.8, 0, 0))
            leaf = T(leaf, ry=-(18 + 17 * k), rz=a, t=(0, 0, z0 + 0.35 * k))
            m.add(leaf, "leaf" if (i + k) % 2 else "leaf2")
    return m


def vaza_prizma():
    def r(th, t):
        return 4.6 + 1.7 * np.sin(np.pi * (0.15 + 0.8 * t)) - 0.6 * t

    parts = vessel(r, 20.0, wall=0.3, base=0.4, nt=7, nz=7)
    # twist the vertices for a folded-paper look
    out = []
    for p in parts:
        v = p.vertices.copy()
        a = 0.85 * v[:, 2] / 20.0
        x, y = v[:, 0] * np.cos(a) - v[:, 1] * np.sin(a), v[:, 0] * np.sin(a) + v[:, 1] * np.cos(a)
        v[:, 0], v[:, 1] = x, y
        out.append(trimesh.Trimesh(v, p.faces, process=False))
    return Model().add(out, smooth=False)


def kupa_listo():
    a, b = 9.5, 6.2

    def r(th, t):
        ell = a * b / np.sqrt((b * np.cos(th)) ** 2 + (a * np.sin(th)) ** 2)
        pinch = 1 - 0.1 * np.abs(np.cos(th)) ** 12
        return ell * pinch * (0.84 + 0.16 * t ** 0.7)

    m = Model().add(vessel(r, 3.0, wall=0.35, base=0.45, nt=260, nz=40))
    m.add(split_ring((2.5, -0.8, 0.6), R=1.3, tilt=8), "metal")
    m.add(T(torus(1.0, 0.085, minor=16), rx=3, t=(-3.2, 1.2, 0.56)), "metal")
    return m


# ============================================================ Кухня и организация
def shtipki_zahapka():
    prof = unary_union([
        rrect(10.5, 0.62, 0.3, cx=5.0, cy=0.31),
        rrect(10.5, 0.62, 0.3, cx=5.0, cy=1.16),
        circle(0.9, -0.15, 0.735).difference(circle(0.5, -0.15, 0.735)),
    ]).difference(rrect(1.5, 0.16, 0.05, cx=0.6, cy=0.735))
    m = Model()
    mats = ["main", "c2", "c3", "c4"]
    for i, (dx, dy, rz) in enumerate([(-3.5, 2.5, 18), (-1.0, -1.2, 4), (1.5, 1.4, -12), (3.6, -3.4, -26)]):
        clip = side_extrude(affinity.rotate(prof, 0, origin=(0, 0)), 1.8)
        # profile drawn along Y, height in Z -> lies on its side like a real clip
        clip = T(clip, rz=90 + rz, t=(dx, dy, 0))
        m.add(clip, mats[i], smooth=True)
    return m


def tray(w, d, h, wall=0.25, base=0.3, r=1.0, cx=0.0, cy=0.0):
    outer = rrect(w, d, r, cx, cy)
    inner = rrect(w - 2 * wall, d - 2 * wall, max(r - wall, 0.05), cx, cy)
    return [bevel_extrude(outer.difference(inner), h, 0.12, steps=3), extrude(outer, base)]


def organizer_modul():
    m = Model()
    g = 0.15
    for (x0, y0, w, d) in [(0, 0, 8, 24), (8, 0, 16, 8), (8, 8, 8, 16), (16, 8, 8, 8), (16, 16, 8, 8)]:
        m.add(tray(w - g, d - g, 5.0, cx=x0 + w / 2 - 12, cy=y0 + d / 2 - 12))
    add_pencils(m, [((-9.3, -9.5, 0.75), -90, 0, 6, "pencil", 16), ((-7.4, -9.5, 0.75), -90, 0, -3, "pencil2", 15)])
    m.add(T(bevel_extrude(rrect(4.2, 2.2, 0.4), 1.2, 0.3), rz=20, t=(0, -4.5, 0.3)), "white")
    m.add(T(bevel_extrude(rrect(3, 3, 0.6), 0.9, 0.3), rz=-10, t=(8, 8, 0.3)), "c2")
    return m


def stoyka_etazh():
    prof = Polygon([(0, 0), (21, 0), (21, 9), (14, 9), (14, 6), (7, 6), (7, 3), (0, 3)])
    prof = prof.buffer(-0.25, join_style=1).buffer(0.25, join_style=1)
    prof = affinity.translate(prof, -10.5, 0)
    m = Model().add(side_extrude(prof, 30), smooth=True)
    for step, (y, z) in enumerate([(-7.0, 3.0), (0.0, 6.0), (7.0, 9.0)]):
        for k, x in enumerate([-8.0, 0.0, 8.0]):
            if (step + k) % 3 == 2:
                continue
            m.add(cylinder(2.5, 7.0, center=(x, y, z + 3.5)), "ceramic")
            m.add(cylinder(2.6, 1.3, center=(x, y, z + 7.65)), "wood")
    return m


def organizer_kapka():
    w, d, h = 17.0, 9.5, 8.0
    outer = rrect(w, d, 2.2)
    inner = rrect(w - 0.6, d - 0.6, 1.9)
    walls = bevel_extrude(outer.difference(inner).union(rrect(0.35, d - 0.4, 0.1, cx=2.6)), h, 0.14, steps=3)
    cut = T(cylinder(4.5, 6, sections=96), rx=90, t=(-2.8, -d / 2, h + 1.6))
    walls = walls.difference(cut, engine="manifold") if hasattr(walls, "difference") else walls
    base = outer
    for i in range(6):
        base = base.difference(rrect(0.5, 5.0, 0.25, cx=-6 + i * 2.2))
    m = Model().add(walls).add(extrude(base, 0.5))
    m.add(T(bevel_extrude(rrect(6.8, 4.4, 0.8), 2.4, 0.6), rz=-8, t=(-2.9, 0.6, 3.0)), "sponge")
    m.add(T(bevel_extrude(rrect(6.8, 4.4, 0.8), 0.8, 0.3), rz=-8, t=(-2.9, 0.6, 5.35)), "leaf")
    return m


# ============================================================ Играчки и забавление
def drakon_iskra():
    m = Model()
    t = np.linspace(0, 1, 15)
    xs = 10 - 21 * t
    ys = 3.4 * np.sin(t * TAU * 0.9 + 0.3)
    radii = 1.85 * (1 - 0.72 * t) + 0.25
    for i in range(1, 15):
        x, y, rr = xs[i], ys[i], radii[i]
        ang = math.degrees(math.atan2(ys[i] - ys[i - 1], xs[i] - xs[i - 1]))
        seg = ellipsoid(0.68, rr, rr * 0.82)
        m.add(T(seg, rz=ang, t=(x, y, rr * 0.82)))
        if i < 11:
            m.add(T(cone(rr * 0.4, rr * 0.85), t=(x, y, rr * 1.5)), "accent")
    m.add(T(extrude(Polygon([(0, 0), (1.6, 1.0), (1.6, -1.0)]).buffer(0.2), 0.3), rz=180 + ang, t=(xs[-1] - 0.3, ys[-1], 0.2)), "accent")
    # head
    hx, hy = xs[0] + 1.0, ys[0]
    m.add(ellipsoid(2.6, 2.1, 1.9, center=(hx, hy, 2.0)))
    m.add(ellipsoid(1.9, 1.4, 1.1, center=(hx + 2.1, hy - 0.4, 1.5)))
    for s in (-1, 1):
        m.add(T(cone(0.45, 2.1), ry=-55, t=(hx - 0.8, hy + s * 1.0, 3.3)), "accent")
        m.add(ellipsoid(0.42, 0.42, 0.42, center=(hx + 1.1, hy + s * 1.35, 2.75)), "white")
        m.add(ellipsoid(0.22, 0.22, 0.22, center=(hx + 1.4, hy + s * 1.55, 2.8)), "ink")
    # wings
    wing = Polygon([(0, 0), (2.5, 6.5), (4.0, 7.2), (4.4, 4.6), (6.0, 5.4), (5.6, 2.8), (7.2, 3.0), (5.2, 0)])
    wing = wing.buffer(0.35).buffer(-0.35)
    for s in (-1, 1):
        wp = affinity.translate(wing, -3, 0)
        if s < 0:
            wp = affinity.scale(wp, 1, -1, origin=(0, 0))
        wm = T(extrude(wp, 0.35), rx=s * 42)
        m.add(T(wm, t=(xs[3], ys[3] + s * 0.9, 2.9)), "accent")
    for idx in (2, 6):
        for s in (-1, 1):
            m.add(ellipsoid(0.7, 0.55, 0.45, center=(xs[idx], ys[idx] + s * radii[idx] * 1.05, 0.45)))
    return m


def oktopod_osmi():
    m = Model()
    m.add(ellipsoid(4.2, 4.0, 4.5, center=(0, 0, 6.6)))
    for s in (-1, 1):
        m.add(ellipsoid(0.9, 0.55, 1.0, center=(s * 1.6, -3.55, 7.0)), "white")
        m.add(ellipsoid(0.48, 0.35, 0.55, center=(s * 1.6, -4.0, 6.8)), "ink")
    m.add(ellipsoid(0.5, 0.3, 0.32, center=(0, -4.1, 5.4)), "accent")
    for k in range(8):
        th0 = TAU * k / 8 + TAU / 16
        n = 12
        for i in range(n):
            s = i / (n - 1)
            rad = 3.0 + 8.0 * s
            th = th0 + 0.55 * s ** 1.5
            z = 2.7 * (1 - s) ** 1.6 + 0.9 * (1 - s) + 0.75 * smoothstep(0.78, 1, s)
            rr = 1.25 * (1 - 0.62 * s)
            m.add(ellipsoid(rr, rr, rr * 0.9, center=(rad * math.cos(th), rad * math.sin(th), max(z, rr * 0.9))),
                  "main" if i % 3 else "accent")
    return m


def fidget_mehanizam():
    m = Model().add(bevel_extrude(rrect(16.5, 11.5, 2.2), 0.8, 0.25))
    gears = [(18, (-3.6, -0.8), "accent"), (10, (1.05, 0.9), "c3"), (14, (3.8, -2.4), "accent"), (8, (2.6, 3.65), "accent")]
    for i, (n, (x, y), mat) in enumerate(gears):
        g = gear_poly(n, 0.35, x, y, bore=0.32)
        g = affinity.rotate(g, (180 / n) * (i % 2), origin=(x, y))
        m.add(bevel_extrude(g, 0.75, 0.12, z0=0.95, steps=2), mat, smooth=False)
        m.add(cylinder(0.28, 2.1, center=(x, y, 1.0)), "c3")
        m.add(ellipsoid(0.45, 0.45, 0.25, center=(x, y, 2.05)), "c3")
    return m


def ribka_luna():
    body = unary_union([
        Polygon([(math.cos(a) * 8.2, math.sin(a) * 4.2 * (1 - 0.25 * math.cos(a))) for a in np.linspace(0, TAU, 120)]),
        Polygon([(6.6, 0), (11.5, 3.6), (10.6, 0), (11.5, -3.6)]).buffer(0.4).buffer(-0.2),
        Polygon([(-2, 3.6), (1.5, 5.6), (3.6, 3.4)]).buffer(0.3),
    ])
    m = Model()
    xs = np.linspace(-8.4, 12, 12)
    bend = lambda x: 0.035 * (x + 2) ** 2 * 0.4
    for i in range(len(xs) - 1):
        strip = body.intersection(Polygon([(xs[i] + 0.12, -8), (xs[i + 1] - 0.12, -8), (xs[i + 1] - 0.12, 8), (xs[i] + 0.12, 8)]))
        if strip.is_empty:
            continue
        cx = (xs[i] + xs[i + 1]) / 2
        seg = bevel_extrude(strip, 1.3, 0.45, steps=4)
        seg = T(seg, t=(-cx, 0, 0))
        seg = T(seg, rz=-math.degrees(math.atan(0.028 * (cx + 2) * 0.8)), t=(cx, bend(cx), 0))
        m.add(seg, "main" if i % 2 == 0 else "accent")
    m.add(ellipsoid(0.75, 0.75, 0.3, center=(-5.6, -1.2 + bend(-5.6), 1.35)), "white")
    m.add(ellipsoid(0.4, 0.4, 0.2, center=(-5.75, -1.25 + bend(-5.6), 1.6)), "ink")
    return m


# ============================================================ Аксесоари и ключодържатели
def klyuchodarzhatel_ime(name="Мила"):
    txt = text_poly(name, 3.3, FONT_ROUND)
    minx, miny, maxx, maxy = txt.bounds
    base = unary_union([txt.buffer(0.42, 32), circle(0.95, minx - 0.6, (miny + maxy) / 2 + 0.2)]).buffer(0.2).buffer(-0.2)
    hole = circle(0.38, minx - 0.6, (miny + maxy) / 2 + 0.2)
    base = Polygon(base.exterior).difference(hole) if base.geom_type == "Polygon" else base.difference(hole)
    m = Model().add(bevel_extrude(base, 0.42, 0.12, steps=2))
    m.add(bevel_extrude(txt, 0.28, 0.08, z0=0.42, steps=2), "text")
    m.add(split_ring((minx - 0.6 - 1.05, (miny + maxy) / 2 + 0.2, 0.42), R=1.25, tilt=14, rz=0), "metal")
    return m


def klyuchodarzhatel_bezkraynost():
    a = 3.0
    t = np.linspace(0, TAU, 400, endpoint=False)
    den = 1 + np.sin(t) ** 2
    x, y = a * np.cos(t) / den, a * np.sin(t) * np.cos(t) / den
    z = 0.3 * np.cos(t)
    pts = np.stack([x, y, z], -1)
    lift = 0.32 + 0.34
    m = Model()
    half = len(t) // 2
    m.add(T(tube(np.vstack([pts[:half + 1]]), 0.32, caps=False), t=(0, 0, lift)))
    m.add(T(tube(np.vstack([pts[half:], pts[:1]]), 0.32, caps=False), t=(0, 0, lift)), "accent")
    m.add(split_ring((a + 0.75, 0, 0.62), R=1.2, tilt=16), "metal")
    return m


def zheton_kolichka():
    m = Model()
    for i, (dx, dy, rz, mat) in enumerate([(-1.6, 0.6, 18, "main"), (1.9, -0.8, -24, "accent")]):
        coin = unary_union([circle(1.16, 0, 0, 96), rrect(1.4, 2.2, 0.6, cx=0, cy=1.4)])
        coin = coin.difference(circle(0.32, 0, 2.05))
        heart = unary_union([circle(0.36, -0.3, 0.16), circle(0.36, 0.3, 0.16), Polygon([(-0.64, 0.02), (0.64, 0.02), (0, -0.66)])]).buffer(0.05)
        part = Model().add(bevel_extrude(coin, 0.23, 0.06, steps=2)).add(bevel_extrude(heart, 0.07, 0.03, z0=0.23, steps=2))
        for p in part.parts:
            m.add(T(p.mesh, rz=rz, t=(dx, dy, 0)), mat)
    hx, hy = -1.6 - 2.05 * math.sin(math.radians(18)), 0.6 + 2.05 * math.cos(math.radians(18))
    m.add(split_ring((hx - 0.35, hy + 1.05, 0.3), R=1.15, tilt=10, rz=18), "metal")
    return m


# ============================================================ Практични решения
def stoyka_naklon():
    base = rrect(10.0, 0.9, 0.35, cx=0.5, cy=0.45)
    ang = math.radians(68)
    back = affinity.rotate(rrect(9.0, 0.9, 0.4, cx=4.5, cy=0), math.degrees(ang), origin=(0, 0))
    back = affinity.translate(back, 1.3, 0.6)
    lip = rrect(0.9, 2.0, 0.35, cx=-4.05, cy=1.0)
    prof = unary_union([base, back, lip]).buffer(0.35).buffer(-0.35)
    prof = prof.difference(rrect(1.4, 2.6, 0.5, cx=0.1, cy=0.2).buffer(0)) if False else prof
    m = Model().add(side_extrude(prof, 7.5))
    # phone resting on the stand (prop)
    tilt = 90 - 68 + 2
    ph = bevel_extrude(rrect(7.4, 15.6, 1.0), 0.8, 0.3)
    ph = T(ph, t=(0, 0, -0.8))
    scr = T(extrude(rrect(6.9, 15.0, 0.8), 0.02), t=(0, 0, 0.0))
    phone = Model().add(ph, "phone").add(scr, "screen")
    out = Model()
    for p in phone.parts:
        q = T(p.mesh, t=(0, 7.6, 0.2))
        q = T(q, rx=90 - tilt)  # stand it up, leaning back
        q = T(q, rz=180, t=(0, -2.1, 0.95))
        out.add(q, p.mat)
    return m.merge(out)


def klips_kabeli():
    m = Model()
    prof = rrect(6.2, 1.6, 0.5, cy=0.8)
    for x in (-1.8, 0, 1.8):
        prof = prof.difference(circle(0.36, x, 1.0)).difference(rrect(0.5, 1.2, 0.05, cx=x, cy=1.6))
    for cx, mat in ((-4.5, "main"), (4.5, "main")):
        clip = front_extrude(affinity.translate(prof, cx, 0), 2.2, y0=1.1)
        m.add(clip, mat)
    cmats = ["cable", "cable2", "accent"]
    for ci, cx in enumerate((-4.5, 4.5)):
        for k, x in enumerate((-1.8, 0, 1.8)):
            ys = np.linspace(-12, 12, 80)
            zz = 0.34 + (1.0 - 0.34) * np.exp(-(ys / 3.4) ** 6)
            xx = np.full_like(ys, cx + x) + 0.25 * np.sin(ys * 0.18 + k)
            m.add(tube(np.stack([xx, ys, zz], -1), 0.33), cmats[k])
    return m


def darzhach_daga():
    m = Model()
    m.add(bevel_extrude(rrect(13, 9, 4.5), 1.3, 0.5))
    col = rrect(3.0, 1.8, 0.8)
    m.add(extrude(col, 21.5, 1.0))
    H = 22.5
    t = np.linspace(0.12, 0.88, 60) * math.pi
    arch = np.stack([6.2 * np.cos(t), np.zeros_like(t), H + 1.6 * np.sin(t)], -1)
    for dy in (-0.55, 0.55):
        m.add(tube(arch + [0, dy, 0], 0.62))
    # headphones (prop)
    band_t = np.linspace(0.0, 1.0, 120) * math.pi
    band = np.stack([7.0 * np.cos(band_t), np.zeros_like(band_t), H + 0.4 + 2.6 * np.sin(band_t) ** 0.8], -1)
    legs = []
    for s in (-1, 1):
        zz = np.linspace(H + 0.4, H - 6.0, 30)
        legs.append(np.stack([np.full_like(zz, s * 7.0 + s * 0.15 * (H - zz) / 6), np.zeros_like(zz), zz], -1))
    m.add(tube(band, 0.45), "phones")
    for s, leg in zip((-1, 1), legs):
        m.add(tube(leg, 0.32), "steel")
        cup = T(cylinder(3.5, 2.2, sections=96), ry=90, t=(s * 8.0, 0, H - 9.0))
        pad = T(torus(2.7, 0.85), ry=90, t=(s * 6.6, 0, H - 9.0))
        m.add(cup, "phones").add(pad, "ink")
    return m


def organizer_terasa():
    m = Model().add(bevel_extrude(rrect(22, 13, 2.0), 0.7, 0.2))

    def r(th, t):
        return np.full_like(th, 3.4)

    m.add([T(p, t=(-6.5, 2.0, 0.7)) for p in vessel(r, 11.0, wall=0.3, base=0.3, nt=160, nz=4)])
    m.add(T(bevel_extrude(rrect(5.6, 9.0, 0.8).difference(rrect(5.0, 8.4, 0.5)), 8.5, 0.12, steps=2), t=(0.6, 1.5, 0.7)))
    for x in (5.4, 8.3):
        m.add(T(bevel_extrude(rrect(2.6, 9.0, 0.6).difference(rrect(2.0, 8.4, 0.35)), 5.0, 0.12, steps=2), t=(x, 1.5, 0.7)))
    m.add(T(bevel_extrude(rrect(21, 3.2, 0.8).difference(rrect(20.4, 2.6, 0.5)), 2.4, 0.1, steps=2), t=(0, -4.6, 0.7)))
    add_pencils(m, [((-7.2, 2.4, 1.0), 12, -8, 0, "pencil", 16), ((-5.8, 1.4, 1.0), -10, 6, 20, "pencil2", 17),
                    ((-6.5, 3.0, 1.0), 8, 10, -30, "pencil3", 15)])
    m.add(T(bevel_extrude(rrect(4.0, 0.25, 0.1), 7.5, 0.05, steps=1), t=(0.6, 1.0, 1.0)), "white")
    m.add(T(bevel_extrude(rrect(4.0, 0.25, 0.1), 6.8, 0.05, steps=1), t=(0.6, 2.4, 1.0)), "c2")
    return m


def kuki_stena():
    line = LineString([(0.25, 7.0), (0.25, 1.0)] + [(0.25 + 1.6 - 1.6 * math.cos(a), 1.0 - 1.0 * math.sin(a)) for a in np.linspace(0.1, math.pi * 0.95, 24)] + [(3.4, 2.6)])
    prof = unary_union([line.buffer(0.42, 24), rrect(0.5, 7.0, 0.25, cx=0.25, cy=4.2)])
    prof = affinity.translate(prof, 0, 0.45 - prof.bounds[1])
    m = Model()
    for i, (x, mat) in enumerate([(-4.2, "main"), (0, "c2"), (4.2, "c3")]):
        hook = side_extrude(affinity.scale(prof, -1, 1, origin=(0, 0)), 2.0)
        m.add(T(hook, rz=0, t=(x, 0, 2.5)), mat)
    m.add(bevel_extrude(rrect(15.5, 1.4, 0.5), 11.5, 0.3), "wood")
    m.parts[-1].mesh.apply_translation([0, 0.72, 0])
    return m


# ============================================================ Персонализирани подаръци
def tabelka_ime(name="Алекс"):
    cloud = unary_union([circle(4.6, -5.5, 4.2), circle(5.6, 0, 5.4), circle(4.4, 5.8, 4.0), rrect(19, 5.5, 2.6, cy=2.8)])
    cloud = cloud.buffer(0.6).buffer(-0.6)
    txt = text_poly(name, 4.1, FONT_ROUND)
    txt = affinity.translate(txt, 0, 3.8)
    star = Polygon([(math.cos(a) * (1.0 if i % 2 == 0 else 0.45), math.sin(a) * (1.0 if i % 2 == 0 else 0.45))
                    for i, a in enumerate(np.linspace(math.pi / 2, math.pi / 2 + TAU, 10, endpoint=False))]).buffer(0.12)
    star = affinity.translate(star, 5.9, 7.2)
    m = Model()
    plate = T(bevel_extrude(cloud, 0.8, 0.25), rx=90, t=(0, 0.4, 1.0))
    m.add(plate)
    for g, mat in ((txt, "text"), (star, "accent")):
        m.add(T(bevel_extrude(g, 0.32, 0.1, z0=0.8, steps=2), rx=90, t=(0, 0.4, 1.0)), mat)
    m.add(bevel_extrude(rrect(16, 4.2, 1.4), 1.0, 0.3), "accent")
    return m


def molivnik_ime(name="Яна"):
    R, H = 4.4, 10.5

    def r(th, t):
        return np.full_like(th, R)

    parts = vessel(r, H, wall=0.35, base=0.4, nt=6, nz=2)
    m = Model().add(parts, smooth=False)
    ap = R * math.cos(math.pi / 6)
    # rotate so a flat face points to the camera (-Y)
    m = m.transformed(rz=0)
    txt = text_poly(name, 2.4, FONT_ROUND)
    face_w = R * 0.78  # keep the name inside one flat face of the hexagon
    minx, _, maxx, _ = txt.bounds
    if maxx - minx > face_w:
        k = face_w / (maxx - minx)
        txt = affinity.scale(txt, k, k, origin=(0, 0))
    txt = affinity.translate(txt, 0, 5.2)
    plate = front_extrude(txt, 0.3, y0=-ap + 0.02)
    m.add(plate, "text")
    add_pencils(m, [((-1.2, 0.6, 0.4), 10, -8, 0, "pencil", 15), ((0.9, 0.2, 0.4), -6, 10, 0, "pencil2", 16),
                    ((0.0, 1.6, 0.4), 14, 4, 0, "pencil3", 14)])
    return m


BUILDERS = {
    "vaza-valna": vaza_valna,
    "kashpa-oblak": kashpa_oblak,
    "vaza-prizma": vaza_prizma,
    "kupa-listo": kupa_listo,
    "shtipki-zahapka": shtipki_zahapka,
    "organizer-modul": organizer_modul,
    "stoyka-etazh": stoyka_etazh,
    "organizer-kapka": organizer_kapka,
    "drakon-iskra": drakon_iskra,
    "oktopod-osmi": oktopod_osmi,
    "fidget-mehanizam": fidget_mehanizam,
    "ribka-luna": ribka_luna,
    "klyuchodarzhatel-ime": klyuchodarzhatel_ime,
    "klyuchodarzhatel-bezkraynost": klyuchodarzhatel_bezkraynost,
    "zheton-kolichka": zheton_kolichka,
    "stoyka-naklon": stoyka_naklon,
    "klips-kabeli": klips_kabeli,
    "darzhach-daga": darzhach_daga,
    "organizer-terasa": organizer_terasa,
    "kuki-stena": kuki_stena,
    "tabelka-ime": tabelka_ime,
    "molivnik-ime": molivnik_ime,
}


def solo(c, **extra):
    d = {"main": F[c]}
    d.update(extra)
    return d


# variant id -> material colours. Variant ids are shared with app/data/products.ts
VARIANTS = {
    "vaza-valna": {"koral": solo("koral"), "lilav": solo("lilav"), "mlechen": solo("mlechen"), "menta": solo("menta")},
    "kashpa-oblak": {"mlechen": solo("mlechen"), "praskova": solo("praskova"), "lavandula": solo("lavandula")},
    "vaza-prizma": {"lilav": solo("lilav"), "pyasak": solo("pyasak"), "grafit": solo("grafit")},
    "kupa-listo": {"pyasak": solo("pyasak"), "koral": solo("koral"), "menta": solo("menta")},
    "shtipki-zahapka": {
        "pastelen-miks": {"main": F["lavandula"], "c2": F["menta"], "c3": F["praskova"], "c4": F["slance"]},
        "lilav-koral": {"main": F["lilav"], "c2": F["koral"], "c3": F["lilav"], "c4": F["koral"]},
        "mlechen": {"main": F["mlechen"], "c2": F["mlechen"], "c3": F["mlechen"], "c4": F["mlechen"]},
    },
    "organizer-modul": {"mlechen": solo("mlechen", c2=F["koral"]), "grafit": solo("grafit", c2=F["slance"]),
                        "lavandula": solo("lavandula", c2=F["koral"])},
    "stoyka-etazh": {"mlechen": solo("mlechen"), "maslina": solo("maslina"), "grafit": solo("grafit")},
    "organizer-kapka": {"mlechen": solo("mlechen"), "menta": solo("menta"), "grafit": solo("grafit")},
    "drakon-iskra": {"lilav": solo("lilav", accent=F["koral"]), "koral": solo("koral", accent=F["lilav"]),
                     "menta": solo("menta", accent=F["lavandula"])},
    "oktopod-osmi": {"koral": solo("koral", accent=F["praskova"]), "lavandula": solo("lavandula", accent=F["lilav"]),
                     "nebe": solo("nebe", accent=F["mlechen"])},
    "fidget-mehanizam": {"lilav-koral": solo("lilav", accent=F["koral"], c3=F["mlechen"]),
                         "grafit-slance": solo("grafit", accent=F["slance"], c3=F["mlechen"]),
                         "menta-mlechen": solo("menta", accent=F["mlechen"], c3=F["lilav"])},
    "ribka-luna": {"koral-praskova": solo("koral", accent=F["praskova"]), "nebe-mlechen": solo("nebe", accent=F["mlechen"]),
                   "lilav-lavandula": solo("lilav", accent=F["lavandula"])},
    "klyuchodarzhatel-ime": {"lilav": solo("lilav", text=F["mlechen"]), "koral": solo("koral", text=F["mlechen"]),
                             "menta": solo("menta", text=F["lilav"]), "grafit": solo("grafit", text=F["slance"])},
    "klyuchodarzhatel-bezkraynost": {"lilav-koral": solo("lilav", accent=F["koral"]),
                                     "grafit-slance": solo("grafit", accent=F["slance"]),
                                     "lavandula-menta": solo("lavandula", accent=F["menta"])},
    "zheton-kolichka": {"lilav-koral": solo("lilav", accent=F["koral"]), "menta-slance": solo("menta", accent=F["slance"]),
                        "grafit-mlechen": solo("grafit", accent=F["mlechen"])},
    "stoyka-naklon": {"mlechen": solo("mlechen"), "lilav": solo("lilav"), "grafit": solo("grafit"), "koral": solo("koral")},
    "klips-kabeli": {"koral": solo("koral", accent=F["lavandula"]), "mlechen": solo("mlechen", accent=F["koral"]),
                     "grafit": solo("grafit", accent=F["slance"])},
    "darzhach-daga": {"lilav": solo("lilav", phones=F["mlechen"]), "mlechen": solo("mlechen", phones=F["grafit"]),
                      "grafit": solo("grafit", phones=F["mlechen"])},
    "organizer-terasa": {"mlechen": solo("mlechen", c2=F["koral"]), "lavandula": solo("lavandula", c2=F["slance"]),
                         "grafit": solo("grafit", c2=F["koral"])},
    "kuki-stena": {"miks": {"main": F["lilav"], "c2": F["koral"], "c3": F["lavandula"]},
                   "mlechen": {"main": F["mlechen"], "c2": F["mlechen"], "c3": F["mlechen"]},
                   "grafit": {"main": F["grafit"], "c2": F["grafit"], "c3": F["grafit"]}},
    "tabelka-ime": {"mlechen": solo("mlechen", text=F["lilav"], accent=F["koral"]),
                    "lavandula": solo("lavandula", text=F["lilav"], accent=F["slance"]),
                    "menta": solo("menta", text=F["mlechen"], accent=F["koral"])},
    "molivnik-ime": {"koral": solo("koral", text=F["mlechen"]), "lilav": solo("lilav", text=F["slance"]),
                     "mlechen": solo("mlechen", text=F["lilav"])},
}


# second wave (play sets, premium decor, seasonal, personalised)
from products2 import BUILDERS2, VARIANTS2  # noqa: E402

BUILDERS.update(BUILDERS2)
VARIANTS.update(VARIANTS2)

# community designs rendered from downloaded CC0 / CC BY / CC BY-SA files
from community import BUILDERS_C, VARIANTS_C  # noqa: E402

BUILDERS.update(BUILDERS_C)
VARIANTS.update(VARIANTS_C)
