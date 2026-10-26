// Ajutoarele de desen și planșa 2 (ansamblu, vederi, secțiuni, detaliu).
// Le folosesc plansa.html și artifact.html; cotele vin din geometrie.js.
const t = P.t, NR_PLANSE = 4;
let o = [];
const pune = id => { document.getElementById(id).innerHTML = o.join(''); o = []; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const txt = (x, y, s, size = 2.2, anchor = 'start', extra = '') =>
  o.push(`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" ${extra}>${esc(s)}</text>`);

// Un desen la scara k, cu originea modelului în punctul (x0, y0) al foii; axa y a modelului urcă.
function vedere(x0, y0, k) {
  const X = x => x0 + x * k, Y = y => y0 - y * k;
  const rect = (x1, y1, x2, y2, cls, rx = 0) =>
    o.push(`<rect x="${X(x1)}" y="${Y(y2)}" width="${(x2 - x1) * k}" height="${(y2 - y1) * k}" rx="${rx * k}" class="${cls}"/>`);
  const line = (x1, y1, x2, y2, cls) => o.push(`<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" class="${cls}"/>`);
  const slot = (cx, cy, w, h, cls) => rect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, cls, Math.min(w, h) / 2);
  const tick = (px, py) => o.push(`<line x1="${px - 0.7}" y1="${py + 0.7}" x2="${px + 0.7}" y2="${py - 0.7}" class="tick"/>`);
  // cotă orizontală: off > 0 deasupra reperului, off < 0 dedesubt
  const dimH = (x1, x2, yRef, off, label = Math.round(x2 - x1)) => {
    const s = Math.sign(off), yl = Y(yRef) - off, a = X(x1), b = X(x2);
    o.push(`<path class="dim" d="M${a} ${Y(yRef) - s * 0.8}V${yl - s * 1.2}M${b} ${Y(yRef) - s * 0.8}V${yl - s * 1.2}M${a - 1.2} ${yl}H${b + 1.2}"/>`);
    tick(a, yl); tick(b, yl);
    const w = String(label).length * 1.15;
    if (b - a > w + 0.6) txt((a + b) / 2, yl - 0.7, label, 2.2, 'middle');
    else txt(b + 1.6, yl - 0.7, label, 2.2, 'start');
  };
  // cotă verticală: off > 0 la stânga reperului, off < 0 la dreapta
  const dimV = (y1, y2, xRef, off, label = Math.round(y2 - y1)) => {
    const s = Math.sign(off), xl = X(xRef) - off, a = Y(y1), b = Y(y2);
    o.push(`<path class="dim" d="M${X(xRef) - s * 0.8} ${a}H${xl - s * 1.2}M${X(xRef) - s * 0.8} ${b}H${xl - s * 1.2}M${xl} ${a + 1.2}V${b - 1.2}"/>`);
    tick(xl, a); tick(xl, b);
    const w = String(label).length * 1.15, m = (a + b) / 2;
    if (a - b > w + 0.6) txt(xl - 0.7, m, label, 2.2, 'middle', `transform="rotate(-90 ${xl - 0.7} ${m})"`);
    else txt(xl - 0.7, b - 1.6, label, 2.2, 'start', `transform="rotate(-90 ${xl - 0.7} ${b - 1.6})"`);
  };
  const lit = (x, y, s, size = 1.9) => txt(X(x), Y(y) + size * 0.35, s, size, 'middle');
  return { X, Y, rect, line, slot, dimH, dimV, lit };
}
function titlu(x, y, nr, s, scara) {
  o.push(`<circle cx="${x + 2.6}" cy="${y - 1.1}" r="2.6" class="thin"/>`);
  txt(x + 2.6, y, nr, 2.6, 'middle', 'font-weight="bold"');
  txt(x + 7, y, s, 3, 'start', 'font-weight="bold"');
  o.push(`<line x1="${x + 7}" y1="${y + 1}" x2="${x + 7 + s.length * 1.75}" y2="${y + 1}" class="thin"/>`);
  txt(x + 7, y + 4, scara, 2.4);
}
// ruptura unui perete tăiat cu linie frântă (zigzag) — doar pentru detaliu
function zig(v, x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = (x2 - x1), dy = (y2 - y1);
  o.push(`<polyline class="thin" points="${v.X(x1 - dy * 0.15)},${v.Y(y1 - dx * 0.15)} ${v.X(mx - dx * 0.1 - dy * 0.12)},${v.Y(my - dy * 0.1 + dx * 0.12)} ${v.X(mx + dx * 0.1 + dy * 0.12)},${v.Y(my + dy * 0.1 - dx * 0.12)} ${v.X(x2 + dy * 0.15)},${v.Y(y2 + dx * 0.15)}"/>`);
}

