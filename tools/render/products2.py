"""Second wave of procedural concept models: play sets, premium decor, seasonal and personalised items.

Original designs inspired by popular product *genres* on MakerWorld (see docs/ASSET-SOURCES.md);
no third-party models or images are used. Units: cm, Z-up, front = -Y.
"""
from __future__ import annotations

import math

import numpy as np
import trimesh
from shapely.geometry import LineString, Point, Polygon, box
from shapely import affinity
from shapely.ops import unary_union

from lib import (FILAMENT as F, Model, T, bevel_extrude, circle, cone, cylinder, ellipsoid, extrude, rrect, text_poly,
                 torus, tube, vessel, FONT_ROUND, FONT_DISPLAY)
from products import front_extrude, side_extrude, smoothstep, split_ring

TAU = 2 * math.pi


def lathe(profile, H, nt=96, nz=60):
    """Closed solid of revolution; profile(t) -> radius, t in [0,1] along height."""
    return trimesh.util.concatenate(vessel(lambda th, t: profile(t) + 0 * th, H, nt=nt, nz=nz, open_top=False))


def solo(c, **extra):
    d = {"main": F[c]}
    d.update(extra)
    return d


# ============================================================ Комплекти за игра
def komplekt_pasta():
    m = Model()
    # pasta box with a label window
    m.add(bevel_extrude(rrect(7.5, 4.2, 0.8), 13.0, 0.4), "main")
    lbl = T(bevel_extrude(rrect(5.6, 6.4, 1.0), 0.18, 0.08, steps=2), rx=90, t=(0, -2.08, 7.6))
    m.add(lbl, "c2")
    bow = unary_union([Polygon([(-1.0, 0.7), (0, 0.15), (1.0, 0.7), (1.0, -0.7), (0, -0.15), (-1.0, -0.7)]).buffer(0.18)])
    for i, (x, z) in enumerate([(-1.2, 9.2), (1.2, 8.4), (0, 6.6)]):
        m.add(T(extrude(affinity.scale(bow, 0.75, 0.75), 0.12), rx=90, rz=0, t=(x, -2.22, z)), "pasta")
    # bowl with noodles
    def rb(th, t):
        return 4.6 * (0.55 + 0.45 * np.sin(np.clip(t, 0, 1) * np.pi / 2)) + 0 * th
    m.add([T(p, t=(8.8, -1.5, 0)) for p in vessel(rb, 3.6, wall=0.3, base=0.35, nt=180, nz=40)], "c3")
    rng = np.random.default_rng(3)
    for k in range(9):
        a0 = rng.uniform(0, TAU)
        s = np.linspace(0, 1, 60)
        r = 1.0 + 2.4 * s
        path = np.stack([8.8 + r * np.cos(a0 + 3.2 * s), -1.5 + r * np.sin(a0 + 3.2 * s), 2.7 + 0.35 * np.sin(s * 9 + k) + 0.25 * s], -1)
        m.add(tube(path, 0.2, nseg=12), "pasta")
    # fusilli, penne, farfalle scattered in front
    for (x, y, rz) in [(-1.5, -6.2, 20), (2.6, -7.0, -35)]:
        s = np.linspace(0, 1, 120)
        for ph in (0, TAU / 2):
            path = np.stack([s * 3.4, 0.38 * np.cos(s * 22 + ph), 0.45 + 0.38 * np.sin(s * 22 + ph)], -1)
            m.add(T(tube(path, 0.2, nseg=10), rz=rz, t=(x, y, 0)), "pasta")
    for (x, y, rz) in [(5.8, -6.6, 70), (7.4, -7.6, 15)]:
        pen = vessel(lambda th, t: 0.55 * (1 + 0.04 * np.cos(10 * th)), 3.0, wall=0.16, base=0.0001, nt=60, nz=6)
        m.add([T(p, ry=90, rz=rz, t=(x, y, 0.58)) for p in pen], "pasta")
    for (x, y, rz) in [(11.6, -6.4, 10), (13.0, -4.6, -30)]:
        m.add(T(bevel_extrude(bow, 0.3, 0.1, steps=2), rz=rz, t=(x, y, 0)), "pasta")
    # big playful fork
    fork = unary_union([rrect(1.4, 9.5, 0.7, cy=-4.0), rrect(3.2, 1.6, 0.6, cy=1.4)] +
                       [rrect(0.42, 3.0, 0.21, cx=x, cy=3.3) for x in (-1.2, -0.4, 0.4, 1.2)])
    m.add(T(bevel_extrude(fork, 0.45, 0.15, steps=2), rz=-72, t=(13.5, 1.6, 0)), "c2")
    return m


def komplekt_burger():
    m = Model()

    def bun_bottom(cx, cy, z0=0.0):
        return T(lathe(lambda t: 3.5 - 0.5 * t ** 2, 1.1), t=(cx, cy, z0))

    def burger(cx, cy):
        z = 0
        parts = [(bun_bottom(cx, cy), "food_bun")]
        z += 1.1
        parts.append((T(lathe(lambda t: 3.55 - 0.25 * t ** 3, 0.9), t=(cx, cy, z)), "food_patty")); z += 0.9
        ch = T(bevel_extrude(rrect(6.4, 6.4, 0.6), 0.22, 0.08, steps=2), rz=45, t=(cx, cy, z))
        parts.append((ch, "food_cheese")); z += 0.22

        def lett(th, t):
            return 3.9 * (1 + 0.07 * np.sin(9 * th)) + 0 * t
        parts.append((T(trimesh.util.concatenate(vessel(lett, 0.3, open_top=False, nt=180, nz=2)), t=(cx, cy, z)), "food_lettuce")); z += 0.3
        for k in range(2):
            parts.append((T(cylinder(1.5, 0.35), t=(cx - 1.2 + 2.4 * k, cy + 0.2 * k, z + 0.17)), "food_tomato"))
        z += 0.35
        top = T(lathe(lambda t: 3.6 * np.sqrt(np.clip(1 - t ** 2, 0, 1)) + 0.02, 2.6, nz=60), t=(cx, cy, z))
        parts.append((top, "food_bun"))
        for k in range(14):
            a, rr = k * 2.4, 0.6 + (k % 5) * 0.55
            zz = z + 2.6 * np.sqrt(max(0.0, 1 - (rr / 3.6) ** 2)) - 0.05
            parts.append((T(ellipsoid(0.22, 0.1, 0.09, sub=2), rz=math.degrees(a), t=(cx + rr * math.cos(a), cy + rr * math.sin(a), zz)), "white"))
        return parts

    for mesh, mat in burger(0, 0):
        m.add(mesh, mat)
    # a second, unstacked set beside it
    m.add(bun_bottom(8.0, -2.6), "food_bun")
    m.add(T(lathe(lambda t: 3.55 - 0.25 * t ** 3, 0.9), t=(8.6, 3.6, 0)), "food_patty")
    m.add(T(bevel_extrude(rrect(6.4, 6.4, 0.6), 0.22, 0.08, steps=2), rz=20, t=(14.4, 0.4, 0)), "food_cheese")
    return m


