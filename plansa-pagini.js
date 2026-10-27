// Planșele 1, 3 și 4: axonometria, planul de debitare, eurosuruburile.
// Folosește ajutoarele din plansa.html (o, txt, vedere, titlu, cartus, pune) și cotele din geometrie.js.

// ================= Planșa 1: axonometrie =================
// Proiecție izometrică: privim dinspre dreapta-față-sus. x spre dreapta, y în adâncime (fața la y mic), z în sus.
const ISO = { u: (x, y) => (x + y) / Math.SQRT2, w: (x, y, z) => (-x + y + 2 * z) / Math.sqrt(6) };
const CULORI = {
  pin: ['#efd8a8', '#dfc08a', '#cba56f'],      // sus, față, dreapta
  negru: ['#55555a', '#38383c', '#28282b'],
  taburet: ['#3e3e42', '#2c2c30', '#202023'],
  tastatura: ['#e2e2e6', '#c9c9ce', '#b3b3b9'],
  mouse: ['#a7a7ad', '#8e8e94', '#78787e']
};
const cub = (x0, x1, y0, y1, z0, z1, c, gauri = []) => ({ x0, x1, y0, y1, z0, z1, c, gauri });

// Un corp cu fețe plane, dat prin fețele lui; pentru picioarele înclinate ale taburetului.
const corp = (fete, c, op = 1) => ({ fete, c, op });
const prisma = (sus, jos, c) => corp([sus, jos, ...sus.map((_, i) => [sus[i], sus[(i + 1) % 4], jos[(i + 1) % 4], jos[i]])], c);
const cubCorp = b => {
  const sq = z => [[b.x0, b.y0, z], [b.x1, b.y0, z], [b.x1, b.y1, z], [b.x0, b.y1, z]];
  const k = prisma(sq(b.z1), sq(b.z0), b.c);
  k.op = b.op ?? 1;
  k.cutie = true;   // corp cu fețele paralele cu axele: se ordonează întreg, nu pe fețe
  k.rol = b.rol;
  return k;
};

