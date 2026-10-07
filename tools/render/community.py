"""Community designs (CC0 / CC BY / CC BY-SA) rendered from the downloaded model files.

Source files and licence records: tools/render/community/<platform>-<id>/ (never published).
Geometry is used unmodified except for scale/placement for the photo; attribution lives in
app/data/products-community.ts (`design` field) and docs/COMMUNITY-DESIGNS.md.
"""
from __future__ import annotations

import glob
import os

import numpy as np
import trimesh
from shapely.geometry import box

from lib import FILAMENT as F, Model, T, bevel_extrude, rrect
from products import split_ring

HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "community")


def stl(rel, scale=0.1):
    m = trimesh.load(os.path.join(HERE, rel), force="mesh")
    m.apply_scale(scale)  # mm -> cm
    m.apply_translation(-np.array([(m.bounds[0][0] + m.bounds[1][0]) / 2, (m.bounds[0][1] + m.bounds[1][1]) / 2, m.bounds[0][2]]))
    return m


def threemf(rel):
    import sys
    sys.path.insert(0, HERE)
    import load3mf
    return load3mf.load(os.path.join(HERE, rel))


def flat(m: trimesh.Trimesh):
    return m  # placeholder hook if a model needs re-orienting


# ------------------------------------------------------------ decor
def vaza_roza():
    m = stl("printables-131488/VaseRose_FullSize_withbottom.stl")
    return Model().add(m, smooth=False)


def vaza_tetrahex():
    return Model().add(stl("printables-228303/Tetrahex Ripple Vase.stl"), smooth=False)


def ogranichiteli_kristal():
    b = stl("printables-447388/crystal cluster bookend.stl")
    m = Model()
    lo, hi = b.bounds
    w = hi[0] - lo[0]
    m.add(T(b, t=(-w / 2 - 4.6, 0, 0)), smooth=False)
    m.add(T(b, rz=180, t=(w / 2 + 4.6, 0, 0)), smooth=False)
    cols = ["book1", "book2", "book3", "book4", "book5"]
    x = -4.2
    for i, (bw, h) in enumerate([(1.6, 14.0), (2.2, 15.5), (1.3, 12.8), (2.4, 15.0), (1.5, 13.5)]):
        m.add(T(bevel_extrude(rrect(bw, 9.5, 0.2), h, 0.12, steps=2), t=(x + bw / 2, 0, 0)), cols[i])
        x += bw + 0.1
    return m


def pano_bonsai():
    g = threemf("printables-764562/bonsai.3mf")
    mesh = list(g.values())[0]
    mesh.apply_scale(0.1)
    mesh.apply_translation(-mesh.bounds[0])
    mesh.apply_translation([-mesh.extents[0] / 2, -mesh.extents[1] / 2, 0])
    art = T(mesh, rx=90)  # stand it up like a framed piece
    art.apply_translation([0, 0.6, 1.0 - art.bounds[0][2]])
    m = Model().add(art, smooth=False)
    m.add(bevel_extrude(rrect(16, 3.4, 1.0), 1.4, 0.4), "accent")
    return m


# ------------------------------------------------------------ toys
def drakon_kristal():
    return Model().add(stl("printables-831762/Articulated crystal dragon enhanced tail.stl"), smooth=False)


def yaytse_drakon():
    g = threemf("printables-159912/DragonEggMedium.3mf")
    parts = list(g.values())
    m = Model()
    for i, p in enumerate(parts):
        p = p.copy()
        p.apply_scale(0.1)
        p.apply_translation([-(p.bounds[0][0] + p.bounds[1][0]) / 2, -(p.bounds[0][1] + p.bounds[1][1]) / 2, -p.bounds[0][2]])
        m.add(T(p, t=(-3.6 + 7.2 * i, 0.6 * i, 0)), "main" if i == 0 else "accent", smooth=False)
    return m


def flexi_reks():
    return Model().add(stl("thingiverse-2738211/Flexi-Rex-improved.stl"), smooth=False)


# ------------------------------------------------------------ games
def kutiya_pazel():
    m = Model()
    shell = stl("printables-40017/outer-shell.stl")
    lid = stl("printables-40017/lid.stl")
    boxp = stl("printables-40017/box.stl")
    m.add(T(shell, t=(-5.2, 2.0, 0)), "main", smooth=False)
    m.add(T(boxp, t=(5.0, 3.0, 0)), "accent", smooth=False)
    m.add(T(lid, rz=-8, t=(0.5, -5.2, 0)), "accent", smooth=False)
    bar = stl("printables-40017/bar.stl")
    m.add(T(bar, rz=12, t=(0, -10.2, 0)), "main", smooth=False)
    return m


def shah_heksagon():
    m = Model()
    order = ["Rook", "Knight", "Bishop", "King", "Queen", "Pawn"]
    for row, mat, y in ((0, "main", -2.4), (1, "accent", 3.0)):
        for i, n in enumerate(order):
            p = stl(f"printables-979308/{n}.stl")
            m.add(T(p, rz=180 * row, t=(-8.1 + i * 3.25, y, 0)), mat, smooth=False)
    m.add(bevel_extrude(rrect(22, 11.5, 1.4), 0.6, 0.2), "c2")
    for p in m.parts[:-1]:
        p.mesh.apply_translation([0, 0, 0.6])
    return m


