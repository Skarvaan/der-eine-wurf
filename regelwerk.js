/* ============================================================
   REGELWERK — öffentliche, vollständige Regel-Nachschlageseite
   ============================================================

   Bewusst UNABHÄNGIG von app.js: Diese Seite braucht keine
   Anmeldung. app.js würde beim Laden sofort versuchen, sich mit
   Firebase zu verbinden, und nach Elementen suchen, die es hier
   gar nicht gibt (#schirm-app und so weiter). Das soll eine rein
   öffentliche Seite nicht auslösen.

   Spielleitungswissen (Einträge mit "nurSL" in regeln.js) bleibt
   deshalb hier grundsätzlich draußen: Ein Besucher dieser Seite
   ist nicht angemeldet, zählt also immer als Spieler. Nur wer
   sich im Spielbereich anmeldet UND die Runde leitet, sieht diese
   Einträge, dort in der Zone "Regeln".
   ============================================================ */

import { REGELN } from './daten/regeln.js';
import { regelListeHtml, regelNavHtml } from './daten/regeln-render.js';

const SICHTBAR = REGELN.filter(r => !r.nurSL);
const liste = document.getElementById('regel-liste');
const suche = document.getElementById('regel-suche');
const leiste = document.getElementById('kapitel-leiste');

function zeichnen() {
  liste.innerHTML = regelListeHtml(SICHTBAR, suche.value);
  // Während einer Suche zeigen die Kapitel-Sprungmarken auf
  // Abschnitte, die es gerade evtl. nicht gibt. Deshalb blendet
  // die Leiste dann aus, statt ins Leere zu springen.
  leiste.hidden = suche.value.trim() !== '';
}

leiste.innerHTML = regelNavHtml(SICHTBAR);
zeichnen();
suche.addEventListener('input', zeichnen);

/* Das aktive Kapitel in der Leiste hervorheben und sichtbar
   halten. IntersectionObserver statt scroll-Ereignis: Safari auf
   dem iPad feuert scroll-Ereignisse beim Schwung-Scrollen nur
   stockend, der Observer meldet zuverlässig. */
const chips = new Map(
  [...leiste.querySelectorAll('.kapitel-chip')].map(a => [a.getAttribute('href').slice(1), a]));

const beobachter = new IntersectionObserver(eintraege => {
  eintraege.forEach(e => {
    if (!e.isIntersecting) return;
    const chip = chips.get(e.target.id);
    if (!chip) return;
    chips.forEach(c => c.classList.remove('aktiv'));
    chip.classList.add('aktiv');
    // Nur die Leiste seitlich verschieben, nie die ganze Seite.
    leiste.scrollTo({ left: chip.offsetLeft - 16, behavior: 'smooth' });
  });
}, { rootMargin: '-120px 0px -65% 0px' });

function kapitelBeobachten() {
  beobachter.disconnect();
  liste.querySelectorAll('.regel-kapitel').forEach(k => beobachter.observe(k));
}
kapitelBeobachten();
suche.addEventListener('input', kapitelBeobachten);