def komplekt_otvari():
    m = Model()
    # cauldron on three feet
    def rc(th, t):
        return 4.2 * np.sin(np.clip(0.25 + 0.75 * t, 0, 1) * np.pi * 0.62 + 0.25) + 0 * th
    m.add([T(p, t=(0, 0, 0.8)) for p in vessel(rc, 6.0, wall=0.3, base=0.4, nt=160, nz=60)], "c2")
    m.add(T(torus(3.75, 0.32), t=(0, 0, 6.8)), "c2")
    for k in range(3):
        a = TAU * k / 3 + 0.4
        m.add(cylinder(0.45, 1.2, center=(2.4 * math.cos(a), 2.4 * math.sin(a), 0.6)), "c2")
    m.add(cylinder(3.5, 0.25, center=(0, 0, 5.6)), "glowliquid")
    for k in range(6):
        a = k * 1.1
        m.add(ellipsoid(0.45, 0.45, 0.3, center=(1.2 * math.cos(a) * (k % 3) * 0.7, 1.2 * math.sin(a) * (k % 3) * 0.7, 5.8)), "glowliquid")

    def flask(cx, cy, mat, h=7.0, r=1.9):
        def rf(th, t):
            body = r * np.sqrt(np.clip(1 - ((t - 0.32) / 0.34) ** 2, 0.02, 1))
            neck = 0.55
            return np.where(t < 0.62, np.maximum(body, neck), neck) + 0 * th
        out = [(T(trimesh.util.concatenate(vessel(rf, h, open_top=False, nt=96, nz=70)), t=(cx, cy, 0)), mat)]
        out.append((cylinder(0.62, 1.1, center=(cx, cy, h + 0.4)), "wood"))
        return out

    for (x, y, mat, h, r) in [(-6.8, 1.0, "c3", 7.0, 1.9), (6.6, 1.6, "accent", 6.0, 1.7), (5.0, -3.6, "c4", 4.6, 1.35)]:
        for mesh, mm in flask(x, y, mat, h, r):
            m.add(mesh, mm)
    # ingredients: mushroom, crystal, star
    m.add(cylinder(0.45, 1.4, center=(-4.4, -4.2, 0.7)), "white")
    m.add(T(lathe(lambda t: 1.5 * np.sqrt(np.clip(1 - t ** 2, 0, 1)) + 0.02, 1.2), t=(-4.4, -4.2, 1.3)), "food_tomato")
    for k in range(6):
        a = k * 1.05
        m.add(ellipsoid(0.2, 0.2, 0.12, center=(-4.4 + 0.85 * math.cos(a), -4.2 + 0.85 * math.sin(a), 2.15)), "white")
    cr = trimesh.creation.cone(radius=0.9, height=3.2, sections=6)
    m.add(T(cr, t=(-1.6, -5.4, 0)), "c3", smooth=False)
    m.add(T(cr, s=0.6, rz=20, t=(-0.7, -6.2, 0)), "c3", smooth=False)
    star = Polygon([(math.cos(a) * (1.1 if i % 2 == 0 else 0.48), math.sin(a) * (1.1 if i % 2 == 0 else 0.48))
                    for i, a in enumerate(np.linspace(math.pi / 2, math.pi / 2 + TAU, 10, endpoint=False))]).buffer(0.1)
    m.add(T(bevel_extrude(star, 0.45, 0.15, steps=2), rz=12, t=(2.2, -5.6, 0)), "accent")
    return m


def chaen_komplekt():
    m = Model()
    # teapot
    body = lathe(lambda t: 3.4 * np.sin(np.clip(0.18 + 0.82 * t, 0, 1) * np.pi) * 0.95 + 0.9 * (t < 0.08) * (1 - t / 0.08) * 0, 6.0)
    m.add(body, "main")
    m.add(cylinder(1.7, 0.5, center=(0, 0, 6.1)), "c2")
    m.add(ellipsoid(0.55, 0.55, 0.45, center=(0, 0, 6.6)), "c2")
    s = np.linspace(0, 1, 30)
    spout = np.stack([2.6 + 2.6 * s, 0 * s, 2.4 + 2.8 * s ** 1.6], -1)
    m.add(tube(spout, np.linspace(0.55, 0.32, 30), nseg=20), "main")
    hs = np.linspace(-0.9, 0.9, 40) * math.pi / 2
    handle = np.stack([-2.9 - 1.6 * np.cos(hs), 0 * hs, 3.2 + 1.7 * np.sin(hs)], -1)
    m.add(tube(handle, 0.35, nseg=16), "main")
    # cups & saucers
    for (x, y) in [(-6.2, -3.2), (6.4, -4.4)]:
        m.add(T(lathe(lambda t: 2.3 - 0.2 * t, 0.35), t=(x, y, 0)), "c2")
        def rc(th, t):
            return 1.45 + 0.35 * t + 0 * th
        m.add([T(p, t=(x, y, 0.35)) for p in vessel(rc, 2.2, wall=0.18, base=0.25, nt=120, nz=20)], "main")
        hs2 = np.linspace(-0.85, 0.85, 30) * math.pi / 2
        h2 = np.stack([x + 1.75 + 0.75 * np.cos(hs2), y + 0 * hs2, 1.5 + 0.7 * np.sin(hs2)], -1)
        m.add(tube(h2, 0.18, nseg=12), "main")
    return m