const L = P.lungSus / 2, yM = P.taburetH + D.micaH, H = D.mareV;
const gx = P.gauraL, gy = P.gauraH;

// ---------- 1. Ansamblu, poziția de lucru, 1:10 ----------
(function () {
  const v = vedere(60, 132, 0.1), tw = P.taburetW / 2;
  o.push(`<line x1="20" y1="132" x2="114" y2="132" class="floor"/>`);
  // taburetul, descriptiv, din modelul lui: piesele din spate întâi, cele din față le acoperă
  for (const pc of taburetProiectat('fata'))
    o.push(`<polygon points="${pc.pts.map(q => v.X(q[0]) + ',' + v.Y(q[1])).join(' ')}" fill="#fff" stroke="#000" stroke-width="0.22" stroke-linejoin="round"/>`);
  v.lit(0, 120, 'taburet IKEA BEKVÄM, desen descriptiv');
  // cutia mică, secțiune; laterala e întreruptă de gaura de mână
  const y0 = P.taburetH, yc = y0 + D.micaH / 2;
  // capacul și fundul cutiei mici, întrerupte de frezarea pentru piesa în T
  for (const [za, zb] of [[y0, y0 + t], [yM - t, yM]]) {
    v.rect(-P.micaW / 2, za, -gx / 2, zb, 'cut');
    v.rect(gx / 2, za, P.micaW / 2, zb, 'cut');
  }
  for (const s of [-1, 1]) {
    const xa = s < 0 ? -P.micaW / 2 : P.micaW / 2 - t;
    v.rect(xa, y0 + t, xa + t, yc - gy / 2, 'cut');
    v.rect(xa, yc + gy / 2, xa + t, yM - t, 'cut');
  }
  // cutia mare, secțiune, sertarul tras
  v.rect(-L, P.tinta - t, L, P.tinta, 'cut');
  v.rect(-L, yM, -gx / 2, yM + t, 'cut');
  v.rect(gx / 2, yM, L, yM + t, 'cut');
  v.rect(-L, yM + t, -L + t, P.tinta - t, 'cut');
  // piesa în T: tija prin cutii și prin șezut, bara pe fundul cutiei mari
  v.rect(-SCANDURA.lat / 2, P.taburetH - TABURET.sezutGros - P.tSub, SCANDURA.lat / 2, yM + t, 'cut');
  v.rect(-P.tBara / 2, yM + t, P.tBara / 2, yM + 2 * t, 'cut');
  // pana, tăiată prin mijloc: apasă pe dedesubtul șezutului
  const zs = P.taburetH - TABURET.sezutGros, hm = (P.pana.lat + P.pana.latMic) / 2;
  v.rect(-P.pana.gauraL / 2, zs - hm, P.pana.gauraL / 2, zs, 'vis');
  v.slot(0, yM + H / 2, gx, gy, 'vis');
  const xi = -L + t, ys = P.tinta - t - P.jocSertar - t;
  v.rect(xi, ys - t, xi + D.sinaL, ys, 'vis');
  v.line(L, yM + t, L, P.tinta - t, 'vis');
  const xs = xi + P.scos;
  v.rect(xs, ys, xs + D.sertarL, ys + t, 'cut');
  v.rect(xs + D.sertarL - D.manerL, ys - t, xs + D.sertarL, ys, 'cut');
  // cote
  v.dimV(0, P.treaptaH, -tw, 8); v.dimV(P.treaptaH, P.taburetH, -tw, 8); v.dimV(P.taburetH, yM, -tw, 8); v.dimV(yM, P.tinta, -tw, 8);
  v.dimH(-P.sezutW / 2, P.sezutW / 2, P.taburetH - TABURET.sezutGros, -7);
  v.dimH(-tw, tw, 0, -4);
  v.dimV(0, P.tinta, -tw, 14);
  v.dimH(-L, L, P.tinta, 5); v.dimH(L, xs + D.sertarL, P.tinta, 5, P.scos);
  titlu(18, 140, '1', 'ANSAMBLU — POZIȚIA DE LUCRU', 'secțiune prin mijlocul adâncimii · 1:10');
})();