function deseneazaIzo(cuburi, cadru, corpuri = []) {
  const pts = [];
  for (const b of cuburi) for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const z of [b.z0, b.z1])
    pts.push([ISO.u(x, y), ISO.w(x, y, z)]);
  for (const c of corpuri) for (const f of c.fete) for (const [x, y, z] of f) pts.push([ISO.u(x, y), ISO.w(x, y, z)]);
  const minU = Math.min(...pts.map(p => p[0])), maxU = Math.max(...pts.map(p => p[0]));
  const minW = Math.min(...pts.map(p => p[1])), maxW = Math.max(...pts.map(p => p[1]));
  // cadrul se potrivește pe desen, afară de cazul în care primește deja scara și originea (animația, care nu are voie să sară)
  const k = cadru.fix ? cadru.fix.k : Math.min(cadru.w / (maxU - minU), cadru.h / (maxW - minW));
  const ox = cadru.fix ? cadru.fix.ox : cadru.x + (cadru.w - (maxU - minU) * k) / 2 - minU * k;
  const oy = cadru.fix ? cadru.fix.oy : cadru.y + cadru.h - (cadru.h - (maxW - minW) * k) / 2 + minW * k;
  const P2 = (x, y, z) => `${(ox + ISO.u(x, y) * k).toFixed(2)},${(oy - ISO.w(x, y, z) * k).toFixed(2)}`;
  const sw = cadru.linie ?? 0.1;
  const poly = (ps, fill, op = 1) => o.push(`<polygon points="${ps.map(p => P2(...p)).join(' ')}" fill="${fill}"${op < 1 ? ` fill-opacity="${op}"` : ''} stroke="#1a1a1a" stroke-width="${sw}" stroke-linejoin="round"/>`);

  // corpurile oarecare stau sub cuburi: se desenează primele, din spate în față, doar fețele întoarse spre noi
  const centru = pp => pp.reduce((s, p) => [s[0] + p[0] / pp.length, s[1] + p[1] / pp.length, s[2] + p[2] / pp.length], [0, 0, 0]);
  // fețele vizibile ale corpurilor oarecare (taburetul, pana), ordonate fiecare după cât de aproape e de privitor
  const fete = [];
  const fataVizibila = (c, f) => {
    const mc = centru(c.fete.flat()), [a, b, d] = f, u1 = b.map((x, i) => x - a[i]), u2 = d.map((x, i) => x - a[i]);
    let n = [u1[1] * u2[2] - u1[2] * u2[1], u1[2] * u2[0] - u1[0] * u2[2], u1[0] * u2[1] - u1[1] * u2[0]];
    const mf = centru(f);
    if (n[0] * (mf[0] - mc[0]) + n[1] * (mf[1] - mc[1]) + n[2] * (mf[2] - mc[2]) < 0) n = n.map(x => -x);
    if (n[0] - n[1] + n[2] <= 1e-9) return null;
    const [cs, cf, cd] = CULORI[c.c], ax = n.map(Math.abs);
    return ax[2] >= ax[0] && ax[2] >= ax[1] ? cs : ax[1] >= ax[0] ? cf : cd;
  };
  for (const c of corpuri.filter(c => !c.cutie)) {
    for (const f of c.fete) {
      const cul = fataVizibila(c, f), mf = centru(f);
      if (!cul) continue;
      // cheia: colțul cel mai apropiat al feței, ca o față lungă să nu treacă în spatele uneia scurte de lângă ea
      fete.push({ f, cul, op: c.op ?? 1, k: Math.max(...f.map(q => q[0] - q[1] + q[2])) + (mf[0] - mf[1] + mf[2]) });
    }
  }
  for (const x of fete.sort((a, b) => a.k - b.k)) poly(x.f, x.cul, x.op);

  // corpurile-cutie, ordonate întregi: unul stă în spatele altuia dacă e separat de el spre stânga, spre fund sau dedesubt.
  // Ordonarea pe fețe greșește aici: sertarul, care iese mult spre dreapta, ar ieși desenat peste capacul de deasupra lui.
  const cutii = corpuri.filter(c => c.cutie).map(c => {
    const v = c.fete.flat();
    return { c, x0: Math.min(...v.map(q => q[0])), x1: Math.max(...v.map(q => q[0])), y0: Math.min(...v.map(q => q[1])),
      y1: Math.max(...v.map(q => q[1])), z0: Math.min(...v.map(q => q[2])), z1: Math.max(...v.map(q => q[2])) };
  });
  const ep = 0.01, inSp = (a, b) => a.x1 <= b.x0 + ep || a.y0 >= b.y1 - ep || a.z1 <= b.z0 + ep;
  const ch = b => (b.x0 + b.x1) / 2 - (b.y0 + b.y1) / 2 + (b.z0 + b.z1) / 2;
  const ramase = new Set(cutii.map((_, i) => i));
  while (ramase.size) {
    const lib = [...ramase].filter(i => ![...ramase].some(j => j !== i && inSp(cutii[j], cutii[i]) && !inSp(cutii[i], cutii[j])));
    const i = (lib.length ? lib : [...ramase]).sort((a, b) => ch(cutii[a]) - ch(cutii[b]))[0];
    ramase.delete(i);
    const c = cutii[i].c;
    for (const f of c.fete) { const cul = fataVizibila(c, f); if (cul) poly(f, cul, c.op ?? 1); }
  }

  // Ordinea de desenare: un cub stă în spatele altuia dacă e separat de el spre stânga, spre fund sau dedesubt.
  const e = 0.01;
  const inSpate = (a, b) => a.x1 <= b.x0 + e || a.y0 >= b.y1 - e || a.z1 <= b.z0 + e;
  const cheie = b => (b.x0 + b.x1) / 2 - (b.y0 + b.y1) / 2 + (b.z0 + b.z1) / 2;
  const rest = new Set(cuburi.map((_, i) => i)), ordine = [];
  while (rest.size) {
    const libere = [...rest].filter(i => ![...rest].some(j => j !== i && inSpate(cuburi[j], cuburi[i]) && !inSpate(cuburi[i], cuburi[j])));
    const alege = (libere.length ? libere : [...rest]).sort((a, b) => cheie(cuburi[a]) - cheie(cuburi[b]))[0];
    ordine.push(alege); rest.delete(alege);
  }
  for (const i of ordine) {
    const b = cuburi[i], [cs, cf, cd] = CULORI[b.c];
    poly([[b.x0, b.y0, b.z1], [b.x1, b.y0, b.z1], [b.x1, b.y1, b.z1], [b.x0, b.y1, b.z1]], cs);
    poly([[b.x0, b.y0, b.z0], [b.x1, b.y0, b.z0], [b.x1, b.y0, b.z1], [b.x0, b.y0, b.z1]], cf);
    poly([[b.x1, b.y0, b.z0], [b.x1, b.y1, b.z0], [b.x1, b.y1, b.z1], [b.x1, b.y0, b.z1]], cd);
    // găurile de mână, pe fața (y0) sau pe dreapta (x1), ca ovale cu capete rotunde
    for (const g of b.gauri) {
      const n = 24, ps = [], r = Math.min(g.a, g.b) / 2, lung = Math.max(g.a, g.b) / 2 - r;
      for (let s = 0; s < 2; s++) for (let i = 0; i <= n; i++) {
        const th = Math.PI / 2 + s * Math.PI + i * Math.PI / n;
        const c = (s ? 1 : -1) * lung;
        let da = c + r * Math.cos(th), db = r * Math.sin(th);
        if (g.b > g.a) [da, db] = [db, -da];
        ps.push(g.pe === 'y0' ? [g.cx + da, b.y0, g.cz + db] : [b.x1, g.cy + da, g.cz + db]);
      }
      poly(ps, '#161618');
    }
  }
  return { k, ox, oy };
}

