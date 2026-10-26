// Geometria suportului de tastatură, în milimetri.
// Singura sursă a cotelor: proiect.html și plansa.html o citesc de aici.
// Ofertele de pe hornbach.ro (Timișoara, Calea Aradului), prețuri văzute pe 26.10.2026.
const MATERIALE = {
  pin: { nume: 'pin încleiat, calitatea B/C', placi: [
    { lat: 400, L: 2000, pret: 124 }, { lat: 400, L: 800, pret: 55 },
    { lat: 300, L: 2000, pret: 94 }, { lat: 300, L: 800, pret: 38 },
    { lat: 200, L: 2000, pret: 40.5 }, { lat: 200, L: 800, pret: 32.5 } ] },
  fag: { nume: 'fag încleiat', placi: [
    { lat: 400, L: 2000, pret: 157, cal: 'B/C' }, { lat: 400, L: 1200, pret: 92, cal: 'B/C' }, { lat: 400, L: 800, pret: 65, cal: 'B/C' },
    { lat: 300, L: 2000, pret: 98, cal: 'A/B' }, { lat: 300, L: 1200, pret: 75, cal: 'A/B' }, { lat: 300, L: 800, pret: 54, cal: 'A/B' },
    { lat: 200, L: 2000, pret: 66, cal: 'A/B' }, { lat: 200, L: 1200, pret: 47, cal: 'A/B' }, { lat: 200, L: 800, pret: 38.9, cal: 'A/B' } ] }
};
// Șinele și mânerul sertarului: scândură rindeluită, aceeași pentru orice material.
const SCANDURA = { nume: 'scândură de cherestea rindeluită', lat: 70, L: 3000, pret: 17.75 };

const P = {
  material: 'pin',
  t: 18,                 // grosimea plăcilor încleiate și a scândurii
  tinta: 1036,           // de la podea până la suprafața tastaturii; cotul e la 1050
  taburetH: 500, taburetW: 430, taburetD: 390,   // BEKVÄM: înălțimea și baza, din desenul cotat IKEA
  treaptaH: 250,         // treapta de jos, din desenul cotat IKEA; stă în spate
  sezutW: 360, sezutD: 240,   // șezutul, măsurat; latura de 360 e spre utilizator
  lungSus: 446,          // lungimea suprafeței de sus, cât tastatura
  latA: 400,             // placa de 400 mm lățime
  latB: 300,             // placa de 300 mm lățime
  latC: 200,             // placa de 200 mm lățime
  jocMin: 10,            // jocul minim cerut, pe fiecare parte
  jocSertar: 2,          // între sertar și capac
  gauraL: 100, gauraH: 30,   // gaura de mână, alungită, cu capete rotunde
  taietura: 4,           // cât mănâncă pânza la fiecare tăietură
  limitaDebitare: 230,   // sub atât, debitarea Hornbach nu taie (de clarificat la magazin)
  taiereAcasa: 380,      // cât taie fierăstrăul de acasă, de-a curmezișul
  scos: 250,             // cât se trage sertarul ca mouse-ul să se și miște
  mouseW: 65, mouseL: 120, margine: 15,
  tastW: 440, tastD: 140,
  tBara: 140,            // piesa în T: lungimea barei care stă pe fundul cutiei mari
  tSub: 35,              // cât iese tija sub șezutul taburetului, cu gaura pentru pană
  // pana plată care strânge piesa în T sub șezut; se bate ca să strângă și se scoate la fiecare demontare
  pana: { lung: 110, lat: 22, latMic: 12, joc: 2, gauraL: 20, gauraH: 18 }
};

P.micaW = P.sezutW;                      // cutia mică are lățimea șezutului

