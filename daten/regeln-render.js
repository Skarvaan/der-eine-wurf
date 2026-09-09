/* ============================================================
   REGELN — gemeinsame Darstellung
   ============================================================

   Baut aus einer (bereits nach Rolle gefilterten) Liste von
   REGELN-Einträgen das HTML für die Zone "Regeln" im
   Spielbereich UND für die öffentliche Seite regelwerk.html.

   Bewusst OHNE jede Abhängigkeit zu app.js oder Firebase: Wer
   diese Datei aufruft, entscheidet selbst, welche Einträge
   sichtbar sind (siehe "nurSL" in regeln.js) — diese Datei
   kennt keine Anmeldung und keine Rollen. Das hält die
   öffentliche Seite unabhängig: sie braucht keine Firebase-
   Verbindung und darf auch keine auslösen.

   LAYOUT: bewusst CSS-Spalten (.regelwerk-spalten, siehe
   stil.css) statt eines Rasters (.bogen-gitter). Ein Raster
   streckt jede ZEILE auf die höchste Karte darin — bei so
   unterschiedlich langen Texten wie hier reißt das große Lücken
   unter den kürzeren Karten. CSS-Spalten lassen jede Karte in
   ihrer eigenen Höhe direkt an die vorherige andocken (wie ein
   Zeitungslayout), ganz ohne JavaScript.
   ============================================================ */

function sicher(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Ein kleines Messing-Symbol pro Gruppe — dieselbe Wappen-Optik
   wie die sechs Attribute auf der öffentlichen Kurzfassung
   (index.html). Taucht eine neue Gruppe in regeln.js auf, für
   die es hier noch kein Symbol gibt, erscheint einfach keins —
   das ist kein Fehler, nur weniger schmückend. */
const GRUPPEN_SYMBOLE = {
  'Grundmechanik': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="3" y="3" width="18" height="18" rx="4"/>
    <circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="8" cy="12" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="8" cy="16" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="12" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"/>
  </svg>`,
  'Attribute & Fertigkeiten': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
    <circle cx="12" cy="7" r="4"/>
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke-linecap="round"/>
  </svg>`,
  'Eigenschaften': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
    <path d="M3 12 12 3h6a3 3 0 0 1 3 3v6l-9 9a2 2 0 0 1-3 0l-6-6a2 2 0 0 1 0-3z"/>
    <circle cx="15" cy="9" r="1.4" fill="currentColor" stroke="none"/>
  </svg>`,
  'Gesundheit': `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 20s-7-4.4-9.5-9C1 8 2 4 6 4c2 0 4 1.5 6 4 2-2.5 4-4 6-4 4 0 5 4 3.5 7-2.5 4.6-9.5 9-9.5 9z"/>
  </svg>`,
  'Kampf': `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/>
    <line x1="4" y1="8" x2="8" y2="4"/><line x1="20" y1="8" x2="16" y2="4"/>
  </svg>`,
  'Stabilität': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
    <circle cx="12" cy="12" r="9"/>
    <path d="M13 4l-3 8h4l-3 8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  'Technik': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
    <circle cx="12" cy="12" r="6"/>
    <rect x="10.5" y="1" width="3" height="6" rx="1" fill="currentColor" stroke="none"/>
    <rect x="10.5" y="1" width="3" height="6" rx="1" fill="currentColor" stroke="none" transform="rotate(60 12 12)"/>
    <rect x="10.5" y="1" width="3" height="6" rx="1" fill="currentColor" stroke="none" transform="rotate(120 12 12)"/>
    <rect x="10.5" y="1" width="3" height="6" rx="1" fill="currentColor" stroke="none" transform="rotate(180 12 12)"/>
    <rect x="10.5" y="1" width="3" height="6" rx="1" fill="currentColor" stroke="none" transform="rotate(240 12 12)"/>
    <rect x="10.5" y="1" width="3" height="6" rx="1" fill="currentColor" stroke="none" transform="rotate(300 12 12)"/>
  </svg>`,
  'Fortschritt': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="20" x2="12" y2="4"/><path d="M6 10l6-6 6 6"/>
  </svg>`,
  'Spielleitung': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
    <path d="M12 6c-2-1.5-5-2-8-1v13c3-1 6-.5 8 1 2-1.5 5-2 8-1V5c-3-1-6-.5-8 1z"/>
    <line x1="12" y1="6" x2="12" y2="19"/>
  </svg>`
};

/**
 * Reihenfolge der Gruppen aus dem ersten Auftreten in der Liste —
 * eine neue "gruppe" in regeln.js taucht automatisch an der
 * richtigen Stelle auf, ohne dass hier etwas gepflegt werden müsste.
 */
export function regelGruppen(eintraege) {
  return [...new Set(eintraege.map(r => r.gruppe))];
}

/**
 * Baut das HTML für eine gefilterte, gruppierte Regelliste.
 * @param {object[]} sichtbar  Einträge, die diese Rolle sehen darf
 *                             (Rollenfilter macht der Aufrufer)
 * @param {string}   suche     Suchtext, Groß-/Kleinschreibung egal
 */
export function regelListeHtml(sichtbar, suche = '') {
  const s = suche.trim().toLowerCase();
  const treffer = sichtbar.filter(r =>
    !s || r.titel.toLowerCase().includes(s)
       || r.text.toLowerCase().includes(s)
       || (r.schlagworte || '').toLowerCase().includes(s));

  if (!treffer.length) {
    return '<div class="karte"><p class="hinweis-schild">Nichts gefunden. Im Zweifel: W20 + Attribut gegen 15.</p></div>';
  }

  return regelGruppen(sichtbar).map(gruppe => {
    const eintraege = treffer.filter(r => r.gruppe === gruppe);
    if (!eintraege.length) return '';

    const symbol = GRUPPEN_SYMBOLE[gruppe];

    return `
      <h3 class="unter regel-gruppen-titel">
        ${symbol ? `<span class="gruppen-icon">${symbol}</span>` : ''}
        <span class="gruppen-name">${sicher(gruppe)}</span>
      </h3>
      <div class="regelwerk-spalten">
        ${eintraege.map(r => `
          <div class="karte">
            <div class="karte-kopf"><h2>${sicher(r.titel)}</h2></div>
            <p class="regel-text">${sicher(r.text)}</p>
          </div>`).join('')}
      </div>`;
  }).join('');
}