// Reperul celor trei axe, ca în desenul tehnic: săgeți din același punct, pe direcțiile din axonometrie.
// (px, py) e originea pe foaie, lung e lungimea săgeților pe foaie; culoarea și grosimea se pot schimba pentru animație.
function axeIzo(px, py, lung, marime = 2.1, gros = 0.25) {
  const dir = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
  const et = { x: 'x · lățime', y: 'y · adâncime', z: 'z · înălțime' };
  for (const a of ['x', 'y', 'z']) {
    const [x, y, z] = dir[a], du = ISO.u(x, y), dw = ISO.w(x, y, z), n = Math.hypot(du, dw);
    const ex = px + du / n * lung, ey = py - dw / n * lung;
    o.push(`<line x1="${px}" y1="${py}" x2="${ex}" y2="${ey}" stroke="#000" stroke-width="${gros}"/>`);
    const ang = Math.atan2(ey - py, ex - px), h = lung * 0.14;
    o.push(`<polygon points="${ex},${ey} ${ex - h * Math.cos(ang - 0.4)},${ey - h * Math.sin(ang - 0.4)} ${ex - h * Math.cos(ang + 0.4)},${ey - h * Math.sin(ang + 0.4)}" fill="#000"/>`);
    txt(ex + (a === 'z' ? 1.5 : du / n * 2), ey + (a === 'z' ? 0 : 2.5), et[a], marime, a === 'y' ? 'start' : a === 'x' ? 'start' : 'start');
  }
}

// Piesele poziției de lucru, pe grupe; originea în centrul taburetului, pe podea.
function scenaLucru() {
  const L = P.lungSus / 2, d = D.mareD / 2, g = {};
  // cutia mică
  const w = P.micaW / 2, m = D.micaD / 2, z0 = P.taburetH, z1 = z0 + D.micaH;
  g.cutiaMica = [
    cub(-w, w, -m, -m + t, z0, z1, 'pin'),
    cub(-w, w, m - t, m, z0, z1, 'pin'),
    cub(-w, w, -m + t, m - t, z0, z0 + t, 'pin'),
    cub(-w, w, -m + t, m - t, z1 - t, z1, 'pin'),
    cub(-w, -w + t, -m + t, m - t, z0 + t, z1 - t, 'pin'),
    cub(w - t, w, -m + t, m - t, z0 + t, z1 - t, 'pin', [{ pe: 'x1', cy: 0, cz: (z0 + z1) / 2, a: P.gauraL, b: P.gauraH }])
  ];
  // cutia mare, culcată, cu fața deschisă spre dreapta, cu șinele lipite în ea
  const Z0 = z1, Z1 = P.tinta, zs = Z1 - t - P.jocSertar - t, s = SCANDURA.lat;
  g.cutiaMare = [
    cub(-L, L, -d, d, Z0, Z0 + t, 'negru'),
    cub(-L, -L + t, -d + t, d - t, Z0 + t, Z1 - t, 'negru'),
    cub(-L, L, d - t, d, Z0 + t, Z1 - t, 'negru'),
    cub(-L + t, -L + t + D.sinaL, -d + t, -d + t + s, zs - t, zs, 'pin'),
    cub(-L + t, -L + t + D.sinaL, d - t - s, d - t, zs - t, zs, 'pin'),
    cub(-L, L, -d, -d + t, Z0 + t, Z1 - t, 'negru', [{ pe: 'y0', cx: 0, cz: (Z0 + Z1) / 2, a: P.gauraL, b: P.gauraH }]),
    Object.assign(cub(-L, L, -d, d, Z1 - t, Z1, 'negru'), { rol: 'capac' })
  ];
  // sertarul tras
  const ws = D.sertarW / 2, xs = -L + t + P.scos;
  g.sertar = [
    cub(xs, xs + D.sertarL, -ws, ws, zs, zs + t, 'pin'),
    cub(xs + D.sertarL - D.manerL, xs + D.sertarL, -ws, ws, zs - t, zs, 'pin')
  ];
  // tastatura și mouse-ul
  const xm = L + P.margine + 40;
  g.tastatura = [
    cub(-P.tastW / 2, P.tastW / 2, -d + 30, -d + 30 + P.tastD, Z1, Z1 + 25, 'tastatura'),
    cub(xm, xm + P.mouseW, -P.mouseL / 2, P.mouseL / 2, zs + t, zs + t + 35, 'mouse')
  ];
  return g;
}
function modelLucru() {
  const g = scenaLucru();
  return [...g.cutiaMica, ...g.cutiaMare, ...g.sertar, ...g.tastatura];
}

