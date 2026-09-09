/* ============================================================
   REGELWERK — öffentliche, vollständige Regel-Nachschlageseite
   ============================================================

   Bewusst UNABHÄNGIG von app.js: Diese Seite braucht keine
   Anmeldung. app.js würde beim Laden sofort versuchen, sich mit
   Firebase zu verbinden, und nach Elementen suchen, die es hier
   gar nicht gibt (#schirm-app und so weiter) — das wollen wir
   auf einer rein öffentlichen Seite nicht auslösen.

   Spielleitungswissen (Einträge mit "nurSL" in regeln.js) bleibt
   deshalb hier grundsätzlich draußen: Ein Besucher dieser Seite
   ist nicht angemeldet, zählt also immer als Spieler. Nur wer
   sich im Spielbereich anmeldet UND die Runde leitet, sieht diese
   Einträge — dort in der Zone "Regeln".
   ============================================================ */

import { REGELN } from './daten/regeln.js';
import { regelListeHtml } from './daten/regeln-render.js';

const SICHTBAR = REGELN.filter(r => !r.nurSL);
const liste = document.getElementById('regel-liste');
const suche = document.getElementById('regel-suche');

function zeichnen() {
  liste.innerHTML = regelListeHtml(SICHTBAR, suche.value);
}

zeichnen();
suche.addEventListener('input', zeichnen);