// ---------- 2. Ansamblu, strâns, 1:10 ----------
(function () {
  const v = vedere(132, 132, 0.1), W = D.mareV, Hh = P.lungSus;
  o.push(`<line x1="124" y1="132" x2="172" y2="132" class="floor"/>`);
  v.rect(0, 0, t, Hh, 'cut');
  // fundul cutiei mari, cu frezarea pentru piesa în T
  v.rect(W - t, 0, W, Hh / 2 - gx / 2, 'cut');
  v.rect(W - t, Hh / 2 + gx / 2, W, Hh, 'cut');
  v.rect(t, Hh - t, W - t, Hh, 'cut');
  v.slot(W / 2, Hh / 2, gy, gx, 'vis');
  const xb = t + P.jocSertar;
  v.rect(xb, 0, xb + t, D.sertarL, 'cut');
  v.rect(xb + t, 0, xb + 2 * t, D.manerL, 'cut');
  v.rect(xb + t, D.manerL, xb + 2 * t, D.manerL + D.sinaL, 'vis');
  // cutia mică, pe latură, secțiune
  const xm = t + D.banda + D.jocV, xe = xm + D.micaH, xc = (xm + xe) / 2;
  // capacul și fundul cutiei mici, cu frezările pentru piesa în T
  for (const xa of [xm, xe - t]) {
    v.rect(xa, 0, xa + t, P.micaW / 2 - gx / 2, 'cut');
    v.rect(xa, P.micaW / 2 + gx / 2, xa + t, P.micaW, 'cut');
  }
  for (const [ya, yb] of [[0, t], [P.micaW - t, P.micaW]]) {
    v.rect(xm + t, ya, xc - gy / 2, yb, 'cut');
    v.rect(xc + gy / 2, ya, xe - t, yb, 'cut');
  }
  v.dimH(0, W, 0, -4);
  v.dimV(0, Hh, 0, 5);
  v.dimH(xe, W - t, P.micaW, 3, D.jocV);
  titlu(120, 140, '2', 'ANSAMBLU — STRÂNS', 'secțiune · 1:10');
})();

// ---------- 3. Cutia mare, vedere din față, 1:5 ----------
(function () {
  const v = vedere(222, 100, 0.2);
  v.rect(-L, 0, L, H, 'vis');
  v.line(-L, t, L, t, 'vis'); v.line(-L, H - t, L, H - t, 'vis');
  v.line(-L + t, t, -L + t, H - t, 'hid');
  v.rect(-L + t, H - 2 * t - P.jocSertar, -L + t + D.sinaL, H - t - P.jocSertar - t + 0, 'hid');
  v.slot(0, H / 2, gx, gy, 'vis');
  v.dimH(-L, L, H, 6);
  v.dimH(-L, -gx / 2, 0, -5); v.dimH(-gx / 2, gx / 2, 0, -5); v.dimH(gx / 2, L, 0, -5);
  v.dimV(0, t, -L, 5); v.dimV(t, H - t, -L, 5); v.dimV(H - t, H, -L, 5);
  v.dimV(0, H, -L, 11);
  v.dimV(0, H / 2 - gy / 2, L, -5); v.dimV(H / 2 - gy / 2, H / 2 + gy / 2, L, -5); v.dimV(H / 2 + gy / 2, H, L, -5);
  titlu(172, 118, '3', 'CUTIA MARE — VEDERE DIN FAȚĂ', 'poziția de lucru · 1:5');
})();