const D = {};
D.mareD = P.latA;                        // adâncimea cutiei mari = lățimea plăcii A
D.iV = P.latB;                           // fața și spatele cutiei mari = lățimea plăcii B
D.mareV = D.iV + 2 * P.t;                // înălțimea cutiei mari, culcată
D.micaH = P.tinta - P.taburetH - D.mareV;
D.micaD = P.latC + 2 * P.t;              // capacul, fundul și lateralele cutiei mici = lățimea plăcii C; cât încape în șezut
D.iD = D.mareD - 2 * P.t;
D.iL = P.lungSus - P.t;
D.sertarL = D.iL;                        // placa sertarului, de la capătul închis până la fața deschisă
D.sertarW = P.latB;                      // placa sertarului = lățimea plăcii B
D.manerL = SCANDURA.lat;                 // mânerul e o bucată de scândură lipită sub capătul plăcii
D.sinaL = D.iL - D.manerL;               // șinele se opresc unde începe mânerul
D.reazem = SCANDURA.lat - (D.iD - D.sertarW) / 2;   // cât stă placa pe fiecare șină
D.banda = P.jocSertar + 2 * P.t;         // sertarul cu șinele, sub capac
D.mouse = P.tinta - P.t - P.jocSertar;
D.micaFP = D.micaH;                      // fața și spatele cutiei mici acoperă celelalte piese; înălțimea = lățimea plăcii C
D.micaCF = D.micaD - 2 * P.t;            // capacul și fundul cutiei mici, între față și spate
D.micaLatH = D.micaH - 2 * P.t;          // lateralele, între capac și fund
// jocul pe fiecare parte când cutia mică stă în cea mare
D.jocD = (D.iD - D.micaD) / 2;
D.jocL = (D.iL - P.micaW) / 2;
D.jocV = (D.iV - D.banda - D.micaH) / 2;
D.scosMin = P.mouseW + 2 * P.margine;
// cât ies cutiile peste șezut, pe fiecare parte
D.iesireLat = (P.micaW - P.sezutW) / 2;
D.iesireAd = (D.micaD - P.sezutD) / 2;
D.iesireMare = (D.mareD - P.sezutD) / 2;

// Taburetul BEKVÄM, desenat descriptiv după desenele IKEA. Cunoscute: înălțimea 500, treapta la 250, baza 430 × 390,
// șezutul 360 × 240. Secțiunile, înclinările și ramele sunt luate din proporțiile desenelor, fără cote.
// Axe: x pe lățime (latura de 360 e spre utilizator), y în adâncime (utilizatorul la y negativ, treapta în spate), z în sus.
const TABURET = {
  picior: 32, sezutGros: 20, treaptaGros: 20, rama: 50, ramaGros: 20,
  sezutPeste: 10,          // cât iese șezutul peste picioare
  inclinFata: 100,         // cât se depărtează spre podea picioarele dinspre utilizator
  treaptaAd: 120,          // adâncimea treptei de jos
  treaptaPeste: 25,        // cât iese treapta peste picioarele din spate
  gauraL: 110, gauraH: 25  // gaura de mână din șezut, în lungul laturii de 360
};
TABURET.zt = P.taburetH - TABURET.sezutGros;                                      // sub șezut
TABURET.evazare = (P.taburetW - P.sezutW) / 2 + TABURET.sezutPeste;               // pe lățime, pe fiecare parte
TABURET.inclinSpate = P.taburetD - P.sezutD + 2 * TABURET.sezutPeste - TABURET.inclinFata;
// colțul exterior al unui picior la înălțimea z; sx, sy = ±1
function piciorLa(sx, sy, z) {
  const f = 1 - z / TABURET.zt, x0 = P.sezutW / 2 - TABURET.sezutPeste, y0 = P.sezutD / 2 - TABURET.sezutPeste;
  return [sx * (x0 + TABURET.evazare * f), sy * (y0 + (sy < 0 ? TABURET.inclinFata : TABURET.inclinSpate) * f)];
}
TABURET.fata = piciorLa(1, -1, 0)[1];                                             // picioarele din față, la podea
TABURET.picioareSpate = piciorLa(1, 1, 0)[1];                                     // picioarele din spate, la podea
TABURET.spate = piciorLa(1, 1, P.treaptaH)[1] + TABURET.treaptaPeste;             // marginea treptei

