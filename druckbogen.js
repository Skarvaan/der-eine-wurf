/* ============================================================
   DRUCKBOGEN — Charaktere als PDF sichern
   ============================================================

   Warum über den Druckdialog und nicht über eine PDF-Bibliothek?

     - Kein Build-Schritt, kein zusätzliches CDN: Jede Bibliothek
       (jsPDF & Co.) wäre eine weitere Abhängigkeit, die offline
       fehlen kann und ihre eigene Schrift- und Umbruchlogik
       mitbringt.
     - Safari auf dem iPad kann aus dem Druckdialog direkt ein
       PDF machen (Teilen-Symbol oben → „In Dateien sichern“).
       Am Rechner heißt das Ziel „Als PDF speichern“.
     - Der Browser bricht Text und Seiten selbst sauber um, auch
       lange deutsche Wörter.

   Ablauf: Der Bogen wird in ein eigenes Element #druckbogen
   direkt unter <body> geschrieben. Die Klasse „druckt-bogen“ am
   <body> sorgt in stil.css (@media print) dafür, dass beim Drucken
   NUR dieser Bogen erscheint und nicht die App drumherum. Der
   Dokumenttitel wird kurz auf den Charakternamen gesetzt, weil
   Safari und Chrome daraus den Dateinamen des PDFs bilden.

   Dieses Modul kennt weder Firestore noch Firebase Auth. Es
   bekommt fertige Charakterobjekte und zeichnet sie nur. Wer
   was sehen darf, entscheiden weiterhin firestore.rules: Die SL
   kann nur drucken, was in ihrer Runde liegt, ein Spieler nur,
   was er selbst lesen darf.
   ============================================================ */

import { sicher } from './app.js';

/* Bewusst eigene Liste statt Import aus charakter.js: Die Zonen
   kennen einander laut Architektur nicht, und der Druckbogen wird
   von charakter.js UND sl.js benutzt. */
const ATTRIBUTE = {
  koerper: 'Körper', geschick: 'Geschick', verstand: 'Verstand',
  wahrnehmung: 'Wahrnehmung', wille: 'Wille', ausstrahlung: 'Ausstrahlung'
};

const FERTIGKEITEN = {
  athletik: 'Athletik', nahkampf: 'Nahkampf', fernkampf: 'Fernkampf',
  heimlichkeit: 'Heimlichkeit', fingerfertigkeit: 'Fingerfertigkeit',
  technik: 'Technik', handwerk: 'Handwerk', ermittlung: 'Ermittlung',
  wissen: 'Wissen', mysterien: 'Mysterien', heilkunde: 'Heilkunde',
  ueberzeugen: 'Überzeugen', widerstand: 'Widerstand',
  ueberleben: 'Überleben', steuern: 'Steuern'
};

/* Dieselben Formeln wie im Spielbogen. Alte Charaktere ohne
   einzelne Felder dürfen den Druck nicht zum Absturz bringen,
   deshalb überall mit Rückfallwert gelesen. */
const maxLp   = (c) => 10 + (c.attribute?.koerper || 0) * 2 + (c.bonusLp || 0);
const maxStab = (c) => 10 + (c.attribute?.wille || 0) * 2 + (c.bonusStab || 0);
const vert    = (c) => 10 + (c.attribute?.geschick || 0) + (c.fertigkeiten?.nahkampf || 0);

/** Zeilenumbrüche aus Textfeldern (Ausrüstung, Notizbuch) erhalten */
const mitUmbruch = (text) => sicher(text || '').replace(/\n/g, '<br>');

/** Eine Zeile „Bezeichnung: Text“, leer bleibt sie weg */
function zeile(bez, text) {
  const t = (text || '').trim();
  if (!t) return '';
  return `<div class="db-zeile"><span class="db-bez">${bez}</span><span>${mitUmbruch(t)}</span></div>`;
}

/**
 * Baut das HTML für EINEN Charakter. Jeder Charakter beginnt auf
 * einer neuen Seite (siehe .db-blatt in stil.css), damit die SL
 * die Bögen einzeln ausdrucken oder weitergeben kann.
 *
 * @param {object} c          Charakterobjekt wie in Firestore
 * @param {object} [extra]
 * @param {string} [extra.notizbuch]  privater Notizbuchtext; nur
 *        mitgeben, wenn die druckende Person ihn ohnehin sehen darf
 */