// Piesa în T și pana, la locul lor în poziția de lucru: tija prin cutii, bara pe fundul cutiei mari, pana sub șezut.
function scenaPiesaT() {
  const w = SCANDURA.lat / 2, g2 = P.t / 2, b = P.tBara / 2, pn = P.pana;
  const zJos = P.taburetH - TABURET.sezutGros - P.tSub, zBara = zJos + D.tTijaL, zs = P.taburetH - TABURET.sezutGros;
  const sq = (z0, z1) => [[-pn.gauraL / 2 + 1, -pn.lung / 2, z0], [pn.gauraL / 2 - 1, -pn.lung / 2, z0], [pn.gauraL / 2 - 1, pn.lung / 2, z1], [-pn.gauraL / 2 + 1, pn.lung / 2, z1]];
  return {
    T: [cubCorp(cub(-w, w, -g2, g2, zJos, zBara, 'pin')), cubCorp(cub(-b, b, -w, w, zBara, zBara + P.t, 'pin'))],
    pana: [prisma(sq(zs, zs), sq(zs - pn.lat, zs - pn.latMic), 'pin')]
  };
}

// Taburetul BEKVÄM, descriptiv: patru picioare înclinate, șezutul și treapta de jos în spate.
function modelTaburet() {
  return taburetPiese().map(pc => prisma(pc.sus, pc.jos, 'taburet'));
}

// Vederea laterală a ansamblului, din dreapta, la 1:10: utilizatorul e în stânga.
function vedereLaterala(x0, y0) {
  const v = vedere(x0, y0, 0.1), d = D.mareD / 2, m = D.micaD / 2, zM = P.taburetH + D.micaH, zT = P.tinta;
  o.push(`<line x1="${v.X(TABURET.fata) - 6}" y1="${y0}" x2="${v.X(TABURET.spate) + 6}" y2="${y0}" class="floor"/>`);
  for (const pc of taburetProiectat('dreapta'))
    o.push(`<polygon points="${pc.pts.map(q => v.X(q[0]) + ',' + v.Y(q[1])).join(' ')}" fill="#fff" stroke="#000" stroke-width="0.18" stroke-linejoin="round"/>`);
  v.rect(-P.t / 2, P.taburetH - TABURET.sezutGros - P.tSub, P.t / 2, P.taburetH - TABURET.sezutGros, 'vis');   // capătul tijei, sub șezut
  const zp = P.taburetH - TABURET.sezutGros, pn = P.pana;
  o.push(`<polygon points="${[[-pn.lung / 2, zp], [pn.lung / 2, zp], [pn.lung / 2, zp - pn.latMic], [-pn.lung / 2, zp - pn.lat]].map(q => v.X(q[0]) + ',' + v.Y(q[1])).join(' ')}" fill="#fff" stroke="#000" stroke-width="0.18"/>`);   // pana
  v.rect(-m, P.taburetH, m, zM, 'vis');
  v.slot(0, P.taburetH + D.micaH / 2, P.gauraL, P.gauraH, 'vis');
  v.rect(-d, zM, d, zT, 'vis');
  v.rect(-d + t, zM + t, d - t, zT - t, 'vis');
  const zs = zT - t - P.jocSertar - t;
  v.rect(-D.sertarW / 2, zs - t, D.sertarW / 2, zs + t, 'vis');
  v.rect(-d + 30, zT, -d + 30 + P.tastD, zT + 25, 'vis');
  // cote: cât ies cutiile peste șezut
  v.dimH(-d, -P.sezutD / 2, zT + 25, 6, D.iesireMare); v.dimH(-P.sezutD / 2, P.sezutD / 2, zT + 25, 6); v.dimH(P.sezutD / 2, d, zT + 25, 6, D.iesireMare);
  v.dimH(-d, d, zT + 25, 11);
  v.dimH(-P.sezutD / 2, P.sezutD / 2, P.taburetH - TABURET.sezutGros, -6);  // șezutul; cutia mică e cotată pe planșa 2
  v.dimH(TABURET.fata, TABURET.picioareSpate, 0, -4);
  v.dimV(0, P.treaptaH, TABURET.fata, 6); v.dimV(P.treaptaH, P.taburetH, TABURET.fata, 6);
  v.dimV(P.taburetH, zM, TABURET.fata, 6); v.dimV(zM, zT, TABURET.fata, 6);
  v.lit(-90, zM + 120, 'spre utilizator', 1.9);
}