// Piesele taburetului, fiecare ca opt colțuri: patru sus, patru jos.
function taburetPiese() {
  const T = TABURET, p = T.picior, g = T.ramaGros, out = [];
  const cub = (x0, x1, y0, y1, z0, z1) => {
    const sq = z => [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]];
    return { sus: sq(z1), jos: sq(z0) };
  };
  // picioarele
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const sq = ([x, y], z) => [[x, y, z], [x - sx * p, y, z], [x - sx * p, y - sy * p, z], [x, y - sy * p, z]];
    out.push({ sus: sq(piciorLa(sx, sy, T.zt), T.zt), jos: sq(piciorLa(sx, sy, 0), 0) });
  }
  // șezutul
  out.push(cub(-P.sezutW / 2, P.sezutW / 2, -P.sezutD / 2, P.sezutD / 2, T.zt, P.taburetH));
  // ramele de sub șezut și ramele de la jumătate: între picioare, cu fața la 6 mm înăuntrul lor
  const rame = (z0, z1, faraSpate) => {
    const zm = (z0 + z1) / 2, [xo, yf] = piciorLa(1, -1, zm), yb = piciorLa(1, 1, zm)[1];
    for (const sy of faraSpate ? [-1] : [-1, 1]) {
      const yo = sy < 0 ? yf : yb, ya = yo - sy * 6, yi = ya - sy * g;
      out.push(cub(-xo + p, xo - p, Math.min(ya, yi), Math.max(ya, yi), z0, z1));
    }
    for (const sx of [-1, 1]) {
      const xa = sx * (xo - 6), xi = xa - sx * g;
      out.push(cub(Math.min(xa, xi), Math.max(xa, xi), yf + p, yb - p, z0, z1));
    }
  };
  rame(T.zt - T.rama, T.zt, false);
  const zr1 = P.treaptaH - T.treaptaGros, zr0 = zr1 - T.rama;
  rame(zr0, zr1, true);
  // treapta de jos, în spate, și rama de sub ea
  const [xs, ys] = piciorLa(1, 1, P.treaptaH);
  out.push(cub(-xs - 5, xs + 5, T.spate - T.treaptaAd, T.spate, zr1, P.treaptaH));
  const [xr, yr] = piciorLa(1, 1, (zr0 + zr1) / 2);
  out.push(cub(-xr + p, xr - p, yr - 6 - g, yr - 6, zr0, zr1));
  return out;
}

// Înfășurătoarea convexă a unor puncte 2D (lanțul monoton).
function infasuratoare(pts) {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]), x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const jos = [], sus = [];
  for (const q of s) { while (jos.length > 1 && x(jos[jos.length - 2], jos[jos.length - 1], q) <= 0) jos.pop(); jos.push(q); }
  for (const q of [...s].reverse()) { while (sus.length > 1 && x(sus[sus.length - 2], sus[sus.length - 1], q) <= 0) sus.pop(); sus.push(q); }
  return jos.slice(0, -1).concat(sus.slice(0, -1));
}
// Conturul fiecărei piese în vederea din față (x, z) sau din dreapta (y, z), de la cea mai depărtată la cea mai apropiată.
function taburetProiectat(vedere) {
  const pr = vedere === 'fata' ? q => [q[0], q[2]] : q => [q[1], q[2]];
  const departe = vedere === 'fata' ? q => q[1] : q => -q[0];
  return taburetPiese().map(pc => {
    const v = [...pc.sus, ...pc.jos];
    return { pts: infasuratoare(v.map(pr)), d: v.reduce((s, q) => s + departe(q), 0) / v.length };
  }).sort((a, b) => b.d - a.d);
}

// Piesa în T care prinde cutiile de taburet: bara stă pe fundul cutiei mari, pe dinăuntru;
// tija coboară prin frezarea din fundul cutiei mari, prin capacul și fundul cutiei mici și prin gaura din șezut.
// Frezările din cutii au mărimea găurilor de mână și stau în mijlocul piesei, în lungul laturii de 36 cm a șezutului.
D.tTijaL = P.t + D.micaH + TABURET.sezutGros + P.tSub;   // de sub bară până sub șezut
D.tH = D.tTijaL + P.t;                                     // toată piesa, cu bara
// gaura pentru pană, în tijă, măsurată de la capătul de jos al tijei: marginea de sus intră cu `joc` peste
// dedesubtul șezutului, ca pana să apese pe șezut și să tragă tija în jos
D.panaSus = P.tSub + P.pana.joc;
D.panaJos = D.panaSus - P.pana.gauraH;

