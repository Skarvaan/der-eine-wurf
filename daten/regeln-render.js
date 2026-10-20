/* ============================================================
   REGELN — gemeinsame Darstellung
   ============================================================

   Baut aus einer (bereits nach Rolle gefilterten) Liste von
   REGELN-Einträgen das HTML für die Zone "Regeln" im
   Spielbereich UND für die öffentliche Seite regelwerk.html.

   Bewusst OHNE jede Abhängigkeit zu app.js oder Firebase: Wer
   diese Datei aufruft, entscheidet selbst, welche Einträge
   sichtbar sind (siehe "nurSL" in regeln.js). Diese Datei kennt
   keine Anmeldung und keine Rollen. Das hält die öffentliche
   Seite unabhängig: Sie braucht keine Firebase-Verbindung und
   darf auch keine auslösen.

   LAYOUT: eine einzige, gut lesbare Spalte (.regel-karte) statt
   der früheren Zeitungsspalten. Mit den neuen Kästen, Tabellen
   und Beispielen sind die Karten so unterschiedlich hoch, dass
   mehrere Spalten am Handy ohnehin nur eine wären und am iPad
   das Auge ständig zwischen Spalten springen müsste. Eine Spalte
   mit begrenzter Zeilenlänge liest sich an beiden Geräten ruhig.
   ============================================================ */

import { GRUPPEN_INFO } from './regeln.js';

