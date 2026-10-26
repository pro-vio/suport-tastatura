// Animația de montare și demontare: de la cutiile strânse, ca măsuță lângă taburet, la suportul gata de lucru, și înapoi.
// Folosește modelul din geometrie.js și desenul izometric din plansa-pagini.js.
(function () {
  const svg = document.getElementById('anim');
  if (!svg) return;
  const text = document.getElementById('anim-text'), pasEl = document.getElementById('anim-pas');

  // Corpurile fiecărei grupe, în poziția de lucru
  const sc = scenaLucru(), st = scenaPiesaT();
  const corpuri = cs => cs.map(c => (c.fete ? c : cubCorp(c)));
  const grupe = {
    cutiaMica: corpuri(sc.cutiaMica),
    cutiaMare: corpuri(sc.cutiaMare),
    sertar: corpuri(sc.sertar),
    T: st.T,
    pana: st.pana,
    tastatura: corpuri(sc.tastatura)
  };
  const taburet = modelTaburet();

  // Centrele în jurul cărora se întorc cutiile: cutia mare, cu sertarul ei, și cutia mică
  const zM = P.taburetH + D.micaH;
  const centru = { cutiaMare: [0, 0, (zM + P.tinta) / 2], sertar: [0, 0, (zM + P.tinta) / 2], cutiaMica: [0, 0, P.taburetH + D.micaH / 2] };

  // Strânse, ca măsuță: cutia mare în picioare, cu fața deschisă în jos, lângă taburet; cutia mică în ea, pe o latură,
  // departe de peretele lângă care stă sertarul. Întoarse cu 90° în jurul axei din adâncime.
  const xMasuta = -720;
  const dMare = [xMasuta, 0, P.lungSus / 2 - centru.cutiaMare[2]];
  const xMica = xMasuta - D.mareV / 2 + P.t + D.jocV + D.micaH / 2;
  const dMica = [xMica, 0, P.micaW / 2 - centru.cutiaMica[2]];
  const ridicat = [dMare[0], 0, dMare[2] + P.micaW + 80];
  const ridicT = zM + P.t - (P.taburetH - TABURET.sezutGros - P.tSub);   // capătul tijei, deasupra fundului cutiei mari

  // Starea fiecărei grupe la sfârșitul fiecărui pas: rot = unghiul, d = mutarea, pre = mutarea sertarului în cutie,
  // via = punctul prin care trece mutarea, ascuns = nu se vede
  const S = (d = [0, 0, 0], o = {}) => ({ rot: 0, pre: [0, 0, 0], d, ...o });
  const inchis = [-P.scos, 0, 0], scos = [420, 0, 0];
  const STARI = {
    cutiaMare: [S(dMare, { rot: 90 }), S(ridicat, { rot: 90 }), S(ridicat, { rot: 90 }), S([0, 0, 0], { via: [-360, 0, 380] }), S(), S(), S(), S(), S()],
    sertar: [S(dMare, { rot: 90, pre: inchis }), S(ridicat, { rot: 90, pre: inchis }), S(ridicat, { rot: 90, pre: inchis }),
      S([0, 0, 0], { pre: inchis, via: [-360, 0, 380] }), S([0, 0, 0], { pre: scos }), S([0, 0, 0], { pre: scos }), S([0, 0, 0], { pre: scos }), S(), S()],
    cutiaMica: [S(dMica, { rot: 90 }), S(dMica, { rot: 90 }), S([0, 0, 0], { via: [-380, 0, 120] }), S(), S(), S(), S(), S(), S()],
    T: [...Array(5)].map(() => S([420, 0, ridicT], { ascuns: true })).concat([S([0, 0, 0], { via: [0, 0, ridicT] }), S(), S(), S()]),
    pana: [...Array(6)].map(() => S([0, -260, 0], { ascuns: true })).concat([S(), S(), S()]),
    tastatura: [...Array(8)].map(() => S([0, 0, 160], { ascuns: true })).concat([S()])
  };
  const PASI = [
    { montare: 'Cutiile stau strânse, ca măsuță, lângă taburet.', demontare: 'Cutiile stau strânse, ca măsuță, lângă taburet.' },
    { montare: 'Cutia mare se ridică de pe cutia mică.', demontare: 'Cutia mare coboară peste cutia mică și devine măsuță.' },
    { montare: 'Cutia mică se întoarce pe fund și urcă pe șezut, cu frezările deasupra găurii din șezut.', demontare: 'Cutia mică coboară de pe șezut și se așază pe o latură, lângă taburet.' },
    { montare: 'Cutia mare se întoarce cu fața deschisă spre dreapta și se culcă pe cutia mică.', demontare: 'Cutia mare se ridică și se întoarce cu fața deschisă în jos.' },
    { montare: 'Sertarul se scoate, ca să facă loc piesei în T.', demontare: 'Sertarul intră la loc în cutia mare, închis.' },
    { montare: 'Piesa în T intră prin fața deschisă și coboară prin frezări, până iese sub șezut.', demontare: 'Piesa în T se ridică din frezări și iese prin fața deschisă.' },
    { montare: 'Pana se bate prin gaura din tijă, sub șezut, și strânge totul.', demontare: 'Pana se scoate cu o lovitură în capătul ei subțire.' },
    { montare: 'Sertarul intră pe șine și se trage spre dreapta cât e nevoie pentru mouse.', demontare: 'Sertarul se scoate de pe șine.' },
    { montare: 'Tastatura și mouse-ul. Gata de lucru.', demontare: 'Se iau tastatura și mouse-ul.' }
  ];
  const N = PASI.length - 1;

  const lin = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
  const usor = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  // starea unei grupe la momentul tt: între starea de la sfârșitul pasului anterior și cea de la sfârșitul pasului curent
  function stare(nume, tt) {
    const s = STARI[nume], i = Math.min(N, Math.max(1, Math.ceil(tt))), a = s[i - 1], b = s[i];
    const u = usor(Math.max(0, Math.min(1, tt - (i - 1))));
    if (tt <= 0) return s[0];
    const pts = b.via ? [a.d, b.via, b.d] : [a.d, b.d], n = pts.length - 1, k = Math.min(u * n, n - 1e-9), j = Math.floor(k);
    return { rot: a.rot + (b.rot - a.rot) * u, pre: lin(a.pre, b.pre, u), d: lin(pts[j], pts[j + 1], k - j), ascuns: a.ascuns && b.ascuns };
  }
  // întoarcerea în jurul axei din adâncime (y), cu fața deschisă a cutiei mari mergând din dreapta în jos
  function aplica(c, nume, s, op) {
    const ce = centru[nume] || [0, 0, 0], r = s.rot * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r);
    const tr = ([x, y, z]) => {
      const px = x + s.pre[0] - ce[0], py = y + s.pre[1], pz = z + s.pre[2] - ce[2];
      return [px * cs + pz * sn + ce[0] + s.d[0], py + s.d[1], -px * sn + pz * cs + ce[2] + s.d[2]];
    };
    return { ...c, op, fete: c.fete.map(f => f.map(tr)) };
  }

  function scena(tt) {
    const transp = document.getElementById('anim-transp').checked;
    // capacul cutiei mari rămâne aproape plin: prin el s-ar vedea sertarul și ar părea că stă deasupra
    const op = { cutiaMica: transp ? 0.4 : 1, cutiaMare: transp ? 0.35 : 1, capac: transp ? 0.92 : 1 };
    const out = [...taburet];
    for (const nume of Object.keys(grupe)) {
      const s = stare(nume, tt);
      if (s.ascuns) continue;
      for (const c of grupe[nume]) out.push(aplica(c, nume, s, (c.rol && op[c.rol]) ?? op[nume] ?? 1));
    }
    return out;
  }

  // Scara și originea, alese o singură dată, pe toate stările și punctele de trecere, ca desenul să nu sară
  const toate = [...taburet];
  for (const nume of Object.keys(grupe)) for (const s of STARI[nume]) {
    for (const d of s.via ? [s.d, s.via] : [s.d]) for (const c of grupe[nume]) toate.push(aplica(c, nume, { ...s, d }, 1));
  }
  o = [];
  const fix = deseneazaIzo([], { x: 6, y: 6, w: 288, h: 228 }, toate);
  o = [];

  let tt = N, tinta = N, directie = 1, ultim = null, cadru = null;
  const fara = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function deseneaza() {
    o = [];
    deseneazaIzo([], { fix, linie: 0.25 }, scena(tt));
    svg.innerHTML = o.join('');
    o = [];
    if (directie > 0) {
      const i = Math.max(0, Math.min(N, Math.ceil(tt - 1e-6)));
      text.textContent = PASI[i].montare;
      pasEl.textContent = `Montare · pasul ${i} din ${N}`;
    } else {
      const i = Math.max(0, Math.min(N, Math.floor(tt + 1e-6)));
      text.textContent = i < N ? PASI[i + 1].demontare : PASI[N].demontare;
      if (tt <= 1e-6) text.textContent = PASI[0].demontare;
      pasEl.textContent = `Demontare · mai sunt ${i} pași`;
    }
  }
  function bucla(acum) {
    if (ultim == null) ultim = acum;
    const dt = Math.min(0.1, (acum - ultim) / 1000); ultim = acum;
    const v = 1 / 1.8;   // un pas la 1,8 secunde
    tt = tinta > tt ? Math.min(tinta, tt + v * dt) : Math.max(tinta, tt - v * dt);
    deseneaza();
    if (tt !== tinta) cadru = requestAnimationFrame(bucla); else { cadru = null; ultim = null; }
  }
  function mergiLa(x) {
    tinta = Math.max(0, Math.min(N, x));
    directie = tinta >= tt ? 1 : -1;
    if (fara) { tt = tinta; deseneaza(); return; }
    if (!cadru) { ultim = null; cadru = requestAnimationFrame(bucla); }
  }

  document.getElementById('anim-monteaza').addEventListener('click', () => { if (tt >= N) tt = 0; mergiLa(N); });
  document.getElementById('anim-demonteaza').addEventListener('click', () => { if (tt <= 0) tt = N; mergiLa(0); });
  document.getElementById('anim-inainte').addEventListener('click', () => mergiLa(Math.floor(tt + 1e-6) + 1));
  document.getElementById('anim-inapoi').addEventListener('click', () => mergiLa(Math.ceil(tt - 1e-6) - 1));
  document.getElementById('anim-opreste').addEventListener('click', () => { tinta = tt; });
  document.getElementById('anim-transp').addEventListener('change', deseneaza);
  deseneaza();
})();