// L = lungimea pe fibră (cât se taie din placă), l = lățimea; placa S e scândura;
// gaura: direcția în care e lungă gaura de mână pe piesă (u = pe lungime, v = pe lățime)
const PIESE = [
  { grup: 'Cutia mare (vopsită negru)' },
  { nr: 1, nume: 'Capac și fund', buc: 2, L: P.lungSus, l: D.mareD, placa: 'A', unde: 'sus și jos în poziția de lucru; acoperă celelalte piese; doar fundul are frezare pentru piesa în T', frezare: 'doar la fund' },
  { nr: 2, nume: 'Față și spate', buc: 2, L: P.lungSus, l: D.iV, placa: 'B', unde: 'între capac și fund; cu gaură de mână', gaura: 'u' },
  { nr: 3, nume: 'Capătul închis', buc: 1, L: D.iD, l: D.iV, placa: 'B', unde: 'în stânga, între toate patru' },
  { grup: 'Sertarul' },
  { nr: 4, nume: 'Placa sertarului', buc: 1, L: D.sertarL, l: D.sertarW, placa: 'B', unde: `la ${P.jocSertar} mm sub capac, așezată pe șine` },
  { nr: 5, nume: 'Mânerul', buc: 1, L: D.sertarW, l: D.manerL, placa: 'S', unde: 'lipit sub capătul plăcii, la fața deschisă; se oprește în capătul șinelor' },
  { nr: 6, nume: 'Șine', buc: 2, L: D.sinaL, l: SCANDURA.lat, placa: 'S', unde: `lipite pe față și pe spate, cu fața de sus la ${P.jocSertar + P.t} mm sub capac, de la capătul închis` },
  { grup: 'Cutia mică (natur)' },
  { nr: 7, nume: 'Față și spate', buc: 2, L: P.micaW, l: D.micaFP, placa: 'C', unde: 'acoperă celelalte piese' },
  { nr: 8, nume: 'Capac și fund', buc: 2, L: P.micaW, l: D.micaCF, placa: 'C', unde: 'între față și spate; cu frezare pentru piesa în T', frezare: 'la amândouă' },
  { nr: 9, nume: 'Laterale', buc: 2, L: D.micaLatH, l: D.micaCF, placa: 'C', unde: 'între față și spate și între capac și fund; cu gaură de mână', gaura: 'v' },
  { grup: 'Piesa în T, care prinde cutiile de taburet' },
  { nr: 10, nume: 'Tija', buc: 1, L: D.tTijaL, l: SCANDURA.lat, placa: 'S', unde: `trece prin fundul cutiei mari, prin cutia mică și prin gaura șezutului; jos are gaura de ${P.pana.gauraL} × ${P.pana.gauraH} pentru pană` },
  { nr: 11, nume: 'Bara', buc: 1, L: P.tBara, l: SCANDURA.lat, placa: 'S', unde: 'lipită și înșurubată deasupra tijei, de-a curmezișul; stă pe fundul cutiei mari' },
  { nr: 12, nume: 'Pana', buc: 1, L: P.pana.lung, l: P.pana.lat, placa: 'S', manual: true, unde: `în pantă, de la ${P.pana.lat} la ${P.pana.latMic} mm; se bate prin gaura tijei, sub șezut` }
];

const LATIMI = { A: P.latA, B: P.latB, C: P.latC, S: SCANDURA.lat };
// Unde se taie: ce trece de fierăstrăul de acasă se taie la Hornbach.
const undeSeTaie = k => LATIMI[k] > P.taiereAcasa ? 'la Hornbach' : 'acasă';

function taieri() {
  const t = { A: [], B: [], C: [], S: [] };
  for (const p of PIESE) {
    if (!p.nume) continue;
    for (let i = 0; i < p.buc; i++) t[p.placa].push({ L: p.L, ce: `${p.nr}. ${p.nume}` });
  }
  return t;
}

// Așază tăieturile pe plăci, cea mai lungă întâi, în prima placă unde mai încape.
function aseaza(cuts, placi) {
  const libere = placi.map(p => ({ ...p, rest: p.L, bucati: [] })).sort((a, b) => b.L - a.L);
  for (const c of [...cuts].sort((a, b) => b.L - a.L)) {
    const pl = libere.find(p => p.rest >= c.L + P.taietura);
    if (!pl) return null;
    pl.rest -= c.L + P.taietura;
    pl.bucati.push(c);
  }
  return libere;
}