// ---------- 4. Cutia mare, secțiunea A–A, 1:5 ----------
(function () {
  const v = vedere(332, 100, 0.2);
  v.rect(-L, H - t, L, H, 'cut');
  v.rect(-L, 0, L, t, 'cut');
  v.rect(-L, t, -L + t, H - t, 'cut');
  v.line(L, t, L, H - t, 'vis');
  v.slot(0, H / 2, gx, gy, 'vis');
  const ys = H - t - P.jocSertar - t;
  v.rect(-L + t, ys - t, -L + t + D.sinaL, ys, 'vis');
  v.rect(-L + t, ys, -L + t + D.sertarL, ys + t, 'cut');
  v.rect(L - D.manerL, ys - t, L, ys, 'cut');
  // trimitere la detaliul 1
  o.push(`<circle cx="${v.X(-L + t + 40)}" cy="${v.Y(ys)}" r="4" class="thin"/>`);
  o.push(`<line x1="${v.X(-L + t + 40) + 2.8}" y1="${v.Y(ys) + 2.8}" x2="${v.X(-L + t + 40) + 7}" y2="${v.Y(ys) + 7}" class="thin"/>`);
  txt(v.X(-L + t + 40) + 7.5, v.Y(ys) + 9, '1', 2.6, 'middle', 'font-weight="bold"');
  v.dimH(-L, -L + t, H, 6); v.dimH(-L + t, L, H, 6, D.sertarL);
  v.dimH(-L + t, L - D.manerL, H, 11, D.sinaL); v.dimH(L - D.manerL, L, H, 11, D.manerL);
  v.dimV(0, t, -L, 5); v.dimV(t, H - t, -L, 5); v.dimV(H - t, H, -L, 5);
  titlu(282, 118, '4', 'CUTIA MARE — SECȚIUNEA A–A', 'sertarul închis · 1:5');
})();

// ---------- 5. Cutia mare, vedere din dreapta (fața deschisă), 1:5 ----------
(function () {
  const v = vedere(95, 222, 0.2), d = D.mareD / 2;
  v.rect(-d, H - t, d, H, 'vis');
  v.rect(-d, 0, d, t, 'vis');
  v.rect(-d, t, -d + t, H - t, 'vis');
  v.rect(d - t, t, d, H - t, 'vis');
  const ys = H - t - P.jocSertar - t, w = D.sertarW / 2, s = SCANDURA.lat;
  v.rect(-w, ys, w, ys + t, 'vis');
  v.rect(-w, ys - t, w, ys, 'vis');
  // șinele: partea de lângă perete se vede, restul e în spatele mânerului
  v.rect(-d + t, ys - t, -w, ys, 'vis'); v.rect(-w, ys - t, -d + t + s, ys, 'hid');
  v.rect(w, ys - t, d - t, ys, 'vis'); v.rect(d - t - s, ys - t, w, ys, 'hid');
  // planul secțiunii A–A
  v.line(0, -3, 0, H + 12, 'axis');
  v.lit(0, H + 15, 'A', 2.6);
  v.lit(-d + 70, H / 2, 'spre utilizator', 1.9);
  v.dimH(-d, -d + t, H, 6); v.dimH(-d + t, d - t, H, 6); v.dimH(d - t, d, H, 6);
  v.dimH(-d, d, 0, -6);
  v.dimV(0, t, -d, 5); v.dimV(t, H - t, -d, 5); v.dimV(H - t, H, -d, 5);
  v.dimV(0, H, -d, 11);
  titlu(40, 238, '5', 'CUTIA MARE — FAȚA DESCHISĂ', 'vedere din dreapta · 1:5');
})();