// Cuburile pentru cutiile strânse: cutia mare în picioare, cu fața deschisă în jos.
function modelStrans() {
  const W = D.mareV, Dd = D.mareD, Hh = P.lungSus;
  return [
    cub(0, t, 0, Dd, 0, Hh, 'negru'),
    cub(t, W - t, Dd - t, Dd, 0, Hh, 'negru'),
    cub(t, W - t, t, Dd - t, Hh - t, Hh, 'negru'),
    cub(t, W - t, 0, t, 0, Hh, 'negru', [{ pe: 'y0', cx: W / 2, cz: Hh / 2, a: P.gauraH, b: P.gauraL }]),
    cub(W - t, W, 0, Dd, 0, Hh, 'negru')
  ];
}

(function () {
  deseneazaIzo(modelLucru(), { x: 20, y: 22, w: 170, h: 200 }, modelTaburet());
  axeIzo(30, 222, 12);
  titlu(20, 236, '1', 'POZIȚIA DE LUCRU', `axonometrie izometrică · fără scară · suprafața de lucru la ${P.tinta} mm`);
  vedereLaterala(232, 222);
  titlu(200, 236, '3', 'VEDERE LATERALĂ, DIN DREAPTA', '1:10 · taburetul desenat descriptiv');
  deseneazaIzo(modelStrans(), { x: 290, y: 60, w: 95, h: 120 });
  titlu(282, 200, '2', 'STRÂNS, CA MĂSUȚĂ', 'cutia mică stă înăuntru');
  txt(282, 215, 'Cutia mare: negru. Cutia mică și sertarul: pin încleiat, natur.', 2.2);
  txt(282, 219, 'Sertarul se trage spre dreapta, prin fața deschisă.', 2.2);
  cartus(1, 'axonometrie și vedere laterală', 'fără scară · 1:10');
  pune('p1');
})();

// ================= Planșa 3: planul de debitare =================
(function () {
  const plan = planDebitare(), k = 0.1, x0 = 20, xMax = 400;
  const nume = { A: MATERIALE[P.material].nume, B: MATERIALE[P.material].nume, C: MATERIALE[P.material].nume, S: SCANDURA.nume };
  // toate plăcile, în ordinea A, B, C, S; pe rânduri, cât încap pe lățimea foii
  const placi = ['A', 'B', 'C', 'S'].flatMap(kk => plan[kk].placi.map(p => ({ ...p, kk })));
  const randuri = [];
  for (const p of placi) {
    const r = randuri[randuri.length - 1], w = p.L * k;
    if (r && r.kk === p.kk && r.w + 12 + w <= xMax - x0) { r.placi.push(p); r.w += 12 + w; }
    else randuri.push({ kk: p.kk, placi: [p], w });
  }
  let y = 26, idx = 0;
  for (const r of randuri) {
    let x = x0;
    const h = r.placi[0].lat * k;
    for (const p of r.placi) {
      idx++;
      txt(x, y - 2.2, `P${idx} · ${p.kk === 'S' ? 'scândură ' : ''}${p.lat} × ${p.L}${p.cal ? ' ' + p.cal : ''} · ${p.pret.toLocaleString('ro-RO')} lei · ${undeSeTaie(p.kk)}`, 2.2, 'start', 'font-weight="bold"');
      o.push(`<rect x="${x}" y="${y}" width="${p.L * k}" height="${h}" fill="url(#waste)" stroke="#000" stroke-width="0.4"/>`);
      let u = 0;
      const lant = [0];
      for (const b of [...p.bucati].sort((a, c) => c.L - a.L)) {
        const nr = parseInt(b.ce, 10), piesa = PIESE.find(q => q.nr === nr);
        o.push(`<rect x="${x + u * k}" y="${y}" width="${b.L * k}" height="${h}" fill="#f6ead2" stroke="#000" stroke-width="0.25"/>`);
        const cx = x + (u + b.L / 2) * k;
        if (h >= 15) {
          txt(cx, y + h / 2 + 0.2, String(nr), 4, 'middle', 'font-weight="bold"');
          txt(cx, y + h / 2 + 4.2, `${b.L} × ${piesa.l}`, 2, 'middle');
        } else txt(cx, y + h / 2 + 0.9, `${nr} · ${b.L} × ${piesa.l}`, 1.9, 'middle');
        u += b.L + P.taietura;
        lant.push(u - P.taietura, u);
      }
      // săgeata fibrei
      o.push(`<line x1="${x + p.L * k - 22}" y1="${y + h + 7.5}" x2="${x + p.L * k - 4}" y2="${y + h + 7.5}" class="thin" marker-end="url(#sageata)"/>`);
      txt(x + p.L * k - 23, y + h + 8.2, 'fibra', 1.9, 'end');
      // lanțul de cote sub placă: piesele și restul
      const v = vedere(x, y + h, k);
      let a = 0;
      for (const b of [...p.bucati].sort((q, c) => c.L - q.L)) { v.dimH(a, a + b.L, 0, -4); a += b.L + P.taietura; }
      if (p.rest > 0) v.dimH(p.L - p.rest, p.L, 0, -4, `rest ${p.rest}`);
      x += p.L * k + 12;
    }
    y += h + 20;
  }
  o.push(`<defs><marker id="sageata" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 z" fill="#000"/></marker></defs>`);

  // note
  let yn = Math.max(y, 200);
  txt(14, yn, 'NOTE', 3, 'start', 'font-weight="bold"'); yn += 4.5;
  const lei = x => x.toLocaleString('ro-RO', { maximumFractionDigits: 2 });
  [
    `Scara 1:10. Cote în mm. Fiecare piesă se taie de-a curmezișul plăcii; lățimea plăcii rămâne lățimea piesei, deci nimic nu se spintecă.`,
    `Am socotit ${P.taietura} mm pierduți la fiecare tăietură. Hașurat: restul plăcii.`,
    `Plăcile de ${P.latA} mm sunt mai late decât cei ${P.taiereAcasa} mm pe care îi taie fierăstrăul de acasă: le taie Hornbach. Restul se taie acasă.`,
    `Hornbach nu debitează sub ${P.limitaDebitare} mm pe orizontală și 500 mm pe verticală; de întrebat dacă limita privește piesa care iese.`,
    `Total: ${lei(plan.pret)} lei, la prețurile de pe hornbach.ro din 26.10.2026. Numerele din piese trimit la lista de piese de pe planșa 2.`
  ].forEach((s, i) => { txt(14, yn, `${i + 1}`, 2.1); txt(18, yn, s, 2.1); yn += 3.6; });
  cartus(3, 'planul de debitare', '1:10');
  pune('p3');
})();