// Pentru fiecare lățime, cea mai ieftină combinație de cel mult trei plăci în care încap toate tăieturile.
function planDebitare(material = P.material) {
  const t = taieri(), plan = {};
  for (const k of ['A', 'B', 'C', 'S']) {
    const oferta = k === 'S' ? [SCANDURA] : MATERIALE[material].placi.filter(p => p.lat === LATIMI[k]);
    let best = null;
    const incearca = combo => {
      const r = aseaza(t[k], combo);
      const pret = combo.reduce((s, p) => s + p.pret, 0);
      if (r && (!best || pret < best.pret)) best = { pret, placi: r };
    };
    oferta.forEach((a, i) => {
      incearca([a]);
      oferta.slice(i).forEach((b, j) => {
        incearca([a, b]);
        oferta.slice(i + j).forEach(c => incearca([a, b, c]));
      });
    });
    plan[k] = best;
  }
  plan.pret = ['A', 'B', 'C', 'S'].reduce((s, k) => s + (plan[k] ? plan[k].pret : NaN), 0);
  return plan;
}

function verificari() {
  const laHornbach = PIESE.filter(p => p.nume && undeSeTaie(p.placa) === 'la Hornbach');
  return [
    [`Cutia mică, de ${P.micaW} × ${D.micaD} mm, stă pe șezutul de ${P.sezutW} × ${P.sezutD} mm: are lățimea lui și e cu ${-D.iesireAd} mm mai scurtă în față și în spate. Cutia mare iese peste marginea din față a șezutului cu ${D.iesireMare} mm; piesa în T o ține prinsă de taburet.`,
      P.micaW <= P.sezutW && D.micaD <= P.sezutD],
    [`Cutia mare, de ${P.lungSus} × ${D.mareD} mm, acoperă toată cutia mică, de ${P.micaW} × ${D.micaD} mm: iese peste ea cu ${(P.lungSus - P.micaW) / 2} mm în stânga și în dreapta și cu ${(D.mareD - D.micaD) / 2} mm în față și în spate.`,
      P.lungSus >= P.micaW && D.mareD >= D.micaD],
    [`Strânse, jocul dintre cutii pe fiecare parte: ${D.jocL} mm pe lungime, ${D.jocD} mm în adâncime, ${D.jocV} mm pe înălțime, lângă sertar. Minimul cerut e ${P.jocMin} mm.`,
      Math.min(D.jocL, D.jocD, D.jocV) >= P.jocMin],
    [`Placa sertarului, de ${D.sertarW} mm, stă pe fiecare șină pe ${D.reazem} mm, iar mânerul trece peste capătul șinelor, deci oprește sertarul.`,
      D.reazem >= P.t],
    [`Nicio piesă nu se spintecă pe lungime: lățimea fiecăreia e lățimea plăcii sau a scândurii din care iese. Doar pana se taie de mână, în pantă.`,
      PIESE.filter(p => p.nume && !p.manual).every(p => p.l === LATIMI[p.placa])],
    [`Sub gaura penei rămân ${D.panaJos} mm de lemn în capătul tijei, destul ca să nu se rupă când strângeți.`,
      D.panaJos >= 15],
    [`Ce se taie la Hornbach (plăcile de ${P.latA} mm, mai late decât cei ${P.taiereAcasa} mm pe care îi taie fierăstrăul de acasă) are cel puțin ${P.limitaDebitare} mm pe fibră: ${laHornbach.map(p => p.L + ' mm').join(', ')}.`,
      laHornbach.every(p => p.L >= P.limitaDebitare)],
    [`Toate piesele încap în plăcile de ${P.latA}, ${P.latB} și ${P.latC} mm pe care le are Hornbach în ${MATERIALE[P.material].nume}, și în scândura de ${SCANDURA.lat} mm.`,
      !!(planDebitare().A && planDebitare().B && planDebitare().C && planDebitare().S)],
    [`Piesa în T are ${D.tH} mm, iar cutia mare are ${D.iV} mm liberi pe înălțime: încape. Se pune cu sertarul scos, fiindcă pe sub șine rămân doar ${D.iV - D.banda} mm.`,
      D.tH <= D.iV],
    [`Tija, de ${SCANDURA.lat} × ${P.t} mm, trece prin frezările de ${P.gauraL} × ${P.gauraH} mm din cutii. Prin gaura șezutului trebuie să treacă și ea; gaura e desenată descriptiv, deci se verifică la montaj.`,
      SCANDURA.lat < P.gauraL && P.t < P.gauraH],
    [`Înălțimea totală: ${P.taburetH} + ${D.micaH} + ${D.mareV} = ${P.taburetH + D.micaH + D.mareV} mm.`,
      P.taburetH + D.micaH + D.mareV === P.tinta]
  ];
}