// ---------- 6. Cutia mică, vedere din față, 1:5 ----------
(function () {
  const v = vedere(210, 222, 0.2), w = P.micaW / 2, h = D.micaH;
  v.rect(-w, 0, w, h, 'vis');
  v.line(-w, t, w, t, 'hid'); v.line(-w, h - t, w, h - t, 'hid');
  v.line(-w + t, t, -w + t, h - t, 'hid'); v.line(w - t, t, w - t, h - t, 'hid');
  v.dimH(-w, w, h, 6);
  v.dimV(0, t, -w, 5); v.dimV(t, h - t, -w, 5); v.dimV(h - t, h, -w, 5);
  v.dimV(0, h, -w, 11);
  titlu(165, 238, '6', 'CUTIA MICĂ — VEDERE DIN FAȚĂ', '1:5');
})();

// ---------- 7. Cutia mică, vedere laterală, 1:5 ----------
(function () {
  const v = vedere(300, 222, 0.2), d = D.micaD / 2, h = D.micaH;
  v.rect(-d, 0, d, h, 'vis');
  v.line(-d + t, 0, -d + t, h, 'vis'); v.line(d - t, 0, d - t, h, 'vis');
  v.line(-d + t, t, d - t, t, 'vis'); v.line(-d + t, h - t, d - t, h - t, 'vis');
  v.slot(0, h / 2, gx, gy, 'vis');
  v.dimH(-d, -d + t, h, 6); v.dimH(-d + t, d - t, h, 6); v.dimH(d - t, d, h, 6);
  v.dimH(-d, -gx / 2, 0, -5); v.dimH(-gx / 2, gx / 2, 0, -5); v.dimH(gx / 2, d, 0, -5);
  v.dimV(0, h / 2 - gy / 2, d, -5); v.dimV(h / 2 - gy / 2, h / 2 + gy / 2, d, -5); v.dimV(h / 2 + gy / 2, h, d, -5);
  titlu(262, 238, '7', 'CUTIA MICĂ — VEDERE LATERALĂ', '1:5');
})();

// ---------- 8. Detaliul 1, șina sertarului, 1:2 ----------
(function () {
  const v = vedere(352, 186, 0.5), j = P.jocSertar, s = SCANDURA.lat, g = (D.iD - D.sertarW) / 2, R = 104;
  v.rect(0, 0, R, t, 'cut');                         // capacul
  v.rect(0, -60, t, 0, 'cut');                       // peretele din față
  v.rect(t, -j - 2 * t, t + s, -j - t, 'cut');       // șina
  v.rect(t + g, -j - t, R, -j, 'cut');               // placa sertarului
  zig(v, R, -2, R, t + 2); zig(v, R, -j - t - 2, R, -j + 2);
  zig(v, -2, -60, t + 2, -60);
  v.lit(70, t / 2, 'a'); v.lit(t / 2, -45, 'b'); v.lit(t + s / 2, -j - 1.5 * t, 'c'); v.lit(80, -j - t / 2, 'd');
  v.dimV(-j, 0, 0, 5); v.dimV(-j - t, -j, 0, 5); v.dimV(-j - 2 * t, -j - t, 0, 5);
  v.dimH(0, t, -60, -4); v.dimH(t, t + s, -60, -4);
  v.dimH(t, t + g, -j - 2 * t, -8); v.dimH(t + g, t + s, -j - 2 * t, -8, D.reazem);
  txt(352, 222.5, 'a capac · b perete față · c șină · d placa sertarului', 1.9);
  titlu(352, 238, '8', 'DETALIUL 1 — ȘINA', '1:2');
})();

// ---------- lista de piese ----------
(function () {
  const x = 140, y0 = 249, rh = 2.18;
  txt(x, y0 - 4, 'LISTA DE PIESE', 3, 'start', 'font-weight="bold"');
  const cols = [[x, 'Nr.', 'start'], [x + 6, 'Piesa', 'start'], [x + 40, 'Buc.', 'end'], [x + 55, 'Pe fibră', 'end'], [x + 69, 'Lățime', 'end'], [x + 72, 'Din', 'start'], [x + 91, 'Observații', 'start']];
  cols.forEach(([cx, s, a]) => txt(cx, y0, s, 2.1, a, 'font-weight="bold"'));
  o.push(`<line x1="${x}" y1="${y0 + 0.9}" x2="${x + 145}" y2="${y0 + 0.9}" class="thin"/>`);
  let y = y0 + rh;
  for (const p of PIESE) {
    if (p.grup) { txt(x, y, p.grup, 1.95, 'start', 'font-style="italic"'); y += rh; continue; }
    const obs = [p.gaura ? 'gaură de mână' : '', p.frezare ? `frezare pentru T, ${p.frezare}` : ''].filter(Boolean).join('; ');
    [[x, p.nr, 'start'], [x + 6, p.nume, 'start'], [x + 40, p.buc, 'end'], [x + 55, p.L, 'end'], [x + 69, p.l, 'end'], [x + 72, p.placa === 'S' ? `scândură ${LATIMI.S}` : `placă ${LATIMI[p.placa]}`, 'start'], [x + 91, obs, 'start']]
      .forEach(([cx, s, a]) => txt(cx, y, s, 1.95, a));
    y += rh;
  }
})();