def shah_prizma():
    m = Model()
    sq = 2.4
    for i in range(8):
        for j in range(8):
            mat = "c2" if (i + j) % 2 == 0 else "c3"
            m.add(extrude(box(-4 * sq + i * sq, -4 * sq + j * sq, -4 * sq + (i + 1) * sq, -4 * sq + (j + 1) * sq), 0.5), mat, smooth=False)
    m.add(extrude(rrect(8 * sq + 1.2, 8 * sq + 1.2, 0.6).difference(box(-4 * sq, -4 * sq, 4 * sq, 4 * sq)), 0.7), "c3", smooth=False)

    def piece(kind):
        z0 = 0.5
        base = lathe(lambda t: 0.85 - 0.25 * t, 0.45, nt=48, nz=4)
        parts = [T(base, t=(0, 0, z0))]
        if kind == "p":
            parts += [T(lathe(lambda t: 0.5 - 0.22 * t, 1.1, nt=48, nz=8), t=(0, 0, z0 + 0.45)), ellipsoid(0.45, 0.45, 0.45, center=(0, 0, z0 + 1.85), sub=3)]
        elif kind == "r":
            parts += [T(lathe(lambda t: 0.6 + 0 * t, 1.8, nt=8, nz=2), t=(0, 0, z0 + 0.45)), T(lathe(lambda t: 0.72 + 0 * t, 0.5, nt=8, nz=2), t=(0, 0, z0 + 2.2))]
        elif kind == "n":
            parts += [T(lathe(lambda t: 0.6 - 0.15 * t, 1.2, nt=48, nz=6), t=(0, 0, z0 + 0.45)),
                      T(bevel_extrude(Polygon([(-0.55, 0), (0.6, 0), (0.75, 1.4), (0.1, 2.0), (-0.75, 1.1), (-0.3, 0.9)]).buffer(0.08), 0.8, 0.15, steps=2), rx=90, t=(0, 0.4, z0 + 1.5))]
        elif kind == "b":
            parts += [T(lathe(lambda t: 0.55 - 0.3 * t, 2.0, nt=48, nz=8), t=(0, 0, z0 + 0.45)), ellipsoid(0.42, 0.42, 0.6, center=(0, 0, z0 + 2.7), sub=3)]
        elif kind == "q":
            parts += [T(lathe(lambda t: 0.6 - 0.25 * t + 0.3 * t ** 6, 2.6, nt=48, nz=12), t=(0, 0, z0 + 0.45)), ellipsoid(0.32, 0.32, 0.32, center=(0, 0, z0 + 3.35), sub=3)]
        elif kind == "k":
            parts += [T(lathe(lambda t: 0.65 - 0.25 * t + 0.25 * t ** 6, 2.9, nt=48, nz=12), t=(0, 0, z0 + 0.45)),
                      extrude(box(-0.14, -0.14, 0.14, 0.14), 1.0, z0 + 3.35), extrude(box(-0.42, -0.14, 0.42, 0.14), 0.26, z0 + 3.85)]
        return trimesh.util.concatenate(parts)

    back = "rnbqkbnr"
    cache = {k: piece(k) for k in "prnbqk"}
    moved = {(4, 1): (4, 3), (3, 6): (3, 4), (6, 0): (5, 2)}
    for side, mat, row_b, row_p in (("w", "main", 0, 1), ("b", "accent", 7, 6)):
        for i in range(8):
            for (ci, cj, k) in ((i, row_b, back[i]), (i, row_p, "p")):
                ti, tj = moved.get((ci, cj), (ci, cj))
                if side == "b" and (ci, cj) == (3, 6):
                    ti, tj = 3, 4
                x, y = -4 * sq + (ti + 0.5) * sq, -4 * sq + (tj + 0.5) * sq
                rot = 180 if side == "b" else 0
                m.add(T(cache[k], rz=rot + (90 if k == "n" else 0), t=(x, y, 0)), mat)
    return m


def pista_topcheta():
    m = Model()
    m.add(bevel_extrude(circle(7.5, res=96), 1.2, 0.4), "accent")
    m.add(cylinder(0.9, 24, center=(0, 0, 13)), "c2")
    m.add(ellipsoid(1.4, 1.4, 1.0, center=(0, 0, 25.0)), "accent")
    turns, Hs = 3.2, 21.0
    s = np.linspace(0, 1, 420)
    ang = s * turns * TAU
    z = 2.4 + Hs * (1 - s)
    for rr in (3.6, 5.0):
        path = np.stack([rr * np.cos(ang), rr * np.sin(ang), z], -1)
        m.add(tube(path, 0.22, nseg=14), "main")
    for k in range(0, 420, 14):
        a = ang[k]
        m.add(tube(np.array([[0.9 * math.cos(a), 0.9 * math.sin(a), z[k] - 0.25], [5.0 * math.cos(a), 5.0 * math.sin(a), z[k] - 0.25]]), 0.14, nseg=8), "c2")
    # end catch tray and marbles (marbles not included)
    m.add([T(p, t=(5.6, -4.6, 1.2)) for p in vessel(lambda th, t: 2.0 + 0.4 * t + 0 * th, 1.0, wall=0.25, base=0.25, nt=96, nz=6)], "main")
    for k, (x, y) in enumerate([(5.2, -4.4), (6.2, -5.0), (5.9, -3.8)]):
        m.add(ellipsoid(0.55, 0.55, 0.55, center=(x, y, 2.05), sub=3), ["c3", "c4", "c3"][k])
    for k in range(4):
        sk = 0.1 + 0.22 * k
        a = sk * turns * TAU
        m.add(ellipsoid(0.55, 0.55, 0.55, center=(4.3 * math.cos(a), 4.3 * math.sin(a), 2.4 + Hs * (1 - sk) + 0.5), sub=3), ["c3", "c4"][k % 2])
    return m