// Eurosuruburi (confirmat). Fiecare îmbinare: piesa prin care trece șurubul („fata"), linia găurilor pe ea,
// și piesa în al cărei cant intră („cant"), cu muchia și intervalul de pe ea.
// Pe piesă: u merge în lungul fibrei (L), v pe lățime (l), ambele de la 0.
P.surub = { nume: 'eurosurub (confirmat) 7 × 50', dFata: 7, dCant: 5, lung: 50, tesire: 10, capat: 50, pas: 150 };

// Găurile pe o latură de lungime len: la cel puțin `capat` de margini, la cel mult `pas` între ele.
function pozitii(len) {
  const { capat, pas } = P.surub;
  const n = Math.max(2, Math.ceil((len - 2 * capat) / pas) + 1);
  return Array.from({ length: n }, (_, i) => Math.round(capat + i * (len - 2 * capat) / (n - 1)));
}

const h2 = P.t / 2;
const IMBINARI = [
  // cutia mare
  { fata: 1, linii: [{ a: 'v', c: h2 }, { a: 'v', c: D.mareD - h2 }], de: 0, la: P.lungSus,
    cant: 2, muchii: ['v0', 'v1'], cDe: 0, fibra: 'lungă', ce: 'capacul și fundul în fața și spatele cutiei mari' },
  { fata: 1, linii: [{ a: 'u', c: h2 }], de: P.t, la: D.mareD - P.t,
    cant: 3, muchii: ['v0', 'v1'], cDe: 0, fibra: 'lungă', ce: 'capacul și fundul în capătul închis' },
  { fata: 2, linii: [{ a: 'u', c: h2 }], de: 0, la: D.iV,
    cant: 3, muchii: ['u0', 'u1'], cDe: 0, fibra: 'capăt', ce: 'fața și spatele în capătul închis' },
  // cutia mică
  { fata: 7, linii: [{ a: 'v', c: h2 }, { a: 'v', c: D.micaH - h2 }], de: 0, la: P.micaW,
    cant: 8, muchii: ['v0', 'v1'], cDe: 0, fibra: 'lungă', ce: 'fața și spatele cutiei mici în capac și fund' },
  { fata: 7, linii: [{ a: 'u', c: h2 }, { a: 'u', c: P.micaW - h2 }], de: P.t, la: D.micaH - P.t,
    cant: 9, muchii: ['v0', 'v1'], cDe: 0, fibra: 'lungă', ce: 'fața și spatele cutiei mici în laterale' },
  { fata: 8, linii: [{ a: 'u', c: h2 }, { a: 'u', c: P.micaW - h2 }], de: 0, la: D.micaCF,
    cant: 9, muchii: ['u0', 'u1'], cDe: 0, fibra: 'capăt', ce: 'capacul și fundul cutiei mici în laterale' }
];
// Găurile prin fața unei piese, în coordonatele ei: [{u, v}]
function gauriFata(nr) {
  const g = [];
  for (const im of IMBINARI.filter(i => i.fata === nr)) {
    const ps = pozitii(im.la - im.de).map(p => im.de + p);
    for (const ln of im.linii) for (const p of ps) g.push(ln.a === 'v' ? { u: p, v: ln.c } : { u: ln.c, v: p });
  }
  return g;
}
// Câte eurosuruburi intră în total
function numarSuruburi() {
  const buc = nr => PIESE.find(p => p.nr === nr).buc;
  return IMBINARI.reduce((s, im) => s + pozitii(im.la - im.de).length * im.linii.length * buc(im.fata), 0);
}
