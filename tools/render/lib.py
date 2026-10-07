"""Imagoo concept-render toolkit.

Procedural meshes (trimesh, Z-up, centimetres) + a fixed Mitsuba studio so every
product image shares the same light, backdrop, lens and crop logic.
All output is *concept imagery* for the demo storefront, not product photography.
"""
from __future__ import annotations

import math
import os
import struct
import tempfile
from dataclasses import dataclass, field

import numpy as np
import trimesh
from shapely.geometry import Polygon, MultiPolygon, Point, box
from shapely import affinity
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_ROUND = os.path.join(HERE, "fonts", "Nunito.ttf")
FONT_DISPLAY = os.path.join(HERE, "fonts", "Unbounded.ttf")

# ---------------------------------------------------------------- colours
# Filament-like colours used by the demo catalogue (sRGB hex).
FILAMENT = {
    "lilav": "#4b2a86",
    "lavandula": "#b8a4e3",
    "koral": "#ee6b62",
    "praskova": "#f6b49a",
    "mlechen": "#efe8dc",
    "pyasak": "#d9c3a1",
    "menta": "#9ed2bf",
    "maslina": "#7d8a5a",
    "grafit": "#3a3a40",
    "slance": "#f2c14e",
    "nebe": "#8fb8e6",
    "cherven": "#c8323a",
    "pasta": "#f1c76d",
    # satin ("silk") filaments: rendered glossier, prefixed with "silk:" in colour maps
    "zlato": "silk:#c9a03a",
    "med": "silk:#b8693d",
    "sedef": "silk:#efe9df",
}


def srgb_to_linear(hexcol: str):
    h = hexcol.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]


# ---------------------------------------------------------------- 2D helpers
def rrect(w, h, r, cx=0.0, cy=0.0):
    r = min(r, w / 2 - 1e-3, h / 2 - 1e-3)
    return box(cx - w / 2 + r, cy - h / 2 + r, cx + w / 2 - r, cy + h / 2 - r).buffer(r, 32)


def circle(r, cx=0.0, cy=0.0, res=64):
    return Point(cx, cy).buffer(r, res)


def text_poly(text, size, font=FONT_ROUND):
    """Glyph outlines as a shapely (Multi)Polygon, centred on the origin."""
    from matplotlib.textpath import TextPath
    from matplotlib.font_manager import FontProperties

    tp = TextPath((0, 0), text, size=size, prop=FontProperties(fname=font))
    geom = Polygon()
    for ring in tp.to_polygons(closed_only=True):
        if len(ring) < 3:
            continue
        p = Polygon(ring).buffer(0)
        geom = geom.symmetric_difference(p)
    minx, miny, maxx, maxy = geom.bounds
    return affinity.translate(geom, -(minx + maxx) / 2, -(miny + maxy) / 2)


def gear_poly(teeth, module, cx=0.0, cy=0.0, bore=0.0):
    rp = teeth * module / 2
    ra, rf = rp + module, rp - 1.25 * module
    pts = []
    for i in range(teeth):
        a0 = 2 * math.pi * i / teeth
        step = 2 * math.pi / teeth
        for frac, r in ((0.0, rf), (0.12, rf), (0.30, ra), (0.55, ra), (0.73, rf), (1.0, rf)):
            a = a0 + frac * step
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    g = Polygon(pts).buffer(module * 0.12).buffer(-module * 0.12)
    if bore > 0:
        g = g.difference(circle(bore, cx, cy))
    return g


# ---------------------------------------------------------------- 3D helpers
def extrude(poly, h, z0=0.0):
    polys = list(poly.geoms) if isinstance(poly, MultiPolygon) else [poly]
    meshes = []
    for p in polys:
        if p.is_empty or p.area < 1e-6:
            continue
        m = trimesh.creation.extrude_polygon(p, h)
        m.apply_translation([0, 0, z0])
        meshes.append(m)
    return trimesh.util.concatenate(meshes)


def bevel_extrude(poly, h, bevel, z0=0.0, steps=4):
    """Extrusion with a rounded top edge (approximated with stacked insets)."""
    bevel = min(bevel, h * 0.9)
    parts = [extrude(poly, h - bevel, z0)]
    for i in range(steps):
        t0 = i / steps
        t1 = (i + 1) / steps
        inset = bevel * (1 - math.cos(t1 * math.pi / 2))
        dz0 = bevel * math.sin(t0 * math.pi / 2)
        dz1 = bevel * math.sin(t1 * math.pi / 2)
        p = poly.buffer(-inset, 24)
        if p.is_empty:
            break
        parts.append(extrude(p, dz1 - dz0 + 1e-4, z0 + h - bevel + dz0))
    return trimesh.util.concatenate(parts)