# ============================================================ Играчки — голям дракон
def drakon_vihar():
    m = Model()
    n = 24
    t = np.linspace(0, 1, n)
    xs = 13 - 28 * t
    ys = 8.5 * np.sin(t * TAU * 1.25 + 0.5)
    radii = 3.0 * (1 - 0.78 * t) + 0.35
    for i in range(1, n):
        x, y, rr = xs[i], ys[i], radii[i]
        ang = math.degrees(math.atan2(ys[i] - ys[i - 1], xs[i] - xs[i - 1]))
        m.add(T(ellipsoid(0.95, rr, rr * 0.8), rz=ang, t=(x, y, rr * 0.8)))
        if i < 19:
            for side in (-1, 1):
                m.add(T(cone(rr * 0.22, rr * 0.7), ry=side * 25, rz=ang, t=(x, y + side * rr * 0.25, rr * 1.45)), "accent")
    m.add(T(extrude(Polygon([(0, 0), (2.6, 1.6), (2.0, 0), (2.6, -1.6)]).buffer(0.25), 0.4), rz=180, t=(xs[-1] - 0.2, ys[-1], 0.3)), "accent")
    hx, hy = xs[0] + 1.8, ys[0]
    m.add(ellipsoid(4.0, 3.2, 3.0, center=(hx, hy, 3.3)))
    m.add(ellipsoid(3.0, 2.2, 1.7, center=(hx + 3.4, hy, 2.6)))
    for s_ in (-1, 1):
        m.add(T(cone(0.7, 3.6), ry=-58, t=(hx - 1.4, hy + s_ * 1.6, 5.3)), "accent")
        m.add(ellipsoid(0.62, 0.62, 0.62, center=(hx + 1.6, hy + s_ * 2.1, 4.5)), "white")
        m.add(ellipsoid(0.33, 0.33, 0.33, center=(hx + 2.05, hy + s_ * 2.42, 4.6)), "ink")
        m.add(ellipsoid(0.25, 0.25, 0.18, center=(hx + 6.0, hy + s_ * 0.8, 3.0)), "ink")
    wing = Polygon([(0, 0), (1.5, 6.0), (4.0, 13.0), (6.0, 12.0), (6.4, 8.6), (9.0, 9.6), (9.2, 5.6), (12.0, 5.8), (9.6, 0)])
    wing = wing.buffer(0.5).buffer(-0.5)
    for s_ in (-1, 1):
        wp = affinity.translate(wing, -5, 0)
        if s_ < 0:
            wp = affinity.scale(wp, 1, -1, origin=(0, 0))
        m.add(T(extrude(wp, 0.45), rx=s_ * 62, t=(xs[4], ys[4] + s_ * 1.6, 5.2)), "accent")
        # wing ribs
        for (ex, ey) in [(4.0, 13.0), (6.4, 8.6), (9.2, 5.6)]:
            p0 = np.array([0.0, 0.0, 0.0]); p1 = np.array([ex - 5, ey * s_, 0.0])
            rib = tube(np.linspace(p0, p1, 12), 0.22, nseg=10)
            m.add(T(T(rib, rx=s_ * 62), t=(xs[4], ys[4] + s_ * 1.6, 5.45)))
    for idx in (3, 9):
        for s_ in (-1, 1):
            m.add(ellipsoid(1.2, 0.9, 0.7, center=(xs[idx], ys[idx] + s_ * radii[idx] * 1.05, 0.7)))
    return m


# ============================================================ Скулптури и арт
def ribbon_sweep(path, width, thick, twist):
    """Sweep a flat rectangle along a closed path, rotating it by `twist(s)` radians."""
    n = len(path)
    tang = np.roll(path, -1, 0) - np.roll(path, 1, 0)
    tang /= np.linalg.norm(tang, axis=1)[:, None]
    up = np.array([0, 1.0, 0])
    nrm = np.cross(tang, up)
    nrm /= np.linalg.norm(nrm, axis=1)[:, None]
    bin_ = np.cross(tang, nrm)
    s = np.linspace(0, 1, n, endpoint=False)
    th = twist(s)
    u = np.cos(th)[:, None] * nrm + np.sin(th)[:, None] * bin_
    v = -np.sin(th)[:, None] * nrm + np.cos(th)[:, None] * bin_
    corners = [(-1, -1), (1, -1), (1, 1), (-1, 1)]
    ring = np.stack([path + a * width / 2 * u + b * thick / 2 * v for a, b in corners], 1)  # n,4,3
    verts = ring.reshape(-1, 3)
    faces = []
    for i in range(n):
        i2 = (i + 1) % n
        # a half twist (Möbius) reconnects corners rotated by two positions
        shift = 2 if (i2 == 0 and abs(th[-1] + (th[1] - th[0]) - th[0] - math.pi) < 0.2) else 0
        for c in range(4):
            c2 = (c + 1) % 4
            a, b = i * 4 + c, i * 4 + c2
            cc, d = i2 * 4 + (c2 + shift) % 4, i2 * 4 + (c + shift) % 4
            faces += [[a, b, cc], [a, cc, d]]
    m = trimesh.Trimesh(verts, faces, process=False)
    m.fix_normals()
    return m


def skulptura_bezkraynost():
    m = Model()
    a = 9.0
    t = np.linspace(0, TAU, 600, endpoint=False)
    den = 1 + np.sin(t) ** 2
    x, z = a * np.cos(t) / den, a * np.sin(t) * np.cos(t) / den
    y = 0.9 * np.cos(t)  # cross over/under at the centre
    path = np.stack([x, y, z + 9.6], -1)
    m.add(ribbon_sweep(path, 2.6, 0.5, lambda s: math.pi * s))
    m.add(bevel_extrude(rrect(9, 4.6, 2.2), 1.6, 0.5), "accent")
    m.add(cylinder(0.55, 8.2, center=(0, 0, 5.6)), "accent")
    return m


