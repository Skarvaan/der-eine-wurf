/* ============================================================
   ZONE „GEMEINSAM“
   ============================================================

   Der Bereich, den alle sehen. Vier Arten von Einträgen:

     journal   Tagebuch der Gruppe — hier dürfen ALLE schreiben
     indiz     gefundene Hinweise — nur der Spielleiter legt an
     ort       Orte und Karten — nur der Spielleiter
     nsc       bekannte Personen — nur der Spielleiter

   Diese Beschränkung ist nicht nur Oberfläche: Die
   Sicherheitsregeln in firestore.rules lassen Spieler
   ausschließlich Journaleinträge schreiben.

   Der Spielleiter legt Einträge hier drüben an oder schiebt
   sie aus seinem eigenen Bereich herüber (siehe sl.js).
   ============================================================ */

import { Geteilt } from './speicher.js';
import { $, $$, sicher, sitzung, merkeAbo, zeitpunkt, status, nutzerTippt, hatOffeneAenderungen } from './app.js';

const TYP_BEZEICHNUNG = {
  journal: 'Journal',
  indiz:   'Indiz',
  ort:     'Ort',
  nsc:     'Person'
};

const TYP_HINWEIS = {
  journal: 'Was ist passiert? Jeder darf schreiben — auch aus Sicht des eigenen Charakters.',
  indiz:   'Was ihr gefunden habt. Legt der Spielleiter an, sobald es entdeckt wurde.',
  ort:     'Orte, Karten, Beschreibungen. Für Karten einen Bildlink einfügen.',
  nsc:     'Menschen, denen ihr begegnet seid — und was ihr über sie wisst.'
};

let gid = null;
let alle = [];
let aktiverTyp = 'journal';
let aboBeenden = null;
let zeichnenAusstehend = false;

/* Siehe charakter.js: nicht neu zeichnen, solange getippt wird —
   sonst verliert man mitten im Journaleintrag den Text. */
function zeichnenSicher() {
  if (nutzerTippt() || hatOffeneAenderungen()) { zeichnenAusstehend = true; return; }
  zeichnenAusstehend = false;
  zeichnen();
}

document.addEventListener('focusout', () => {
  setTimeout(() => {
    if (zeichnenAusstehend && !nutzerTippt()) zeichnenSicher();
  }, 120);
});

document.addEventListener('gespeichert', () => zeichnenSicher());

export function beendeGeteilt() {
  if (aboBeenden) { aboBeenden(); aboBeenden = null; }
  alle = [];
}

export function starteGeteilt(gruppenId) {
  gid = gruppenId;

  // Untertabs
  $$('#geteilt-tabs .untertab').forEach(tab => {
    tab.addEventListener('click', () => {
      aktiverTyp = tab.dataset.typ;
      $$('#geteilt-tabs .untertab').forEach(t => t.classList.toggle('aktiv', t === tab));
      zeichnen();
    });
  });

  aboBeenden = Geteilt.abonnieren(gid, (eintraege) => {
    // Neueste zuerst
    alle = eintraege.sort((a, b) => (b.angelegt?.seconds || 0) - (a.angelegt?.seconds || 0));
    zeichnenSicher();
  });
  merkeAbo(aboBeenden);
}

/* ============================================================
   ZEICHNEN
   ============================================================ */

function zeichnen() {
  const behaelter = $('geteilt-bereich');
  if (!behaelter) return;

  const eintraege = alle.filter(e => e.typ === aktiverTyp);

  // Wer darf hier etwas anlegen?
  const darfAnlegen = sitzung.istSL || aktiverTyp === 'journal';

  behaelter.innerHTML = `
    ${darfAnlegen ? formular() : ''}
    <div class="karte karte-geteilt">
      <div class="karte-kopf">
        <h2>${TYP_BEZEICHNUNG[aktiverTyp]}</h2>
        <span class="hinweis">${TYP_HINWEIS[aktiverTyp]}</span>
      </div>
      ${eintraege.length
        ? eintraege.map(eintrag).join('')
        : '<p class="leise">Noch nichts hier.</p>'}
    </div>
  `;

  if (darfAnlegen) bindeFormular();
  bindeEintraege(behaelter);
}