def ellipsoid(rx, ry, rz, center=(0, 0, 0), sub=4):
    m = trimesh.creation.icosphere(subdivisions=sub)
    m.apply_scale([rx, ry, rz])
    m.apply_translation(center)
    return m


def cylinder(r, h, center=(0, 0, 0), sections=72):
    m = trimesh.creation.cylinder(radius=r, height=h, sections=sections)
    m.apply_translation(center)
    return m


def cone(r, h, base=(0, 0, 0), sections=48):
    m = trimesh.creation.cone(radius=r, height=h, sections=sections)
    m.apply_translation(base)
    return m


def torus(R, r, center=(0, 0, 0), major=96, minor=24):
    m = trimesh.creation.torus(major_radius=R, minor_radius=r, major_sections=major, minor_sections=minor)
    m.apply_translation(center)
    return m


def tube(path, radius, nseg=28, caps=True, closed=False):
    """Sweep a circle along a polyline with parallel-transport frames."""
    path = np.asarray(path, float)
    n = len(path)
    rad = np.broadcast_to(np.asarray(radius, float), (n,))
    if closed:
        tang = np.roll(path, -1, 0) - np.roll(path, 1, 0)
    else:
        tang = np.gradient(path, axis=0)
    tang /= np.linalg.norm(tang, axis=1)[:, None]
    ref = np.array([0, 0, 1.0]) if abs(tang[0][2]) < 0.9 else np.array([1.0, 0, 0])
    nrm = np.cross(tang[0], ref); nrm /= np.linalg.norm(nrm)
    normals = [nrm]
    for i in range(1, n):
        v = normals[-1] - np.dot(normals[-1], tang[i]) * tang[i]
        normals.append(v / np.linalg.norm(v))
    normals = np.array(normals)
    binorm = np.cross(tang, normals)
    ang = np.linspace(0, 2 * np.pi, nseg, endpoint=False)
    ring = (np.cos(ang)[None, :, None] * normals[:, None, :] + np.sin(ang)[None, :, None] * binorm[:, None, :])
    verts = (path[:, None, :] + ring * rad[:, None, None]).reshape(-1, 3)
    faces = []
    rows = n if closed else n - 1
    for i in range(rows):
        i2 = (i + 1) % n
        for j in range(nseg):
            j2 = (j + 1) % nseg
            a, b, c, d = i * nseg + j, i * nseg + j2, i2 * nseg + j2, i2 * nseg + j
            faces += [[a, b, c], [a, c, d]]
    m = trimesh.Trimesh(verts, faces, process=False)
    parts = [m]
    if caps and not closed:
        for idx, sgn in ((0, -1), (n - 1, 1)):
            parts.append(ellipsoid(rad[idx], rad[idx], rad[idx], path[idx], sub=3))
    out = trimesh.util.concatenate(parts)
    out.fix_normals()
    return out


def vessel(rfun, H, wall=0.25, base=0.3, nt=200, nz=140, open_top=True):
    """Thin-walled vessel. rfun(theta[], t[]) -> outer radius, t in [0,1] along height."""
    th = np.linspace(0, 2 * np.pi, nt, endpoint=False)
    tz = np.linspace(0, 1, nz + 1)
    T, Z = np.meshgrid(th, tz)
    R = rfun(T, Z)

    def grid(Rr, z0, z1, flip):
        zz = z0 + (z1 - z0) * Z
        v = np.stack([Rr * np.cos(T), Rr * np.sin(T), zz], -1).reshape(-1, 3)
        f = []
        for i in range(nz):
            for j in range(nt):
                j2 = (j + 1) % nt
                a, b, c, d = i * nt + j, i * nt + j2, (i + 1) * nt + j2, (i + 1) * nt + j
                f += [[a, b, c], [a, c, d]] if not flip else [[a, c, b], [a, d, c]]
        return trimesh.Trimesh(v, f, process=False)

    outer = grid(R, 0, H, False)
    parts = [outer]
    # bottom cap
    ring0 = np.stack([R[0] * np.cos(th), R[0] * np.sin(th), np.zeros(nt)], -1)
    parts.append(fan(ring0, [0, 0, 0], flip=True))
    if open_top:
        Ri = np.maximum(R - wall, 0.05)
        inner = grid(Ri, base, H, True)
        parts.append(inner)
        top_o = np.stack([R[-1] * np.cos(th), R[-1] * np.sin(th), np.full(nt, H)], -1)
        top_i = np.stack([Ri[-1] * np.cos(th), Ri[-1] * np.sin(th), np.full(nt, H)], -1)
        parts.append(strip(top_o, top_i))
        ringb = np.stack([Ri[0] * np.cos(th), Ri[0] * np.sin(th), np.full(nt, base)], -1)
        parts.append(fan(ringb, [0, 0, base], flip=False))
    else:
        top = np.stack([R[-1] * np.cos(th), R[-1] * np.sin(th), np.full(nt, H)], -1)
        parts.append(fan(top, [0, 0, H], flip=False))
    return parts


