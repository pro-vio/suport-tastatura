# -*- coding: utf-8 -*-
"""Desenează modelul taburetului peste desenul cotat IKEA, cu aceeași proiecție găsită de calibreaza.py.

Unde liniile roșii cad pe liniile negre ale desenului, modelul îl urmează; unde se depărtează, modelul greșește.
Asta arată că modelul se potrivește cu desenul IKEA, nu că desenul IKEA se potrivește cu taburetul real.
    python masuratori/suprapune.py desen.jpg piese.json iesire.png
piese.json: {"piese": [{"sus": [[x,y,z]×4], "jos": [...]}...], "dy": mutarea pe y din modelul nostru în cadrul măsurătorii}
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw

AICI = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(AICI, 'bekvam-cote.json'), encoding='utf-8'))
desen, fis_piese, iesire = sys.argv[1:4]

# aceeași proiecție ca în calibreaza.py: o, ex, ey din tălpi; ez din șezut
A, b = [], []
for p in M['podea']:
    x, y, _ = p['xyz']
    for k in range(2):
        r = [0.0] * 6; r[k] = 1.0; r[2 + k] = x; r[4 + k] = y
        A.append(r); b.append(p['px'][k])
o_u, o_v, exu, exv, eyu, eyv = np.linalg.solve(np.array(A), np.array(b))
sz = M['sezut']; A, b = [], []
for c in sz['colturi']:
    dy = 240 if c['partea'] == 'treapta' else 0
    ru = c['px'][0] - o_u - c['x'] * exu - dy * eyu
    rv = c['px'][1] - o_v - c['x'] * exv - dy * eyv
    A += [[eyu, 0.0], [eyv, sz['z']]]; b += [ru, rv]
(y0, ezv), *_ = np.linalg.lstsq(np.array(A), np.array(b), rcond=None)

date = json.load(open(fis_piese, encoding='utf-8'))
dy = date['dy']
P = lambda x, y, z: (o_u + x * exu + (y + dy) * eyu, o_v + x * exv + (y + dy) * eyv + z * ezv)

im = Image.open(desen).convert('RGB')
d = ImageDraw.Draw(im)
for pc in date['piese']:
    s, j = pc['sus'], pc['jos']
    muchii = [(s[i], s[(i + 1) % 4]) for i in range(4)] + [(j[i], j[(i + 1) % 4]) for i in range(4)] + [(s[i], j[i]) for i in range(4)]
    for a, c in muchii:
        d.line([P(*a), P(*c)], fill=(220, 30, 30), width=2)
im.save(iesire)
print('scris', iesire)