function formular() {
  return `
    <div class="karte">
      <div class="karte-kopf">
        <h2>Neuer Eintrag</h2>
        ${!sitzung.istSL ? '<span class="hinweis">Du kannst ins Journal schreiben. Indizien, Orte und Personen trägt der Spielleiter ein.</span>' : ''}
      </div>
      <label class="feld">
        <span>Überschrift</span>
        <input type="text" id="neu-titel" placeholder="${aktiverTyp === 'journal' ? 'z. B. Die Nacht in der Werkstatt' : 'Kurzer Name'}">
      </label>
      <label class="feld">
        <span>Text</span>
        <textarea id="neu-text" rows="4"></textarea>
      </label>
      ${aktiverTyp === 'ort' ? `
      <label class="feld">
        <span>Bildlink (optional) — für Karten und Skizzen</span>
        <input type="url" id="neu-bild" placeholder="https://…">
      </label>` : ''}
      <button type="button" class="knopf knopf-haupt" id="btn-neu">Eintragen</button>
    </div>`;
}

function eintrag(e) {
  const darfAendern = sitzung.istSL || (e.typ === 'journal' && e.autorUid === sitzung.nutzer.uid);

  return `
    <div class="eintrag" data-id="${e.id}">
      <div class="eintrag-kopf">
        <h4>${sicher(e.titel || 'Ohne Titel')}</h4>
        <span class="marke ${e.typ}">${TYP_BEZEICHNUNG[e.typ]}</span>
      </div>
      ${e.bild ? `<img src="${sicher(e.bild)}" alt="" style="max-width:100%;border-radius:8px;margin-bottom:8px">` : ''}
      <p>${sicher(e.text || '')}</p>
      <div class="eintrag-fuss">
        <span class="leise" style="font-size:13px">${sicher(e.autorName || '')} · ${zeitpunkt(e.angelegt)}</span>
        ${darfAendern ? `
          <button type="button" class="knopf-klein" data-aendern="${e.id}">Ändern</button>
          <button type="button" class="knopf-klein knopf-gefahr" data-weg="${e.id}">Löschen</button>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   EREIGNISSE
   ============================================================ */

function bindeFormular() {
  $('btn-neu').addEventListener('click', async () => {
    const titel = $('neu-titel').value.trim();
    const text  = $('neu-text').value.trim();
    const bild  = $('neu-bild')?.value.trim() || '';

    if (!titel && !text) return;

    $('btn-neu').disabled = true;
    try {
      await Geteilt.anlegen(gid, { typ: aktiverTyp, titel, text, bild });
      $('neu-titel').value = '';
      $('neu-text').value = '';
      if ($('neu-bild')) $('neu-bild').value = '';
      status('eingetragen');
    } catch (fehler) {
      console.error(fehler);
      alert('Der Eintrag konnte nicht gespeichert werden. Darfst du hier schreiben?');
    } finally {
      $('btn-neu').disabled = false;
    }
  });
}

function bindeEintraege(behaelter) {

  behaelter.querySelectorAll('[data-weg]').forEach(knopf => {
    knopf.addEventListener('click', async () => {
      if (!confirm('Diesen Eintrag löschen?')) return;
      await Geteilt.loeschen(gid, knopf.dataset.weg);
    });
  });

  behaelter.querySelectorAll('[data-aendern]').forEach(knopf => {
    knopf.addEventListener('click', () => {
      const e = alle.find(x => x.id === knopf.dataset.aendern);
      if (!e) return;
      bearbeitenOeffnen(e);
    });
  });
}

/**
 * Ersetzt den Eintrag durch ein Bearbeitungsformular.
 * Bewusst ohne eigenes Fenster — auf dem iPad sind
 * überlagernde Fenster fummelig.
 */
function bearbeitenOeffnen(e) {
  const kasten = document.querySelector(`.eintrag[data-id="${e.id}"]`);
  if (!kasten) return;

  kasten.innerHTML = `
    <label class="feld"><span>Überschrift</span>
      <input type="text" class="bearb-titel" value="${sicher(e.titel || '')}"></label>
    <label class="feld"><span>Text</span>
      <textarea class="bearb-text" rows="5">${sicher(e.text || '')}</textarea></label>
    ${e.typ === 'ort' ? `<label class="feld"><span>Bildlink</span>
      <input type="url" class="bearb-bild" value="${sicher(e.bild || '')}"></label>` : ''}
    <div style="display:flex;gap:8px">
      <button type="button" class="knopf knopf-haupt bearb-speichern">Speichern</button>
      <button type="button" class="knopf bearb-abbrechen">Abbrechen</button>
    </div>`;

  kasten.querySelector('.bearb-speichern').addEventListener('click', async () => {
    const daten = {
      titel: kasten.querySelector('.bearb-titel').value.trim(),
      text:  kasten.querySelector('.bearb-text').value.trim()
    };
    const bildFeld = kasten.querySelector('.bearb-bild');
    if (bildFeld) daten.bild = bildFeld.value.trim();

    await Geteilt.aendern(gid, e.id, daten);
    status('geändert');
  });

  kasten.querySelector('.bearb-abbrechen').addEventListener('click', zeichnen);
}
