/* =====================================================================
   1 Basis – Hoofdstuk 3 Getallen – Paragraaf 3.3 Breuken
   Eigen teksten, getallen, contexten en figuren
   (zelfde leerdoelen als de methode, geen letterlijke kopie).
   ===================================================================== */
(function () {
  const F = window.F;
  F.KLEUR.perzik = '#fde9c7';
  const W = 'WI/K/5.4 Breuken';
  const WG = 'WI/K/5.1 Rekenen met geld';

  /* ---------- Vormen die niet standaard zijn ---------- */
  function vierkant8(o = {}) {
    const TL = [0, 0], Tm = [1, 0], TR = [2, 0], Rm = [2, 1], BR = [2, 2], Bm = [1, 2], BL = [0, 2], Lm = [0, 1], C = [1, 1];
    return F.vormen([[TL, Tm, C], [Tm, TR, C], [TR, Rm, C], [Rm, BR, C], [BR, Bm, C], [Bm, BL, C], [BL, Lm, C], [Lm, TL, C]], o);
  }
  function driehoek9(o = {}) {
    // driehoek met de punt naar boven, 9 kleine driehoekjes
    const h = Math.sqrt(3) / 2, rij = [];
    for (let j = 0; j <= 3; j++) { const r = []; for (let i = 0; i <= j; i++) r.push([1.5 - j / 2 + i, j * h]); rij.push(r); }
    const p = [];
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i <= j; i++) p.push([rij[j][i], rij[j + 1][i], rij[j + 1][i + 1]]);
      for (let i = 0; i < j; i++) p.push([rij[j][i], rij[j][i + 1], rij[j + 1][i + 1]]);
    }
    return F.vormen(p, o);
  }
  function figE(o = {}) {
    // vierkant in 4 rechthoeken, elke rechthoek in 2 driehoeken = 8 stukken
    const p = [];
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([x, y]) => {
      p.push([[x, y], [x + 1, y], [x, y + 1]]);
      p.push([[x + 1, y], [x + 1, y + 1], [x, y + 1]]);
    });
    return F.vormen(p, o);
  }
  function figD(o = {}) {
    // rechthoek 4 breed en 2 hoog = 8 hokjes
    return F.rooster(4, 2, o);
  }
  function figB(o = {}) {
    // ruit (wybertje) in 4 stukken
    const T = [1, 0], R = [2, 1.4], B = [1, 2.8], L = [0, 1.4], C = [1, 1.4];
    return F.vormen([[T, R, C], [R, B, C], [B, L, C], [L, T, C]], o);
  }
  function figC(o = {}) {
    return F.vormen([[[0, 0], [1, 0], [1, 2], [0, 2]], [[1, 0], [2, 0], [2, 2], [1, 2]], [[2, 0], [3, 0], [3, 2], [2, 2]], [[3, 0], [4, 0], [4, 2], [3, 2]]], o);
  }

  /* ---------- Pannenkoek / pizza-tekening (opdracht 1) ---------- */
  function pizza(snij) {
    const c = 62;
    let s = `<svg viewBox="0 0 124 124" width="124" height="124" xmlns="http://www.w3.org/2000/svg">`;
    s += `<circle cx="${c}" cy="${c}" r="60" fill="#d58a3c"/><circle cx="${c}" cy="${c}" r="52" fill="#c4402a"/>`;
    const kaas = [[40, 40, 12], [80, 38, 10], [60, 62, 13], [36, 78, 11], [84, 80, 12], [62, 92, 9], [92, 58, 8], [30, 58, 8]];
    kaas.forEach(k => s += `<circle cx="${k[0]}" cy="${k[1]}" r="${k[2]}" fill="#f2dfa8"/>`);
    const salami = [[52, 46], [74, 66], [46, 70], [70, 86], [88, 46], [40, 92]];
    salami.forEach(h => s += `<circle cx="${h[0]}" cy="${h[1]}" r="7" fill="#9c2a2a"/>`);
    if (snij >= 2) s += `<line x1="${c}" y1="0" x2="${c}" y2="124" stroke="#fff" stroke-width="3"/>`;
    if (snij >= 4) s += `<line x1="0" y1="${c}" x2="124" y2="${c}" stroke="#fff" stroke-width="3"/>`;
    return s + '</svg>';
  }

  const fig = (naam, o) => F.svg(typeof P.figuren[naam] === 'function' ? P.figuren[naam]() : P.figuren[naam], o || {});
  const breuk = (t, n) => `<span class="breuk"><span class="t">${t}</span><span class="n">${n}</span></span>`;
  const label = l => `<span class="figlabel" style="width:26px;height:26px;font-size:15px">${l}</span>`;

  const P = {
    id: '1b-3-3-breuken',
    titel: '§ 3.3 Breuken',
    klas: '1 Basis · Hoofdstuk 3 Getallen',
    figuren: {
      zes: () => F.veelhoek(6),
      zes4: () => F.veelhoek(6, { gk: [0, 1, 2, 3], k: 'roze' }),
      zes2: () => F.veelhoek(6, { gk: [3, 4], k: 'roze' }),
      tien: () => F.veelhoek(10, { r: 82 }),
      tien7: () => F.veelhoek(10, { r: 82, gk: [0, 1, 2, 3, 4, 5, 6], k: 'roze' }),
      drie: () => F.cirkel(3),
      drie2: () => F.cirkel(3, { gk: [0, 1], k: 'geel' }),
      noah: () => F.cirkel(4, { r: 70 }),
      sara: () => F.cirkel(6, { r: 70 }),
      noahKlein: () => F.cirkel(4, { r: 36 }),
      saraKlein: () => F.cirkel(6, { r: 36 }),
      taart: () => F.cirkel(8, { r: 110, gk: [0, 1, 2, 6, 7], k: 'perzik', stippel: [3, 4, 5] }),
      figA: () => F.cirkel(3, { r: 80, gk: [0, 2], k: 'geel' }),
      figB: () => figB({ s: 36, gk: [0, 2], k: 'geel' }),
      figC: () => figC({ s: 30, gk: [0, 1, 3], k: 'blauw' }),
      figD: () => figD({ s: 32, gk: [0, 5, 6], k: 'donkerroze' }),
      figE: () => figE({ s: 46, gk: [0, 3, 4, 6, 7], k: 'lichtroze' }),
      f8_1: () => F.cirkel(8, { r: 46, gk: [0, 1, 2], k: 'magenta' }),
      f8_2: () => vierkant8({ s: 46, gk: [0, 1, 2, 4, 5], k: 'oranje' }),
      f8_3: () => F.ovaal4({ rx: 24, ry: 50, gk: [0, 1] }),
      f8_4: () => F.cirkel(8, { r: 46, gk: [0, 1, 2, 3, 4, 5, 6], k: 'blauw' }),
      f9_1: () => F.rooster(5, 2, { s: 26, gk: [0, 1, 2, 5, 6, 7], k: 'geel' }),
      f9_2: () => F.cirkel(8, { r: 44, gk: [0, 1, 2], k: 'groen' }),
      f9_3: () => F.rooster(6, 1, { s: 22, gk: [5], k: 'blauw' }),
      f9_4: () => F.rooster(3, 3, { s: 26, gk: [0, 1, 3, 4], k: 'blauw' }),
      lvorm: () => F.rooster(4, 2, { s: 56, weg: [2, 3] }),
      lvormKlein: () => F.rooster(4, 2, { s: 34, weg: [2, 3] }),
      vk8: () => vierkant8({ s: 50 }),
      dr9: () => driehoek9({ s: 50 }),
      cirkel4: () => F.cirkel(4, { r: 50, verborgenLijnen: true }),
      r74: () => F.rooster(7, 4, { s: 24 }),
      // mini-toets
      t_zes: () => F.cirkel(6, { r: 60, gk: [0, 1], k: 'roze' }),
      t_strook: () => F.rooster(5, 1, { s: 40, gk: [0, 1], k: 'blauw' }),
      t_vk4: () => F.rooster(2, 2, { s: 60 }),
      t_r72: () => F.rooster(7, 2, { s: 34 })
    },
    onderdelen: []
  };
  const O = P.onderdelen;

  /* =================== UITLEG 1 =================== */
  O.push({
    type: 'uitleg', id: 'u1', kort: '📺 1', titel: 'Uitleg 1: Wat is een breuk?',
    waarom: 'Breuken gebruik je elke dag: een halve pizza, een kwart taart of een deel van je loon.',
    scenes: [
      { fig: 'zes', stappen: [
        { zin: 'Deze figuur heeft zes stukken.', doe: { tel: 'alle' } },
        { zin: 'Alle stukken zijn even groot.' },
        { zin: 'We kleuren één stuk.', doe: { wisNr: true, kleur: [0], k: 'roze' } },
        { zin: 'Dat stuk schrijf je als breuk: [1/6].', doe: { breuk: [1, 6] } },
        { zin: 'Het getal boven de streep heet de **teller**.', doe: { mark: 't' } },
        { zin: 'Het getal onder de streep heet de **noemer**.', doe: { mark: 'n' } }
      ] },
      { kop: 'Voorbeeld', stappen: [
        { zin: 'Kijk naar de breuken [3/4], [1/6], [5/9] en [1/9].', doe: { rij: [[3, 4], [1, 6], [5, 9], [1, 9]] } },
        { zin: 'Bij welke breuken is de teller hetzelfde?', doe: { markRij: 't' } },
        { zin: 'Bij [1/6] en [1/9]. Allebei hebben ze teller 1.', doe: { kies: [1, 3] } }
      ] }
    ],
    onthoud: ['Een breuk heeft een **teller** en een **noemer**.', 'De teller staat boven de streep.', 'De noemer staat onder de streep.'],
    boek: () => `<h3>Samenvatting</h3>
      <p class="regel">Een figuur is verdeeld in zes even grote stukken.</p>
      <p class="regel">Eén stuk is ${breuk(1, 6)} deel van de figuur.</p>
      <p class="regel">${breuk(1, 6)} is een <b>breuk</b>.</p>
      <p class="regel">Boven de streep staat de <b>teller</b>: 1.</p>
      <p class="regel">Onder de streep staat de <b>noemer</b>: 6.</p>
      <div class="fig">${fig('zes', { schaal: .8 })}</div>
      <div class="voorbeeld"><h4>Voorbeeld</h4><div class="paarstekst">
        <p class="regel">Welke breuken hebben dezelfde teller: ${breuk(3, 4)}, ${breuk(1, 6)}, ${breuk(5, 9)} of ${breuk(1, 9)}?</p>
        <p class="regel">${breuk(1, 6)} en ${breuk(1, 9)}.</p>
        <p class="regel">Ze hebben allebei teller 1.</p></div></div>`
  });

  /* =================== OPDRACHT 1: pizza =================== */
  O.push({
    type: 'opdracht', id: '1', kort: '1', titel: 'Opdracht 1 – Pizzeria Napoli', eindterm: WG,
    waarom: 'In een restaurant of snackbar reken je zo uit wat een deel kost.',
    bron: () => `<div class="intro" style="display:block">
        <div class="figrij" style="justify-content:space-around">${pizza(1)}${pizza(2)}${pizza(4)}</div>
        <p class="regel" style="color:var(--tekst);font-size:17px;margin-top:8px">Een hele pizza kost 16 euro.</p>
        <p class="regel">Bij Pizzeria Napoli koop je een hele pizza of een stuk pizza.</p></div>`,
    delen: [
      { id: 'a', type: 'invul', regels: ['Een halve pizza kost {n} euro.'], ans: [8],
        hint: ['Een halve pizza is de pizza in 2 even grote stukken.', 'Deel de prijs van de hele pizza door 2.', 'Reken uit: 16 : 2 = ...'],
        uitleg: ['De helft uitrekenen: je deelt door 2.', '16 : 2 = 8', 'Een halve pizza kost 8 euro.'] },
      { id: 'b', type: 'invul', regels: ['De pizza wordt in vier even grote stukken gesneden.', 'Eén stuk kost {n} euro.', 'Drie stukken kosten samen {n} euro.'], ans: [4, 12],
        hint: ['De pizza heeft 4 even grote stukken.', 'Eén stuk: deel 16 euro door 4.', 'Drie stukken: doe de prijs van één stuk keer 3.'],
        uitleg: ['Eén stuk kost 16 : 4 = 4 euro.', 'Drie stukken kosten 3 × 4 = 12 euro.'] }
    ]
  });

  /* =================== OPDRACHT 2: noemer =================== */
  O.push({
    type: 'opdracht', id: '2', kort: '2', titel: 'Opdracht 2 – Dezelfde noemer', eindterm: W,
    waarom: 'Breuken met dezelfde noemer kun je makkelijk vergelijken.',
    bron: () => `<div class="intro" style="display:flex;gap:26px;flex-wrap:wrap;font-size:18px">${[[3, 4], [1, 6], [5, 9], [1, 9]].map(b => breuk(b[0], b[1])).join('')}</div>`,
    delen: [
      { id: 'a', type: 'mk', regels: ['Kijk naar de vier breuken.', 'Welke twee breuken hebben dezelfde noemer?'],
        opties: ['[3/4]', '[1/6]', '[5/9]', '[1/9]'], ans: [2, 3],
        hint: ['De noemer is het getal onder de streep.', 'Schrijf bij elke breuk het getal onder de streep op.', 'Zoek twee breuken met hetzelfde getal onder de streep.'],
        uitleg: ['Kijk naar het getal onder de streep.', '[3/4] → 4, [1/6] → 6, [5/9] → 9, [1/9] → 9.', '[5/9] en [1/9] hebben dezelfde noemer: 9.'] }
    ]
  });

  /* =================== OPDRACHT 3: omcirkelen =================== */
  O.push({
    type: 'opdracht', id: '3', kort: '3', titel: 'Opdracht 3 – Zoek de paren', eindterm: W,
    bron: () => `<div class="intro" style="display:flex;gap:26px;flex-wrap:wrap;font-size:16px">${[[3, 10], [3, 8], [10, 3], [7, 10], [10, 13], [1, 3]].map(b => breuk(b[0], b[1])).join('')}</div>`,
    delen: [
      { id: 'a', type: 'omcirkel', regels: ['✏️ Hier staan zes breuken.', 'Twee breuken met dezelfde noemer krijgen dezelfde kleur.', 'Gebruik voor elk paar een andere kleur.'],
        items: [[3, 10], [3, 8], [10, 3], [7, 10], [10, 13], [1, 3]],
        hint: ['Kijk alleen naar het getal onder de streep.', 'Zoek twee breuken met noemer 10. Geef ze dezelfde kleur.', 'Zoek twee breuken met noemer 3. Geef ze een andere kleur.'],
        uitleg: ['[3/10] en [7/10] hebben noemer 10. Die krijgen dezelfde kleur.', '[10/3] en [1/3] hebben noemer 3. Die krijgen een andere kleur.', '[3/8] en [10/13] hebben geen partner. Die kleur je niet.'] }
    ]
  });

  /* =================== UITLEG 2 =================== */
  O.push({
    type: 'uitleg', id: 'u2', kort: '📺 2', titel: 'Uitleg 2: Welk deel is gekleurd?',
    waarom: 'Een kok, een bakker en een schilder werken met delen: een halve liter, een kwart taart, een derde van de muur.',
    scenes: [
      { fig: 'zes', stappen: [
        { zin: 'Deze figuur heeft zes even grote stukken.', doe: { tel: 'alle' } },
        { zin: 'Vier stukken zijn roze.', doe: { wisNr: true, kleur: [0, 1, 2, 3], k: 'roze' } },
        { zin: 'Tel de roze stukken: 1, 2, 3, 4.', doe: { tel: [0, 1, 2, 3], gk: true } },
        { zin: 'Dan is [4/6] deel gekleurd.', doe: { breuk: [4, 6] } },
        { zin: 'De teller vertelt hoeveel stukken gekleurd zijn.', doe: { mark: 't' } },
        { zin: 'De noemer vertelt hoeveel stukken er in totaal zijn.', doe: { mark: 'n' } }
      ] },
      { fig: 'tien', kop: 'Voorbeeld 1', stappen: [
        { zin: 'Hoeveel deel is hier gekleurd?', doe: { kleur: [0, 1, 2, 3, 4, 5, 6], k: 'roze' } },
        { zin: 'Eerst tel je alle stukken: het zijn er tien.', doe: { tel: 'alle' } },
        { zin: 'Dan tel je de gekleurde stukken: het zijn er zeven.', doe: { tel: [0, 1, 2, 3, 4, 5, 6], gk: true } },
        { zin: 'Het antwoord is [7/10] deel.', doe: { breuk: [7, 10] } }
      ] },
      { fig: 'drie', kop: 'Voorbeeld 2', stappen: [
        { zin: 'Opdracht: kleur [2/3] deel.', doe: { breuk: [2, 3] } },
        { zin: 'De noemer is 3: de figuur heeft drie stukken.', doe: { tel: 'alle' } },
        { zin: 'De teller is 2: je kleurt twee stukken.', doe: { wisNr: true, kleur: [0, 1], k: 'geel' } }
      ] }
    ],
    onthoud: ['**Teller** = het aantal gekleurde stukken.', '**Noemer** = het totaal aantal stukken.', 'De stukken moeten even groot zijn.'],
    boek: () => `<h3>Samenvatting</h3>
      <p class="regel">Tel eerst alle stukken. Dat getal is de noemer.</p>
      <p class="regel">Tel dan de gekleurde stukken. Dat getal is de teller.</p>
      <p class="regel">Hier zijn 4 van de 6 stukken gekleurd: ${breuk(4, 6)} deel.</p>
      <div class="fig">${fig('zes4', { schaal: .8 })}</div>
      <div class="voorbeeld"><h4>Voorbeeld 1</h4><div class="paarstekst">
        <div class="fig">${fig('tien7', { schaal: .7 })}</div>
        <p class="regel">10 stukken, waarvan 7 gekleurd.</p>
        <p class="regel">Dus ${breuk(7, 10)} deel is gekleurd.</p></div></div>
      <div class="voorbeeld"><h4>Voorbeeld 2</h4><div class="paarstekst">
        <p class="regel">Kleur ${breuk(2, 3)} deel.</p>
        <p class="regel">Er zijn 3 stukken. Je kleurt er 2.</p>
        <div class="fig">${fig('drie2', { schaal: .7 })}</div></div></div>`
  });

  /* =================== OPDRACHT 4: appeltaart =================== */
  O.push({
    type: 'opdracht', id: '4', kort: '4', titel: 'Opdracht 4 – De appeltaart', eindterm: W,
    waarom: 'Bij de bakker koop je taart per stuk. Dan wil je weten wat één stuk kost.',
    intro: ['Bakker Sem verkoopt appeltaart per stuk.', 'De stippellijnen zijn de stukken die al weg zijn.'],
    bron: () => `<div class="fig">${fig('taart')}</div>`,
    delen: [
      { id: 'a', type: 'invul', regels: ['De hele taart had {n} even grote stukken.'], ans: [8],
        hint: ['Tel alle stukken: de gekleurde stukken én de stukken met stippellijnen.'],
        hulpFig: [{ fig: 'taart', schaal: .8, tekst: 'Tel alle stukken: 1 tot en met 8.' }],
        uitleg: ['De hele taart had 8 stukken.'] },
      { id: 'b', type: 'invul', regels: ['Er zijn al {n} stukken verkocht.'], ans: [3],
        hint: ['Verkochte stukken zijn er niet meer.', 'Tel de stukken met stippellijnen.'],
        uitleg: ['De stukken met stippellijnen zijn verkocht.', 'Er zijn 3 stukken verkocht.'] },
      { id: 'c', type: 'invul', eindterm: WG, regels: ['Een hele taart kost 16 euro.', 'Eén stuk kost {n} euro.'], ans: [2],
        hint: ['De hele taart heeft 8 stukken.', 'Deel de prijs door het aantal stukken.', 'Reken uit: 16 : 8 = ...'],
        uitleg: ['16 : 8 = 2', 'Eén stuk taart kost 2 euro.'] }
    ]
  });

  /* =================== OPDRACHT 5: Noah en Sara =================== */
  O.push({
    type: 'opdracht', id: '5', kort: '5', titel: 'Opdracht 5 – Noah en Sara', eindterm: W,
    waarom: 'Met breuken kun je eerlijk vergelijken wie meer heeft.',
    bron: () => `<div class="intro" style="display:block">
        <div class="figrij" style="gap:28px"><div class="fig">${fig('noahKlein', { dikte: 1.5 })}<div style="font-size:11px;color:var(--tekst)">Noah</div></div>
        <div class="fig">${fig('saraKlein', { dikte: 1.5 })}<div style="font-size:11px;color:var(--tekst)">Sara</div></div></div>
        <p class="regel">Noah eet ${breuk(1, 4)} deel van zijn pizza.</p>
        <p class="regel">Sara eet ${breuk(2, 6)} deel van haar pizza.</p>
        <p class="regel">De pizza's zijn even groot.</p></div>`,
    delen: [
      { id: 'a', type: 'kleur', regels: ['✏️ Kleur in de pizza van Noah [1/4] deel.'], kleur: 'geel',
        figs: [{ fig: 'noah', nodig: 1, label: 'Noah' }],
        hint: ['De noemer is 4: de pizza heeft 4 stukken.', 'De teller is 1: kleur 1 stuk.', 'Klik op een stuk om het te kleuren.'],
        uitleg: ['[1/4] betekent: 1 van de 4 stukken.', 'Je kleurt dus 1 stuk.'] },
      { id: 'b', type: 'kleur', regels: ['✏️ Kleur in de pizza van Sara [2/6] deel.'], kleur: 'geel',
        figs: [{ fig: 'sara', nodig: 2, label: 'Sara' }],
        hint: ['De noemer is 6: de pizza heeft 6 stukken.', 'De teller is 2: kleur 2 stukken.'],
        uitleg: ['[2/6] betekent: 2 van de 6 stukken.', 'Je kleurt dus 2 stukken.'] },
      { id: 'c', type: 'mk', regels: ['Wie heeft meer pizza gegeten?'], opties: ['Noah', 'Sara'], ans: 1,
        hint: ['Kijk naar je gekleurde pizza\'s bij A en B.', 'Welke pizza heeft het grootste gekleurde deel?'],
        uitleg: ['Noah at [1/4] deel. Dat is een kwart van de pizza.', 'Sara at [2/6] deel. Dat is een derde van de pizza.', 'Het gekleurde deel van Sara is groter.', 'Sara heeft meer pizza gegeten.'] }
    ]
  });

  /* =================== OPDRACHT 6: niet gekleurd =================== */
  O.push({
    type: 'opdracht', id: '6', kort: '6', titel: 'Opdracht 6 – Wat is wit?', eindterm: W,
    bron: () => `<div class="fig">${fig('zes2', { schaal: 1.3 })}</div>`,
    delen: [
      { id: 'a', type: 'invul', regels: ['Een deel van de figuur is wit.', 'Welk deel is wit?', 'Het witte deel is {f} van de figuur.'], ans: [[4, 6]],
        hint: ['Tel eerst alle stukken. Dat is de noemer.', 'Tel daarna de witte stukken. Dat is de teller.', 'Let op: je telt de stukken die níet gekleurd zijn.'],
        hulpFig: [{ fig: 'zes2', nummers: 'alle', tekst: 'Er zijn 6 stukken. 2 zijn roze. 6 − 2 = 4 zijn wit.' }],
        uitleg: ['Teller = 4 witte stukken.', 'Noemer = 6 stukken in totaal.', 'Dus [4/6] deel is wit.'] }
    ]
  });

  /* =================== OPDRACHT 7: figuur A t/m E =================== */
  O.push({
    type: 'opdracht', id: '7', kort: '7', titel: 'Opdracht 7 – Figuur A tot en met E', eindterm: W,
    bron: () => `<div class="figrij" style="align-items:center"><div class="fig">${fig('figA')}${label('A')}</div></div>`,
    delen: [
      { id: 'a', type: 'invul', regels: ['Kijk naar figuur **A**.', 'Figuur **A** heeft {n} even grote stukken.'], ans: [3],
        hint: ['Tel alle stukken van figuur A, ook het witte stuk.'],
        hulpFig: [{ fig: 'figA', schaal: .7 }], uitleg: ['Figuur A heeft 3 even grote stukken.'] },
      { id: 'b', type: 'invul', regels: ['Er zijn {n} stukken geel.'], ans: [2],
        hint: ['Tel alleen de gele stukken.'],
        hulpFig: [{ fig: 'figA', schaal: .7, nummers: 'gk' }], uitleg: ['Er zijn 2 stukken geel.'] },
      { id: 'c', type: 'invul', regels: ['Schrijf als breuk: welk deel van figuur **A** is geel?', 'Antwoord: {f} deel.'], ans: [[2, 3]],
        hint: ['De teller is het aantal gele stukken (vraag B).', 'De noemer is het totaal aantal stukken (vraag A).'],
        uitleg: ['Teller = 2 gele stukken.', 'Noemer = 3 stukken.', 'Dus [2/3] deel is geel.'] },
      { id: 'd', type: 'invul', regels: ['Doe hetzelfde bij figuur **B**, **C**, **D** en **E**.', 'Schrijf steeds een breuk.'],
        rij: [{ fig: 'figB', label: 'B', invul: '{f} deel' }, { fig: 'figC', label: 'C', invul: '{f} deel' }, { fig: 'figD', label: 'D', invul: '{f} deel' }, { fig: 'figE', label: 'E', invul: '{f} deel' }],
        ans: [[2, 4], [3, 4], [3, 8], [5, 8]],
        hint: ['Tel bij elke figuur eerst alle stukken. Dat is de noemer.', 'Tel daarna de gekleurde stukken. Dat is de teller.', 'Figuur D en E hebben allebei 8 stukken.'],
        hulpFig: [{ fig: 'figB', nummers: 'alle', schaal: .8, tekst: 'B: 2 van 4' }, { fig: 'figC', nummers: 'alle', schaal: .8, tekst: 'C: 3 van 4' }, { fig: 'figD', nummers: 'alle', schaal: .8, tekst: 'D: 3 van 8' }, { fig: 'figE', nummers: 'alle', schaal: .8, tekst: 'E: 5 van 8' }],
        uitleg: ['B: [2/4] deel.', 'C: [3/4] deel.', 'D: [3/8] deel.', 'E: [5/8] deel.'] }
    ]
  });

  /* =================== OPDRACHT 8 =================== */
  O.push({
    type: 'opdracht', id: '8', kort: '8', titel: 'Opdracht 8 – Welk deel is gekleurd?', eindterm: W,
    delen: [
      { id: 'a', type: 'invul', regels: ['Schrijf onder elke figuur welk deel gekleurd is.', 'Bij figuur 1 staat de teller er al.'],
        rij: [{ fig: 'f8_1', label: '1', invul: '{f:3/} deel' }, { fig: 'f8_2', label: '2', invul: '{f} deel' }, { fig: 'f8_3', label: '3', invul: '{f} deel' }, { fig: 'f8_4', label: '4', invul: '{f} deel' }],
        ans: [[3, 8], [5, 8], [2, 4], [7, 8]],
        hint: ['Tel bij elke figuur alle stukken. Dat getal komt onder de streep.', 'Tel de gekleurde stukken. Dat getal komt boven de streep.'],
        hulpFig: [{ fig: 'f8_1', nummers: 'alle', tekst: '1: 3 van 8' }, { fig: 'f8_2', nummers: 'alle', tekst: '2: 5 van 8' }, { fig: 'f8_3', nummers: 'alle', tekst: '3: 2 van 4' }, { fig: 'f8_4', nummers: 'alle', tekst: '4: 7 van 8' }],
        uitleg: ['1: [3/8] deel.', '2: [5/8] deel.', '3: [2/4] deel.', '4: [7/8] deel.'] }
    ]
  });

  /* =================== OPDRACHT 9 =================== */
  O.push({
    type: 'opdracht', id: '9', kort: '9', titel: 'Opdracht 9 – Hokjes en stukken', eindterm: W,
    intro: ['Hier staan vier figuren.', 'Welk deel is gekleurd?', 'Schrijf het antwoord als breuk.'],
    delen: [
      { id: 'a', type: 'invul', regels: [],
        rij: [{ fig: 'f9_1', label: '1', invul: '{f} deel' }, { fig: 'f9_2', label: '2', invul: '{f} deel' }, { fig: 'f9_3', label: '3', invul: '{f} deel' }, { fig: 'f9_4', label: '4', invul: '{f} deel' }],
        ans: [[6, 10], [3, 8], [1, 6], [4, 9]],
        leesExtra: ['Hier staan vier figuren.', 'Welk deel is gekleurd?', 'Schrijf het antwoord als breuk.'],
        hint: ['Figuur 1 heeft 2 rijen van 5 hokjes.', 'Tel steeds eerst alle stukken (noemer), daarna de gekleurde stukken (teller).'],
        hulpFig: [{ fig: 'f9_1', nummers: 'alle', tekst: '1: 6 van 10' }, { fig: 'f9_2', nummers: 'alle', tekst: '2: 3 van 8' }, { fig: 'f9_3', nummers: 'alle', tekst: '3: 1 van 6' }, { fig: 'f9_4', nummers: 'alle', tekst: '4: 4 van 9' }],
        uitleg: ['1: [6/10] deel.', '2: [3/8] deel.', '3: [1/6] deel.', '4: [4/9] deel.'] }
    ]
  });

  /* =================== OPDRACHT 10 =================== */
  O.push({
    type: 'opdracht', id: '10', kort: '10', titel: 'Opdracht 10 – Zelf kleuren', eindterm: W,
    bron: () => `<div class="fig">${fig('lvorm')}</div><div>${label('1')}</div>`,
    delen: [
      { id: 'a', type: 'invul', regels: ['Kijk naar figuur **1**.', 'Tel de vierkantjes.', 'Figuur **1** heeft {n} vierkantjes.'], ans: [6],
        hint: ['Tel de vierkantjes in de bovenste rij.', 'Tel daarna de vierkantjes in de onderste rij.'],
        hulpFig: [{ fig: 'lvormKlein', nummers: 'alle' }], uitleg: ['2 + 4 = 6 vierkantjes.'] },
      { id: 'b', type: 'kleur', regels: ['✏️ Maak in figuur **1** vier vierkantjes groen.'], kleur: 'groen',
        figs: [{ fig: 'lvormKlein', nodig: 4, label: '1' }],
        hint: ['Klik op een vierkantje om het groen te maken.', 'Klik nog een keer om het weer wit te maken.', 'Je moet er precies 4 kleuren.'],
        uitleg: ['Je kleurt 4 van de 6 vierkantjes.', 'Welke 4 maakt niet uit.'] },
      { id: 'c', type: 'invul', regels: ['Welk deel van figuur **1** is nu groen?', 'Antwoord: {f:/6} deel.'], ans: [[4, 6]], gelijkwaardig: false,
        hint: ['Hoeveel vierkantjes heb je groen gemaakt?', 'Dat getal komt boven de streep.'],
        uitleg: ['Je kleurde 4 van de 6 vierkantjes.', 'Dus [4/6] deel is groen.'] },
      { id: 'd', type: 'kleur', regels: ['✏️ Kleur in figuur **2** en figuur **3** het deel dat onder de figuur staat.'], kleur: 'geel',
        figs: [{ fig: 'vk8', nodig: 5, label: '2', onder: '[5/8] deel' }, { fig: 'dr9', nodig: 4, label: '3', onder: '[4/9] deel' }],
        hint: ['Kijk naar de teller: zoveel stukken kleur je.', 'Bij figuur 2 kleur je 5 stukken.', 'Bij figuur 3 kleur je 4 stukken.'],
        uitleg: ['[5/8]: kleur 5 van de 8 stukken.', '[4/9]: kleur 4 van de 9 stukken.'] }
    ]
  });

  /* =================== OPDRACHT 11 =================== */
  O.push({
    type: 'opdracht', id: '11', kort: '11', titel: 'Opdracht 11 – Kleur het deel', eindterm: W,
    delen: [
      { id: 'a', type: 'kleur', regels: ['✏️ Onder elke figuur staat een breuk.', 'Kleur dat deel van de figuur.'], kleur: 'blauw',
        figs: [
          { fig: 'cirkel4', nodig: 3, label: '1', onder: '[3/4] deel', ruitjes: true },
          { fig: 'lvormKlein', nodig: 5, label: '2', onder: '[5/6] deel', ruitjes: true },
          { fig: 'r74', nodig: 8, label: '3', onder: '[2/7] deel', ruitjes: true, voorbeeld: [0, 1, 7, 8, 14, 15, 21, 22] },
          { fig: 'r74', nodig: 20, label: '4', onder: '[5/7] deel', ruitjes: true, voorbeeld: [0, 1, 2, 3, 4, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25] }],
        hint: ['Figuur 1: de cirkel heeft 4 gelijke stukken. Klik op 3 stukken.', 'Figuur 3 heeft 28 hokjes. 28 : 7 = 4. Dus [1/7] deel = 4 hokjes.', 'Hoeveel hokjes zijn dan [2/7] deel en [5/7] deel?'],
        uitleg: ['1: kleur 3 van de 4 stukken.', '2: kleur 5 van de 6 vierkantjes.', '3: [1/7] deel = 4 hokjes. [2/7] deel = 2 × 4 = 8 hokjes (2 kolommen).', '4: [5/7] deel = 5 × 4 = 20 hokjes (5 kolommen).'] }
    ]
  });

  /* =================== MINI-TOETS =================== */
  O.push({
    type: 'toets', id: 'T', kort: '🏁 Toets', titel: 'Mini-toets – Breuken', eindterm: W,
    waarom: 'Laat zien wat je hebt geleerd. Je kunt nog steeds een hint gebruiken, maar dan krijg je 1 punt.',
    delen: [
      { id: 'a', type: 'invul', regels: ['Welk deel van de figuur is gekleurd?'], rij: [{ fig: 't_zes', invul: '{f} deel' }], ans: [[2, 6]],
        hint: ['Tel alle stukken (noemer) en de gekleurde stukken (teller).'],
        hulpFig: [{ fig: 't_zes', nummers: 'alle', schaal: .7 }], uitleg: ['2 van de 6 stukken zijn gekleurd.', 'Dus [2/6] deel.'] },
      { id: 'b', type: 'invul', regels: ['Kijk naar de breuk [3/7].', 'De noemer van deze breuk is {n}.'], ans: [7],
        hint: ['De noemer staat onder de streep.'], uitleg: ['De noemer is het getal onder de streep: 7.'] },
      { id: 'c', type: 'mk', regels: ['Welke twee breuken hebben dezelfde teller?'], opties: ['[2/9]', '[4/7]', '[2/5]', '[1/4]'], ans: [0, 2],
        hint: ['De teller staat boven de streep.'], uitleg: ['[2/9] en [2/5] hebben allebei teller 2.'] },
      { id: 'd', type: 'invul', eindterm: WG, regels: ['Een taart is in 6 even grote stukken verdeeld.', 'De hele taart kost 18 euro.', 'Eén stuk taart kost {n} euro.'], ans: [3],
        hint: ['Deel de prijs door het aantal stukken.'], uitleg: ['18 : 6 = 3', 'Eén stuk kost 3 euro.'] },
      { id: 'e', type: 'invul', regels: ['Welk deel van de strook is **niet** gekleurd?'], rij: [{ fig: 't_strook', invul: '{f} deel' }], ans: [[3, 5]],
        hint: ['Tel de witte hokjes. Dat is de teller.'], uitleg: ['3 van de 5 hokjes zijn wit.', 'Dus [3/5] deel is niet gekleurd.'] },
      { id: 'f', type: 'kleur', regels: ['✏️ Kleur [3/4] deel van het vierkant.'], kleur: 'roze', figs: [{ fig: 't_vk4', nodig: 3 }],
        hint: ['Het vierkant heeft 4 stukken. Kleur er 3.'], uitleg: ['Kleur 3 van de 4 stukken.'] },
      { id: 'g', type: 'kleur', regels: ['✏️ Kleur [2/7] deel van de figuur.'], kleur: 'groen', figs: [{ fig: 't_r72', nodig: 4, voorbeeld: [0, 1, 7, 8] }],
        hint: ['De figuur heeft 14 hokjes. 14 : 7 = 2.', '[1/7] deel = 2 hokjes. Hoeveel is dan [2/7] deel?'], uitleg: ['14 : 7 = 2 hokjes per zevende.', '[2/7] deel = 2 × 2 = 4 hokjes.'] },
      { id: 'h', type: 'mk', regels: ['Sam eet [1/2] pizza.', 'Jan eet [1/4] pizza.', 'Wie eet de meeste pizza?'], opties: ['Sam', 'Jan'], ans: 0,
        hint: ['Denk aan twee pizza\'s: één in 2 stukken, één in 4 stukken.', 'Welk stuk is groter: een half of een vierde?'],
        uitleg: ['Een halve pizza is groter dan een kwart pizza.', 'Sam eet de meeste pizza.'] }
    ]
  });

  window.PARAGRAAF = P;
  (window.PARAGRAFEN_DEF = window.PARAGRAFEN_DEF || {})[P.id] = P;
})();