def slon_poligon():
    m = Model()
    lp = lambda rx, ry, rz, c: ellipsoid(rx, ry, rz, center=c, sub=1)
    m.add(lp(5.4, 3.4, 3.6, (0, 0, 7.2)), smooth=False)
    m.add(lp(2.9, 2.6, 2.8, (5.2, 0, 9.0)), smooth=False)
    for s in (-1, 1):
        ear = T(lp(2.2, 0.45, 2.8, (0, 0, 0)), rz=s * 18, t=(4.3, s * 2.6, 9.4))
        m.add(ear, smooth=False)
    for (x, y) in [(3.0, 1.8), (3.0, -1.8), (-3.1, 1.8), (-3.1, -1.8)]:
        m.add(trimesh.creation.cylinder(radius=1.25, height=5.0, sections=7, transform=trimesh.transformations.translation_matrix([x, y, 2.5])), smooth=False)
    s = np.linspace(0, 1, 9)
    trunk = np.stack([7.3 + 1.6 * s, 0 * s, 8.4 - 6.2 * s ** 1.3 + 1.4 * s ** 6], -1)
    m.add(tube(trunk, np.linspace(1.0, 0.5, 9), nseg=7), smooth=False)
    for sgn in (-1, 1):
        tusk = np.stack([7.0 + 1.6 * s, sgn * (0.9 + 0.2 * s), 7.4 - 0.8 * s + 1.0 * s ** 2], -1)
        m.add(tube(tusk, np.linspace(0.28, 0.1, 9), nseg=6), "white", smooth=False)
    tail = np.stack([-5.3 - 0.8 * s, 0 * s, 8.0 - 3.0 * s], -1)
    m.add(tube(tail, 0.22, nseg=6), smooth=False)
    return m


def ogranichiteli_arka():
    m = Model()

    def arch():
        ring = circle(9.0, res=128).difference(circle(4.6, res=128))
        ring = ring.intersection(box(-10, 0, 10, 10))
        stripes = [ring.intersection(circle(r1, res=128).difference(circle(r0, res=128))) for r0, r1 in ((4.6, 6.1), (6.1, 7.6), (7.6, 9.0))]
        return stripes

    mats = ["main", "c2", "c3"]
    for side, x in ((-1, -8.6), (1, 8.6)):
        for k, st in enumerate(arch()):
            # arch standing up in the YZ plane, 3 cm thick along X
            mesh = side_extrude(st, 3.0)
            m.add(T(mesh, rz=0, t=(x, 0, 0)), mats[k])
    book_cols = ["book1", "book2", "book3", "book4", "book5", "book1"]
    xs = -6.2
    for i, (w, h) in enumerate([(1.8, 15.5), (2.4, 17.0), (1.4, 14.0), (2.8, 16.2), (1.9, 15.0), (2.2, 12.6)]):
        tilt = -10 if i == 5 else 0
        bk = T(bevel_extrude(rrect(w, 10.5, 0.25), h, 0.15, steps=2), ry=tilt, t=(xs + w / 2, 0, 0))
        m.add(bk, book_cols[i])
        xs += w + 0.12
    return m


def pano_vulni():
    m = Model()
    r = 5.0
    hexagon = Polygon([(r * math.cos(a), r * math.sin(a)) for a in np.linspace(0, TAU, 6, endpoint=False) + math.pi / 6])
    w = r * math.sqrt(3)
    cells = [(0, 0)] + [(w * math.cos(a), w * math.sin(a)) for a in np.linspace(0, TAU, 6, endpoint=False)]
    mats = ["main", "c2", "c3", "main", "c2", "c3", "c2"]
    for k, (cx, cy) in enumerate(cells):
        hx = affinity.translate(hexagon.buffer(-0.18, join_style=2).buffer(0.12), cx, cy)
        h = 1.2 + 0.9 * ((k * 37) % 5) / 4
        m.add(bevel_extrude(hx, h, h * 0.85, steps=6), mats[k], smooth=False)
    return m


def svetilnik_korona():
    m = Model()
    R, H = 4.6, 11.0
    m.add(bevel_extrude(circle(R + 0.6, res=96), 0.9, 0.3), "main")
    m.add(T(torus(R, 0.35), t=(0, 0, H)), "main")
    n = 22
    for k in range(n):
        a = TAU * k / n
        s = np.linspace(0, 1, 30)
        path = np.stack([R * np.cos(a + 0.9 * s), R * np.sin(a + 0.9 * s), 0.8 + (H - 0.8) * s], -1)
        m.add(tube(path, 0.22, nseg=10), "main")
    m.add(cylinder(1.9, 1.5, center=(0, 0, 1.65)), "white")
    m.add(T(lathe(lambda t: 0.42 * np.sin(np.clip(t, 0, 1) * np.pi) ** 0.8 * (1 - 0.35 * t) + 0.01, 1.3), t=(0, 0, 2.4)), "glow")
    return m


# ============================================================ Празници и сезони
def tikva_rebro():
    m = Model()

    def rp(th, t):
        prof = 7.0 * np.sin(np.clip(0.06 + 0.88 * t, 0, 1) * np.pi) ** 0.75
        lobes = 1 - 0.07 * (1 - np.abs(np.cos(5 * th))) ** 3
        ribs = 1 + 0.012 * np.cos(40 * th)
        return np.maximum(prof * lobes * ribs, 0.4)

    m.add(vessel(rp, 9.5, open_top=False, nt=480, nz=120))
    s = np.linspace(0, 1, 20)
    stem = np.stack([0.9 * s ** 2, 0 * s, 9.0 + 2.6 * s], -1)
    m.add(tube(stem, np.linspace(0.75, 0.5, 20), nseg=8), "stem", smooth=False)
    return m