def fan(ring, center, flip=False):
    n = len(ring)
    v = np.vstack([ring, center])
    f = [[n, (j + 1) % n, j] if flip else [n, j, (j + 1) % n] for j in range(n)]
    return trimesh.Trimesh(v, f, process=False)


def strip(a, b):
    n = len(a)
    v = np.vstack([a, b])
    f = []
    for j in range(n):
        j2 = (j + 1) % n
        f += [[j, j2, n + j2], [j, n + j2, n + j]]
    return trimesh.Trimesh(v, f, process=False)


def T(m, *, t=(0, 0, 0), rz=0.0, rx=0.0, ry=0.0, s=None):
    m = m.copy()
    if s is not None:
        m.apply_scale(s)
    for ang, ax in ((rx, [1, 0, 0]), (ry, [0, 1, 0]), (rz, [0, 0, 1])):
        if ang:
            m.apply_transform(trimesh.transformations.rotation_matrix(math.radians(ang), ax))
    m.apply_translation(t)
    return m


# ---------------------------------------------------------------- scene model
@dataclass
class Part:
    mesh: trimesh.Trimesh
    mat: str = "main"           # material key resolved per variant
    smooth: bool = True         # smooth-shade with angle threshold


@dataclass
class Model:
    parts: list = field(default_factory=list)

    def add(self, mesh, mat="main", smooth=True):
        if isinstance(mesh, (list, tuple)):
            for m in mesh:
                self.parts.append(Part(m, mat, smooth))
        else:
            self.parts.append(Part(mesh, mat, smooth))
        return self

    def bounds(self):
        b = np.array([p.mesh.bounds for p in self.parts])
        return np.array([b[:, 0].min(0), b[:, 1].max(0)])

    def transformed(self, **kw):
        return Model([Part(T(p.mesh, **kw), p.mat, p.smooth) for p in self.parts])

    def merge(self, other):
        self.parts += other.parts
        return self


def materials(colors: dict):
    """Material dictionary. `colors` maps material keys to sRGB hex."""
    def pla(hexcol, alpha=0.22):
        return {"type": "roughplastic", "distribution": "ggx", "alpha": alpha, "int_ior": 1.5,
                "diffuse_reflectance": {"type": "rgb", "value": srgb_to_linear(hexcol)}}

    def silk(hexcol):
        return {"type": "roughplastic", "distribution": "ggx", "alpha": 0.07, "int_ior": 1.62,
                "diffuse_reflectance": {"type": "rgb", "value": srgb_to_linear(hexcol)}}

    mats = {k: (silk(v[5:]) if v.startswith("silk:") else pla(v)) for k, v in colors.items()}
    mats.setdefault("metal", {"type": "roughconductor", "material": "Al", "alpha": 0.12})
    mats.setdefault("steel", {"type": "roughconductor", "material": "Cr", "alpha": 0.2})
    mats.setdefault("ink", pla("#1d1b22", 0.15))
    mats.setdefault("white", pla("#f7f4ee"))
    mats.setdefault("phone", pla("#1c1c22", 0.12))
    mats.setdefault("screen", {"type": "plastic", "diffuse_reflectance": {"type": "rgb", "value": srgb_to_linear("#2b2f4a")}, "int_ior": 1.5})
    mats.setdefault("wood", pla("#b98a5e", 0.5))
    mats.setdefault("leaf", pla("#6f9a62", 0.35))
    mats.setdefault("leaf2", pla("#8bb57a", 0.35))
    mats.setdefault("soil", {"type": "diffuse", "reflectance": {"type": "rgb", "value": srgb_to_linear("#4a3a30")}})
    mats.setdefault("ceramic", pla("#fbfaf7", 0.08))
    mats.setdefault("cable", pla("#2c2c30", 0.35))
    mats.setdefault("cable2", pla("#f1efe9", 0.35))
    mats.setdefault("sponge", pla("#f2c14e", 0.9))
    mats.setdefault("pencil", pla("#f2c14e", 0.3))
    mats.setdefault("pencil2", pla("#8fb8e6", 0.3))
    mats.setdefault("pencil3", pla("#ee6b62", 0.3))
    mats.setdefault("lead", pla("#e9d3b0", 0.6))
    mats.setdefault("food_bun", pla("#d99a4e", 0.5))
    mats.setdefault("food_patty", pla("#6b3e26", 0.6))
    mats.setdefault("food_cheese", pla("#f4c23a", 0.4))
    mats.setdefault("food_lettuce", pla("#7db65a", 0.4))
    mats.setdefault("food_tomato", pla("#d8413a", 0.3))
    mats.setdefault("glow", {"type": "diffuse", "reflectance": {"type": "rgb", "value": [0.9, 0.8, 0.6]}})
    return {k: {"type": "twosided", "bsdf": v} for k, v in mats.items()}


