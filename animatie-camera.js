// Animația din cameră: taburetul în fața ferestrei, întors cu treapta spre dulap, și cutiile ca măsuță între fotoliu și
// fereastră; montat, totul se aduce oblic, la 45°, în fața monitorului, iar monitorul vine spre cameră pe extensia brațului.
// Camera vine din camera-model.js, suportul din animatie.js.
(function () {
  const svg = document.getElementById('cam');
  if (!svg || typeof CAMERA === 'undefined') return;
  const text = document.getElementById('cam-text'), pasEl = document.getElementById('cam-pas');
  Object.assign(CULORI, {
    perete: ['#f1efea', '#e4e1da', '#d3cfc6'],
    podea: ['#d9b98c', '#c9a774', '#b8955f'],
    lemn: ['#ecd29c', '#ddbd82', '#c9a66a'],
    alb: ['#fbfbfa', '#ececea', '#dcdcd9'],
    sticla: ['#d6e8f0', '#c3dbe6', '#aecbd8'],
    metal: ['#c4c6ca', '#a9acb1', '#8f9297'],
    tapitat: ['#9fb3d1', '#8399bb', '#6f84a5']
  });
  const { taburet, PASI, N, grupeLa } = suportAnimat();
  const L = CAMERA.locuri;

  // Piesele camerei. Prin dulap, care stă între privitor și birou, se vede. Peretele dușului, din fața raftului alb,
  // se taie la 90 cm, ca să nu acopere biroul; tăietura se arată cu o linie frântă.
  const TAIAT = 900;
  const prin = { 'dulap-pin': 0.3, 'raft-t-2': 0.35 };
  const piesa = p => Object.assign(cubCorp(cub(p.x[0], p.x[1], p.y[0], p.y[1], p.z[0], p.id === 'dus' ? Math.min(p.z[1], TAIAT) : p.z[1], p.culoare)),
    { op: prin[p.id] ?? 1, taiat: p.id === 'dus' });
  const camera = CAMERA.piese.filter(p => p.id !== 'monitor').map(piesa);
  const monitor = piesa(CAMERA.piese.find(p => p.id === 'monitor'));
  // demontat, tastatura stă în picioare în raftul de sub pult, iar mouse-ul lângă ea, pe fundul raftului
  const RT = L.raftTastatura;
  const tastaturaStransa = [
    cubCorp(cub(RT.x + 10, RT.x + 35, RT.y + 40, RT.y + 40 + P.tastD, RT.z, RT.z + P.tastW, 'tastatura')),
    cubCorp(cub(RT.x + 45, RT.x + 45 + P.mouseW, RT.y + 60, RT.y + 60 + P.mouseL, RT.z, RT.z + 35, 'mouse'))
  ];

  // Întoarcerea în jurul verticalei, cu unghiul în grade, și mutarea: punct = rot(punct − pivot) + loc
  const rotXY = ([x, y], g) => { const r = g * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [x * c - y * s, x * s + y * c]; };
  const pune = (cs, g, pivot, loc) => cs.map(c => ({ ...c, fete: c.fete.map(f => f.map(([x, y, z]) => {
    const [u, v] = rotXY([x - pivot[0], y - pivot[1]], g); return [u + loc[0], v + loc[1], z - pivot[2] + loc[2]];
  })) }));
  const limite = cs => {
    const v = cs.flatMap(c => c.fete.flat());
    const m = i => [Math.min(...v.map(q => q[i])), Math.max(...v.map(q => q[i]))];
    const [x, y, z] = [m(0), m(1), m(2)];
    return { x0: x[0], x1: x[1], y0: y[0], y1: y[1], z0: z[0], z1: z[1] };
  };
  const centruXY = b => [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, 0];

  // Locurile, în cadrul camerei. Suportul are originea în mijlocul taburetului; utilizatorul stă la y mic.
  const OBLIC = -45;   // montat, utilizatorul privește spre raftul alb și spre biblioteca deopotrivă
  const masuta = g => [...g.cutiaMare, ...g.cutiaMica, ...g.sertar];
  const gata = grupeLa(N, false), strans = grupeLa(0, false);
  const bGata = limite([...taburet, ...Object.values(gata).flat()]);
  // monitorul: strâns deasupra raftului; desfăcut, întors la 45° și adus 35 cm spre cameră, pe extensia brațului
  const bMon = limite([monitor]), MON = centruXY(bMon);
  const spreUtilizator = rotXY([0, -1], OBLIC);
  const MON_SCOS = [MON[0] + 350 * spreUtilizator[0], MON[1] + 350 * spreUtilizator[1], 0];
  // suportul: în fața monitorului desfăcut, cu monitorul deasupra capătului dinspre raft
  const LUCRU = [MON_SCOS[0] + (bGata.y1 - 50) * spreUtilizator[0], MON_SCOS[1] + (bGata.y1 - 50) * spreUtilizator[1], 0];
  // demontat: taburetul în fața ferestrei, întors cu 180°, cu treapta spre dulap, ca să se ajungă la cercevelele de sus
  const TABURET_STRANS = [L.taburetDemontat[0], L.taburetDemontat[1], 0];
  // măsuța: între fotoliu și peretele cu fereastra, la 15 cm de fotoliu
  const bM = limite(masuta(strans)), cM = centruXY(bM);
  const MASUTA = [L.fotoliu[0], L.fotoliuY + 150 + (bM.y1 - bM.y0) / 2, 0];
  const MASUTA_LUCRU = (([u, v]) => [LUCRU[0] + u, LUCRU[1] + v, 0])(rotXY(cM, OBLIC));

  // pașii din cameră; între pasul 2 și penultimul se face montarea din animația suportului
  const K = N + 3;
  const STRANS = 'Demontat: taburetul stă în fața ferestrei, întors cu treapta spre dulap, ca să se ajungă la cercevelele de sus; cutiile stau ca măsuță între fotoliu și fereastră; tastatura și mouse-ul stau în raftul de sub pult.';
  const PASI_CAMERA = [
    { montare: STRANS, demontare: STRANS },
    { montare: 'Taburetul se întoarce și se duce în fața monitorului, oblic, la 45°.', demontare: 'Taburetul se duce înapoi în fața ferestrei și se întoarce cu treapta spre dulap.' },
    { montare: 'Măsuța se aduce lângă taburet.', demontare: 'Cutiile, strânse ca măsuță, se duc între fotoliu și fereastră.' },
    ...PASI.slice(1, N),
    { montare: 'Tastatura și mouse-ul se iau din raftul de sub pult. Gata de lucru.', demontare: 'Tastatura și mouse-ul se pun în raftul de sub pult.' },
    { montare: 'Monitorul vine spre cameră pe extensia brațului, 35 cm, întors la 45°, deasupra tastaturii.', demontare: 'Monitorul se strânge pe braț, deasupra raftului.' }
  ];

  const usor = u => { u = Math.max(0, Math.min(1, u)); return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; };
  const intre = (a, b, u) => a.map((v, i) => v + (b[i] - v) * usor(u));
  const unghi = (a, b, u) => a + (b - a) * usor(u);
  // o mutare prin cameră se face pe sus: obiectul se ridică, merge și coboară
  const peSus = (a, b, u, h) => { const p = intre(a, b, u); p[2] += h * Math.sin(Math.PI * Math.max(0, Math.min(1, u))); return p; };

  // grupurile desenate la momentul tt: fiecare are corpurile lui, în cadrul lui, și cum se pune în cameră
  function grupuri(tt) {
    const g = grupeLa(Math.max(0, tt - 2), false);
    const out = camera.map(c => ({ corpuri: [c], g: 0, pivot: [0, 0, 0], loc: [0, 0, 0], taiat: c.taiat }));
    if (tt < 2) {
      // de la 180° la 315°, adică −45°, pe drumul cel mai scurt
      out.push({ corpuri: [...taburet, ...g.T, ...g.pana, ...g.tastatura], g: unghi(180, 360 + OBLIC, tt), pivot: [0, 0, 0], loc: peSus(TABURET_STRANS, LUCRU, tt, 150) });
      out.push({ corpuri: masuta(g), g: unghi(0, OBLIC, tt - 1), pivot: cM, loc: peSus(MASUTA, MASUTA_LUCRU, tt - 1, 150) });
    } else out.push({ corpuri: [...taburet, ...Object.values(g).flat()], g: OBLIC, pivot: [0, 0, 0], loc: LUCRU });
    // tastatura stă în raft până începe pasul în care se pune pe suport
    if (tt <= N + 1) out.push({ corpuri: tastaturaStransa, g: 0, pivot: [0, 0, 0], loc: [0, 0, 0] });
    const u = tt - (K - 1);
    out.push({ corpuri: [monitor], g: unghi(0, OBLIC, u), pivot: MON, loc: intre(MON, MON_SCOS, u) });
    return out;
  }

  // Ordinea. Un corp stă în spatele altuia dacă e separat de el spre privitor pe o axă a cadrului lui; privitorul e la
  // (1, −1, 1) în cameră, iar în cadrul întors al unui grup direcția lui se întoarce invers.
  const e = 0.01;
  const inSpate = v => (a, b) => (v[0] > e && a.x1 <= b.x0 + e) || (v[0] < -e && a.x0 >= b.x1 - e) ||
    (v[1] > e && a.y1 <= b.y0 + e) || (v[1] < -e && a.y0 >= b.y1 - e) || a.z1 <= b.z0 + e;
  const cheie = v => b => v[0] * (b.x0 + b.x1) / 2 + v[1] * (b.y0 + b.y1) / 2 + (b.z0 + b.z1) / 2;
  function ordine(bs, v) {
    const sp = inSpate(v), ch = cheie(v), rest = new Set(bs.map((_, i) => i)), out = [];
    while (rest.size) {
      const lib = [...rest].filter(i => ![...rest].some(j => j !== i && sp(bs[j], bs[i]) && !sp(bs[i], bs[j])));
      const i = (lib.length ? lib : [...rest]).sort((a, b) => ch(bs[a]) - ch(bs[b]))[0];
      rest.delete(i); out.push(i);
    }
    return out;
  }
  const VEDERE = [1, -1];
  // Camera se privește întoarsă cu 20°: altfel suportul, așezat la 45°, s-ar vedea exact din lateral, iar monitorul din muchie.
  const VISTA = 20, MIJLOC = [CAMERA.piese.find(p => p.id === 'podea').x[1] / 2, CAMERA.piese.find(p => p.id === 'podea').y[1] / 2, 0];
  const vista = cs => pune(cs, VISTA, MIJLOC, MIJLOC);
  const vistaPunct = (x, y) => { const [u, v] = rotXY([x - MIJLOC[0], y - MIJLOC[1]], VISTA); return [u + MIJLOC[0], v + MIJLOC[1]]; };

  // Linia frântă a tăieturii, pe muchiile de sus dinspre privitor
  function linieFranta(b) {
    const P2 = (x0, y0, z) => { const [x, y] = vistaPunct(x0, y0); return `${(fix.ox + ISO.u(x, y) * fix.k).toFixed(2)},${(fix.oy - ISO.w(x, y, z) * fix.k).toFixed(2)}`; };
    const muchii = [[[b.x0, b.y0], [b.x1, b.y0]], [[b.x1, b.y0], [b.x1, b.y1]]];
    for (const [a, c] of muchii) {
      const n = 14, pts = [];
      for (let i = 0; i <= n; i++) {
        const u = i / n, dz = i === 0 || i === n ? 0 : (i % 2 ? 60 : -60);
        pts.push(P2(a[0] + (c[0] - a[0]) * u, a[1] + (c[1] - a[1]) * u, b.z1 + dz));
      }
      o.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="#1a1a1a" stroke-width="0.35" stroke-linejoin="round"/>`);
    }
  }

  // Un grup se desenează așa: corpurile oarecare întâi (fețele lor se ordonează singure), apoi cutiile, una câte una,
  // în ordinea din cadrul grupului
  function deseneazaGrup(gr) {
    const lumea = cs => vista(pune(cs, gr.g, gr.pivot, gr.loc));
    const oarecare = gr.corpuri.filter(c => !c.cutie), cutii = gr.corpuri.filter(c => c.cutie);
    if (oarecare.length) deseneazaIzo([], { fix, linie: 0.2 }, lumea(oarecare));
    const v = rotXY(VEDERE, -gr.g - VISTA);
    for (const i of ordine(cutii.map(c => limite([c])), v)) deseneazaIzo([], { fix, linie: 0.2 }, lumea([cutii[i]]));
    if (gr.taiat) linieFranta(limite(gr.corpuri));
  }

  // Scara, aleasă o singură dată pe toate locurile prin care trece ceva
  const toate = [...camera, monitor, ...tastaturaStransa, ...pune([monitor], OBLIC, MON, MON_SCOS), ...pune(taburet, 180, [0, 0, 0], TABURET_STRANS),
    ...pune(masuta(strans), 0, cM, MASUTA), ...pune([...taburet, ...Object.values(gata).flat()], OBLIC, [0, 0, 0], LUCRU)];
  o = [];
  const fix = deseneazaIzo([], { x: 6, y: 6, w: 388, h: 248 }, vista(toate));
  o = [];

  let tt = K, tinta = K, directie = 1, ultim = null, cadru = null;
  const fara = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function deseneaza() {
    o = [];
    const gs = grupuri(tt);
    const bs = gs.map(gr => limite(pune(gr.corpuri, gr.g, gr.pivot, gr.loc)));
    for (const i of ordine(bs, rotXY(VEDERE, -VISTA))) deseneazaGrup(gs[i]);
    axeIzo(16, 250, 16, 4.2, 0.6);
    svg.innerHTML = o.join('');
    o = [];
    if (directie > 0) {
      const i = Math.max(0, Math.min(K, Math.ceil(tt - 1e-6)));
      text.textContent = PASI_CAMERA[i].montare;
      pasEl.textContent = `Montare · pasul ${i} din ${K}`;
    } else {
      const i = Math.max(0, Math.min(K, Math.floor(tt + 1e-6)));
      text.textContent = i < K ? PASI_CAMERA[i + 1].demontare : PASI_CAMERA[K].demontare;
      if (tt <= 1e-6) text.textContent = PASI_CAMERA[0].demontare;
      pasEl.textContent = `Demontare · mai sunt ${i} pași`;
    }
  }
  function bucla(acum) {
    if (ultim == null) ultim = acum;
    const dt = Math.min(0.1, (acum - ultim) / 1000); ultim = acum;
    const v = 1 / 1.8;   // un pas la 1,8 secunde, ca în animația suportului
    tt = tinta > tt ? Math.min(tinta, tt + v * dt) : Math.max(tinta, tt - v * dt);
    deseneaza();
    if (tt !== tinta) cadru = requestAnimationFrame(bucla); else { cadru = null; ultim = null; }
  }
  function mergiLa(x) {
    tinta = Math.max(0, Math.min(K, x));
    directie = tinta >= tt ? 1 : -1;
    if (fara) { tt = tinta; deseneaza(); return; }
    if (!cadru) { ultim = null; cadru = requestAnimationFrame(bucla); }
  }

  document.getElementById('cam-monteaza').addEventListener('click', () => { if (tt >= K) tt = 0; mergiLa(K); });
  document.getElementById('cam-demonteaza').addEventListener('click', () => { if (tt <= 0) tt = K; mergiLa(0); });
  document.getElementById('cam-inainte').addEventListener('click', () => mergiLa(Math.floor(tt + 1e-6) + 1));
  document.getElementById('cam-inapoi').addEventListener('click', () => mergiLa(Math.ceil(tt - 1e-6) - 1));
  document.getElementById('cam-opreste').addEventListener('click', () => { tinta = tt; });
  deseneaza();
})();
