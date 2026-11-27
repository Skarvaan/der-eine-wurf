/* ============================================================
   WERTE — Attribute, Fertigkeiten und ihre Schnellhilfe
   ============================================================

   Gemeinsame Stammdaten für den Spielbogen (charakter.js) und die
   Charakterübersicht der Spielleitung (sl.js). Vorher hatte jede
   Datei ihre eigene Liste, und die SL-Übersicht zeigte nur die
   vier besten Fertigkeiten. Eine Quelle heißt: Beide Ansichten
   zeigen immer dieselben fünfzehn Fertigkeiten in derselben
   Reihenfolge.

   Die Hilfetexte hinter dem „?“ werden NICHT neu geschrieben,
   sondern aus daten/regeln.js gelesen (Kapitel „Die sechs
   Attribute“ und „Die fünfzehn Fertigkeiten“). Ändert sich dort
   eine Formulierung, ändert sie sich auch auf dem Bogen. Nur die
   Rechenregeln (welcher Wert wovon abhängt) stehen hier als
   kurzer Zusatz, weil sie im Regeltext an anderen Stellen stehen.

   Bewusst ohne Abhängigkeit zu app.js oder Firebase, genau wie
   regeln-render.js: reine Daten und reines HTML.
   ============================================================ */

import { REGELN } from './regeln.js';

export const ATTRIBUTE = {
  koerper:      'Körper',
  geschick:     'Geschick',
  verstand:     'Verstand',
  wahrnehmung:  'Wahrnehmung',
  wille:        'Wille',
  ausstrahlung: 'Ausstrahlung'
};

export const FERTIGKEITEN = {
  athletik: 'Athletik',           nahkampf: 'Nahkampf',
  fernkampf: 'Fernkampf',         heimlichkeit: 'Heimlichkeit',
  fingerfertigkeit: 'Fingerfertigkeit', technik: 'Technik',
  handwerk: 'Handwerk',           ermittlung: 'Ermittlung',
  wissen: 'Wissen',               mysterien: 'Mysterien',
  heilkunde: 'Heilkunde',         ueberzeugen: 'Überzeugen',
  widerstand: 'Widerstand',       ueberleben: 'Überleben',
  steuern: 'Steuern'
};

/* Was ein Wert außer dem Würfeln noch beeinflusst. */
const ZUSATZ = {
  koerper:   'Lebenspunkte = 10 + Körper × 2.',
  geschick:  'Verteidigung = 10 + Geschick + Nahkampf.',
  wille:     'Stabilität = 10 + Wille × 2.',
  nahkampf:  'Zählt auch zur Verteidigung.',
  mysterien: 'Ab Mysterien 1 kostet jeder misslungene Schreckwurf 1 Stabilität extra.'
};

/* Hilfetexte einmal beim Laden aus den Regeln zusammensuchen.
   Gesucht wird über den Anzeigenamen (titel bzw. erste Spalte),
   denn so stehen sie im Regeltext. */
const HILFE = (() => {
  const nachName = {};
  const attr = REGELN.find(r => r.titel === 'Die sechs Attribute');
  (attr?.punkte || []).forEach(p => { nachName[p.titel] = p.text; });
  const fert = REGELN.find(r => r.titel === 'Die fünfzehn Fertigkeiten');
  (fert?.tabelle?.zeilen || []).forEach(([name, text]) => { nachName[name] = text + '.'; });

  const hilfe = {};
  Object.entries({ ...ATTRIBUTE, ...FERTIGKEITEN }).forEach(([k, name]) => {
    hilfe[k] = [nachName[name], ZUSATZ[k]].filter(Boolean).join(' ');
  });
  return hilfe;
})();

export function hilfeZu(schluessel) {
  return HILFE[schluessel] || '';
}

function maskiert(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Eine Zeile „Name (?) … Wert“. Was rechts steht (nur die Zahl,
 * Würfeln-Knopf, Minus/Plus), bestimmt die aufrufende Ansicht und
 * reicht es als fertiges HTML in `rechts` herein.
 *
 * Die Hilfe klappt UNTER der Zeile auf statt als schwebende Blase:
 * Auf dem iPad gibt es kein Überfahren mit der Maus, und eine Blase
 * am Bildschirmrand wird gern abgeschnitten.
 */
export function wertZeile(schluessel, name, rechts, { gedimmt = false } = {}) {
  const text = hilfeZu(schluessel);
  return `
    <div class="wert-zeile${gedimmt ? ' gedimmt' : ''}">
      <span class="bez">${maskiert(name)}</span>
      ${text ? `<button type="button" class="hilfe-knopf" data-hilfe aria-expanded="false"
        aria-label="Was ist ${maskiert(name)}?" title="Was ist ${maskiert(name)}?">?</button>` : ''}
      <span class="rechts">${rechts}</span>
      ${text ? `<p class="wert-hilfe" hidden>${maskiert(text)}</p>` : ''}
    </div>`;
}

/** Bindet alle „?“-Knöpfe in einem Behälter. Nach jedem
    innerHTML neu aufrufen, die alten Knöpfe sind dann weg. */
export function bindeHilfe(behaelter) {
  behaelter.querySelectorAll('[data-hilfe]').forEach(knopf => {
    knopf.addEventListener('click', () => {
      const text = knopf.parentElement.querySelector('.wert-hilfe');
      if (!text) return;
      text.hidden = !text.hidden;
      knopf.setAttribute('aria-expanded', String(!text.hidden));
      knopf.classList.toggle('offen', !text.hidden);
    });
  });
}