function blatt(c, extra = {}) {
  const istWesen = !!c.wesen;
  /* Beim Wesen nimmt die Gabe die Plätze 2 und 3 ein; der Text,
     der dort noch stehen mag, gilt nicht (siehe Baukasten). Durch
     Steigerung dazugekaufte Stärken hängen ab Platz 4 an und
     zählen für alle. */
  const alle = c.staerken || [];
  const staerken = (istWesen ? [alle[0], ...alle.slice(3)] : alle)
    .filter(s => (s || '').trim());
  const makel = (c.makel || []).filter(m => (m || '').trim());
  const narben = (c.narben || []).filter(n => (n || '').trim());

  // Gabe, Bann und Zeichen stehen beim Wesen im eigenen Kasten
  // „Natur“, hier nicht noch einmal.
  const eigenschaften = [
    ...staerken.map(s => ['Stärke', s]),
    ...makel.map(m => ['Makel', m]),
    ...narben.map(n => ['Narbe', n])
  ];

  const stand = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

  return `
    <section class="db-blatt">
      <header class="db-kopf">
        <div class="db-titel">
          <h1>${sicher(c.name || 'Ohne Namen')}</h1>
          ${(c.hintergrund || '').trim() ? `<p class="db-unter">${sicher(c.hintergrund)}</p>` : ''}
        </div>
        <div class="db-marke">
          Der Eine Wurf<br>
          <span>${istWesen ? 'Wesen' : 'Mensch'}${c.fertig ? '' : ' · noch im Bau'}</span>
        </div>
      </header>

      <div class="db-werte">
        <div><span>Lebenspunkte</span><b>${c.lp ?? maxLp(c)} / ${maxLp(c)}</b></div>
        <div><span>Stabilität</span><b>${c.stab ?? maxStab(c)} / ${maxStab(c)}</b></div>
        <div><span>Verteidigung</span><b>${vert(c)}</b></div>
        <div><span>Schicksal</span><b>${c.sp || 0} / 3</b></div>
        <div><span>Fortschritt</span><b>${c.fp || 0} FP</b></div>
      </div>

      <div class="db-spalten">
        <div class="db-kasten">
          <h2>Attribute</h2>
          <table class="db-tabelle">
            ${Object.entries(ATTRIBUTE).map(([k, bez]) =>
              `<tr><td>${bez}</td><td>${c.attribute?.[k] ?? 0}</td></tr>`).join('')}
          </table>
        </div>
        <div class="db-kasten">
          <h2>Fertigkeiten</h2>
          <table class="db-tabelle db-zweispaltig">
            ${Object.entries(FERTIGKEITEN).map(([k, bez]) => {
              const w = c.fertigkeiten?.[k] ?? 0;
              return `<tr class="${w ? '' : 'db-null'}"><td>${bez}</td><td>${w}</td></tr>`;
            }).join('')}
          </table>
        </div>
      </div>

      <div class="db-kasten">
        <h2>Eigenschaften</h2>
        ${eigenschaften.length ? `
        <table class="db-tabelle db-eigen">
          ${eigenschaften.map(([art, text]) =>
            `<tr><td class="db-art">${art}</td><td>${sicher(text)}</td></tr>`).join('')}
        </table>` : '<p class="db-leer">Noch keine eingetragen.</p>'}
      </div>

      ${istWesen ? `
      <div class="db-kasten">
        <h2>Natur</h2>
        ${zeile('Gabe', c.gabe)}${zeile('Bann', c.bann)}${zeile('Zeichen', c.zeichen)}${zeile('Ventil', c.ventil)}
        <p class="db-hinweis">Schlaf, Ruhe und ein abgeschlossenes Abenteuer geben keine Stabilität zurück. Nur das Ventil: 1W6, einmal pro Spielabend.</p>
      </div>` : ''}

      <div class="db-kasten">
        <h2>Anker, Riss, Ausrüstung</h2>
        ${zeile('Anker', c.anker)}${zeile('Riss', c.riss)}${zeile('Ausrüstung', c.ausruestung)}
        ${!(c.anker || c.riss || c.ausruestung || '').trim() ? '<p class="db-leer">Noch nichts eingetragen.</p>' : ''}
        ${istWesen ? '' : '<p class="db-hinweis">Zeit mit dem Anker gibt 1W6 Stabilität zurück, einmal pro Spielabend.</p>'}
      </div>

      ${(extra.notizbuch || '').trim() ? `
      <div class="db-kasten db-notizbuch">
        <h2>Notizbuch</h2>
        <p>${mitUmbruch(extra.notizbuch)}</p>
      </div>` : ''}

      <footer class="db-fuss">Stand: ${stand}</footer>
    </section>`;
}

/**
 * Öffnet den Druckdialog mit einem oder mehreren Charakterbögen.
 *
 * @param {object[]} liste   Charaktere in der gewünschten Reihenfolge
 * @param {object}   [opt]
 * @param {string}   [opt.dateiname]  wird zum Dokumenttitel und damit
 *                   zum Vorschlag für den PDF-Dateinamen
 * @param {object}   [opt.notizbuecher]  { charakterId: text } — nur für
 *                   Notizen, die die druckende Person sehen darf
 */
export function druckeCharaktere(liste, opt = {}) {
  if (!liste?.length) return;

  let ziel = document.getElementById('druckbogen');
  if (!ziel) {
    ziel = document.createElement('div');
    ziel.id = 'druckbogen';
    // Für Bildschirmleser unsichtbar, solange nicht gedruckt wird
    ziel.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ziel);
  }
  ziel.innerHTML = liste.map(c => blatt(c, { notizbuch: opt.notizbuecher?.[c.id] })).join('');

  const alterTitel = document.title;
  // Schrägstriche und Doppelpunkte sind in Dateinamen verboten
  // und werden je nach System sonst seltsam ersetzt.
  document.title = (opt.dateiname || `Charakterbogen ${liste[0].name || ''}`)
    .replace(/[\\/:*?"<>|]+/g, ' ').trim();
  document.body.classList.add('druckt-bogen');

  /* Aufräumen nach dem Druck. Safari auf dem iPad kehrt aus
     window.print() zurück, BEVOR der Dialog geschlossen ist —
     deshalb nicht direkt danach aufräumen, sondern auf
     „afterprint“ warten. Fällt das Ereignis aus, bleibt der Bogen
     unsichtbar im Dokument liegen; das stört niemanden, weil er
     am Bildschirm ohnehin ausgeblendet ist. */
  const aufraeumen = () => {
    document.body.classList.remove('druckt-bogen');
    document.title = alterTitel;
    window.removeEventListener('afterprint', aufraeumen);
  };
  window.addEventListener('afterprint', aufraeumen);

  // Ein Bild später drucken: So hat der Browser den neuen Inhalt
  // sicher gesetzt, bevor er die Druckvorschau berechnet.
  requestAnimationFrame(() => setTimeout(() => window.print(), 50));
}