// ================= Planșa 4: eurosuruburi =================
function gauriCant(nr) {
  const piesa = PIESE.find(p => p.nr === nr), g = [];
  for (const im of IMBINARI.filter(i => i.cant === nr)) {
    for (const p of pozitii(im.la - im.de)) for (const m of im.muchii) {
      const q = im.cDe + p;
      g.push(m === 'v0' ? { u: q, v: 0 } : m === 'v1' ? { u: q, v: piesa.l } : m === 'u0' ? { u: 0, v: q } : { u: piesa.L, v: q });
    }
  }
  return g;
}

(function () {
  const k = 0.2;
  const asezare = [
    { nr: 1, x: 32, y: 112 }, { nr: 2, x: 152, y: 112 }, { nr: 3, x: 272, y: 112 },
    { nr: 7, x: 32, y: 212 }, { nr: 8, x: 152, y: 212 }, { nr: 9, x: 272, y: 212 }
  ];
  for (const a of asezare) {
    const p = PIESE.find(q => q.nr === a.nr), v = vedere(a.x, a.y, k);
    v.rect(0, 0, p.L, p.l, 'vis');
    if (p.gaura) v.slot(p.L / 2, p.l / 2, ...(p.gaura === 'u' ? [P.gauraL, P.gauraH] : [P.gauraH, P.gauraL]), 'vis');
    if (p.frezare) {
      v.slot(p.L / 2, p.l / 2, P.gauraL, P.gauraH, p.frezare === 'doar la fund' ? 'hid' : 'vis');
      v.lit(p.L / 2, p.l / 2 - P.gauraH / 2 - 14, `frezare pentru piesa în T, ${p.frezare}`, 1.8);
    }
    const fata = gauriFata(p.nr), cant = gauriCant(p.nr);
    for (const g of fata) {
      o.push(`<circle cx="${v.X(g.u)}" cy="${v.Y(g.v)}" r="${P.surub.dFata / 2 * k}" fill="#fff" stroke="#000" stroke-width="0.2"/>`);
      o.push(`<circle cx="${v.X(g.u)}" cy="${v.Y(g.v)}" r="${P.surub.tesire / 2 * k}" fill="none" stroke="#000" stroke-width="0.1"/>`);
    }
    for (const g of cant) o.push(`<circle cx="${v.X(g.u)}" cy="${v.Y(g.v)}" r="0.75" fill="#000"/>`);
    // lanțuri de cote: pozițiile pe lungime deasupra, pe lățime la stânga
    const toate = [...fata, ...cant];
    // pe lungime: găurile de pe liniile paralele cu lungimea; pe lățime: cele de pe liniile paralele cu lățimea
    const peLungime = g => g.v === 0 || g.v === p.l || g.v === h2 || g.v === p.l - h2;
    const peLatime = g => g.u === 0 || g.u === p.L || g.u === h2 || g.u === p.L - h2;
    const us = [...new Set(toate.filter(peLungime).map(g => g.u))].filter(u => u > 0 && u < p.L).sort((x, y) => x - y);
    const vs = [...new Set(toate.filter(peLatime).map(g => g.v))].filter(w => w > 0 && w < p.l).sort((x, y) => x - y);
    const lu = [0, ...us, p.L];
    for (let i = 0; i < lu.length - 1; i++) v.dimH(lu[i], lu[i + 1], p.l, 5);
    v.dimH(0, p.L, p.l, 10);
    const lv = [0, ...vs, p.l];
    for (let i = 0; i < lv.length - 1; i++) v.dimV(lv[i], lv[i + 1], 0, 5);
    v.dimV(0, p.l, 0, 10);
    const per = PIESE.find(q => q.nr === p.nr).buc;
    titlu(a.x - 6, a.y + 8, String(p.nr), `${p.nume.toUpperCase()} · ${per} BUC.`, `fibra pe ${p.L} · pe piesă: ${fata.length} pe față, ${cant.length} în cant`);
  }

  // detaliul îmbinării, 1:1
  (function () {
    const v = vedere(380, 92, 1), s = P.surub, adanc = s.lung - t + 3;
    v.rect(-20, 0, 20, t, 'cut');                // piesa prin care trece șurubul
    v.rect(-t / 2, -45, t / 2, 0, 'cut');        // piesa în al cărei cant intră
    o.push(`<rect x="${v.X(-s.dFata / 2)}" y="${v.Y(t)}" width="${s.dFata}" height="${t}" fill="#fff" stroke="#000" stroke-width="0.2"/>`);
    o.push(`<rect x="${v.X(-s.dCant / 2)}" y="${v.Y(0)}" width="${s.dCant}" height="${adanc}" fill="#fff" stroke="#000" stroke-width="0.2"/>`);
    o.push(`<polygon points="${v.X(-s.tesire / 2)},${v.Y(t)} ${v.X(s.tesire / 2)},${v.Y(t)} ${v.X(s.dFata / 2)},${v.Y(t - 1.5)} ${v.X(-s.dFata / 2)},${v.Y(t - 1.5)}" fill="#fff" stroke="#000" stroke-width="0.2"/>`);
    v.line(0, t + 3, 0, -adanc - 3, 'axis');
    v.dimV(0, t, 20, -5); v.dimV(t - s.lung, 0, t / 2, -5, s.lung - t);
    v.dimV(-adanc, 0, -t / 2, 5, adanc);
    v.dimH(-s.dFata / 2, s.dFata / 2, t, 4, `Ø${s.dFata}`);
    v.dimH(-s.dCant / 2, s.dCant / 2, -adanc, -4, `Ø${s.dCant}`);

    titlu(350, 146, 'D', 'DETALIU — EUROSURUB', `${s.nume} · 1:1`);
  })();

  // piesa în T: din față și din lateral la 1:5, plus axonometria ei
  (function () {
    const w = SCANDURA.lat / 2, b = P.tBara / 2, g = P.t / 2, y0 = 216;
    // din față: tija pe lățimea scândurii, bara pe lungimea ei
    const f = vedere(333, y0, 0.2);
    f.rect(-w, 0, w, D.tTijaL, 'vis');
    f.rect(-b, D.tTijaL, b, D.tH, 'vis');
    f.dimH(-b, b, D.tH, 4);
    f.dimH(-w, w, 0, -4);
    f.dimV(0, D.tTijaL, -b, 4); f.dimV(D.tTijaL, D.tH, -b, 4);
    // gaura pentru pană și dedesubtul șezutului
    const pn = P.pana;
    f.rect(-pn.gauraL / 2, D.panaJos, pn.gauraL / 2, D.panaSus, 'vis');
    f.line(-w - 6, P.tSub, w + 6, P.tSub, 'axis');
    f.dimV(0, D.panaJos, w, -4); f.dimV(D.panaJos, D.panaSus, w, -4);
    f.dimH(-pn.gauraL / 2, pn.gauraL / 2, D.panaSus, 3);
    txt(333, y0 + 15, 'din față', 1.9, 'middle');
    // din lateral: tija pe grosimea scândurii, bara pe lățimea ei
    const l = vedere(362, y0, 0.2);
    l.rect(-g, 0, g, D.tTijaL, 'vis');
    l.rect(-w, D.tTijaL, w, D.tH, 'vis');
    l.dimH(-w, w, D.tH, 4);
    l.dimH(-g, g, 0, -4);
    l.dimV(0, D.tH, w, -4);
    // pana în gaură: fața de sus pe dedesubtul șezutului, fața de jos în pantă
    l.line(-pn.lung / 2 - 4, P.tSub, pn.lung / 2 + 4, P.tSub, 'axis');
    o.push(`<polygon points="${[[-pn.lung / 2, P.tSub], [pn.lung / 2, P.tSub], [pn.lung / 2, P.tSub - pn.latMic], [-pn.lung / 2, P.tSub - pn.lat]].map(q => l.X(q[0]) + ',' + l.Y(q[1])).join(' ')}" fill="#fff" stroke="#000" stroke-width="0.25"/>`);
    // tija stă în fața penei: o redesenez plină peste ea, iar gaura rămâne punctată
    o.push(`<rect x="${l.X(-g)}" y="${l.Y(D.tTijaL)}" width="${P.t * 0.2}" height="${D.tTijaL * 0.2}" fill="#fff" stroke="#000" stroke-width="0.25"/>`);
    l.rect(-g, D.panaJos, g, D.panaSus, 'hid');
    l.dimH(-pn.lung / 2, pn.lung / 2, P.tSub - pn.lat, -14);
    l.dimV(P.tSub - pn.lat, P.tSub, -pn.lung / 2, 3, pn.lat); l.dimV(P.tSub - pn.latMic, P.tSub, pn.lung / 2, -3, pn.latMic);
    txt(362, y0 + 15, 'din lateral', 1.9, 'middle');
    // axonometria piesei
    const sq = (z0, z1, y0p, y1p) => [[-pn.gauraL / 2 + 1, y0p, z0], [pn.gauraL / 2 - 1, y0p, z0], [pn.gauraL / 2 - 1, y1p, z1], [-pn.gauraL / 2 + 1, y1p, z1]];
    const pana = prisma(sq(P.tSub, P.tSub, -pn.lung / 2, pn.lung / 2), sq(P.tSub - pn.lat, P.tSub - pn.latMic, -pn.lung / 2, pn.lung / 2), 'pin');
    deseneazaIzo([cub(-w, w, -g, g, 0, D.tTijaL, 'pin'), cub(-b, b, -w, w, D.tTijaL, D.tH, 'pin')], { x: 379, y: 160, w: 27, h: 50 }, [pana]);
    txt(392, y0 + 15, 'axonometrie', 1.9, 'middle');
    titlu(312, 240, 'T', 'PIESA ÎN T, CU PANA', `piesele 10, 11 și 12 · 1:5 · linia punctată: dedesubtul șezutului`);
  })();

  // legenda și tabelul îmbinărilor
  const x = 14; let y = 238;
  txt(x, y, 'LEGENDĂ ȘI ÎMBINĂRI', 3, 'start', 'font-weight="bold"'); y += 5;
  o.push(`<circle cx="${x + 1.5}" cy="${y - 0.8}" r="0.7" fill="#fff" stroke="#000" stroke-width="0.2"/><circle cx="${x + 1.5}" cy="${y - 0.8}" r="1" fill="none" stroke="#000" stroke-width="0.1"/>`);
  txt(x + 4, y, `gaură Ø${P.surub.dFata} prin piesă, cu teșire Ø${P.surub.tesire}, la ${h2} mm de margine (în mijlocul grosimii piesei de dedesubt)`, 2.1); y += 3.6;
  o.push(`<circle cx="${x + 1.5}" cy="${y - 0.8}" r="0.75" fill="#000"/>`);
  txt(x + 4, y, `gaură Ø${P.surub.dCant} în cant, adâncă de ${P.surub.lung - t + 3} mm; se dă prin gaura de deasupra, cu piesele strânse în menghine`, 2.1); y += 5;
  for (const im of IMBINARI) {
    const n = pozitii(im.la - im.de).length * im.linii.length * PIESE.find(p => p.nr === im.fata).buc;
    txt(x, y, `${im.fata} → ${im.cant}`, 2.1, 'start', 'font-weight="bold"');
    txt(x + 12, y, `${im.ce}: ${n} șuruburi${im.fibra === 'capăt' ? ' — intră în capătul fibrei, unde prind mai slab; aici lipiți îmbinarea' : ''}`, 2.1);
    y += 3.4;
  }
  txt(x, y + 1.5, `Total: ${numarSuruburi()} de ${P.surub.nume}. Pe capacul cutiei mari capetele rămân la vedere, sub tastatură; se pot acoperi cu capace pentru eurosurub.`, 2.1, 'start', 'font-weight="bold"');
  cartus(4, 'poziția eurosuruburilor', '1:5 · 1:1');
  pune('p4');
})();