# ---------------------------------------------------------------- PLY io
def write_ply_raw(path, v, f, nrm):
    with open(path, "wb") as fh:
        hdr = ("ply\nformat binary_little_endian 1.0\n"
               f"element vertex {len(v)}\nproperty float x\nproperty float y\nproperty float z\n"
               "property float nx\nproperty float ny\nproperty float nz\n"
               f"element face {len(f)}\nproperty list uchar int vertex_indices\nend_header\n")
        fh.write(hdr.encode())
        fh.write(np.hstack([v, nrm]).astype("<f4").tobytes())
        rec = np.zeros(len(f), dtype=[("n", "u1"), ("i", "<i4", 3)])
        rec["n"] = 3; rec["i"] = f
        fh.write(rec.tobytes())


def write_ply(path, mesh: trimesh.Trimesh, smooth=True):
    m = mesh.copy()
    if not smooth:
        m.unmerge_vertices()  # per-face normals for crisp facets
    else:
        try:
            m = trimesh.graph.smooth_shade(m, angle=math.radians(32), facet_minarea=None)
        except TypeError:
            m = trimesh.graph.smooth_shade(m, angle=math.radians(32))
    # Z-up (cm) -> Mitsuba Y-up
    v = m.vertices[:, [0, 2, 1]].copy(); v[:, 2] *= -1
    nrm = m.vertex_normals[:, [0, 2, 1]].copy(); nrm[:, 2] *= -1
    f = m.faces  # (x,y,z)->(x,z,-y) is a proper rotation: winding is preserved
    with open(path, "wb") as fh:
        hdr = ("ply\nformat binary_little_endian 1.0\n"
               f"element vertex {len(v)}\nproperty float x\nproperty float y\nproperty float z\n"
               "property float nx\nproperty float ny\nproperty float nz\n"
               f"element face {len(f)}\nproperty list uchar int vertex_indices\nend_header\n")
        fh.write(hdr.encode())
        fh.write(np.hstack([v, nrm]).astype("<f4").tobytes())
        rec = np.zeros(len(f), dtype=[("n", "u1"), ("i", "<i4", 3)])
        rec["n"] = 3; rec["i"] = f
        fh.write(rec.tobytes())


# ---------------------------------------------------------------- studio
def cyclorama(width=600, depth=260, radius=70, height=260, back=-60, nseg=40, nx=24, nfloor=24):
    """Seamless studio sweep in Mitsuba Y-up coordinates (floor y=0, wall at z=back).

    Built from many small quads: huge triangles lose precision on the GPU path.
    """
    pts = [(0.0, float(depth) - (float(depth) - (back + radius)) * k / nfloor) for k in range(nfloor + 1)]
    for i in range(1, nseg + 1):
        a = (math.pi / 2) * i / nseg
        pts.append((radius - radius * math.cos(a), back + radius - radius * math.sin(a)))
    for k in range(1, 9):
        pts.append((radius + (height - radius) * k / 8, float(back)))
    xs = np.linspace(-width / 2, width / 2, nx + 1)
    verts = np.array([(x, y, z) for (y, z) in pts for x in xs])
    faces = []
    for k in range(1, len(pts)):
        for i in range(nx):
            a = (k - 1) * (nx + 1) + i
            b, c, d = a + 1, k * (nx + 1) + i + 1, k * (nx + 1) + i
            faces += [(a, b, c), (a, c, d)]
    return trimesh.Trimesh(verts, faces, process=False)


