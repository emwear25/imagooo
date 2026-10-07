"""Minimal 3MF loader: objects (incl. external component files), build transforms, and Bambu
per-triangle `paint_color` groups (multi-colour painted models)."""
import re
import zipfile

import numpy as np
import trimesh

V_RE = re.compile(r'<vertex x="([-\d.eE+]+)" y="([-\d.eE+]+)" z="([-\d.eE+]+)"')
T_RE = re.compile(r'<triangle v1="(\d+)" v2="(\d+)" v3="(\d+)"([^>]*)/>')


def _mat(s):
    if not s:
        return np.eye(4)
    a = [float(x) for x in s.split()]
    M = np.eye(4)
    M[:3, :3] = np.array(a[:9]).reshape(3, 3).T
    M[:3, 3] = a[9:12]
    return M


def _objects(xml):
    out = {}
    for oid, body in re.findall(r'<object id="(\d+)"[^>]*>(.*?)</object>', xml, re.S):
        if '<mesh' in body:
            v = np.array(V_RE.findall(body), float)
            tris = T_RE.findall(body)
            f = np.array([t[:3] for t in tris], int)
            paint = [re.search(r'paint_color="([^"]*)"', t[3]) for t in tris]
            paint = np.array([p.group(1) if p else '' for p in paint])
            out[oid] = ("mesh", v, f, paint)
        else:
            comps = re.findall(r'<component ([^>]*)/>', body)
            out[oid] = ("comp", comps)
    return out


def load(path):
    """Return {group_key: trimesh} where group_key is 'obj<i>' or 'obj<i>:paint<code>'."""
    z = zipfile.ZipFile(path)
    files = {n: z.read(n).decode('utf8', 'ignore') for n in z.namelist() if n.endswith('.model')}
    objs = {('/' + n, k): v for n, x in files.items() for k, v in _objects(x).items()}
    root = '/3D/3dmodel.model'
    groups = {}

    def emit(key, ref, M):
        kind = objs[ref][0]
        if kind == "mesh":
            _, v, f, paint = objs[ref]
            vv = (np.c_[v, np.ones(len(v))] @ M.T)[:, :3]
            for code in np.unique(paint):
                sel = f[paint == code]
                m = trimesh.Trimesh(vv, sel, process=True)
                k = f"{key}:paint{code}" if code else key
                groups[k] = trimesh.util.concatenate([groups[k], m]) if k in groups else m
        else:
            for c in objs[ref][1]:
                oid = re.search(r'objectid="(\d+)"', c).group(1)
                p = re.search(r'p:path="([^"]+)"', c)
                t = re.search(r'transform="([^"]+)"', c)
                emit(key, (p.group(1) if p else ref[0], oid), M @ _mat(t.group(1) if t else ''))

    for i, it in enumerate(re.findall(r'<item ([^>]*)/>', files['3D/3dmodel.model'])):
        oid = re.search(r'objectid="(\d+)"', it).group(1)
        t = re.search(r'transform="([^"]+)"', it)
        emit(f"obj{i}", (root, oid), _mat(t.group(1) if t else ''))
    return groups