# ------------------------------------------------------------ personalised
def ornament_ime():
    o = stl("printables-253402/ChristmasNameOrnament-Emma.stl")
    m = Model()
    # two-colour print: top layers (name / snowflakes) in the accent colour
    m.add(T(o, rx=90, t=(0, 0.2, 1.0)), "main", smooth=False)
    m.add(bevel_extrude(rrect(5.0, 2.4, 1.0), 0.6, 0.2), "c2")
    lo, hi = m.bounds()
    m.add(T(trimesh.creation.torus(0.6, 0.1, major_sections=64, minor_sections=12), ry=90, t=(0, 0.1, hi[2] + 0.45)), "ribbon")
    return m


def medalion_sarce():
    t = stl("printables-1122023/cat dog tag.stl", scale=100.0)  # file is in metres
    m = Model()
    zs = t.bounds[1][2] * 0.62
    top = trimesh.intersections.slice_mesh_plane(t, [0, 0, 1], [0, 0, zs], cap=True)
    bot = trimesh.intersections.slice_mesh_plane(t, [0, 0, -1], [0, 0, zs], cap=True)
    m.add(bot, "main", smooth=False).add(top, "text", smooth=False)
    lo, hi = m.bounds()
    m.add(split_ring(((lo[0] + hi[0]) / 2, hi[1] + 0.75, 0.2), R=0.95, tilt=12, rz=90), "metal")
    return m


def klyuchodarzhatel_skript():
    k = stl("printables-820622/Alice.stl")
    m = Model()
    zs = k.bounds[1][2] * 0.5
    top = trimesh.intersections.slice_mesh_plane(k, [0, 0, 1], [0, 0, zs], cap=True)
    bot = trimesh.intersections.slice_mesh_plane(k, [0, 0, -1], [0, 0, zs], cap=True)
    m.add(bot, "main", smooth=False).add(top, "text", smooth=False)
    lo, hi = m.bounds()
    m.add(split_ring((lo[0] - 0.45, (lo[1] + hi[1]) / 2 + 0.6, 0.35), R=1.1, tilt=12), "metal")
    return m


BUILDERS_C = {
    "vaza-roza": vaza_roza,
    "vaza-tetrahex": vaza_tetrahex,
    "ogranichiteli-kristal": ogranichiteli_kristal,
    "pano-bonsai": pano_bonsai,
    "drakon-kristal": drakon_kristal,
    "yaytse-drakon": yaytse_drakon,
    "flexi-reks": flexi_reks,
    "kutiya-pazel": kutiya_pazel,
    "shah-heksagon": shah_heksagon,
    "ornament-ime": ornament_ime,
    "medalion-sarce": medalion_sarce,
    "klyuchodarzhatel-skript": klyuchodarzhatel_skript,
}

BOOKS = dict(book1="#2f5d73", book2="#e3b04b", book3="#b5523b", book4="#ece6da", book5="#5a6b4a")


def solo(c, **extra):
    d = {"main": F[c]}
    d.update(extra)
    return d


VARIANTS_C = {
    "vaza-roza": {"cherven": solo("cherven"), "praskova": solo("praskova"), "sedef": solo("sedef")},
    "vaza-tetrahex": {"zlato": solo("zlato"), "lilav": solo("lilav"), "mlechen": solo("mlechen")},
    "ogranichiteli-kristal": {"lavandula": dict(main=F["lavandula"], **BOOKS), "sedef": dict(main=F["sedef"], **BOOKS),
                              "grafit": dict(main=F["grafit"], **BOOKS)},
    "pano-bonsai": {"grafit": solo("grafit", accent=F["pyasak"]), "maslina": solo("maslina", accent=F["mlechen"]),
                    "zlato": solo("zlato", accent=F["grafit"])},
    "drakon-kristal": {"lavandula": solo("lavandula"), "zlato": solo("zlato"), "menta": solo("menta")},
    "yaytse-drakon": {"med": solo("med", accent=F["med"]), "sedef": solo("sedef", accent=F["sedef"]),
                      "lilav-koral": solo("lilav", accent=F["koral"])},
    "flexi-reks": {"menta": solo("menta"), "koral": solo("koral"), "nebe": solo("nebe")},
    "kutiya-pazel": {"pyasak-grafit": solo("pyasak", accent=F["grafit"]), "lilav-koral": solo("lilav", accent=F["koral"])},
    "shah-heksagon": {"klasik": {"main": F["mlechen"], "accent": F["grafit"], "c2": F["pyasak"]},
                      "imagoo": {"main": F["mlechen"], "accent": F["lilav"], "c2": F["lavandula"]}},
    "ornament-ime": {"cherven": {"main": F["cherven"], "text": F["mlechen"], "c2": F["mlechen"], "ribbon": F["zlato"]},
                     "zlato": {"main": F["zlato"], "text": F["mlechen"], "c2": F["mlechen"], "ribbon": F["cherven"]},
                     "nebe": {"main": F["nebe"], "text": F["mlechen"], "c2": F["mlechen"], "ribbon": F["zlato"]}},
    "medalion-sarce": {"koral": solo("koral", text=F["mlechen"]), "lavandula": solo("lavandula", text=F["lilav"]),
                       "zlato": solo("zlato", text=F["grafit"])},
    "klyuchodarzhatel-skript": {"lilav": solo("lilav", text=F["mlechen"]), "praskova": solo("praskova", text=F["cherven"]),
                                "grafit": solo("grafit", text=F["zlato"])},
}
