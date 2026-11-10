# Wiskunde oefenapps – 1 Basis

Oefenapp voor VMBO Basis met geanimeerde uitleg, opdrachten, hints, rekenmachine, voorleesstem en een mini-toets.
Het werk van leerlingen wordt opgeslagen in Supabase. De docent ziet per opdracht wat leerlingen fout doen.

## Bestanden

| Bestand | Wat doet het |
|---|---|
| `index.html` | Startpagina met alle paragrafen |
| `oefen.html?p=3-3` | De oefenapp voor één paragraaf |
| `docent.html` | Docentenoverzicht: resultaten per klas en foutenanalyse |
| `engine.js`, `figuren.js`, `stijl.css` | De werking en de huisstijl (hoef je niet te veranderen) |
| `paragrafen/3-3.js` | De inhoud van § 3.3 Breuken |
| `paragrafen/lijst.js` | Lijst van alle paragrafen |
| `config.js` | Adres en sleutel van je Supabase-project |
| `supabase-setup.sql` | Maakt de tabellen in de database |

## Eenmalig instellen

1. Maak op supabase.com een nieuw project (gratis).
2. Open in Supabase de **SQL Editor**, plak `supabase-setup.sql` en klik op **Run**.
3. Zet bij **Project Settings → API** de Project URL en de publishable key in `config.js`.
4. Zet alle bestanden in een nieuwe GitHub-repository en zet **GitHub Pages** aan (branch `main`, map `/root`).
5. Zet in Supabase bij **Authentication → URL Configuration** de Site URL op het adres van docent.html op GitHub Pages.
6. Open `docent.html`, vul je e-mailadres in en klik op de link in je mail. Maak daarna een klas. Je krijgt een klascode.
7. Tip: zet daarna in Supabase bij **Authentication → Sign In / Providers** "Allow new users to sign up" uit, zodat alleen jij een account hebt.

## Leerlingen

Leerlingen openen `index.html`, kiezen de paragraaf en vullen in: klascode, naam en een zelfgekozen pincode van 4 cijfers.
De volgende les gaan ze verder waar ze waren. Pincode vergeten? Klik in het docentenoverzicht op 🔑.

## Een paragraaf toevoegen

1. Kopieer `paragrafen/3-3.js` naar bijvoorbeeld `paragrafen/3-4.js`.
2. Verander `id`, `titel`, de figuren en de onderdelen.
3. Zet een regel erbij in `paragrafen/lijst.js`.
De paragraaf verschijnt dan vanzelf op de startpagina en in het docentenoverzicht.

## Punten

- 2 punten: in één keer goed, zonder hint.
- 1 punt: goed na een hint of na een fout.
- 0 punten: na 4 fouten. De app laat dan stap voor stap zien hoe het moet.
