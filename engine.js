/* =====================================================================
   Oefen-engine voor de wiskunde-apps (VMBO Basis)
   - geanimeerde uitleg met voorleesstem (moet bekeken zijn)
   - opdrachten met hints, 4-fouten-hulp, punten
   - rekenmachine, voorlezen, opslaan in Supabase
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const wacht = ms => new Promise(r => setTimeout(r, ms));
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- Breuken uitspreken ---------------- */
  const GETAL = ['nul', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien', 'twintig'];
  const DEEL = { 2: 'half', 3: 'derde', 4: 'vierde', 5: 'vijfde', 6: 'zesde', 7: 'zevende', 8: 'achtste', 9: 'negende', 10: 'tiende', 11: 'elfde', 12: 'twaalfde', 13: 'dertiende', 14: 'veertiende', 15: 'vijftiende', 16: 'zestiende', 17: 'zeventiende', 18: 'achttiende', 19: 'negentiende', 20: 'twintigste' };
  function breukWoord(t, n) {
    t = +t; n = +n;
    const tw = t <= 20 ? (t === 1 ? 'één' : GETAL[t]) : String(t);
    const nw = DEEL[n] || (n + 'ste');
    if (n === 2) return t === 1 ? 'een half' : tw + ' halve';
    return tw + ' ' + nw;
  }
  function spreekTekst(t) {
    return String(t)
      .replace(/\[(\d+)\/(\d+)\]/g, (m, a, b) => breukWoord(a, b))
      .replace(/\{f:(\d*)\/(\d*)\}/g, ' hokje ')
      .replace(/\{[nf]\}/g, ' hokje ')
      .replace(/\*\*/g, '')
      .replace(/×/g, ' keer ').replace(/:/g, ' gedeeld door ')
      .replace(/€/g, ' euro ');
  }
  /* Tekst met [a/b] en **vet** naar HTML */
  function opmaak(t) {
    return esc(t)
      .replace(/\[(\d+)\/(\d+)\]/g, '<span class="breuk"><span class="t">$1</span><span class="n">$2</span></span>')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  }

  /* ---------------- Voorlezen ---------------- */
  const Stem = {
    tempo: 0.9, aan: true, stem: null,
    kies() {
      if (!('speechSynthesis' in window)) return;
      const v = speechSynthesis.getVoices();
      this.stem = v.find(x => /nl[-_]NL/i.test(x.lang) && /google/i.test(x.name)) || v.find(x => /nl[-_]NL/i.test(x.lang)) || v.find(x => /^nl/i.test(x.lang)) || null;
    },
    stop() { if ('speechSynthesis' in window) speechSynthesis.cancel(); },
    /* Geeft een Promise die klaar is als de zin is uitgesproken. */
    zeg(tekst, forceer) {
      const schoon = spreekTekst(tekst);
      const duur = Math.max(1200, schoon.length * 62 / this.tempo);
      if ((!this.aan && !forceer) || !('speechSynthesis' in window)) return wacht(duur);
      return new Promise(res => {
        let klaar = false; const t0 = Date.now();
        const einde = () => { if (klaar) return; klaar = true; const rest = duur * 0.75 - (Date.now() - t0); rest > 0 ? setTimeout(res, rest) : res(); };
        try {
          const u = new SpeechSynthesisUtterance(schoon);
          u.lang = 'nl-NL'; if (this.stem) u.voice = this.stem;
          u.rate = this.tempo;
          u.onend = einde; u.onerror = einde;
          speechSynthesis.speak(u);
          setTimeout(einde, duur * 2.2 + 2500);
        } catch (e) { setTimeout(einde, duur); }
      });
    },
    async leesLijst(regels) {
      this.stop();
      for (const r of regels) { await this.zeg(r, true); }
    }
  };
  if ('speechSynthesis' in window) { Stem.kies(); speechSynthesis.onvoiceschanged = () => Stem.kies(); }

  /* ---------------- Opslag ---------------- */
  const CFG = window.APP_CONFIG || {};
  const opslag = {
    sleutel() { return 'wiskunde_' + P.id + '_' + (Leerling.naam || 'gast').toLowerCase(); },
    lokaal() { try { localStorage.setItem(this.sleutel(), JSON.stringify(S)); } catch (e) { } },
    laadLokaal() { try { return JSON.parse(localStorage.getItem(this.sleutel()) || 'null'); } catch (e) { return null; } },
    online() { return !!(CFG.SUPABASE_URL && CFG.SUPABASE_KEY && !/JOUW/.test(CFG.SUPABASE_URL)); },
    async rpc(fn, args) {
      const h = { 'Content-Type': 'application/json', apikey: CFG.SUPABASE_KEY };
      if (/^eyJ/.test(CFG.SUPABASE_KEY)) h.Authorization = 'Bearer ' + CFG.SUPABASE_KEY;
      const r = await fetch(CFG.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/rpc/' + fn, { method: 'POST', headers: h, body: JSON.stringify(args) });
      if (!r.ok) throw new Error('Server ' + r.status);
      return r.json();
    },
    timer: null,
    bewaar() {
      this.lokaal();
      if (!this.online() || !Leerling.pin) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.stuur(), 1200);
    },
    async stuur() {
      const t = totaal();
      try {
        const r = await this.rpc('leerling_opslaan', {
          p_app: P.id, p_klascode: Leerling.klascode, p_naam: Leerling.naam, p_pin: Leerling.pin,
          p_staat: S, p_samenvatting: samenvatting(), p_punten: t.punten, p_max: t.max
        });
        zetOpslagStatus(r && r.ok ? 'ok' : 'fout');
      } catch (e) { zetOpslagStatus('fout'); }
    }
  };
  function zetOpslagStatus(s) {
    const el = $('#opslagstatus'); if (!el) return;
    el.textContent = s === 'ok' ? '☁️ opgeslagen' : s === 'fout' ? '⚠️ niet opgeslagen' : '';
    el.title = s === 'fout' ? 'Er is geen verbinding. Je werk staat wel op deze computer.' : '';
  }

  /* ---------------- Staat ---------------- */
  let P = null;                 // de paragraaf
  let S = { uitleg: {}, d: {}, inv: {} };   // staat van de leerling
  const Leerling = { naam: '', klascode: '', pin: '', klas: '' };
  let huidig = 0;               // index in P.onderdelen

  function deelKey(o, d) { return o.id + d.id; }
  function ds(k) { return S.d[k] || (S.d[k] = { s: 'open', f: 0, h: 0, p: 0, fa: [] }); }
  function alleDelen() {
    const lijst = [];
    P.onderdelen.forEach(o => { if (o.delen) o.delen.forEach(d => lijst.push({ o, d, k: deelKey(o, d) })); });
    return lijst;
  }
  function totaal() {
    let punten = 0, max = 0, goed = 0, fout = 0;
    alleDelen().forEach(x => { const st = S.d[x.k]; max += 2; if (st) { punten += st.p; if (st.s === 'goed') goed++; fout += st.f; } });
    return { punten, max, goed, fout };
  }
  function onderdeelKlaar(o) {
    if (o.type === 'uitleg') return !!S.uitleg[o.id];
    return o.delen.every(d => { const st = S.d[deelKey(o, d)]; return st && (st.s === 'goed' || st.s === 'fout4'); });
  }
  function opSlot(i) {
    for (let j = 0; j < i; j++) { const o = P.onderdelen[j]; if (o.type === 'uitleg' && !S.uitleg[o.id]) return o; }
    return null;
  }
  function samenvatting() {
    const opdr = {}, delen = {};
    P.onderdelen.forEach(o => {
      if (o.type === 'uitleg') return;
      let p = 0, max = 0, begonnen = false;
      o.delen.forEach(d => {
        const k = deelKey(o, d), st = S.d[k]; max += 2;
        if (st) { p += st.p; if (st.s !== 'open' || st.f > 0) begonnen = true; delen[k] = { p: st.p, f: st.f, s: st.s, h: st.h, fa: st.fa.slice(-5) }; }
      });
      opdr[o.id] = { p, max, klaar: onderdeelKlaar(o), begonnen };
    });
    const t = totaal();
    return { opdr, delen, uitleg: S.uitleg, punten: t.punten, max: t.max, cijfer: cijfer(t.punten, t.max) };
  }
  function cijfer(p, m) { return m ? Math.round((p / m * 9 + 1) * 10) / 10 : 1; }

  /* ---------------- Kop en navigatie ---------------- */
  function tekenKop() {
    const t = totaal();
    $('#scoregoed').textContent = '✓ ' + t.goed;
    $('#scorefout').textContent = '✗ ' + t.fout;
    $('#scorepunt').textContent = t.punten + ' / ' + t.max + ' punten';
  }
  function tekenNav() {
    const nav = $('#nav'); nav.innerHTML = '';
    P.onderdelen.forEach((o, i) => {
      const b = document.createElement('button');
      b.className = 'navknop' + (o.type === 'uitleg' ? ' uitleg' : '') + (o.type === 'toets' ? ' toets' : '') + (i === huidig ? ' actief' : '') + (onderdeelKlaar(o) ? ' klaar' : '') + (opSlot(i) ? ' slot' : '');
      b.textContent = o.kort || o.id;
      b.title = o.titel || '';
      b.onclick = () => ga(i);
      nav.appendChild(b);
    });
    const a = nav.children[huidig]; if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function ga(i) {
    Stem.stop(); Speler.stop();
    huidig = Math.max(0, Math.min(P.onderdelen.length - 1, i));
    S.huidig = huidig; opslag.lokaal();
    tekenNav(); tekenPagina(); window.scrollTo(0, 0);
  }

  /* ---------------- Pagina ---------------- */
  function tekenPagina() {
    const main = $('#pagina');
    const o = P.onderdelen[huidig];
    const slot = opSlot(huidig);
    if (slot) {
      const si = P.onderdelen.indexOf(slot);
      main.innerHTML = `<div class="slotmelding"><h2>🔒 Eerst de uitleg bekijken</h2>
        <p class="regel" style="text-align:center">Bekijk eerst de uitleg "${esc(slot.titel)}".</p>
        <p class="regel" style="text-align:center">Daarna kun je verder met deze opdracht.</p>
        <button class="knop hoofd" id="naaruitleg">Naar de uitleg</button></div>`;
      $('#naaruitleg').onclick = () => ga(si);
      return;
    }
    if (o.type === 'uitleg') return Speler.toon(o, main);
    tekenOpdracht(o, main);
  }

  function regelsHTML(regels, deelk) {
    let vi = 0;
    return regels.map(r => {
      let h = opmaak(r);
      h = h.replace(/\{n\}/g, () => `<input class="vak" inputmode="decimal" autocomplete="off" data-vi="${vi++}" aria-label="antwoord">`);
      h = h.replace(/\{f(?::(\d*)\/(\d*))?\}/g, (m, t, n) => {
        const i = vi++;
        const tv = t ? `<input class="vak vast" value="${t}" readonly tabindex="-1">` : `<input class="vak" inputmode="numeric" autocomplete="off" data-vi="${i}" data-dl="t" aria-label="teller">`;
        const nv = n ? `<input class="vak vast" value="${n}" readonly tabindex="-1">` : `<input class="vak" inputmode="numeric" autocomplete="off" data-vi="${i}" data-dl="n" aria-label="noemer">`;
        return `<span class="breukvak" data-vi="${i}" data-vt="${t || ''}" data-vn="${n || ''}">${tv}<span class="streep"></span>${nv}</span>`;
      });
      return `<p class="regel">${h}</p>`;
    }).join('');
  }

  function figHTML(naam, o = {}) {
    const f = P.figuren[naam];
    if (!f) return `<em>figuur ${esc(naam)} ontbreekt</em>`;
    return F.svg(typeof f === 'function' ? f() : f, o);
  }

  function bronHTML(o) {
    if (!o.bron) return '';
    if (typeof o.bron === 'function') return o.bron();
    return o.bron;
  }

  function tekenOpdracht(o, main) {
    const heeftBron = !!o.bron;
    let h = `<div class="opdrkop"><h2>${esc(o.titel)}</h2></div>`;
    if (o.waarom) h += `<p class="waarom">💡 ${esc(o.waarom)}</p>`;
    h += `<div class="${heeftBron ? 'kolommen' : ''}">`;
    if (heeftBron) h += `<div class="bron"><div class="bronkop">Bij deze opdracht</div>${bronHTML(o)}</div>`;
    h += `<div class="vragen">`;
    if (o.intro) h += `<div class="kaart"><div class="kaartkop"><span class="ruimte"></span><button class="leesknop" data-lees="intro" title="Lees voor">🔊</button></div><div class="lijf"><div class="intro">${(o.introFig ? `<div class="figrij" style="margin-bottom:6px">${o.introFig()}</div>` : '') + regelsHTML(o.intro)}</div></div></div>`;
    o.delen.forEach((d, i) => { h += `<div class="kaart" id="kaart-${d.id}" data-di="${i}"></div>`; });
    h += `</div></div>`;
    h += `<div style="display:flex;justify-content:space-between;margin:18px 0 40px;gap:10px">
      <button class="knop licht" id="vorige">← Vorige</button>
      <button class="knop hoofd" id="volgende">Volgende →</button></div>`;
    main.innerHTML = h;
    $('#vorige').onclick = () => ga(huidig - 1);
    $('#volgende').onclick = () => ga(huidig + 1);
    $('#vorige').disabled = huidig === 0;
    if (huidig === P.onderdelen.length - 1) { $('#volgende').textContent = 'Klaar ✓'; $('#volgende').onclick = toonEinde; }
    const li = $('[data-lees="intro"]', main); if (li) li.onclick = () => Stem.leesLijst(o.intro);
    o.delen.forEach(d => tekenDeel(o, d));
  }

  /* ---------------- Een deelvraag ---------------- */
  function tekenDeel(o, d) {
    const k = deelKey(o, d), st = ds(k);
    const kaart = $('#kaart-' + d.id);
    kaart.className = 'kaart' + (st.s === 'goed' ? ' goed' : st.s === 'fout4' ? ' fout4' : '');
    const dicht = st.s === 'goed' || st.s === 'fout4';
    let lijf = '';
    if (d.regels) lijf += regelsHTML(d.regels);
    if (d.type === 'invul' && d.rij) lijf += rijHTML(d);
    if (d.type === 'mk') lijf += mkHTML(d, k);
    if (d.type === 'omcirkel') lijf += omcirkelHTML(d, k);
    if (d.type === 'kleur') lijf += kleurHTML(d, k);
    if (d.onder) lijf += regelsHTML(d.onder);
    kaart.innerHTML = `
      <div class="kaartkop"><span class="letter">${esc(d.id.toUpperCase())}</span>
        <span class="eindterm" title="Eindterm examen VMBO Basis">${esc(d.eindterm || o.eindterm || '')}</span>
        <span class="ruimte"></span>${st.s === 'goed' ? `<span style="color:var(--goed)">+${st.p} ${st.p === 1 ? 'punt' : 'punten'}</span>` : ''}
        <button class="leesknop" title="Lees voor">🔊</button></div>
      <div class="lijf">${lijf}<div class="hintvak"></div><div class="terugvak"></div></div>
      <div class="voet">
        <button class="knop hint">💡 Hint${d.hint ? ` (${Math.min(st.h, d.hint.length)}/${d.hint.length})` : ''}</button>
        <button class="knop hoofd controle">Controleer</button>
        <button class="knop licht overslaan">Sla over</button>
      </div>`;
    // bewaarde invoer terugzetten
    herstelInvoer(kaart, d, k);
    // events
    $('.leesknop', kaart).onclick = () => Stem.leesLijst((d.regels || []).concat(d.leesExtra || []).concat(d.onder || []).concat(d.type === 'mk' ? d.opties.map((x, i) => 'Keuze ' + (i + 1) + ': ' + x) : []));
    $('.hint', kaart).onclick = () => geefHint(o, d);
    $('.controle', kaart).onclick = () => controleer(o, d);
    $('.overslaan', kaart).onclick = () => slaOver(o, d);
    $$('input.vak:not(.vast)', kaart).forEach(inp => {
      inp.addEventListener('input', () => { inp.classList.remove('fout', 'goed'); bewaarInvoer(kaart, d, k); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') controleer(o, d); });
    });
    // hints die al gegeven zijn
    toonHints(kaart, d, st);
    if (dicht) {
      $$('input.vak', kaart).forEach(i => i.readOnly = true);
      $('.controle', kaart).disabled = true; $('.hint', kaart).disabled = true; $('.overslaan', kaart).disabled = true;
      if (st.s === 'goed') terug(kaart, 'goed', [goedTekst(st.p)].concat(d.goedUitleg || []));
      else toonHulp(o, d, kaart);
    }
  }

  function rijHTML(d) {
    // figuren naast elkaar, met onder elke figuur een label en invulvak
    let vi = 0;
    const cel = d.rij.map(c => {
      let invul = c.invul ? opmaak(c.invul) : '';
      invul = invul.replace(/\{n\}/g, () => `<input class="vak" inputmode="decimal" autocomplete="off" data-vi="${vi++}">`)
        .replace(/\{f(?::(\d*)\/(\d*))?\}/g, (m, t, n) => {
          const i = vi++;
          const tv = t ? `<input class="vak vast" value="${t}" readonly tabindex="-1">` : `<input class="vak" inputmode="numeric" autocomplete="off" data-vi="${i}" data-dl="t" aria-label="teller">`;
          const nv = n ? `<input class="vak vast" value="${n}" readonly tabindex="-1">` : `<input class="vak" inputmode="numeric" autocomplete="off" data-vi="${i}" data-dl="n" aria-label="noemer">`;
          return `<span class="breukvak" data-vi="${i}" data-vt="${t || ''}" data-vn="${n || ''}">${tv}<span class="streep"></span>${nv}</span>`;
        });
      return `<div class="kleurfig"><div class="fig">${figHTML(c.fig, { schaal: c.schaal || 1 })}</div>${c.label ? `<span class="figlabel">${esc(c.label)}</span>` : ''}<div class="regel" style="text-align:center">${invul}</div></div>`;
    }).join('');
    return `<div class="figrij" style="margin-top:6px">${cel}</div>`;
  }
  // Belangrijk: regelsHTML en rijHTML nummeren de vakken los van elkaar.
  // Daarom krijgen vakken in de rij een vervolgnummer na de regels.
  function vakken(kaart) {
    // alle invulplekken in volgorde: getalvak of breukvak
    const lijst = [];
    $$('.lijf input.vak:not(.vast), .lijf .breukvak', kaart).forEach(el => {
      if (el.classList.contains('breukvak')) lijst.push({ type: 'f', el });
      else if (!el.closest('.breukvak')) lijst.push({ type: 'n', el });
    });
    return lijst;
  }
  function leesVak(v) {
    if (v.type === 'n') return v.el.value;
    const t = v.el.dataset.vt || $('[data-dl="t"]', v.el).value;
    const n = v.el.dataset.vn || $('[data-dl="n"]', v.el).value;
    return [t, n];
  }
  function bewaarInvoer(kaart, d, k) {
    if (d.type === 'invul') S.inv[k] = vakken(kaart).map(leesVak);
    opslag.lokaal();
  }
  function herstelInvoer(kaart, d, k) {
    const w = S.inv[k];
    if (d.type === 'invul' && Array.isArray(w)) {
      vakken(kaart).forEach((v, i) => {
        if (w[i] == null) return;
        if (v.type === 'n') v.el.value = w[i];
        else { const t = $('[data-dl="t"]', v.el), n = $('[data-dl="n"]', v.el); if (t) t.value = w[i][0] || ''; if (n) n.value = w[i][1] || ''; }
      });
    }
  }

  /* Meerkeuze */
  function mkHTML(d, k) {
    const gek = S.inv[k] || [];
    const multi = Array.isArray(d.ans);
    return `<div class="mk">${d.opties.map((x, i) => `<button class="mkoptie${multi ? '' : ' rond'}${gek.indexOf(i) >= 0 ? ' gekozen' : ''}" data-i="${i}"><span class="bol"></span><span>${opmaak(x)}</span></button>`).join('')}</div>`;
  }
  /* Omcirkelen met kleuren */
  const OMKLEUR = ['#E924D5', '#1f6fae', '#18a25a'];
  function omcirkelHTML(d, k) {
    const w = S.inv[k] || {};
    const pen = (S.inv[k + '_pen'] ?? 0);
    return `<div class="kleurkeuze">Kies een kleur:${OMKLEUR.map((c, i) => `<button class="kleurbol${i === pen ? ' aan' : ''}" data-pen="${i}" style="background:${c}" aria-label="kleur ${i + 1}"></button>`).join('')}<button class="knop licht" data-pen="-1" style="padding:4px 10px">Gum</button></div>
      <div class="omcirkel">${d.items.map((b, i) => `<button class="ombreuk" data-i="${i}" style="border-color:${w[i] != null ? OMKLEUR[w[i]] : 'transparent'}"><span class="breuk"><span class="t">${b[0]}</span><span class="n">${b[1]}</span></span></button>`).join('')}</div>`;
  }
  /* Kleuren in figuren */
  function kleurHTML(d, k) {
    const w = S.inv[k] || d.figs.map(() => []);
    return `<div class="figrij">${d.figs.map((f, fi) => `
      <div class="kleurfig" data-fi="${fi}">
        <div class="fig${f.ruitjes ? ' ruitjes' : ''}">${figHTML(f.fig, { klik: true, kleurSet: w[fi] || [], kleur: f.kleur || d.kleur || 'geel', schaal: f.schaal || 1 })}</div>
        ${f.label ? `<span class="figlabel">${esc(f.label)}</span>` : ''}
        ${f.onder ? `<div class="regel" style="text-align:center">${opmaak(f.onder)}</div>` : ''}
      </div>`).join('')}</div>`;
  }

  // klik-events voor mk, omcirkel en kleur (gedelegeerd)
  document.addEventListener('click', e => {
    const kaart = e.target.closest('.kaart[data-di]'); if (!kaart) return;
    const o = P.onderdelen[huidig]; const d = o.delen[+kaart.dataset.di]; if (!d) return;
    const k = deelKey(o, d), st = ds(k);
    if (st.s === 'goed' || st.s === 'fout4') return;
    const opt = e.target.closest('.mkoptie');
    if (opt && d.type === 'mk') {
      const i = +opt.dataset.i; let g = S.inv[k] || [];
      if (Array.isArray(d.ans)) g = g.indexOf(i) >= 0 ? g.filter(x => x !== i) : g.concat(i); else g = [i];
      S.inv[k] = g; $$('.mkoptie', kaart).forEach(b => { b.classList.toggle('gekozen', g.indexOf(+b.dataset.i) >= 0); b.classList.remove('goed', 'fout'); });
      opslag.lokaal(); return;
    }
    const pen = e.target.closest('[data-pen]');
    if (pen && d.type === 'omcirkel') {
      S.inv[k + '_pen'] = +pen.dataset.pen;
      $$('.kleurbol', kaart).forEach(b => b.classList.toggle('aan', +b.dataset.pen === +pen.dataset.pen));
      return;
    }
    const ob = e.target.closest('.ombreuk');
    if (ob && d.type === 'omcirkel') {
      const w = S.inv[k] || (S.inv[k] = {}); const i = +ob.dataset.i; const p = S.inv[k + '_pen'] ?? 0;
      if (p < 0 || w[i] === p) delete w[i]; else w[i] = p;
      ob.style.borderColor = w[i] != null ? OMKLEUR[w[i]] : 'transparent';
      opslag.lokaal(); return;
    }
    const stuk = e.target.closest('.stuk');
    if (stuk && d.type === 'kleur') {
      const fi = +stuk.closest('.kleurfig').dataset.fi; const i = +stuk.dataset.i;
      const w = S.inv[k] || (S.inv[k] = d.figs.map(() => []));
      w[fi] = w[fi].indexOf(i) >= 0 ? w[fi].filter(x => x !== i) : w[fi].concat(i);
      const kl = d.figs[fi].kleur || d.kleur || 'geel';
      stuk.setAttribute('fill', w[fi].indexOf(i) >= 0 ? F.KLEUR[kl] : '#fff');
      stuk.closest('.kleurfig').classList.remove('goed', 'fout');
      opslag.lokaal();
    }
  });

  /* ---------------- Hints ---------------- */
  function geefHint(o, d) {
    const k = deelKey(o, d), st = ds(k), kaart = $('#kaart-' + d.id);
    if (!d.hint || !d.hint.length) return;
    if (st.h < d.hint.length) st.h++;
    toonHints(kaart, d, st);
    $('.hint', kaart).textContent = `💡 Hint (${st.h}/${d.hint.length})`;
    Stem.zeg(d.hint[st.h - 1]);
    opslag.bewaar();
  }
  function toonHints(kaart, d, st) {
    const v = $('.hintvak', kaart);
    if (!st.h || !d.hint) { v.innerHTML = ''; return; }
    v.innerHTML = `<div class="terug hint"><b>Hint</b>${d.hint.slice(0, st.h).map((h, i) => `<p class="regel">${i + 1}. ${opmaak(h)}</p>`).join('')}</div>`;
  }
  function terug(kaart, soort, regels) {
    $('.terugvak', kaart).innerHTML = `<div class="terug ${soort}">${regels.map(r => `<p class="regel">${opmaak(r)}</p>`).join('')}</div>`;
  }
  function goedTekst(p) { return p === 2 ? '🎉 **Goed zo! In één keer goed.**' : '👍 **Goed zo!**'; }

  /* ---------------- Nakijken ---------------- */
  function getal(s) {
    s = String(s || '').trim().toLowerCase().replace(/€|euro|stukken|stuks|deel/g, '').replace(/\s/g, '').replace(',', '.');
    if (s === '') return { leeg: true };
    if (!/^-?\d+(\.\d+)?$/.test(s)) return { onzin: true };
    return { w: parseFloat(s) };
  }
  function breukGoed(t, n, a, gelijk) {
    if (t === a[0] && n === a[1]) return true;
    return gelijk !== false && n !== 0 && t * a[1] === a[0] * n;
  }

  function beoordeel(d, kaart, k) {
    // geeft {leeg|onzin} of {goed, deelGoed[], tekst}
    if (d.type === 'invul') {
      const vs = vakken(kaart); const perVak = []; const tekst = [];
      for (let i = 0; i < vs.length; i++) {
        const v = vs[i], a = d.ans[i], w = leesVak(v);
        if (v.type === 'n') {
          const g = getal(w); if (g.leeg) return { leeg: true }; if (g.onzin) return { onzin: true };
          const ok = Array.isArray(a) ? a.indexOf(g.w) >= 0 : Math.abs(g.w - a) < 1e-9;
          perVak.push(ok); tekst.push(String(w).trim());
        } else {
          const t = getal(w[0]), n = getal(w[1]);
          if (t.leeg || n.leeg) return { leeg: true }; if (t.onzin || n.onzin) return { onzin: true };
          perVak.push(breukGoed(t.w, n.w, a, d.gelijkwaardig)); tekst.push(t.w + '/' + n.w);
        }
      }
      return { goed: perVak.every(Boolean), perVak, tekst: tekst.join(' ; ') };
    }
    if (d.type === 'mk') {
      const g = S.inv[k] || []; if (!g.length) return { leeg: true };
      const ans = Array.isArray(d.ans) ? d.ans : [d.ans];
      const goed = g.length === ans.length && ans.every(a => g.indexOf(a) >= 0);
      return { goed, tekst: g.map(i => d.opties[i].replace(/\[(\d+)\/(\d+)\]/g, '$1/$2')).join(' + ') };
    }
    if (d.type === 'omcirkel') {
      const w = S.inv[k] || {}; if (!Object.keys(w).length) return { leeg: true };
      // groepen met dezelfde noemer
      const groep = {}; d.items.forEach((b, i) => { (groep[b[1]] = groep[b[1]] || []).push(i); });
      const echt = Object.values(groep).filter(g => g.length > 1);
      const perItem = d.items.map(() => true);
      const gebruikt = {};
      echt.forEach(g => {
        const kl = w[g[0]];
        g.forEach(i => { if (w[i] == null || w[i] !== kl) perItem[i] = false; });
        if (kl != null) { if (gebruikt[kl]) g.forEach(i => perItem[i] = false); gebruikt[kl] = true; }
      });
      Object.values(groep).filter(g => g.length === 1).forEach(g => { if (w[g[0]] != null) perItem[g[0]] = false; });
      const tekst = Object.keys(w).map(i => d.items[i].join('/') + '→kleur' + (w[i] + 1)).join(', ');
      return { goed: perItem.every(Boolean), perItem, tekst };
    }
    if (d.type === 'kleur') {
      const w = S.inv[k] || d.figs.map(() => []);
      if (w.every(x => !x || !x.length)) return { leeg: true };
      const perFig = d.figs.map((f, i) => (w[i] || []).length === f.nodig);
      return { goed: perFig.every(Boolean), perFig, tekst: d.figs.map((f, i) => (w[i] || []).length + ' gekleurd').join(' ; ') };
    }
    return { leeg: true };
  }

  function controleer(o, d) {
    const k = deelKey(o, d), st = ds(k), kaart = $('#kaart-' + d.id);
    if (st.s === 'goed' || st.s === 'fout4') return;
    const r = beoordeel(d, kaart, k);
    if (r.leeg) { terug(kaart, 'hint', ['Vul eerst alles in.', 'Daarna klik je op Controleer.']); return; }
    if (r.onzin) { terug(kaart, 'hint', ['Typ alleen een getal in het hokje.', 'Dit telt niet als fout.']); return; }
    // vakjes kleuren: precies aanwijzen wat fout is
    if (d.type === 'invul') {
      vakken(kaart).forEach((v, i) => {
        const els = v.type === 'n' ? [v.el] : $$('input:not(.vast)', v.el);
        els.forEach(x => { x.classList.remove('goed', 'fout'); x.classList.add(r.perVak[i] ? 'goed' : 'fout'); });
      });
    }
    if (d.type === 'mk') {
      const ans = Array.isArray(d.ans) ? d.ans : [d.ans];
      $$('.mkoptie.gekozen', kaart).forEach(b => b.classList.add(ans.indexOf(+b.dataset.i) >= 0 ? 'goed' : 'fout'));
    }
    if (d.type === 'kleur') $$('.kleurfig', kaart).forEach((el, i) => { el.classList.remove('goed', 'fout'); el.classList.add(r.perFig[i] ? 'goed' : 'fout'); });
    if (d.type === 'omcirkel') $$('.ombreuk', kaart).forEach((el, i) => { el.style.background = r.perItem[i] ? '' : '#fde3e6'; });

    if (r.goed) {
      st.s = 'goed';
      st.p = (st.f === 0 && st.h === 0) ? 2 : 1;
      Stem.zeg(st.p === 2 ? 'Goed zo! In één keer goed.' : 'Goed zo!');
      opslag.bewaar(); tekenKop(); tekenNav(); tekenDeel(o, d);
      return;
    }
    st.f++;
    st.fa.push(r.tekst); if (st.fa.length > 8) st.fa.shift();
    if (st.f >= 4) {
      st.s = 'fout4'; st.p = 0;
      opslag.bewaar(); tekenKop(); tekenNav(); tekenDeel(o, d);
      return;
    }
    const nog = 4 - st.f;
    const msg = ['Nog niet goed.', foutWijzer(d, r), `Probeer het nog eens. (nog ${nog} ${nog === 1 ? 'kans' : 'kansen'})`];
    if (!st.h && d.hint) msg.push('Tip: klik op 💡 Hint.');
    terug(kaart, 'fout', msg);
    opslag.bewaar(); tekenKop();
  }

  function foutWijzer(d, r) {
    if (d.type === 'invul') {
      const n = r.perVak.filter(x => !x).length;
      return r.perVak.length > 1 ? `Er ${n === 1 ? 'is 1 hokje' : 'zijn ' + n + ' hokjes'} fout. Kijk naar de rode hokjes.` : 'Het rode hokje is fout.';
    }
    if (d.type === 'kleur') {
      const k = deelKey(P.onderdelen[huidig], d); const w = S.inv[k] || [];
      return d.figs.map((f, i) => r.perFig[i] ? null : `${f.label ? 'Figuur ' + f.label + ': j' : 'J'}e kleurde ${(w[i] || []).length} ${((w[i] || []).length === 1 ? 'stuk' : 'stukken')}. Tel nog eens.`).filter(Boolean).join(' ');
    }
    if (d.type === 'omcirkel') return 'De breuken met een rode achtergrond kloppen nog niet.';
    if (d.type === 'mk') return 'Een rode keuze is fout.';
    return '';
  }

  /* Hulp na 4 fouten: laat zien hoe het antwoord is opgebouwd */
  function toonHulp(o, d, kaart) {
    const k = deelKey(o, d);
    let h = `<p class="regel"><b>🤝 Zo werkt het:</b></p>`;
    if (d.hulpFig) {
      h += `<div class="hulpfig">${d.hulpFig.map(x => `<div class="fig">${figHTML(x.fig, { nummers: x.nummers || 'alle', schaal: x.schaal || 1 })}${x.tekst ? `<div style="font-size:13px;max-width:200px">${opmaak(x.tekst)}</div>` : ''}</div>`).join('')}</div>`;
    }
    if (d.type === 'kleur') {
      h += `<div class="hulpfig">${d.figs.map(f => {
        const fig = typeof P.figuren[f.fig] === 'function' ? P.figuren[f.fig]() : P.figuren[f.fig];
        const set = (f.voorbeeld || Array.from({ length: f.nodig }, (_, i) => i));
        return `<div class="fig">${F.svg(fig, { kleurSet: set, kleur: f.kleur || d.kleur || 'geel', nummers: 'gk', schaal: f.schaal || 1 })}<div style="font-size:13px">${f.label ? 'Figuur ' + esc(f.label) + ': ' : ''}${f.nodig} van de ${fig.stukken.length} stukken</div></div>`;
      }).join('')}</div>`;
    }
    if (d.type === 'omcirkel') {
      const groep = {}; d.items.forEach((b, i) => { (groep[b[1]] = groep[b[1]] || []).push(i); });
      let c = 0;
      h += `<div class="omcirkel">${d.items.map((b, i) => {
        const g = groep[b[1]]; let kl = 'transparent';
        if (g.length > 1) { const idx = Object.values(groep).filter(x => x.length > 1).indexOf(g); kl = OMKLEUR[idx % OMKLEUR.length]; }
        return `<span class="ombreuk" style="border-color:${kl}"><span class="breuk"><span class="t">${b[0]}</span><span class="n">${b[1]}</span></span></span>`;
      }).join('')}</div>`;
    }
    h += (d.uitleg || []).map(r => `<p class="regel">${opmaak(r)}</p>`).join('');
    // juiste antwoorden invullen
    if (d.type === 'invul') {
      vakken(kaart).forEach((v, i) => {
        const a = d.ans[i];
        if (v.type === 'n') { v.el.value = Array.isArray(a) ? a[0] : String(a).replace('.', ','); v.el.classList.remove('fout'); v.el.classList.add('goed'); }
        else { const t = $('[data-dl="t"]', v.el), n = $('[data-dl="n"]', v.el); if (t) { t.value = a[0]; t.className = 'vak goed'; } if (n) { n.value = a[1]; n.className = 'vak goed'; } }
      });
    }
    if (d.type === 'mk') {
      const ans = Array.isArray(d.ans) ? d.ans : [d.ans];
      $$('.mkoptie', kaart).forEach(b => { b.classList.remove('fout', 'gekozen'); if (ans.indexOf(+b.dataset.i) >= 0) b.classList.add('goed'); });
    }
    h += `<p class="regel" style="margin-top:6px">Je krijgt voor deze vraag geen punten.</p><p class="regel">Lees de uitleg goed en ga verder. Je kunt het! 💪</p>`;
    $('.terugvak', kaart).innerHTML = `<div class="terug hulp">${h}</div>`;
  }

  function slaOver(o, d) {
    const i = o.delen.indexOf(d);
    const vlg = o.delen.slice(i + 1).find(x => { const s = ds(deelKey(o, x)).s; return s === 'open'; });
    if (vlg) { const el = $('#kaart-' + vlg.id); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); const inp = $('input.vak:not(.vast)', el); if (inp) inp.focus({ preventScroll: true }); }
    else ga(huidig + 1);
  }

  /* ---------------- Eindscherm ---------------- */
  function toonEinde() {
    Stem.stop();
    const t = totaal();
    const toets = P.onderdelen.find(o => o.type === 'toets');
    let tp = 0, tm = 0;
    if (toets) toets.delen.forEach(d => { tm += 2; const st = S.d[deelKey(toets, d)]; if (st) tp += st.p; });
    const open = alleDelen().filter(x => !S.d[x.k] || S.d[x.k].s === 'open');
    $('#pagina').innerHTML = `<div class="eind"><h2>Goed gewerkt, ${esc(Leerling.naam || '')}! 🎉</h2>
      <p class="regel" style="text-align:center">Je hebt ${t.punten} van de ${t.max} punten.</p>
      ${toets ? `<p class="regel" style="text-align:center">Cijfer voor de mini-toets:</p><div class="cijfer">${cijfer(tp, tm).toFixed(1).replace('.', ',')}</div>` : ''}
      ${open.length ? `<p class="regel" style="text-align:center">Je hebt nog ${open.length} ${open.length === 1 ? 'vraag' : 'vragen'} open staan.</p><p class="regel" style="text-align:center">Klik bovenin op een nummer om ze te maken.</p>` : '<p class="regel" style="text-align:center">Je hebt alle vragen gemaakt. Top!</p>'}
      <p class="regel" style="text-align:center">Je werk is opgeslagen.</p></div>`;
    opslag.bewaar();
  }

  /* =====================================================================
     UITLEG-SPELER (animatie + stem)
     ===================================================================== */
  const Speler = {
    run: 0, pauze: false, o: null, bezig: false,
    stop() { this.run++; this.bezig = false; Stem.stop(); },
    toon(o, main) {
      this.o = o; this.stop();
      const gezien = !!S.uitleg[o.id];
      main.innerHTML = `
      <div class="uitlegkaart">
        <div class="uitlegkop"><h2>📺 ${esc(o.titel)}</h2></div>
        ${o.waarom ? `<p class="waarom" style="padding:10px 16px 0;margin:0">💡 ${esc(o.waarom)}</p>` : ''}
        <div class="podium"><div class="scene" id="scene"></div><div class="zinnen" id="zinnen"></div></div>
        <div class="speler">
          <button class="knop hoofd" id="spStart">▶ Start de uitleg</button>
          <button class="knop licht" id="spOpnieuw">↺ Opnieuw</button>
          <button class="knop licht" id="spGeluid">${Stem.aan ? '🔊 Geluid aan' : '🔇 Geluid uit'}</button>
          <div class="voortbalk"><div id="spBalk"></div></div>
        </div>
        <div id="naUitleg" class="${gezien ? '' : 'verborgen'}">
          ${o.onthoud ? `<div class="onthoud"><h3>⭐ Onthoud</h3>${o.onthoud.map(r => `<p class="regel">${opmaak(r)}</p>`).join('')}</div>` : ''}
          ${o.boek ? `<div class="boektheorie">${o.boek()}</div>` : ''}
        </div>
        <div class="speler" style="justify-content:flex-end">
          <span id="spMelding" style="font-size:13px;color:var(--grijs);flex:1">${gezien ? 'Je hebt deze uitleg al bekeken.' : 'Bekijk de hele uitleg. Daarna kun je verder.'}</span>
          <button class="knop hoofd" id="spKlaar" ${gezien ? '' : 'disabled'}>Ik heb het bekeken ✓</button>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;max-width:900px;margin:16px auto 40px">
        <button class="knop licht" id="vorige">← Vorige</button>
        <button class="knop hoofd" id="volgende" ${gezien ? '' : 'disabled'}>Volgende →</button></div>`;
      $('#vorige').onclick = () => ga(huidig - 1); $('#vorige').disabled = huidig === 0;
      $('#volgende').onclick = () => ga(huidig + 1);
      $('#spStart').onclick = () => this.startPauze();
      $('#spOpnieuw').onclick = () => { this.stop(); this.speel(0); };
      $('#spGeluid').onclick = () => { Stem.aan = !Stem.aan; if (!Stem.aan) Stem.stop(); $('#spGeluid').textContent = Stem.aan ? '🔊 Geluid aan' : '🔇 Geluid uit'; };
      $('#spKlaar').onclick = () => { S.uitleg[o.id] = true; opslag.bewaar(); tekenNav(); ga(huidig + 1); };
      this.zetScene(0, 0);
    },
    stappenTotaal() { return this.o.scenes.reduce((a, s) => a + s.stappen.length, 0); },
    zetScene(si) {
      const sc = this.o.scenes[si]; this.scIdx = si;
      const st = $('#scene'), zn = $('#zinnen');
      st.innerHTML = (sc.fig ? `<div class="fig" id="spFig">${figHTML(sc.fig, { schaal: sc.schaal || 1.25, id: 'spSvg' })}</div>` : '') + `<div id="spBreuk"></div>`;
      zn.innerHTML = (sc.kop ? `<p class="regel" style="font-weight:800;color:var(--paars);opacity:1">${esc(sc.kop)}</p>` : '') + sc.stappen.map((s, i) => `<p class="regel" data-z="${i}">${opmaak(s.zin)}</p>`).join('');
    },
    startPauze() {
      const b = $('#spStart');
      if (!this.bezig) { this.pauze = false; this.speel(this.positie || 0); return; }
      this.pauze = !this.pauze;
      b.textContent = this.pauze ? '▶ Verder' : '⏸ Pauze';
    },
    async speel(vanaf) {
      const mijn = ++this.run; this.bezig = true; this.pauze = false;
      $('#spStart').textContent = '⏸ Pauze';
      const o = this.o; const N = this.stappenTotaal();
      let teller = 0;
      for (let si = 0; si < o.scenes.length; si++) {
        const sc = o.scenes[si];
        if (teller + sc.stappen.length <= vanaf) { teller += sc.stappen.length; continue; }
        this.zetScene(si);
        // eerdere stappen in deze scene direct afspelen (bij hervatten)
        for (let i = 0; i < sc.stappen.length; i++, teller++) {
          if (mijn !== this.run) return;
          while (this.pauze) { await wacht(200); if (mijn !== this.run) return; }
          this.positie = teller;
          $('#spBalk').style.width = Math.round(teller / N * 100) + '%';
          const stap = sc.stappen[i];
          const zinEl = $(`[data-z="${i}"]`);
          $$('#zinnen .regel').forEach(z => z.classList.remove('nu'));
          if (zinEl) { zinEl.classList.add('zicht', 'nu'); }
          const snel = teller < vanaf;
          await Promise.all([this.actie(stap.doe, mijn, snel), snel ? null : Stem.zeg(stap.zeg || stap.zin)]);
          if (mijn !== this.run) return;
          if (!snel) await wacht(stap.pauze || 500);
        }
        if (si < o.scenes.length - 1) await wacht(700);
      }
      if (mijn !== this.run) return;
      $('#spBalk').style.width = '100%';
      $$('#zinnen .regel').forEach(z => z.classList.remove('nu'));
      this.bezig = false; this.positie = 0;
      $('#spStart').textContent = '▶ Nog een keer';
      $('#naUitleg').classList.remove('verborgen');
      $('#spKlaar').disabled = false; $('#volgende').disabled = false;
      $('#spMelding').textContent = 'Goed gekeken! Klik op "Ik heb het bekeken".';
      S.uitleg[o.id + '_gezien'] = true; opslag.lokaal();
    },
    async actie(doe, mijn, snel) {
      if (!doe) return;
      const svg = $('#spSvg');
      const pauze = snel ? 0 : 380;
      const stuk = i => svg && $(`.stuk[data-i="${i}"]`, svg);
      const alle = () => svg ? $$('.stuk', svg).map(p => +p.dataset.i) : [];
      if (doe.tel) {
        const lijst = doe.tel === 'alle' ? alle() : doe.tel;
        $$('.stuknr', svg).forEach(t => t.remove());
        for (let n = 0; n < lijst.length; n++) {
          if (mijn !== this.run) return;
          const p = stuk(lijst[n]); if (!p) continue;
          const info = this.stukInfo(lijst[n]);
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('class', 'stuknr' + (doe.gk ? ' gk' : '')); t.setAttribute('x', info.cx); t.setAttribute('y', info.cy);
          t.setAttribute('text-anchor', 'middle'); t.setAttribute('dominant-baseline', 'central'); t.textContent = n + 1;
          svg.appendChild(t);
          await wacht(pauze);
        }
      }
      if (doe.wisNr) $$('.stuknr', svg).forEach(t => t.remove());
      if (doe.kleur) {
        for (const i of doe.kleur) {
          if (mijn !== this.run) return;
          const p = stuk(i); if (p) { p.style.transition = 'fill .35s'; p.setAttribute('fill', F.KLEUR[doe.k || 'roze']); }
          await wacht(pauze);
        }
      }
      if (doe.breuk) {
        $('#spBreuk').innerHTML = `<div class="grootbreuk"><span class="t">${doe.breuk[0]}</span><span class="st"></span><span class="n">${doe.breuk[1]}</span></div>`;
      }
      if (doe.mark) {
        const gb = $('#spBreuk .grootbreuk'); if (gb) {
          const el = $('.' + doe.mark, gb); el.classList.add('mark');
          const lab = document.createElement('span'); lab.className = 'lab ' + (doe.mark === 't' ? 'lt' : 'ln');
          lab.textContent = doe.mark === 't' ? '← teller' : '← noemer'; gb.appendChild(lab);
        }
      }
      if (doe.rij) {
        $('#spBreuk').innerHTML = `<div class="breukrij">${doe.rij.map((b, i) => `<div class="grootbreuk" data-r="${i}"><span class="t">${b[0]}</span><span class="st"></span><span class="n">${b[1]}</span></div>`).join('')}</div>`;
      }
      if (doe.markRij) {
        $$('#spBreuk .grootbreuk').forEach(g => $('.' + doe.markRij, g).classList.add('mark'));
      }
      if (doe.kies) {
        await wacht(pauze);
        $$('#spBreuk .grootbreuk').forEach(g => { const i = +g.dataset.r; g.classList.add(doe.kies.indexOf(i) >= 0 ? 'keus' : 'weg'); });
      }
    },
    stukInfo(i) {
      const sc = this.o.scenes[this.scIdx || 0];
      const f = P.figuren[sc.fig]; const fig = typeof f === 'function' ? f() : f;
      return fig.stukken[i];
    }
  };

  /* =====================================================================
     REKENMACHINE
     ===================================================================== */
  let laatsteVak = null;
  document.addEventListener('focusin', e => { if (e.target.matches && e.target.matches('input.vak:not(.vast)')) laatsteVak = e.target; });
  const RM = {
    som: '', uit: '', klaar: false,
    maak() {
      const el = document.createElement('div');
      el.className = 'rekenmachine verborgen'; el.id = 'rekenmachine';
      el.innerHTML = `<div class="rmkop" id="rmkop"><span>🧮 Rekenmachine</span><button id="rmdicht" aria-label="sluiten">✕</button></div>
        <div class="rmscherm"><div class="som" id="rmsom"></div><div class="uit" id="rmuit">0</div></div>
        <div class="rmtoetsen">${['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', ',', '←', '='].map(t => `<button data-t="${t}" class="${'÷×−+'.includes(t) ? 'op' : t === '=' ? 'is' : (t === 'C' || t === '←') ? 'wis' : ''}">${t}</button>`).join('')}</div>
        <button class="rmkopieer" id="rmkopieer">⤵ Kopieer naar antwoordvak</button>`;
      document.body.appendChild(el);
      $$('.rmtoetsen button', el).forEach(b => b.onclick = () => this.druk(b.dataset.t));
      $('#rmdicht').onclick = () => this.wissel(false);
      $('#rmkopieer').onclick = () => {
        if (!laatsteVak) { $('#rmsom').textContent = 'Klik eerst in een hokje'; return; }
        const w = this.uit || this.som; if (!w) return;
        laatsteVak.value = w.replace('.', ','); laatsteVak.dispatchEvent(new Event('input')); laatsteVak.focus();
      };
      // slepen
      const kop = $('#rmkop'); let sx, sy, ox, oy, sleep = false;
      kop.addEventListener('pointerdown', e => { if (e.target.id === 'rmdicht') return; sleep = true; sx = e.clientX; sy = e.clientY; const r = el.getBoundingClientRect(); ox = r.left; oy = r.top; kop.setPointerCapture(e.pointerId); });
      kop.addEventListener('pointermove', e => {
        if (!sleep) return;
        const x = Math.max(0, Math.min(innerWidth - el.offsetWidth, ox + e.clientX - sx));
        const y = Math.max(0, Math.min(innerHeight - el.offsetHeight, oy + e.clientY - sy));
        el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto';
      });
      kop.addEventListener('pointerup', () => sleep = false);
    },
    wissel(aan) {
      const el = $('#rekenmachine'); const zicht = aan ?? el.classList.contains('verborgen');
      el.classList.toggle('verborgen', !zicht); $('#rmknop').classList.toggle('aan', zicht);
    },
    toon() { $('#rmsom').textContent = this.som; $('#rmuit').textContent = (this.uit || '0').replace('.', ','); },
    druk(t) {
      if (t === 'C') { this.som = ''; this.uit = ''; this.klaar = false; return this.toon(); }
      if (t === '←') { this.som = this.som.slice(0, -1); this.klaar = false; this.uit = ''; return this.toon(); }
      if (t === '=') {
        try {
          const e = this.som.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.');
          if (!/^[0-9+\-*/().\s]+$/.test(e)) throw 0;
          let v = Function('"use strict";return (' + e + ')')();
          if (!isFinite(v)) throw 0;
          v = Math.round(v * 1e8) / 1e8;
          this.uit = String(v); this.klaar = true;
        } catch (x) { this.uit = 'Fout'; }
        return this.toon();
      }
      if (this.klaar && /[0-9,(]/.test(t)) { this.som = ''; }
      if (this.klaar && /[÷×−+]/.test(t) && this.uit && this.uit !== 'Fout') { this.som = this.uit.replace('.', ','); }
      this.klaar = false; this.uit = '';
      this.som += t; this.toon();
    }
  };
  document.addEventListener('keydown', e => {
    const el = $('#rekenmachine'); if (!el || el.classList.contains('verborgen')) return;
    if (document.activeElement && document.activeElement.matches('input')) return;
    const map = { '*': '×', '/': '÷', '-': '−', '+': '+', 'Enter': '=', '=': '=', 'Backspace': '←', 'Escape': 'C', '.': ',', ',': ',', '(': '(', ')': ')' };
    if (/^[0-9]$/.test(e.key)) RM.druk(e.key); else if (map[e.key]) { e.preventDefault(); RM.druk(map[e.key]); }
  });

  /* =====================================================================
     AANMELDEN EN START
     ===================================================================== */
  function aanmeldScherm() {
    return new Promise(res => {
      const online = opslag.online();
      // Klascode in de link (bijv. ?klas=BREUK7): leerlingen hoeven hem dan niet te typen.
      const linkKlas = (new URLSearchParams(location.search).get('klas') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const div = document.createElement('div'); div.className = 'scherm';
      div.innerHTML = `<form class="aanmeldkaart" id="aanmeldform" autocomplete="off">
        <h2>${esc(P.titel)}</h2><p style="margin:0;color:var(--grijs);font-size:13px">${esc(P.klas)}</p>
        ${online && !linkKlas ? `<label for="ak">Klascode</label><input id="ak" required maxlength="12" style="text-transform:uppercase">` : ''}
        <label for="an">Je voornaam en achternaam</label><input id="an" required maxlength="60">
        ${online ? `<label for="ap">Pincode (4 cijfers)</label><input id="ap" required type="text" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" autocomplete="off" class="pinvak">
        <p style="font-size:12px;color:var(--grijs);margin:6px 0 0">De eerste keer kies je zelf een pincode.<br>Onthoud hem goed!</p>` : `<p style="font-size:12px;color:var(--grijs)">Oefenmodus: je werk wordt op deze computer bewaard.</p>`}
        <button class="knop hoofd" type="submit">Start</button><div class="melding" id="am"></div></form>`;
      document.body.appendChild(div);
      const vorige = (() => { try { return JSON.parse(localStorage.getItem('wiskunde_leerling') || '{}'); } catch (e) { return {}; } })();
      if (vorige.naam) $('#an').value = vorige.naam;
      if (online && !linkKlas && vorige.klascode) $('#ak').value = vorige.klascode;
      $('#aanmeldform').onsubmit = async e => {
        e.preventDefault();
        Leerling.naam = $('#an').value.trim().replace(/\s+/g, ' ');
        if (Leerling.naam.length < 2) { $('#am').textContent = 'Vul je naam in.'; return; }
        if (!online) { div.remove(); return res(null); }
        Leerling.klascode = linkKlas || $('#ak').value.trim().toUpperCase().replace(/\s/g, '');
        Leerling.pin = $('#ap').value.trim();
        $('#am').textContent = 'Even geduld...';
        try {
          const r = await opslag.rpc('leerling_aanmelden', { p_app: P.id, p_klascode: Leerling.klascode, p_naam: Leerling.naam, p_pin: Leerling.pin });
          if (!r.ok) {
            $('#am').textContent = { klascode: 'Deze klascode bestaat niet. Vraag je docent.', pincode: 'De pincode klopt niet. Vraag je docent om hulp.', pin: 'Kies 4 cijfers als pincode.', naam: 'Vul je hele naam in.' }[r.fout] || 'Er ging iets mis.';
            return;
          }
          Leerling.klas = r.klas;
          try { localStorage.setItem('wiskunde_leerling', JSON.stringify({ naam: Leerling.naam, klascode: Leerling.klascode })); } catch (x) { }
          div.remove(); res(r.staat && Object.keys(r.staat).length ? r.staat : null);
        } catch (x) {
          $('#am').textContent = 'Geen verbinding met de server. Probeer het nog eens.';
        }
      };
    });
  }

  async function start() {
    P = window.PARAGRAAF;
    document.title = P.titel + ' – ' + P.klas;
    $('#titel').innerHTML = `${esc(P.titel)}<small>${esc(P.klas)} · Wiskunde</small>`;
    RM.maak();
    $('#rmknop').onclick = () => RM.wissel();
    $('#tempo').onchange = e => { Stem.tempo = +e.target.value; };
    $('#tempo').value = String(Stem.tempo);
    const remote = await aanmeldScherm();
    const lokaal = opslag.laadLokaal();
    S = remote || lokaal || S;
    S.uitleg = S.uitleg || {}; S.d = S.d || {}; S.inv = S.inv || {};
    $('#wie').textContent = '👤 ' + Leerling.naam + (Leerling.klas ? ' · ' + Leerling.klas : '');
    huidig = Math.min(S.huidig || 0, P.onderdelen.length - 1);
    if (opSlot(huidig)) huidig = P.onderdelen.indexOf(opSlot(huidig));
    tekenKop(); tekenNav(); tekenPagina();
    window.addEventListener('beforeunload', () => { opslag.lokaal(); if (opslag.online() && Leerling.pin) opslag.stuur(); });
  }

  window.Oefen = { start, F: window.F, breukWoord, spreekTekst, opmaak, _staat: () => S, _ga: ga };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
