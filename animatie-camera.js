// Animația din cameră: taburetul în fața ferestrei și cutiile ca măsuță lângă fotoliu; montat, totul e adus în fața
// monitorului, iar monitorul se desface pe braț spre cameră. Camera vine din camera-model.js, suportul din animatie.js.
(function () {
  const svg = document.getElementById('cam');
  if (!svg || typeof CAMERA === 'undefined') return;
  const text = document.getElementById('cam-text'), pasEl = document.getElementById('cam-pas');
  Object.assign(CULORI, {
    perete: ['#f1efea', '#e4e1da', '#d3cfc6'],
    podea: ['#d9b98c', '#c9a774', '#b8955f'],
    lemn: ['#ecd29c', '#ddbd82', '#c9a66a'],
    alb: ['#fbfbfa', '#ececea', '#dcdcd9'],
    gri: ['#a9b4c4', '#8f9bad', '#7a8698'],
    sticla: ['#d6e8f0', '#c3dbe6', '#aecbd8']
  });
  const { taburet, PASI, N, grupeLa, toatePozitiile } = suportAnimat();
  const L = CAMERA.locuri;

  // piesele camerei; prin dulap și prin blocul dușului, care stau între privitor și birou, se vede
  const prin = { 'dulap-pin': 0.3, dus: 0.3 };
  const piesa = p => Object.assign(cubCorp(cub(p.x[0], p.x[1], p.y[0], p.y[1], p.z[0], p.z[1], p.culoare)), { op: prin[p.id] ?? 1 });
  const camera = CAMERA.piese.filter(p => p.id !== 'monitor').map(piesa);
  const monitor = piesa(CAMERA.piese.find(p => p.id === 'monitor'));

  const muta = (cs, [dx, dy, dz]) => cs.map(c => ({ ...c, fete: c.fete.map(f => f.map(([x, y, z]) => [x + dx, y + dy, z + dz])) }));
  const limite = cs => {
    const v = cs.flatMap(c => c.fete.flat());
    const m = i => [Math.min(...v.map(q => q[i])), Math.max(...v.map(q => q[i]))];
    const [x, y, z] = [m(0), m(1), m(2)];
    return { x0: x[0], x1: x[1], y0: y[0], y1: y[1], z0: z[0], z1: z[1] };
  };

  // Locurile, în cadrul camerei. Suportul are originea în mijlocul taburetului.
  const masuta = g => [...g.cutiaMare, ...g.cutiaMica, ...g.sertar];
  const gata = grupeLa(N, false), strans = grupeLa(0, false);
  const bGata = limite([...taburet, ...Object.values(gata).flat()]);
  // montat: în dreptul brațului monitorului, cu spatele taburetului la 5 cm de raftul alb
  const LUCRU = [L.monitorX, L.raftFata - 50 - bGata.y1, 0];
  const TABURET_STRANS = [L.taburetDemontat[0], L.taburetDemontat[1], 0];
  // măsuța: lângă fotoliu, spre mijlocul camerei, la 15 cm de el
  const bM = limite(masuta(strans));
  const MASUTA = [L.fotoliuX[1] + 150 - bM.x0, L.fotoliu[1] - (bM.y0 + bM.y1) / 2, 0];
  // monitorul desfăcut: deasupra capătului dinspre raft al suportului, cu marginea de jos la 25 cm peste tastatură
  const bMon = limite([monitor]);
  const MONITOR_SCOS = [LUCRU[0] - (bMon.x0 + bMon.x1) / 2, LUCRU[1] + bGata.y1 - bMon.y1, P.tinta + 250 - bMon.z0];

  // pașii din cameră; între pasul 2 și ultimul se face montarea din animația suportului
  const K = N + 3;
  const PASI_CAMERA = [
    { montare: 'Demontat: taburetul stă în fața ferestrei, cutiile stau ca măsuță lângă fotoliu.', demontare: 'Demontat: taburetul stă în fața ferestrei, cutiile stau ca măsuță lângă fotoliu.' },
    { montare: 'Taburetul se duce în fața monitorului, lângă raftul alb.', demontare: 'Taburetul se duce înapoi, în fața ferestrei.' },
    { montare: 'Măsuța se aduce lângă taburet.', demontare: 'Cutiile, strânse ca măsuță, se duc lângă fotoliu.' },
    ...PASI.slice(1),
    { montare: 'Monitorul se desface pe braț, spre cameră, deasupra tastaturii.', demontare: 'Monitorul se strânge pe braț, deasupra raftului.' }
  ];

  const usor = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  const intre = (a, b, u) => a.map((v, i) => v + (b[i] - v) * usor(Math.max(0, Math.min(1, u))));
  // o mutare prin cameră se face pe sus: obiectul se ridică, merge și coboară
  const peSus = (a, b, u, h) => { const p = intre(a, b, u); p[2] += h * Math.sin(Math.PI * Math.max(0, Math.min(1, u))); return p; };

  // grupurile desenate la momentul tt: fiecare se ordonează întreg față de mobila camerei
  function grupuri(tt) {
    const g = grupeLa(Math.max(0, tt - 2), false);
    const out = camera.map(c => [c]);
    if (tt < 2) {
      out.push(muta([...taburet, ...g.T, ...g.pana, ...g.tastatura], peSus(TABURET_STRANS, LUCRU, tt, 150)));
      out.push(muta(masuta(g), peSus(MASUTA, LUCRU, tt - 1, 150)));
    } else out.push(muta([...taburet, ...Object.values(g).flat()], LUCRU));
    out.push(muta([monitor], intre([0, 0, 0], MONITOR_SCOS, tt - (K - 1))));
    return out;
  }

  // Ordinea: un grup stă în spatele altuia dacă e separat de el spre stânga, spre fund sau dedesubt (ca în deseneazaIzo).
  const e = 0.01, inSp = (a, b) => a.x1 <= b.x0 + e || a.y0 >= b.y1 - e || a.z1 <= b.z0 + e;
  const ch = b => (b.x0 + b.x1) / 2 - (b.y0 + b.y1) / 2 + (b.z0 + b.z1) / 2;
  function ordonate(gs) {
    const bs = gs.map(limite), rest = new Set(gs.map((_, i) => i)), out = [];
    while (rest.size) {
      const lib = [...rest].filter(i => ![...rest].some(j => j !== i && inSp(bs[j], bs[i]) && !inSp(bs[i], bs[j])));
      const i = (lib.length ? lib : [...rest]).sort((a, b) => ch(bs[a]) - ch(bs[b]))[0];
      rest.delete(i); out.push(gs[i]);
    }
    return out;
  }

  // Scara, aleasă o singură dată pe toate locurile prin care trece ceva
  const toate = [...camera, monitor, ...muta([monitor], MONITOR_SCOS), ...muta(taburet, TABURET_STRANS),
    ...muta(masuta(strans), MASUTA), ...muta([...taburet, ...toatePozitiile()], LUCRU)];
  o = [];
  const fix = deseneazaIzo([], { x: 6, y: 6, w: 388, h: 248 }, toate);
  o = [];

  let tt = K, tinta = K, directie = 1, ultim = null, cadru = null;
  const fara = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function deseneaza() {
    o = [];
    for (const g of ordonate(grupuri(tt))) deseneazaIzo([], { fix, linie: 0.2 }, g);
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