// ---------- note ----------
(function () {
  const x = 14; let y = 250;
  txt(x, y - 4, 'NOTE', 3, 'start', 'font-weight="bold"');
  let n = 0;
  [
    `Cote în mm. Material: ${MATERIALE[P.material].nume}, ${t} mm.`,
    'Cutia mare vopsită negru; cutia mică în culoarea lemnului.',
    'Îmbinări cap la cap, cu eurosuruburi (planșa 4). La cutia mare, capacul',
    '+și fundul acoperă celelalte piese; la cea mică, fața și spatele.',
    `Joc între cutii, strânse: ${Math.min(D.jocL, D.jocD, D.jocV)} mm pe fiecare parte (minim ${P.jocMin}).`,
    `Găuri de mână ${gx} × ${gy}, capete rotunde, centrate pe față.`,
    `Sertar lemn pe lemn, joc ${P.jocSertar} mm sub capac.`,
    `Mâner și șine din ${SCANDURA.nume} ${t} × ${SCANDURA.lat}.`,
    `Suprafața de lucru la ${P.tinta} de la podea. Taburetul BEKVÄM e desenat descriptiv;`,
    `+cutiile se prind de el cu piesa în T, strânsă sub șezut cu o pană (planșa 4).`,
    `Sertarul se trage ${D.scosMin} ca să încapă mouse-ul, ${P.scos} ca să se și miște.`
  ].forEach(s => {
    const cont = s.startsWith('+');
    if (!cont) txt(x, y, String(++n), 2.1);
    txt(x + 4, y, cont ? s.slice(1) : s, 2.1); y += 3.5;
  });
})();

// ---------- cartuș și chenar, pe fiecare planșă ----------
function cartus(nr, ce, scari) {
  o.push(`<rect x="10" y="10" width="400" height="277" class="frame"/>`);
  const x = 290, y = 252, w = 120, h = 35;
  o.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="frame"/>`);
  o.push(`<path class="thin" d="M${x} ${y + 12}H${x + w}M${x} ${y + 21}H${x + w}M${x + 60} ${y + 12}V${y + h}M${x} ${y + 28}H${x + w}"/>`);
  txt(x + 3, y + 6, 'SUPORT DE TASTATURĂ DIN DOUĂ CUTII', 3.6, 'start', 'font-weight="bold"');
  txt(x + 3, y + 10, ce, 2.4);
  txt(x + 3, y + 15.5, 'Scări', 1.8); txt(x + 3, y + 19.2, scari, 2.6);
  txt(x + 63, y + 15.5, 'Format', 1.8); txt(x + 63, y + 19.2, 'A3', 2.6);
  txt(x + 3, y + 24.5, 'Material', 1.8); txt(x + 3, y + 27, MATERIALE[P.material].nume + ', ' + t + ' mm', 2.2);
  txt(x + 63, y + 24.5, 'Data', 1.8); txt(x + 63, y + 27, '26.10.2026', 2.4);
  txt(x + 3, y + 32.5, 'Cotele se generează din geometrie.js', 2);
  txt(x + 63, y + 32.5, `Planșa ${nr} / ${NR_PLANSE}`, 2.4);
}
cartus(2, 'ansamblu, vederi, secțiuni și detaliu', '1:10 · 1:5 · 1:2');
pune('p2');