def koledna_igrachka(name="Мила"):
    m = Model()
    disc = circle(4.2, res=128)
    txt = text_poly(name, 2.1, FONT_ROUND)
    tb = txt.bounds
    if tb[2] - tb[0] > 6.0:
        k = 6.0 / (tb[2] - tb[0])
        txt = affinity.scale(txt, k, k, origin=(0, 0))
    txt = affinity.translate(txt, 0, -0.6)
    flakes = []
    for (cx, cy, sc) in [(-2.2, 2.0, 0.6), (2.2, 2.1, 0.55), (0, 2.6, 0.45), (-2.6, -2.4, 0.35), (2.5, -2.4, 0.4)]:
        arms = unary_union([affinity.rotate(LineString([(0, 0), (0, 1)]).buffer(0.09), a, origin=(0, 0)) for a in range(0, 360, 60)] +
                           [affinity.rotate(LineString([(0, 0.55), (0.3, 0.85)]).buffer(0.07), a, origin=(0, 0)) for a in range(0, 360, 60)] +
                           [affinity.rotate(LineString([(0, 0.55), (-0.3, 0.85)]).buffer(0.07), a, origin=(0, 0)) for a in range(0, 360, 60)])
        flakes.append(affinity.translate(affinity.scale(arms, sc, sc, origin=(0, 0)), cx, cy))
    flake = unary_union(flakes)
    plate = T(bevel_extrude(disc, 0.6, 0.2, steps=3), rx=90, t=(0, 0.3, 4.6))
    m.add(plate, "main")
    for g, mat in ((txt, "text"), (flake, "text")):
        m.add(T(bevel_extrude(g, 0.22, 0.07, z0=0.6, steps=2), rx=90, t=(0, 0.3, 4.6)), mat)
    m.add(T(cylinder(0.9, 1.0), t=(0, 0, 9.3)), "cap")
    m.add(T(torus(0.7, 0.12), rx=0, ry=90, t=(0, 0, 10.4)), "cap")
    # hanging ribbon loop
    s = np.linspace(0, 1, 60)
    loop = np.stack([1.4 * np.sin(s * TAU), 0 * s, 10.4 + 2.6 * (1 - np.cos(s * TAU)) / 2 + 0.6], -1)
    m.add(tube(loop, 0.12, nseg=10), "ribbon")
    # stand so it photographs upright
    m.add(bevel_extrude(rrect(5.0, 2.4, 1.0), 0.5, 0.2), "c2")
    return m


# ============================================================ Персонализирани
def klyuchodarzhatel_geroi(variant="meche", name="Дани"):
    m = Model()
    txt = text_poly(name, 1.9, FONT_ROUND)
    tb = txt.bounds
    txt = affinity.translate(txt, 0, -1.25 - (tb[1] + tb[3]) / 2)
    layers = []  # (polygon, z0, h, mat)
    if variant == "meche":
        head = circle(1.75, 0, 1.6)
        ears = unary_union([circle(0.7, -1.35, 3.0), circle(0.7, 1.35, 3.0)])
        silhouette = unary_union([head, ears])
        layers += [(silhouette, 0.32, 0.26, "c2"), (unary_union([circle(0.36, -1.35, 3.0), circle(0.36, 1.35, 3.0)]), 0.58, 0.08, "c3"),
                   (affinity.scale(Point(0, 1.05).buffer(1), 0.85, 0.62), 0.58, 0.08, "c3"),
                   (affinity.scale(Point(0, 1.3).buffer(1), 0.32, 0.22), 0.66, 0.06, "ink"),
                   (unary_union([circle(0.17, -0.65, 1.95), circle(0.17, 0.65, 1.95)]), 0.58, 0.08, "ink")]
    elif variant == "kote":
        head = affinity.scale(Point(0, 1.5).buffer(1), 1.95, 1.6)
        ears = unary_union([Polygon([(-1.8, 2.1), (-1.5, 3.7), (-0.5, 2.9)]), Polygon([(1.8, 2.1), (1.5, 3.7), (0.5, 2.9)])]).buffer(0.15)
        silhouette = unary_union([head, ears])
        layers += [(silhouette, 0.32, 0.26, "c2"),
                   (unary_union([Polygon([(-1.55, 2.5), (-1.42, 3.25), (-0.95, 2.85)]), Polygon([(1.55, 2.5), (1.42, 3.25), (0.95, 2.85)])]), 0.58, 0.08, "c3"),
                   (unary_union([affinity.scale(Point(-0.7, 1.75).buffer(1), 0.2, 0.3), affinity.scale(Point(0.7, 1.75).buffer(1), 0.2, 0.3)]), 0.58, 0.08, "ink"),
                   (Polygon([(-0.22, 1.15), (0.22, 1.15), (0, 0.9)]).buffer(0.06), 0.58, 0.08, "c3"),
                   (unary_union([LineString([(0.5, 1.0), (1.6, 1.2)]).buffer(0.05), LineString([(0.5, 0.85), (1.6, 0.7)]).buffer(0.05),
                                 LineString([(-0.5, 1.0), (-1.6, 1.2)]).buffer(0.05), LineString([(-0.5, 0.85), (-1.6, 0.7)]).buffer(0.05)]), 0.58, 0.06, "ink")]
    else:  # raketa
        body = unary_union([rrect(1.9, 2.6, 0.5, cy=1.4), Polygon([(-0.95, 2.4), (0.95, 2.4), (0, 4.0)]).buffer(0.2)])
        fins = unary_union([Polygon([(-0.95, 0.2), (-1.9, -0.2), (-0.95, 1.5)]), Polygon([(0.95, 0.2), (1.9, -0.2), (0.95, 1.5)])]).buffer(0.12)
        flame = Polygon([(-0.55, 0.15), (0.55, 0.15), (0.2, -0.45), (0, -0.2), (-0.2, -0.45)]).buffer(0.08)
        silhouette = unary_union([body, fins, flame])
        layers += [(body, 0.32, 0.26, "c2"), (fins, 0.32, 0.3, "c3"), (flame, 0.32, 0.2, "c4"),
                   (circle(0.5, 0, 2.2), 0.58, 0.08, "c4"), (circle(0.32, 0, 2.2), 0.66, 0.06, "nebe")]
    tab = circle(0.85, 0, silhouette.bounds[3] + 0.35)
    base = unary_union([silhouette.buffer(0.45, 32), txt.buffer(0.42, 32), tab]).buffer(0.25).buffer(-0.25)
    base = Polygon(base.exterior) if base.geom_type == "Polygon" else base
    base = base.difference(circle(0.36, 0, silhouette.bounds[3] + 0.35))
    m.add(bevel_extrude(base, 0.32, 0.1, steps=2), "main")
    for poly, z0, h, mat in layers:
        m.add(bevel_extrude(poly, h, min(0.06, h * 0.4), z0=z0, steps=2), mat)
    m.add(bevel_extrude(txt, 0.3, 0.08, z0=0.32, steps=2), "text")
    cy = silhouette.bounds[3] + 0.35
    m.add(split_ring((0.0, cy + 1.05, 0.32), R=1.2, tilt=14, rz=90), "metal")
    return m


