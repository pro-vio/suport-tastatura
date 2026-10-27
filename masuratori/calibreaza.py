# -*- coding: utf-8 -*-
"""Măsoară taburetul pe desenul cotat IKEA, în loc să-i ghicească unghiurile.

Desenul e o axonometrie: o proiecție paralelă, în care verticalele rămân verticale. Atunci
punctul din lume (x, y, z) ajunge pe desen în o + x·ex + y·ey + z·ez, cu ez vertical.
  1. Trei tălpi, a căror poziție la podea o știm din cotele 430 × 390, dau o, ex și ey.
  2. Colțurile șezutului, la z = 500 și cu x = ±180 cunoscut, dau ez și poziția șezutului în adâncime.
  3. Colțurile treptei, la z = 250, dau locul treptei, pe x și pe y.
Din acestea ies înclinările picioarelor și cât iese treapta peste ele.

Scrie ../taburet-masurat.js, pe care îl citește geometrie.js. Se rulează după orice schimbare în
bekvam-cote.json:
    python masuratori/calibreaza.py
"""
import json, os
import numpy as np

AICI = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(AICI, 'bekvam-cote.json'), encoding='utf-8'))

# 1. podeaua: o, ex, ey din trei tălpi (6 ecuații, 6 necunoscute)
A, b = [], []
for p in M['podea']:
    x, y, _ = p['xyz']
    for k in range(2):                       # u, apoi v
        rand = [0.0] * 6
        rand[k] = 1.0                        # o
        rand[2 + k] = x                      # ex
        rand[4 + k] = y                      # ey
        A.append(rand); b.append(p['px'][k])
o_u, o_v, exu, exv, eyu, eyv = np.linalg.solve(np.array(A), np.array(b))
o, ex, ey = np.array([o_u, o_v]), np.array([exu, exv]), np.array([eyu, eyv])

# 2. șezutul: necunoscute ez_v și y0 (marginea șezutului de pe partea opusă treptei); ez_u = 0
sz = M['sezut']; z = sz['z']; D_SEZ = 240
A, b = [], []
for c in sz['colturi']:
    dy = D_SEZ if c['partea'] == 'treapta' else 0
    rest = np.array(c['px']) - o - c['x'] * ex - dy * ey
    A.append([eyu, 0.0]); b.append(rest[0])          # u: y0·ey_u + z·0
    A.append([eyv, z]); b.append(rest[1])            # v: y0·ey_v + z·ez_v
(y0, ezv), rez, *_ = np.linalg.lstsq(np.array(A), np.array(b), rcond=None)
ez = np.array([0.0, ezv])
abatere = np.sqrt(rez[0] / len(b)) if len(rez) else 0.0

# un punct de pe desen, la înălțimea z cunoscută, înapoi în (x, y)
def inapoi(px, z):
    rest = np.array(px) - o - z * ez
    return np.linalg.solve(np.column_stack([ex, ey]), rest)

tr = M['treapta']; zt = tr['z']
fata = [inapoi(p['px'], zt) for p in tr['muchia_din_fata']]
spate = [inapoi(p['px'], zt) for p in tr['muchia_din_spate']]
y_fata = float(np.mean([p[1] for p in fata]))
y_spate = float(np.mean([p[1] for p in spate]))
x_st, x_dr = float(fata[0][0]), float(fata[1][0])

rezultat = {
    'sezutSpate': round(float(y0), 1),             # y-ul marginii șezutului dinspre utilizator
    'sezutTreapta': round(float(y0) + D_SEZ, 1),    # y-ul marginii șezutului dinspre treaptă
    'bazaSpate': -195, 'bazaTreapta': 195,
    'treaptaFata': round(y_fata, 1), 'treaptaSpate': round(y_spate, 1),
    'treaptaLat': round(x_dr - x_st, 1),
    'scaraOrizontala': round(float(np.hypot(*ex)), 4), 'scaraVerticala': round(float(-ezv), 4),
    'abatereMedie_px': round(float(abatere), 2)
}
cale = os.path.join(AICI, '..', 'taburet-masurat.js')
with open(cale, 'w', encoding='utf-8') as f:
    f.write('// Generat de masuratori/calibreaza.py din masuratori/bekvam-cote.json. Nu se editează de mână.\n')
    f.write('const MASURAT = ' + json.dumps(rezultat, ensure_ascii=False, indent=2) + ';\n')
for k, v in rezultat.items():
    print(f'{k:18} {v}')