function sicher(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Einzige erlaubte Auszeichnung in regeln.js: **fett**. Läuft
   NACH sicher(), deshalb kann über die Regeltexte kein fremdes
   HTML in die Seite gelangen. */
function text(roh) {
  return sicher(roh).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}

/* ------------------------------------------------------------
   Symbole — schlichte Strich-Icons im 24er-Raster, alle mit
   currentColor, damit die Farbe aus dem CSS kommt. Ein Schlüssel,
   den es hier nicht gibt, ergibt einen einfachen Punkt statt
   eines Fehlers.
   ------------------------------------------------------------ */
const PFADE = {
  wuerfel:   '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>',
  frage:     '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6V14"/><circle cx="12" cy="17" r=".9" fill="currentColor"/>',
  stern:     '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  blitz:     '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
  hoch:      '<path d="M12 19V5M6 11l6-6 6 6"/>',
  runter:    '<path d="M12 5v14M6 13l6 6 6-6"/>',
  waage:     '<path d="M12 4v16M7 20h10M5 8h14M5 8l-2.5 6a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0z"/>',
  hand:      '<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 10.5V5a1.5 1.5 0 0 1 3 0v6M14 10.5V6.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.5a6 6 0 0 1-4.6-2.2L3.5 15a1.5 1.5 0 0 1 2.3-2L8 15"/>',
  auge:      '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  kampf:     '<path d="M4 4l10 10M20 4L10 14M7 17l-3 3M17 17l3 3M5.5 14.5l4 4M18.5 14.5l-4 4"/>',
  schwert:   '<path d="M14.5 4H20v5.5L10 19.5 4.5 14z"/><path d="M7 17l-3 3M4.5 14l5.5 5.5"/>',
  gruppe:    '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M3 19a6 6 0 0 1 12 0M15 14.5a4.5 4.5 0 0 1 6 4.5"/>',
  pfeil:     '<path d="M4 12h15M13 6l6 6-6 6"/>',
  koerper:   '<rect x="2.5" y="9" width="4" height="6" rx="1"/><rect x="17.5" y="9" width="4" height="6" rx="1"/><path d="M6.5 12h11"/>',
  geschick:  '<path d="M13 2.5L4 14h7l-1 7.5L20 10h-7z"/>',
  verstand:  '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  wahrnehmung: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  wille:     '<path d="M12 2.5l8 3v6c0 5-3.5 9-8 10.5-4.5-1.5-8-5.5-8-10.5v-6z"/>',
  ausstrahlung: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  start:     '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  ziel:      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
  funke:     '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5z"/>',
  feder:     '<path d="M20 4c-7 0-13 5-13 13v3M7 17c6 0 10-4 11-9M4 20l3-3"/>',
  tropfen:   '<path d="M12 3c3.5 4.5 6 7.8 6 11a6 6 0 0 1-12 0c0-3.2 2.5-6.5 6-11z"/>',
  plus:      '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  drei:      '<circle cx="12" cy="6.5" r="2.5"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="17.5" cy="16.5" r="2.5"/>',
  eins:      '<circle cx="12" cy="12" r="9"/><path d="M10 9l2.5-1.5V17"/>',
  sprechen:  '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  schild:    '<path d="M12 2.5l8 3v6c0 5-3.5 9-8 10.5-4.5-1.5-8-5.5-8-10.5v-6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  schluessel:'<circle cx="7.5" cy="12" r="4"/><path d="M11.5 12H21M17.5 12v3.5M20.5 12v2.5"/>',
  herz:      '<path d="M12 20s-7.5-4.5-9.3-9.3C1.5 7.3 3.6 4.5 6.8 4.5c2 0 3.6 1.2 5.2 3.2 1.6-2 3.2-3.2 5.2-3.2 3.2 0 5.3 2.8 4.1 6.2C19.5 15.5 12 20 12 20z"/>',
  zahnrad:   '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/><circle cx="12" cy="12" r="6.5"/>',
  gewicht:   '<path d="M8 8a4 4 0 1 1 8 0M5.5 8h13l2 12h-17z"/>',
  uhr:       '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>',
  mauer:     '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/>',
  haken:     '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16.5 9"/>',
  narbe:     '<path d="M5 19L19 5M7 11l2 2M10 8l2 2M13 15l2 2M16 12l2 2"/>',
  buch:      '<path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5V20"/>',
  kerze:     '<rect x="8.5" y="10" width="7" height="11" rx="1"/><path d="M12 10V7.5M12 2.5c1.5 1.7 2 2.8 0 5-2-2.2-1.5-3.3 0-5z"/>',
  steuer:    '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2.5V10M12 14v7.5M2.5 12H10M14 12h7.5"/>',
  werkzeug:  '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2zM4 20l3.5-3.5"/>',
  tasche:    '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  muenze:    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 9.5v5"/>',
  lupe:      '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
  mond:      '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/>',
  hut:       '<path d="M3 17h18M6 17V9.5A1.5 1.5 0 0 1 7.5 8h9A1.5 1.5 0 0 1 18 9.5V17M6 13.5h12"/>',
  person:    '<circle cx="12" cy="7.5" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  karte:     '<path d="M3 6l6-2.5 6 2.5 6-2.5v14.5L15 20.5 9 18l-6 2.5zM9 3.5V18M15 6v14.5"/>',
  welt:      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
  idee:      '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  warnung:   '<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".9" fill="currentColor"/>',
  szene:     '<path d="M4 4h16v12H8l-4 4z"/><path d="M8 8.5h8M8 11.5h5"/>'
};

export function symbol(name, klasse = 'symbol') {
  const pfad = PFADE[name] || '<circle cx="12" cy="12" r="3" fill="currentColor"/>';
  return `<svg class="${klasse}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pfad}</svg>`;
}

/* Symbol pro Gruppe. Eine neue Gruppe ohne Eintrag bekommt den
   Würfel, das ist kein Fehler. */
const GRUPPEN_SYMBOLE = {
  'Grundregeln':            'wuerfel',
  'Dein Charakter':         'person',
  'Reden und Ermitteln':    'lupe',
  'Gesundheit':             'herz',
  'Kampf':                  'schwert',
  'Horror und Stabilität':  'mond',
  'Technik und Ausrüstung': 'zahnrad',
  'Fortschritt':            'hoch',
  'Welten':                 'welt',
  'Spielleitung':           'buch'
};

/* Etikett und Symbol pro Genre der Beispielkästen. Die Farbe
   kommt aus stil.css (.genre-wesen usw.). */
const GENRES = {
  wesen:     { name: 'Übernatürlich',  icon: 'funke' },
  steampunk: { name: 'Steampunk',      icon: 'zahnrad' },
  mystery:   { name: 'Murder Mystery', icon: 'lupe' },
  fantasy:   { name: 'Fantasy',        icon: 'schwert' },
  horror:    { name: 'Horror',         icon: 'mond' }
};

/* Aus "Horror und Stabilität" wird "horror-und-stabilitaet" —
   als Sprungziel für die Kapitelleiste. Umlaute werden ersetzt,
   damit die Anker auch in alten Safari-Versionen sicher greifen. */
export function gruppenAnker(gruppe) {
  return 'kapitel-' + gruppe.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Reihenfolge der Gruppen aus dem ersten Auftreten in der Liste:
 * Eine neue "gruppe" in regeln.js taucht automatisch an der
 * richtigen Stelle auf, ohne dass hier etwas gepflegt werden müsste.
 */
export function regelGruppen(eintraege) {
  return [...new Set(eintraege.map(r => r.gruppe))];
}

/* Alles, was die Suche durchsuchen soll, als ein langer String.
   Weil die Einträge jetzt aus vielen Feldern bestehen, reicht es
   nicht mehr, nur titel und text zu prüfen. */
function suchText(r) {
  const teile = [r.titel, r.kurz, r.formel, r.merke, r.schlagworte,
    r.warnung?.text,
    ...(r.skala || []).flatMap(s => [s.wert, s.text]),
    ...(r.stufen || []).flatMap(s => [s.titel, s.text]),
    ...(r.zustaende || []).flatMap(s => [s.titel, s.text]),
    ...(r.zonen || []).flatMap(s => [s.titel, s.text]),
    ...(r.schritte || []).flatMap(s => [s.titel, s.text]),
    ...(r.punkte || []).flatMap(s => [s.titel, s.text]),
    ...(r.marken || []),
    ...(r.tabelle ? [...r.tabelle.kopf, ...r.tabelle.zeilen.flat()] : []),
    ...(r.beispiele || []).flatMap(b => [b.text, GENRES[b.genre]?.name])];
  return teile.filter(Boolean).join(' ').toLowerCase();
}

/* ------------------------------------------------------------
   Bausteine einer Regelkarte
   ------------------------------------------------------------ */

function skalaHtml(skala) {
  return `<div class="sg-leiste">${skala.map(s =>
    `<div><b>${sicher(s.wert)}</b><span>${sicher(s.text)}</span></div>`).join('')}</div>`;
}

function stufenHtml(stufen) {
  return `<div class="ergebnis-leiter">${stufen.map(s =>
    `<div class="stufe ${sicher(s.ton)}"><b>${sicher(s.titel)}</b><span>${text(s.text)}</span></div>`).join('')}</div>`;
}

function zustaendeHtml(zustaende) {
  return `<div class="zustand-leiter">${zustaende.map(z =>
    `<div class="${sicher(z.ton)}"><b>${sicher(z.titel)}</b><span>${text(z.text)}</span></div>`).join('')}</div>`;
}

function zonenHtml(zonen) {
  return `<div class="zonen-leiste">${zonen.map((z, i) =>
    `<div class="zonen-stufe" style="--stufe:${i}"><b>${sicher(z.titel)}</b><span>${sicher(z.text)}</span></div>`).join('')}</div>`;
}

function schritteHtml(schritte) {
  return `<div class="schritt-kette">${schritte.map((s, i) => `
    <div class="schritt-glied"><span class="schritt-nr">${i + 1}</span>
      <div class="schritt-text"><h4>${sicher(s.titel)}</h4><p>${text(s.text)}</p></div></div>`).join('')}</div>`;
}

/* Tabellen bekommen data-label pro Zelle: Auf schmalen
   Bildschirmen klappt stil.css jede Zeile zu einem kleinen
   Kasten um und zeigt die Spaltenüberschrift davor an. Eine
   echte Tabelle mit fünf Spalten wäre am Telefon sonst nur mit
   seitlichem Scrollen lesbar. Zweispaltige Tabellen bleiben
   Tabellen, die passen auch schmal. */
function tabelleHtml(t) {
  const breit = t.kopf.length > 2 ? ' tabelle-breit' : '';
  // Ist die letzte Spalte durchweg ein kurzer Wert (Schaden,
  // Kosten, SG), wird sie rechtsbündig hervorgehoben. Bei langem
  // Text dort (z. B. „Deckt ab“ bei den Fertigkeiten) nicht,
  // sonst würde die Zeile nicht umbrechen und überlaufen.
  const kurz = t.zeilen.every(z => String(z[z.length - 1]).length <= 16) ? ' wert-spalte' : '';
  // Umgekehrt: Ist die ERSTE Spalte durchweg ein kurzer Name,
  // wird sie hervorgehoben und bricht nicht um.
  const name = !kurz && t.zeilen.every(z => String(z[0]).length <= 18) ? ' name-spalte' : '';
  return `<div class="regel-tabelle-huelle"><table class="regel-tabelle${breit}${kurz}${name}">
    <thead><tr>${t.kopf.map(k => `<th>${sicher(k)}</th>`).join('')}</tr></thead>
    <tbody>${t.zeilen.map(z => `<tr>${z.map((zelle, i) =>
      `<td data-label="${sicher(t.kopf[i] || '')}">${text(zelle)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

function markenHtml(marken) {
  return `<p class="marken">${marken.map(m => `<span>${sicher(m)}</span>`).join('')}</p>`;
}

function punkteHtml(punkte) {
  return `<ul class="regel-punkte">${punkte.map(p => `
    <li>
      <span class="punkt-icon">${symbol(p.icon)}</span>
      <div class="punkt-text">${p.titel ? `<b>${sicher(p.titel)}</b>` : ''}<span>${text(p.text)}</span></div>
    </li>`).join('')}</ul>`;
}

function warnungHtml(w) {
  return `<div class="regel-warnung${w.kritisch ? ' kritisch' : ''}">
    ${symbol('warnung', 'kasten-icon')}<p>${text(w.text)}</p></div>`;
}

function merkeHtml(m) {
  return `<div class="regel-merke">${symbol('idee', 'kasten-icon')}<p>${text(m)}</p></div>`;
}

function beispieleHtml(beispiele) {
  return beispiele.map(b => {
    const g = GENRES[b.genre] || { name: 'Beispiel', icon: 'szene' };
    return `<figure class="beispiel genre-${sicher(b.genre || 'allgemein')}">
      <figcaption>${symbol(g.icon, 'genre-icon')}<span>Am Tisch · ${sicher(g.name)}</span></figcaption>
      <p>${text(b.text)}</p>
    </figure>`;
  }).join('');
}

function karteHtml(r) {
  return `
    <article class="regel-karte">
      <h3 class="regel-titel">${sicher(r.titel)}</h3>
      ${r.kurz      ? `<p class="regel-kurz">${text(r.kurz)}</p>` : ''}
      ${r.formel    ? `<div class="formel">${sicher(r.formel)}</div>` : ''}
      ${r.skala     ? skalaHtml(r.skala) : ''}
      ${r.stufen    ? stufenHtml(r.stufen) : ''}
      ${r.zustaende ? zustaendeHtml(r.zustaende) : ''}
      ${r.zonen     ? zonenHtml(r.zonen) : ''}
      ${r.schritte  ? schritteHtml(r.schritte) : ''}
      ${r.tabelle   ? tabelleHtml(r.tabelle) : ''}
      ${r.marken    ? markenHtml(r.marken) : ''}
      ${r.punkte    ? punkteHtml(r.punkte) : ''}
      ${r.warnung   ? warnungHtml(r.warnung) : ''}
      ${r.merke     ? merkeHtml(r.merke) : ''}
      ${r.beispiele ? beispieleHtml(r.beispiele) : ''}
    </article>`;
}

/**
 * Kapitelleiste: eine Reihe Sprungmarken zu den Gruppen. Nur die
 * öffentliche Seite benutzt sie; im Spielbereich gibt es dafür
 * keinen Platz unter den beiden klebenden Kopfleisten.
 */
export function regelNavHtml(sichtbar) {
  return regelGruppen(sichtbar).map(g =>
    `<a class="kapitel-chip" href="#${gruppenAnker(g)}">${symbol(GRUPPEN_SYMBOLE[g] || 'wuerfel')}<span>${sicher(g)}</span></a>`
  ).join('');
}

/**
 * Baut das HTML für eine gefilterte, gruppierte Regelliste.
 * @param {object[]} sichtbar  Einträge, die diese Rolle sehen darf
 *                             (Rollenfilter macht der Aufrufer)
 * @param {string}   suche     Suchtext, Groß-/Kleinschreibung egal
 */
export function regelListeHtml(sichtbar, suche = '') {
  const s = suche.trim().toLowerCase();
  const treffer = sichtbar.filter(r => !s || suchText(r).includes(s));

  if (!treffer.length) {
    return `<div class="regel-leer">${symbol('lupe', 'kasten-icon')}
      <p><b>Nichts gefunden.</b> Im Zweifel gilt: W20 + Attribut gegen 15.</p></div>`;
  }

  const zaehler = s
    ? `<p class="regel-zaehler">${treffer.length} Treffer für „${sicher(suche.trim())}“</p>`
    : '';

  return zaehler + regelGruppen(sichtbar).map(gruppe => {
    const eintraege = treffer.filter(r => r.gruppe === gruppe);
    if (!eintraege.length) return '';
    const info = GRUPPEN_INFO[gruppe];

    return `
      <section class="regel-kapitel" id="${gruppenAnker(gruppe)}">
        <header class="kapitel-kopf">
          <span class="kapitel-icon">${symbol(GRUPPEN_SYMBOLE[gruppe] || 'wuerfel')}</span>
          <div class="kapitel-kopf-text">
            <h2>${sicher(gruppe)}</h2>
            ${info ? `<p>${sicher(info)}</p>` : ''}
          </div>
        </header>
        ${eintraege.map(karteHtml).join('')}
      </section>`;
  }).join('');
}