klyuchodarzhatel_geroi.per_variant = True  # different character per variant


def tabela_semeystvo(name="Петрови"):
    m = Model()
    house = Polygon([(-8, 0), (8, 0), (8, 7.5), (0, 13.0), (-8, 7.5)]).buffer(0.8).buffer(-0.8)
    roof = Polygon([(-9.4, 7.0), (0, 13.9), (9.4, 7.0), (9.4, 8.6), (0, 15.4), (-9.4, 8.6)]).buffer(0.25)
    big = text_poly(name, 2.8, FONT_ROUND)
    bb = big.bounds
    if bb[2] - bb[0] > 13:
        k = 13 / (bb[2] - bb[0])
        big = affinity.scale(big, k, k, origin=(0, 0))
    big = affinity.translate(big, 0, 3.4)
    small = affinity.translate(text_poly("Семейство", 1.25, FONT_ROUND), 0, 7.0)
    heart = unary_union([circle(0.45, -0.38, 10.0), circle(0.45, 0.38, 10.0), Polygon([(-0.8, 9.85), (0.8, 9.85), (0, 8.95)])]).buffer(0.04)
    door = rrect(2.0, 2.6, 0.9, cy=1.6)
    stand = lambda mesh: T(mesh, rx=90, t=(0, 0.4, 0.9))
    m.add(stand(bevel_extrude(house, 0.8, 0.25)), "main")
    m.add(stand(bevel_extrude(roof, 0.5, 0.15, z0=0.8, steps=2)), "accent")
    for g, mat in ((big, "text"), (small, "text"), (heart, "accent"), (door, "c3")):
        m.add(stand(bevel_extrude(g, 0.3, 0.09, z0=0.8, steps=2)), mat)
    m.add(bevel_extrude(rrect(14, 4.0, 1.4), 0.9, 0.3), "c3")
    return m


def etiket_lyubimets(name="Рекс"):
    m = Model()
    bone = unary_union([rrect(5.0, 2.0, 0.5), circle(0.9, -2.5, 0.6), circle(0.9, -2.5, -0.6), circle(0.9, 2.5, 0.6), circle(0.9, 2.5, -0.6)])
    bone = bone.buffer(0.15).buffer(-0.15)
    txt = text_poly(name, 1.35, FONT_ROUND)
    tb = txt.bounds
    if tb[2] - tb[0] > 4.0:
        k = 4.0 / (tb[2] - tb[0])
        txt = affinity.scale(txt, k, k, origin=(0, 0))
    paw = unary_union([affinity.scale(Point(0, 0).buffer(1), 0.32, 0.27)] + [circle(0.11, x, y) for x, y in ((-0.3, 0.32), (-0.1, 0.45), (0.1, 0.45), (0.3, 0.32))])
    paw = affinity.translate(paw, 2.55, 0.05)
    tag = unary_union([bone, circle(0.6, -3.35, 0)]).difference(circle(0.28, -3.45, 0))
    m.add(bevel_extrude(tag, 0.35, 0.12, steps=2), "main")
    m.add(bevel_extrude(affinity.translate(txt, -0.15, 0), 0.22, 0.07, z0=0.35, steps=2), "text")
    m.add(bevel_extrude(paw, 0.18, 0.06, z0=0.35, steps=2), "text")
    m.add(split_ring((-4.4, 0.0, 0.32), R=1.0, tilt=12), "metal")
    return m


def obemni_bukvi(name="ЕМА"):
    m = Model()
    mats = ["main", "c2", "c3", "c4", "main", "c2", "c3", "c4"]
    x = 0.0
    letters = []
    for ch in name:
        p = text_poly(ch, 12.0, FONT_DISPLAY)
        b = p.bounds
        p = affinity.translate(p, -b[0], -b[1])
        letters.append(p)
    total = sum(p.bounds[2] for p in letters) + 1.2 * (len(letters) - 1)
    x = -total / 2
    for k, p in enumerate(letters):
        mesh = T(bevel_extrude(affinity.translate(p, x, 0), 3.0, 0.5, steps=4), rx=90, t=(0, 1.5 + (k % 2) * 1.6, 0))
        m.add(mesh, mats[k % len(mats)])
        x += p.bounds[2] + 1.2
    star = Polygon([(math.cos(a) * (1.4 if i % 2 == 0 else 0.62), math.sin(a) * (1.4 if i % 2 == 0 else 0.62))
                    for i, a in enumerate(np.linspace(math.pi / 2, math.pi / 2 + TAU, 10, endpoint=False))]).buffer(0.15)
    m.add(T(bevel_extrude(star, 1.6, 0.4, steps=3), rx=90, t=(total / 2 + 2.2, 0.5, 1.6)), "c4")
    return m


BUILDERS2 = {
    "komplekt-pasta": komplekt_pasta,
    "komplekt-burger": komplekt_burger,
    "komplekt-otvari": komplekt_otvari,
    "chaen-komplekt": chaen_komplekt,
    "shah-prizma": shah_prizma,
    "pista-topcheta": pista_topcheta,
    "drakon-vihar": drakon_vihar,
    "skulptura-bezkraynost": skulptura_bezkraynost,
    "slon-poligon": slon_poligon,
    "ogranichiteli-arka": ogranichiteli_arka,
    "pano-vulni": pano_vulni,
    "svetilnik-korona": svetilnik_korona,
    "tikva-rebro": tikva_rebro,
    "koledna-igrachka-ime": koledna_igrachka,
    "klyuchodarzhatel-geroi": klyuchodarzhatel_geroi,
    "tabela-semeystvo": tabela_semeystvo,
    "etiket-lyubimets": etiket_lyubimets,
    "obemni-bukvi": obemni_bukvi,
}

BOOKS = dict(book1="#2f5d73", book2="#e3b04b", book3="#b5523b", book4="#ece6da", book5="#5a6b4a")

