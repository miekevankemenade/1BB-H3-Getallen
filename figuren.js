/* =====================================================================
   Figuren: stukken (delen) die je kunt kleuren, tellen en aanklikken.
   Een figuur is { w, h, stukken:[{d, k, cx, cy, stippel}], lijnen:[d] }
   ===================================================================== */
(function () {
  const KLEUR = {
    roze: '#efc3cb', geel: '#fdd78a', blauw: '#bcc9ea', groen: '#7ccbb1',
    magenta: '#c7176f', oranje: '#f9b12a', lichtroze: '#f3c9cf', donkerroze: '#e39aa8'
  };
  const LIJN = '#1f6fae';
  const r2 = v => Math.round(v * 100) / 100;
  const pt = (x, y) => r2(x) + ' ' + r2(y);

  function polyPad(p) { return 'M' + p.map(q => pt(q[0], q[1])).join(' L') + ' Z'; }
  function midden(p) {
    let x = 0, y = 0; p.forEach(q => { x += q[0]; y += q[1]; });
    return [x / p.length, y / p.length];
  }
  function inSet(gk, i) { return gk.indexOf(i) >= 0; }

  const F = {
    KLEUR, LIJN,

    /* Cirkel in n gelijke stukken. Stuk 0 begint bovenaan en loopt met de klok mee. */
    cirkel(n, o = {}) {
      const R = o.r || 80, pad = 4, c = R + pad, start = (o.start ?? -90) * Math.PI / 180;
      const gk = o.gk || [], st = o.stippel || [], k = o.k || 'geel';
      const stukken = [];
      for (let i = 0; i < n; i++) {
        const a1 = start + i * 2 * Math.PI / n, a2 = start + (i + 1) * 2 * Math.PI / n;
        const am = (a1 + a2) / 2;
        const p1 = [c + R * Math.cos(a1), c + R * Math.sin(a1)];
        const p2 = [c + R * Math.cos(a2), c + R * Math.sin(a2)];
        const groot = (a2 - a1) > Math.PI ? 1 : 0;
        const d = n === 1
          ? `M${c - R} ${c} A${R} ${R} 0 1 1 ${c + R} ${c} A${R} ${R} 0 1 1 ${c - R} ${c} Z`
          : `M${pt(c, c)} L${pt(p1[0], p1[1])} A${R} ${R} 0 ${groot} 1 ${pt(p2[0], p2[1])} Z`;
        stukken.push({ d, k: inSet(gk, i) ? k : null, stippel: inSet(st, i),
          cx: c + R * 0.6 * Math.cos(am), cy: c + R * 0.6 * Math.sin(am) });
      }
      return { w: 2 * c, h: 2 * c, stukken, lijnen: o.zonderLijnen ? [] : null, verborgenLijnen: !!o.verborgenLijnen };
    },

    /* Regelmatige veelhoek (vlakke bovenkant) in n stukken vanuit het midden. */
    veelhoek(n, o = {}) {
      const R = o.r || 82, pad = 4, c = R + pad;
      const gk = o.gk || [], k = o.k || 'roze';
      const off = -90 - 180 / n;
      const hoek = [];
      for (let i = 0; i < n; i++) {
        const a = (off + i * 360 / n) * Math.PI / 180;
        hoek.push([c + R * Math.cos(a), c + R * Math.sin(a)]);
      }
      const stukken = [];
      for (let i = 0; i < n; i++) {
        const p = [[c, c], hoek[i], hoek[(i + 1) % n]];
        const m = midden(p);
        stukken.push({ d: polyPad(p), k: inSet(gk, i) ? k : null, cx: m[0], cy: m[1] });
      }
      return { w: 2 * c, h: 2 * c, stukken };
    },

    /* Rooster van kol x rij hokjes. gk = lijst van indexen (rij * kol + kolom). */
    rooster(kol, rij, o = {}) {
      const s = o.s || 30, pad = 3, gk = o.gk || [], k = o.k || 'geel';
      const weg = o.weg || [];
      const stukken = [];
      for (let y = 0; y < rij; y++) for (let x = 0; x < kol; x++) {
        const i = y * kol + x;
        if (inSet(weg, i)) continue;
        const p = [[pad + x * s, pad + y * s], [pad + (x + 1) * s, pad + y * s], [pad + (x + 1) * s, pad + (y + 1) * s], [pad + x * s, pad + (y + 1) * s]];
        stukken.push({ d: polyPad(p), k: inSet(gk, i) ? k : null, cx: pad + (x + .5) * s, cy: pad + (y + .5) * s });
      }
      return { w: kol * s + 2 * pad, h: rij * s + 2 * pad, stukken };
    },

    /* Losse veelhoeken (punten in eenheden), geschaald met s. */
    vormen(polys, o = {}) {
      const s = o.s || 60, pad = 4, gk = o.gk || [], k = o.k || 'geel';
      let mx = 0, my = 0;
      polys.forEach(p => p.forEach(q => { mx = Math.max(mx, q[0]); my = Math.max(my, q[1]); }));
      const stukken = polys.map((p, i) => {
        const pp = p.map(q => [pad + q[0] * s, pad + q[1] * s]);
        const m = midden(pp);
        return { d: polyPad(pp), k: inSet(gk, i) ? k : null, cx: m[0], cy: m[1] };
      });
      return { w: mx * s + 2 * pad, h: my * s + 2 * pad, stukken };
    },

    /* Ovaal in 4 stukken (kwarten). Stuk 0 = rechtsboven, met de klok mee. */
    ovaal4(o = {}) {
      const rx = o.rx || 26, ry = o.ry || 64, pad = 4, cx = rx + pad, cy = ry + pad;
      const gk = o.gk || [], k = o.k || 'blauw';
      const P = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
      const stukken = [];
      for (let i = 0; i < 4; i++) {
        const a = P[i], b = P[(i + 1) % 4];
        stukken.push({ d: `M${pt(cx, cy)} L${pt(a[0], a[1])} A${rx} ${ry} 0 0 1 ${pt(b[0], b[1])} Z`,
          k: inSet(gk, i) ? k : null,
          cx: cx + (i === 0 || i === 1 ? 1 : -1) * rx * .45, cy: cy + (i < 1 || i > 2 ? -1 : 1) * ry * .45 });
      }
      return { w: 2 * cx, h: 2 * cy, stukken };
    },

    /* Teken een figuur als SVG-tekst. */
    svg(f, o = {}) {
      const sch = o.schaal || 1;
      const W = f.w * sch, H = f.h * sch;
      const sw = o.dikte || 2;
      let s = `<svg viewBox="0 0 ${r2(f.w)} ${r2(f.h)}" width="${r2(W)}" height="${r2(H)}" xmlns="http://www.w3.org/2000/svg"${o.id ? ` id="${o.id}"` : ''} class="${o.klik ? 'klikbaar' : ''}">`;
      f.stukken.forEach((p, i) => {
        const kleur = o.kleurSet ? (o.kleurSet.indexOf(i) >= 0 ? KLEUR[o.kleur || 'geel'] : '#fff') : (p.k ? KLEUR[p.k] : (p.stippel ? 'none' : '#fff'));
        const lijnKleur = f.verborgenLijnen ? 'none' : LIJN;
        s += `<path class="stuk" data-i="${i}" d="${p.d}" fill="${kleur}" stroke="${p.stippel ? LIJN : lijnKleur}" stroke-width="${sw}" stroke-linejoin="round"${p.stippel ? ' stroke-dasharray="7 6"' : ''}/>`;
      });
      if (f.verborgenLijnen) {
        // alleen de omtrek tonen; hulplijnen heel licht gestippeld
        f.stukken.forEach(p => { s += `<path d="${p.d}" fill="none" stroke="#9fc0de" stroke-width="1" stroke-dasharray="3 4" pointer-events="none"/>`; });
        s += `<circle cx="${f.w / 2}" cy="${f.h / 2}" r="${f.w / 2 - 4}" fill="none" stroke="${LIJN}" stroke-width="${sw}" pointer-events="none"/>`;
      }
      if (o.nummers) {
        const set = o.nummers === 'gk' ? f.stukken.map((p, i) => (o.kleurSet ? o.kleurSet.indexOf(i) >= 0 : !!p.k) ? i : -1).filter(i => i >= 0)
          : f.stukken.map((p, i) => i);
        set.forEach((i, n) => {
          const p = f.stukken[i];
          s += `<text class="stuknr${o.nummers === 'gk' ? ' gk' : ''}" x="${r2(p.cx)}" y="${r2(p.cy)}" text-anchor="middle" dominant-baseline="central">${n + 1}</text>`;
        });
      }
      return s + '</svg>';
    }
  };

  window.F = F;
})();