@dataclass
class View:
    az: float = -32.0     # degrees, 0 = front
    el: float = 20.0      # degrees above horizon
    fov: float = 26.0
    fill: float = 0.74    # fraction of the frame the object should occupy
    yshift: float = 0.0   # positive pushes the object up in frame


VIEWS = {
    "hero": View(),
    "side": View(az=28, el=9, fill=0.72),
    "top": View(az=-12, el=58, fill=0.72),
    "detail": View(az=-20, el=24, fill=1.05),
}


def _look(origin, target):
    import mitsuba as mi
    return mi.ScalarTransform4f().look_at(origin=list(map(float, origin)), target=list(map(float, target)), up=[0, 1, 0])


def render(model: Model, colors: dict, out_png: str, *, view: View = VIEWS["hero"], size=(1080, 1350),
           spp=256, backdrop="#f3ede4", norm_radius=10.0, extra_rot=0.0, return_projection=None,
           white_png=None):
    """Render a model in the shared studio. Returns optional projected 2D anchors."""
    import mitsuba as mi
    mi.set_variant("metal_ad_rgb")

    # normalise scale so lighting/shadows are identical for small and large objects
    lo, hi = model.bounds()
    centre_xy = (lo[:2] + hi[:2]) / 2
    radius = np.linalg.norm(hi - lo) / 2
    s = norm_radius / radius
    tmp = tempfile.mkdtemp(prefix="imagoo_")
    mats = materials(colors)
    scene = {"type": "scene", "integrator": {"type": "path", "max_depth": 7}}

    pts_all = []
    for i, p in enumerate(model.parts):
        m = T(p.mesh, t=(-centre_xy[0], -centre_xy[1], -lo[2]))
        m = T(m, rz=extra_rot, s=s)
        fn = os.path.join(tmp, f"p{i}.ply")
        write_ply(fn, m, smooth=p.smooth)
        scene[f"part{i}"] = {"type": "ply", "filename": fn, "bsdf": mats[p.mat]}
        if p.mat == "glow":  # LED tealight flame
            scene[f"part{i}"]["emitter"] = {"type": "area", "radiance": {"type": "rgb", "value": [14.0, 8.5, 3.2]}}
        v = m.vertices[:, [0, 2, 1]].copy(); v[:, 2] *= -1
        pts_all.append(v)
    pts = np.vstack(pts_all)

    # backdrop
    cyc = cyclorama(width=900, depth=420, radius=48, height=420, back=-78)
    fn = os.path.join(tmp, "cyc.ply")
    write_ply_raw(fn, cyc.vertices, cyc.faces, cyc.vertex_normals)
    if not os.environ.get("NOBACK"): scene["backdrop"] = {"type": "ply", "filename": fn,
                         "bsdf": {"type": "twosided", "bsdf": {"type": "diffuse", "reflectance": {"type": "rgb", "value": srgb_to_linear(backdrop)}}}}

    # lights (in normalised units, object radius ~10)
    def area(name, pos, tgt, sx, sy, rad):
        scene[name] = {"type": "rectangle",
                       "to_world": _look(pos, tgt) @ mi.ScalarTransform4f().scale([sx, sy, 1]),
                       "emitter": {"type": "area", "radiance": {"type": "rgb", "value": rad}}}

    area("key", (-42, 52, 36), (0, 4, 0), 24, 24, [6.4, 6.1, 5.7])
    area("fill", (46, 22, 34), (0, 5, 0), 22, 22, [1.5, 1.55, 1.65])
    area("rim", (18, 48, -30), (0, 6, 0), 18, 12, [2.4, 2.3, 2.2])
    area("top", (0, 95, -20), (0, 0, -40), 60, 40, [1.5, 1.45, 1.4])
    scene["env"] = {"type": "constant", "radiance": {"type": "rgb", "value": [0.46, 0.45, 0.43]}}

    # camera: auto-fit projected extents
    W, H = size
    aspect = W / H
    fov = math.radians(view.fov)  # horizontal if W>=H, Mitsuba uses x fov by default
    az, el = math.radians(view.az), math.radians(view.el)
    d_dir = np.array([math.sin(az) * math.cos(el), math.sin(el), math.cos(az) * math.cos(el)])
    tgt = np.array([0.0, (pts[:, 1].max()) * 0.5, 0.0])
    dist = 40.0
    tanx = math.tan(fov / 2)
    tany = tanx / aspect
    for _ in range(14):
        cam = tgt + d_dir * dist
        fwd = (tgt - cam) / np.linalg.norm(tgt - cam)
        right = np.cross(fwd, [0, 1, 0]); right /= np.linalg.norm(right)
        up = np.cross(right, fwd)
        rel = pts - cam
        z = rel @ fwd
        x = (rel @ right) / z / tanx
        y = (rel @ up) / z / tany
        cx, cy = (x.max() + x.min()) / 2, (y.max() + y.min()) / 2
        ext = max((x.max() - x.min()) / 2, (y.max() - y.min()) / 2)
        # recentre target in camera plane
        tgt = tgt + right * cx * z.mean() * tanx + up * (cy - view.yshift) * z.mean() * tany
        dist *= ext / view.fill
        if os.environ.get("FITDEBUG"): print("fit", dist, tgt, ext, cx, cy)
    cam = tgt + d_dir * dist
    scene["sensor"] = {"type": "perspective", "fov": view.fov, "fov_axis": "x",
                       "to_world": _look(cam, tgt),
                       "film": {"type": "hdrfilm", "width": W, "height": H, "rfilter": {"type": "gaussian"}},
                       "sampler": {"type": "independent", "sample_count": spp}}
    sc = mi.load_dict(scene)
    img = mi.render(sc, spp=spp)
    bmp = mi.Bitmap(img).convert(mi.Bitmap.PixelFormat.RGB, mi.Struct.Type.UInt8, srgb_gamma=True)
    os.makedirs(os.path.dirname(out_png), exist_ok=True)
    bmp.write(out_png)

    if white_png:
        # "Shadow catcher": divide by an empty-studio plate from the same camera, so the
        # backdrop becomes white while objects and contact shadows are preserved.
        from scipy.ndimage import gaussian_filter
        plate_scene = {k: v for k, v in scene.items() if not k.startswith("part")}
        plate = np.array(mi.render(mi.load_dict(plate_scene), spp=max(spp, 256)))
        plate = np.stack([gaussian_filter(plate[..., c], 3) for c in range(3)], -1)
        lin = np.array(img)[..., :3]
        ratio = np.clip(lin / np.maximum(plate, 1e-4), 0, 1)
        # clean residual sampling noise on the empty ground, keep soft shadows
        from scipy.ndimage import median_filter
        from scipy.ndimage import binary_dilation

        def depth(sc_dict):
            d = dict(sc_dict)
            d["integrator"] = {"type": "aov", "aovs": "dd:depth"}
            d["sensor"] = dict(d["sensor"]); d["sensor"]["sampler"] = {"type": "independent", "sample_count": 4}
            return np.array(mi.render(mi.load_dict(d), spp=4))[..., -1]

        obj = depth(scene) < depth(plate_scene) - 1e-3
        obj = binary_dilation(obj, iterations=3)
        lum = median_filter(ratio.mean(-1), size=3)
        t = np.clip((lum - 0.94) / (0.985 - 0.94), 0, 1)
        t = np.where(obj, 0.0, t * t * (3 - 2 * t))[..., None]
        ratio = ratio * (1 - t) + t
        srgb = np.where(ratio <= 0.0031308, ratio * 12.92, 1.055 * np.power(ratio, 1 / 2.4) - 0.055)
        from PIL import Image as _I
        _I.fromarray((np.clip(srgb, 0, 1) * 255 + 0.5).astype(np.uint8)).save(white_png)

    if return_projection is not None:
        # project given world points (model coordinates, Z-up cm) into [0,1] image coords
        fwd = (tgt - cam) / np.linalg.norm(tgt - cam)
        right = np.cross(fwd, [0, 1, 0]); right /= np.linalg.norm(right)
        up = np.cross(right, fwd)
        res = {}
        for key, p in return_projection.items():
            q = (np.asarray(p, float) - [centre_xy[0], centre_xy[1], lo[2]]) * s
            q = T(trimesh.Trimesh([q], [], process=False), rz=extra_rot).vertices[0]
            w = np.array([q[0], q[2], -q[1]])
            rel = w - cam
            z = rel @ fwd
            # Mitsuba's x axis is mirrored relative to `right` in look_at frame
            xx = (rel @ right) / z / tanx
            yy = (rel @ up) / z / tany
            res[key] = (round(float(0.5 + xx / 2), 4), round(float(0.5 - yy / 2), 4))
        return res
    return None