VARIANTS2 = {
    "komplekt-pasta": {"koral": solo("koral", c2=F["mlechen"], c3=F["mlechen"], pasta=F["pasta"]),
                       "menta": solo("menta", c2=F["mlechen"], c3=F["mlechen"], pasta=F["pasta"]),
                       "lavandula": solo("lavandula", c2=F["mlechen"], c3=F["mlechen"], pasta=F["pasta"])},
    "komplekt-burger": {"klasik": {"main": F["pyasak"]},
                        "pastelen": {"main": F["pyasak"], "food_bun": F["praskova"], "food_patty": F["lavandula"], "food_cheese": F["slance"],
                                     "food_lettuce": F["menta"], "food_tomato": F["koral"]}},
    "komplekt-otvari": {"magiya": {"main": F["lilav"], "c2": F["grafit"], "c3": F["lavandula"], "c4": F["menta"], "accent": F["koral"], "glowliquid": F["menta"]},
                        "gora": {"main": F["maslina"], "c2": F["maslina"], "c3": F["menta"], "c4": F["slance"], "accent": F["praskova"], "glowliquid": F["slance"]}},
    "chaen-komplekt": {"mlechen-koral": solo("mlechen", c2=F["koral"]), "lavandula": solo("lavandula", c2=F["mlechen"]),
                       "menta": solo("menta", c2=F["mlechen"])},
    "shah-prizma": {"klasik": {"main": F["mlechen"], "accent": F["grafit"], "c2": F["pyasak"], "c3": "#7a5a43"},
                    "imagoo": {"main": F["mlechen"], "accent": F["lilav"], "c2": F["lavandula"], "c3": F["koral"]}},
    "pista-topcheta": {"duga": {"main": F["koral"], "accent": F["lilav"], "c2": F["mlechen"], "c3": F["slance"], "c4": F["menta"]},
                       "nebe": {"main": F["nebe"], "accent": F["grafit"], "c2": F["mlechen"], "c3": F["koral"], "c4": F["slance"]}},
    "drakon-vihar": {"zlato": {"main": F["zlato"], "accent": F["sedef"]}, "med": {"main": F["med"], "accent": F["grafit"]},
                     "sedef-lilav": {"main": F["sedef"], "accent": F["lilav"]}},
    "skulptura-bezkraynost": {"zlato": {"main": F["zlato"], "accent": F["grafit"]}, "koral": {"main": F["koral"], "accent": F["lilav"]},
                              "sedef": {"main": F["sedef"], "accent": F["mlechen"]}},
    "slon-poligon": {"mlechen": {"main": F["mlechen"]}, "zlato": {"main": F["zlato"]}, "grafit": {"main": F["grafit"]}, "menta": {"main": F["menta"]}},
    "ogranichiteli-arka": {"zalez": dict(main=F["koral"], c2=F["praskova"], c3=F["slance"], **BOOKS),
                           "zemya": dict(main=F["maslina"], c2=F["pyasak"], c3=F["mlechen"], **BOOKS),
                           "lilav": dict(main=F["lilav"], c2=F["lavandula"], c3=F["mlechen"], **BOOKS)},
    "pano-vulni": {"zalez": {"main": F["koral"], "c2": F["praskova"], "c3": F["slance"]},
                   "okean": {"main": F["nebe"], "c2": F["menta"], "c3": F["mlechen"]},
                   "lilav": {"main": F["lilav"], "c2": F["lavandula"], "c3": F["mlechen"]}},
    "svetilnik-korona": {"mlechen": {"main": F["mlechen"]}, "zlato": {"main": F["zlato"]}, "grafit": {"main": F["grafit"]}},
    "tikva-rebro": {"pyasak": {"main": F["pyasak"], "stem": "#7a6a4f"}, "praskova": {"main": F["praskova"], "stem": "#7d8a5a"},
                    "sedef": {"main": F["sedef"], "stem": "#a08c64"}, "grafit": {"main": F["grafit"], "stem": "#c9a03a"}},
    "koledna-igrachka-ime": {"cherven": {"main": F["cherven"], "text": F["mlechen"], "cap": F["zlato"], "ribbon": F["zlato"], "c2": F["mlechen"]},
                             "zlato": {"main": F["zlato"], "text": F["mlechen"], "cap": F["zlato"], "ribbon": F["cherven"], "c2": F["mlechen"]},
                             "sedef": {"main": F["sedef"], "text": F["nebe"], "cap": F["zlato"], "ribbon": F["nebe"], "c2": F["mlechen"]}},
    "klyuchodarzhatel-geroi": {"meche": {"main": "#13858a", "c2": "#9a6440", "c3": "#e9c9a4", "text": F["mlechen"]},
                               "kote": {"main": F["lavandula"], "c2": "#8b8f9c", "c3": "#f3a6b7", "text": F["lilav"]},
                               "raketa": {"main": "#1d2a6b", "c2": F["mlechen"], "c3": F["cherven"], "c4": F["slance"], "nebe": F["nebe"], "text": F["slance"]}},
    "tabela-semeystvo": {"mlechen": {"main": F["mlechen"], "accent": F["koral"], "text": F["lilav"], "c3": F["pyasak"]},
                         "maslina": {"main": F["pyasak"], "accent": F["maslina"], "text": F["maslina"], "c3": F["mlechen"]},
                         "grafit": {"main": F["grafit"], "accent": F["zlato"], "text": F["mlechen"], "c3": F["grafit"]}},
    "etiket-lyubimets": {"koral": {"main": F["koral"], "text": F["mlechen"]}, "nebe": {"main": F["nebe"], "text": F["lilav"]},
                         "zlato": {"main": F["zlato"], "text": F["grafit"]}},
    "obemni-bukvi": {"pastelni": {"main": F["lavandula"], "c2": F["praskova"], "c3": F["menta"], "c4": F["slance"]},
                     "lilav": {"main": F["lilav"], "c2": F["lilav"], "c3": F["lilav"], "c4": F["koral"]},
                     "mlechen": {"main": F["mlechen"], "c2": F["mlechen"], "c3": F["mlechen"], "c4": F["zlato"]}},
}
