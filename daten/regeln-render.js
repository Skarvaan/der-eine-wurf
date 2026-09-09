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
   ============================================================ */

function sicher(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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

    return `
      <h3 class="unter">${sicher(gruppe)}</h3>
      <div class="bogen-gitter gitter-drei">
        ${eintraege.map(r => `
          <div class="karte">
            <div class="karte-kopf"><h2>${sicher(r.titel)}</h2></div>
            <p class="regel-text">${sicher(r.text)}</p>
          </div>`).join('')}
      </div>`;
  }).join('');
}
