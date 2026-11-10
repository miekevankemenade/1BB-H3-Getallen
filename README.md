# 1BB H3 Getallen – § 3.3 Breuken en § 3.4 Decimale getallen (VMBO Basis)

Oefenapp voor klas 1BB bij paragraaf 3.3 *Breuken* en 3.4 *Decimale getallen en breuken*.
De app is gebouwd in hetzelfde format als *2BB H2 – oefenen voor de toets*.

## Wat zit erin?

| Bestand | Wat is het? |
|---|---|
| `index.html` | De app voor leerlingen. |
| `docent.html` | De pagina waar jij de resultaten bekijkt. |
| `config.js` | De Supabase-gegevens en de naam van deze app (`MODULE`). |
| `videos/` | De vier theoriefilmpjes (mp4, Vlaamse stem). |
| `supabase.sql` | Script voor de tabellen (bestaan al in het project). |

**Tabbladen**
- **Wat is een breuk?** – filmpje, opdracht 1 t/m 3 (teller en noemer, prijs van een deel)
- **Welk deel is gekleurd?** – filmpje, opdracht 4 t/m 9 (breuk aflezen uit een figuur)
- **Zelf kleuren** – opdracht 10 en 11 (een deel van een figuur kleuren)
- **Extra oefenen** – opdracht 12a t/m 12h
- **Decimale getallen** (§ 3.4) – filmpje, opdracht 13 t/m 16 (maatbekers, getallenlijn, 0,7 = 0,70)
- **Breuk en decimaal getal** (§ 3.4) – filmpje, opdracht 17 t/m 20 (breuk ↔ decimaal getal, tienden en honderdsten)
- **Oefentoets** – 20 vragen uit de app, zonder hints en met één poging

**Eerst de uitleg:** een leerling kan pas verder met de opdrachten als hij het filmpje helemaal heeft bekeken.

**Soorten vragen:** getal, meerkeuze, stappen, breuk invullen (teller en noemer), zelf kleuren (klik op de stukken van een figuur) en een pijl op de getallenlijn zetten.
Bij breuken telt een gelijkwaardige breuk ook als goed (bijvoorbeeld 3/5 bij 6/10), behalve bij 10c.

**Punten:** 2 punten als het in één keer goed is; 1 punt bij de 2e poging of na een hint; 0 punten daarna.
**Cijfer:** (punten ÷ totaal × 9) + 1.

Alle teksten, getallen en figuren zijn zelf gemaakt.
Ze volgen de leerdoelen van de methode, maar zijn er geen kopie van.

## Online zetten

De app staat op Netlify. Elke wijziging in deze repository komt daar vanzelf online als Netlify aan GitHub gekoppeld is.
Anders sleep je de bestanden naar Netlify (Deploys).

## Docentenpagina

Open `docent.html` en vul je e-mailadres in.
Je krijgt een inloglink in je mail.
Er is geen wachtwoord meer op de pagina.
Alleen e-mailadressen in de tabel `docenten` kunnen inloggen.

Het adres van `docent.html` moet in Supabase staan bij **Authentication → URL Configuration → Redirect URLs**.

## Supabase

Deze app gebruikt hetzelfde Supabase-project als je andere oefenapps.
De kolom `module` (`1BB H3 Getallen – § 3.3 en 3.4`; oudere resultaten heten nog `1BB H3 Getallen – § 3.3 Breuken`) laat zien bij welke app een resultaat hoort.
Op de docentenpagina kies je bovenaan bij **App** welke app je wilt zien.
