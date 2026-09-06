/* ============================================================
   ZONE „MEIN CHARAKTER“
   ============================================================

   Enthält drei Dinge in einer Ansicht:

     1. Den Baukasten (solange der Charakter nicht fertig ist)
     2. Den Spielbogen (Zähler, Fertigkeiten antippen zum Würfeln)
     3. Das Steigerungswerkzeug (nur wenn der Spielleiter es
        freigegeben hat)

   Ein Spieler sieht immer nur seinen eigenen Charakter.
   Der Spielleiter sieht alle — das steckt aber in sl.js.
   ============================================================ */

import { Charaktere, Notizbuch } from './speicher.js';
import { $, sicher, status, sitzung, merkeAbo, wuerfelnMit, wuerfelnAktiv, nutzerTippt,
         merkeAenderung, hatOffeneAenderungen, verwirfAenderung, alleSpeichern } from './app.js';

/* ------------------------------------------------------------
   Stammdaten
   ------------------------------------------------------------ */

const ATTRIBUTE = {
  koerper:      'Körper',
  geschick:     'Geschick',
  verstand:     'Verstand',
  wahrnehmung:  'Wahrnehmung',
  wille:        'Wille',
  ausstrahlung: 'Ausstrahlung'
};

const FERTIGKEITEN = {
  athletik: 'Athletik',           nahkampf: 'Nahkampf',
  fernkampf: 'Fernkampf',         heimlichkeit: 'Heimlichkeit',
  fingerfertigkeit: 'Fingerfertigkeit', technik: 'Technik',
  handwerk: 'Handwerk',           ermittlung: 'Ermittlung',
  wissen: 'Wissen',               mysterien: 'Mysterien',
  heilkunde: 'Heilkunde',         ueberzeugen: 'Überzeugen',
  widerstand: 'Widerstand',       ueberleben: 'Überleben',
  steuern: 'Steuern'
};

/* Vorgaben aus dem Regelheft */
const START_ATTRIBUT   = 2;
const PUNKTE_ATTRIBUTE = 7;
const MAX_ATTRIBUT_START = 5;
const PUNKTE_FERTIGKEITEN = 10;
const MAX_FERTIGKEIT_START = 3;

/* ------------------------------------------------------------
   Abgeleitete Werte
   ------------------------------------------------------------ */

const maxLp   = (c) => 10 + (c.attribute.koerper || 0) * 2 + (c.bonusLp || 0);
const maxStab = (c) => 10 + (c.attribute.wille || 0) * 2 + (c.bonusStab || 0);
const vert    = (c) => 10 + (c.attribute.geschick || 0) + (c.fertigkeiten.nahkampf || 0);

/* ------------------------------------------------------------
   Das Messgerät — ein rundes Druckmessgerät statt trockener
   Zahl für Lebenspunkte, Stabilität und Schicksal. Der
   Füllstand kommt über einen Kegelverlauf in CSS, siehe
   ".messgeraet" in stil.css.
   ------------------------------------------------------------ */
function gaugeKlasse(wert, max) {
  if (wert <= 0) return 'gefahr';
  if (wert <= Math.floor(max / 2)) return 'warnung';
  return 'ok';
}
function gaugePct(wert, max) {
  return Math.max(0, Math.min(100, Math.round((wert / max) * 100)));
}
function messgeraet(wert, max, mitKlasse = true) {
  const klasse = mitKlasse ? gaugeKlasse(wert, max) : '';
  return `
    <div class="messgeraet ${klasse}" style="--pct:${gaugePct(wert, max)}%">
      <div class="zeiger-zahl">${wert}<small>/ ${max}</small></div>
    </div>`;
}

/* ------------------------------------------------------------
   Zustand dieses Moduls
   ------------------------------------------------------------ */

let gid = null;
let meiner = null;         // mein Charakter oder null
let aboBeenden = null;
let zeichnenAusstehend = false;

/* Das Notizbuch lebt bewusst NICHT im Charakterdokument (das
   dürfen alle in der Runde lesen), sondern in einer eigenen,
   wirklich geschützten Sammlung — siehe Notizbuch in speicher.js
   und firestore.rules. Deshalb eigener Entwurfszustand hier. */
let notizenText = '';
let notizenAboBeenden = null;

/**
 * Zeichnet nur, wenn der Nutzer gerade NICHT tippt.
 * Sonst wird gemerkt, dass etwas nachzuholen ist — und sobald
 * das Feld verlassen wird, holen wir es nach (siehe unten).
 *
 * Ohne diese Bremse zerstört jede Rückmeldung aus Firestore
 * das Feld, in das gerade geschrieben wird.
 */
function zeichnenSicher() {
  // Nicht neu zeichnen, solange getippt wird ODER es
  // ungespeicherte Änderungen gibt — sonst würde der Stand aus
  // der Datenbank die Arbeit des Nutzers überschreiben.
  // Das Notizbuch zählt mit — es hat einen eigenen Puffer
  // ('notizen'), sitzt aber in derselben Ansicht.
  if (nutzerTippt() || hatOffeneAenderungen('charakter') || hatOffeneAenderungen('notizen')) {
    zeichnenAusstehend = true;
    return;
  }
  zeichnenAusstehend = false;
  zeichnen();
}

/**
 * Meldet dem Änderungspuffer, dass etwas offen ist.
 * Beim Speichern wird der ganze Charakter in EINEM Vorgang
 * geschrieben — nicht Feld für Feld.
 */
function geaendert() {
  merkeAenderung('charakter', speichernAlles);
  aktualisiereSpeicherhinweis();
}

/** Schreibt den kompletten Charakter — ein Schreibvorgang */
async function speichernAlles() {
  if (!meiner) return;
  const { id, ...daten } = meiner;
  await Charaktere.aendern(gid, id, daten);
  aktualisiereSpeicherhinweis();
  zeichnenSicher();
}

/** Färbt den Hinweis neben dem Speichern-Knopf */
function aktualisiereSpeicherhinweis() {
  const el = document.querySelector('#charakter-bereich .stand-text');
  if (!el) return;
  const offen = hatOffeneAenderungen('charakter') || hatOffeneAenderungen('notizen');
  el.textContent = offen ? 'Ungespeicherte Änderungen' : 'Alles gespeichert';
  el.classList.toggle('offen', offen);
}

/** Der Kopf mit dem Speichern-Knopf, in beiden Ansichten gleich */
function speichernKopf() {
  const offen = hatOffeneAenderungen('charakter') || hatOffeneAenderungen('notizen');
  return `
    <div class="speichern-oben">
      <button type="button" class="knopf knopf-haupt" id="btn-char-speichern">Speichern</button>
      <span class="stand-text ${offen ? 'offen' : ''}">
        ${offen ? 'Ungespeicherte Änderungen' : 'Alles gespeichert'}
      </span>
    </div>`;
}

/** Meldet dem Änderungspuffer, dass das Notizbuch geändert
    wurde — eigener Eimer ('notizen'), weil es in eine andere
    Sammlung schreibt als der Rest des Charakterbogens. */
function notizenGeaendert() {
  merkeAenderung('notizen', async () => {
    await Notizbuch.speichern(gid, sitzung.nutzer.uid, notizenText);
  });
  aktualisiereSpeicherhinweis();
}

function bindeSpeichernKopf() {
  document.getElementById('btn-char-speichern')?.addEventListener('click', () => alleSpeichern());
}

// Beim Verlassen eines Feldes nachholen, was übersprungen wurde.
// Das kleine Zeitfenster gibt dem Browser Gelegenheit, den Fokus
// auf das nächste Feld zu setzen — dann wird weiter gewartet.
document.addEventListener('focusout', () => {
  setTimeout(() => {
    if (zeichnenAusstehend && !nutzerTippt()) zeichnenSicher();
  }, 120);
});

export function beendeCharakter() {
  if (aboBeenden) { aboBeenden(); aboBeenden = null; }
  if (notizenAboBeenden) { notizenAboBeenden(); notizenAboBeenden = null; }
  meiner = null;
  notizenText = '';
}

export function starteCharakter(gruppenId) {
  gid = gruppenId;

  aboBeenden = Charaktere.abonnieren(gid, (alle) => {
    meiner = alle.find(c => c.besitzer === sitzung.nutzer.uid) || null;
    zeichnenSicher();
  });
  merkeAbo(aboBeenden);

  notizenAboBeenden = Notizbuch.abonnieren(gid, sitzung.nutzer.uid, (text) => {
    notizenText = text;
    zeichnenSicher();
  });
  merkeAbo(notizenAboBeenden);

  // Wenn der Spielleiter die Steigerung freischaltet, neu zeichnen
  document.addEventListener('gruppe-geaendert', zeichnenSicher);

  // Der Würfeln-Schalter entscheidet, ob Würfeln-Knöpfe oder nur
  // der Bonus zu sehen sind — bei Änderung neu zeichnen.
  document.addEventListener('wuerfeln-umgeschaltet', zeichnenSicher);

  // Nach dem Speichern oder Verwerfen darf wieder gezeichnet werden
  document.addEventListener('gespeichert', () => zeichnenSicher());
  document.addEventListener('verworfen', () => { zeichnenAusstehend = false; zeichnen(); });
}

/* ------------------------------------------------------------
   Leerer Charakter
   ------------------------------------------------------------ */

function leer() {
  const attribute = {};
  Object.keys(ATTRIBUTE).forEach(k => attribute[k] = START_ATTRIBUT);
  const fertigkeiten = {};
  Object.keys(FERTIGKEITEN).forEach(k => fertigkeiten[k] = 0);

  return {
    besitzer: sitzung.nutzer.uid,
    name: '', attribute, fertigkeiten,
    staerken: ['', ''], makel: [''],
    hintergrund: '', anker: '', riss: '', ausruestung: '',
    lp: 14, stab: 14, sp: 0,
    fp: 0, bonusLp: 0, bonusStab: 0,
    narben: [], tick: '',
    fertig: false
  };
}

/* ============================================================
   ZEICHNEN
   ============================================================ */

function zeichnen() {
  const behaelter = $('charakter-bereich');
  if (!behaelter) return;

  if (!meiner) { zeichneStart(behaelter); return; }
  if (!meiner.fertig) { zeichneBaukasten(behaelter); return; }
  zeichneSpielbogen(behaelter);
}

/* ------------------------------------------------------------
   Noch kein Charakter
   ------------------------------------------------------------ */

function zeichneStart(behaelter) {
  behaelter.innerHTML = `
    <div class="karte">
      <div class="karte-kopf"><h2>Noch kein Charakter</h2></div>
      <p>Ein Charakter ist in einer Viertelstunde fertig. Das Werkzeug rechnet alles mit,
      du musst nur entscheiden.</p>
      <button type="button" class="knopf knopf-haupt" id="btn-char-neu">Charakter anlegen</button>
    </div>`;

  $('btn-char-neu').addEventListener('click', async () => {
    $('btn-char-neu').disabled = true;
    await Charaktere.anlegen(gid, leer());
    // Das Abo zeichnet automatisch neu
  });
}

/* ------------------------------------------------------------
   Der Baukasten
   ------------------------------------------------------------ */

function zeichneBaukasten(behaelter) {
  const c = meiner;

  const attributPunkte = Object.values(c.attribute)
    .reduce((s, w) => s + (w - START_ATTRIBUT), 0);
  const fertigkeitPunkte = Object.values(c.fertigkeiten)
    .reduce((s, w) => s + w, 0);

  const attributRest   = PUNKTE_ATTRIBUTE - attributPunkte;
  const fertigkeitRest = PUNKTE_FERTIGKEITEN - fertigkeitPunkte;

  const fertigMoeglich = attributRest === 0 && fertigkeitRest === 0 && c.name.trim();

  behaelter.innerHTML = `
    ${speichernKopf()}
    <div class="karte">
      <div class="karte-kopf">
        <h2>Schritt 1 — Wer bist du?</h2>
      </div>
      <label class="feld">
        <span>Name</span>
        <input type="text" data-feld="name" value="${sicher(c.name)}" placeholder="z. B. Elsbeth Grothe">
      </label>
      <label class="feld">
        <span>Ein Satz, wer du bist</span>
        <input type="text" data-feld="hintergrund" value="${sicher(c.hintergrund)}"
          placeholder="Ehemalige Polizistin, entlassen, weil sie in die falsche Richtung ermittelt hat">
      </label>
    </div>

    <div class="bogen-gitter">
      <div class="karte">
        <div class="karte-kopf">
          <h2>Schritt 2 — Attribute</h2>
          <span class="hinweis">Alle starten auf 2. Verteile 7 Punkte, höchstens bis 5.</span>
        </div>
        <div class="punkte-anzeige ${attributRest === 0 ? 'passt' : attributRest < 0 ? 'zuviel' : 'offen'}">
          <span class="zahl">${attributRest}</span>
          <span class="leise">${attributRest === 0 ? 'Punkte verteilt — passt' : attributRest > 0 ? 'Punkte übrig' : 'Punkte zu viel'}</span>
        </div>
        ${Object.entries(ATTRIBUTE).map(([k, bez]) => stufenZeile(
          k, bez, c.attribute[k], 1, MAX_ATTRIBUT_START, 'attribut', attributRest
        )).join('')}
      </div>

      <div class="karte">
        <div class="karte-kopf">
          <h2>Schritt 3 — Fertigkeiten</h2>
          <span class="hinweis">Alle starten auf 0. Verteile 10 Punkte, höchstens bis 3.</span>
        </div>
        <div class="punkte-anzeige ${fertigkeitRest === 0 ? 'passt' : fertigkeitRest < 0 ? 'zuviel' : 'offen'}">
          <span class="zahl">${fertigkeitRest}</span>
          <span class="leise">${fertigkeitRest === 0 ? 'Punkte verteilt — passt' : fertigkeitRest > 0 ? 'Punkte übrig' : 'Punkte zu viel'}</span>
        </div>
        <p class="hinweis-schild">Eine 0 ist <b>kein Abzug</b> — du darfst alles versuchen, nur eben ohne Bonus.</p>
        ${Object.entries(FERTIGKEITEN).map(([k, bez]) => stufenZeile(
          k, bez, c.fertigkeiten[k], 0, MAX_FERTIGKEIT_START, 'fertigkeit', fertigkeitRest
        )).join('')}
      </div>
    </div>

    <div class="karte">
      <div class="karte-kopf">
        <h2>Schritt 4 — Eigenschaften</h2>
        <span class="hinweis">Zwei Stärken, ein Makel. Konkret formulieren: „Hat Medizin studiert“ statt „klug“. Ist eine Eigenschaft relevant, gibt sie Vorteil oder Nachteil.</span>
      </div>
      <label class="feld"><span>Stärke 1</span>
        <input type="text" data-feld="staerke0" value="${sicher(c.staerken[0] || '')}" placeholder="Zwölf Jahre bei der Kriminalpolizei"></label>
      <label class="feld"><span>Stärke 2</span>
        <input type="text" data-feld="staerke1" value="${sicher(c.staerken[1] || '')}" placeholder="Merkt sich jedes Gesicht"></label>
      <label class="feld feld-betont"><span>Makel</span>
        <input type="text" data-feld="makel0" value="${sicher(c.makel[0] || '')}" placeholder="Kann nicht aufhören, wenn sie einmal angefangen hat"></label>
      <p class="hinweis-schild">Wenn dein Makel dir einen Nachteil einbringt, bekommst du einen <b>Schicksalspunkt</b>.</p>
    </div>

    <div class="karte">
      <div class="karte-kopf">
        <h2>Schritt 5 — Anker und Riss</h2>
        <span class="hinweis">Die zwei Zeilen, mit denen der Spielleiter am meisten anfangen kann.</span>
      </div>
      <label class="feld"><span>Anker — was dir wirklich etwas bedeutet</span>
        <input type="text" data-feld="anker" value="${sicher(c.anker)}" placeholder="Ihre Schwester, die noch immer zu ihr hält"></label>
      <label class="feld"><span>Riss — was in deinem Leben nicht in Ordnung ist</span>
        <input type="text" data-feld="riss" value="${sicher(c.riss)}" placeholder="Der Fall, wegen dem sie gehen musste, ist nicht abgeschlossen"></label>
      <label class="feld"><span>Ausrüstung — Waffe, Werkzeug, drei besondere Gegenstände</span>
        <textarea data-feld="ausruestung" rows="3">${sicher(c.ausruestung)}</textarea></label>
    </div>

    <div class="karte">
      <div class="karte-kopf"><h2>Deine Werte</h2></div>
      <div class="werte-gitter">
        <div class="wert-kachel"><span>Lebenspunkte</span><b>${maxLp(c)}</b></div>
        <div class="wert-kachel"><span>Stabilität</span><b>${maxStab(c)}</b></div>
        <div class="wert-kachel"><span>Verteidigung</span><b>${vert(c)}</b></div>
      </div>
      <button type="button" class="knopf knopf-haupt" id="btn-fertig" ${fertigMoeglich ? '' : 'disabled'} style="width:100%">
        ${fertigMoeglich ? 'Fertig — ab ins Spiel' : 'Noch nicht fertig'}
      </button>
      ${fertigMoeglich ? '' : '<p class="warnschild" style="margin-top:8px">Es fehlt noch: '
        + [ !c.name.trim() ? 'ein Name' : null,
            attributRest !== 0 ? 'die Attributspunkte' : null,
            fertigkeitRest !== 0 ? 'die Fertigkeitspunkte' : null
          ].filter(Boolean).join(', ') + '.</p>'}
    </div>
  `;

  bindeSpeichernKopf();
  bindeFelder(behaelter);
  bindeStufen(behaelter);

  $('btn-fertig')?.addEventListener('click', async () => {
    meiner.fertig = true;
    meiner.lp = maxLp(meiner);
    meiner.stab = maxStab(meiner);
    geaendert();
    await alleSpeichern();   // hier lohnt sich das sofortige Schreiben
  });
}

/** Eine Zeile mit Minus, Wert, Plus */
function stufenZeile(schluessel, bezeichnung, wert, min, max, art, rest) {
  const runterAus = wert <= min;
  const hochAus   = wert >= max || rest <= 0;
  return `
    <div class="stufen-zeile">
      <span class="bez">${bezeichnung}</span>
      <button type="button" data-stufe="${art}:${schluessel}:-1" ${runterAus ? 'disabled' : ''}>−</button>
      <span class="stand">${wert}</span>
      <button type="button" data-stufe="${art}:${schluessel}:1" ${hochAus ? 'disabled' : ''}>+</button>
    </div>`;
}

function bindeStufen(behaelter) {
  behaelter.querySelectorAll('[data-stufe]').forEach(knopf => {
    knopf.addEventListener('click', async () => {
      const [art, schluessel, richtung] = knopf.dataset.stufe.split(':');
      const ziel = art === 'attribut' ? meiner.attribute : meiner.fertigkeiten;
      ziel[schluessel] += parseInt(richtung, 10);

      geaendert();
      zeichnen();   // sofort neu zeichnen, damit die Punkte stimmen
    });
  });
}

/** Textfelder an den Charakter binden */
function bindeFelder(behaelter) {
  behaelter.querySelectorAll('[data-feld]').forEach(el => {

    const uebernehmen = () => {
      const feld = el.dataset.feld;

      if (feld.startsWith('staerke')) {
        meiner.staerken[parseInt(feld.slice(7), 10)] = el.value;
      } else if (feld.startsWith('makel')) {
        meiner.makel[parseInt(feld.slice(5), 10)] = el.value;
      } else {
        meiner[feld] = el.value;
      }
      geaendert();
    };

    // Nur in den Arbeitsspeicher übernehmen. Geschrieben wird
    // erst beim Druck auf Speichern.
    el.addEventListener('input', uebernehmen);
  });
}

/* ------------------------------------------------------------
   Der Spielbogen
   ------------------------------------------------------------ */

function zeichneSpielbogen(behaelter) {
  const c = meiner;
  const lpMax = maxLp(c), stabMax = maxStab(c);
  const angeschlagen = c.lp <= Math.floor(lpMax / 2);
  const erschuettert = c.stab <= Math.floor(stabMax / 2);
  const wuerfelt = wuerfelnAktiv();

  const lpZustand = c.lp <= 0
    ? '<span class="zustand gefahr">AM BODEN</span>'
    : angeschlagen ? '<span class="zustand warnung">angeschlagen</span>'
                   : '<span class="zustand ok">unversehrt</span>';

  const stabZustand = c.stab <= 0
    ? '<span class="zustand gefahr">GEBROCHEN</span>'
    : erschuettert ? '<span class="zustand warnung">erschüttert</span>'
                   : '<span class="zustand ok">gefasst</span>';

  const darfSteigern = sitzung.gruppe?.freigaben?.steigern || c.steigernFrei;

  behaelter.innerHTML = `
    ${speichernKopf()}
    <div class="karte">
      <div class="karte-kopf">
        <h2>${sicher(c.name)}</h2>
        <button type="button" class="knopf-klein" id="btn-bearbeiten">Bearbeiten</button>
        ${c.hintergrund ? `<span class="hinweis">${sicher(c.hintergrund)}</span>` : ''}
      </div>

      <div class="zaehler">
        <span class="titel">Lebenspunkte</span>
        <button type="button" data-zaehler="lp:-1">−</button>
        ${messgeraet(c.lp, lpMax)}
        <button type="button" data-zaehler="lp:1">+</button>
        ${lpZustand}
      </div>
      <div class="zaehler">
        <span class="titel">Stabilität</span>
        <button type="button" data-zaehler="stab:-1">−</button>
        ${messgeraet(c.stab, stabMax)}
        <button type="button" data-zaehler="stab:1">+</button>
        ${stabZustand}
      </div>
      <div class="zaehler">
        <span class="titel">Schicksal</span>
        <button type="button" data-zaehler="sp:-1">−</button>
        ${messgeraet(c.sp, 3, false)}
        <button type="button" data-zaehler="sp:1">+</button>
        <span class="leise" style="font-size:13px">Makel greift → +1</span>
      </div>

      ${angeschlagen && c.lp > 0 ? '<p class="warnschild">Angeschlagen: Nachteil auf alles mit Körper oder Geschick.</p>' : ''}
      ${erschuettert && c.stab > 0 ? '<p class="warnschild">Erschüttert: Nachteil auf alles mit Wille oder Wahrnehmung. Spiel deinen Tick.</p>' : ''}
      ${c.stab <= 0 ? '<p class="warnschild kritisch"><b>Gebrochen.</b> Du entscheidest selbst, wie dein Charakter bricht — fliehen, erstarren, zusammenbrechen. Bis zum Ende der Szene.</p>' : ''}
    </div>

    <div class="bogen-gitter">
      <div class="karte">
        <div class="karte-kopf">
          <h2>Attribute</h2>
          ${wuerfelt ? '<span class="hinweis">Antippen würfelt nur mit dem Attribut — für alles, was man nicht lernen kann.</span>' : ''}
        </div>
        <div class="werte-gitter">
          ${Object.entries(ATTRIBUTE).map(([k, bez]) => wuerfelt
            ? `<button type="button" class="wert-kachel" data-wurf="attribut:${k}">
                <span>${bez}</span><b>${c.attribute[k]}</b></button>`
            : `<div class="wert-kachel"><span>${bez}</span><b>${c.attribute[k]}</b></div>`
          ).join('')}
        </div>
        <div class="werte-gitter">
          <div class="wert-kachel"><span>Verteidigung</span><b>${vert(c)}</b></div>
        </div>
      </div>

      <div class="karte">
        <div class="karte-kopf">
          <h2>Fertigkeiten</h2>
          <span class="hinweis">Nur der Wert — welches Attribut dazukommt, entscheidet ihr am Tisch je nach Situation. Zusammenrechnen ist Sache des echten Wurfs.</span>
        </div>
        <div class="werte-gitter">
          ${Object.entries(FERTIGKEITEN).map(([k, bez]) => `
            <div class="wert-kachel"><span>${bez}</span><b>${c.fertigkeiten[k]}</b></div>`).join('')}
        </div>
      </div>

      <div class="karte">
        <div class="karte-kopf"><h2>Eigenschaften</h2></div>
        <ul class="liste">
          ${c.staerken.filter(Boolean).map(s => `<li><span style="flex:1">${sicher(s)}</span><span class="marke ort">Stärke</span></li>`).join('')}
          ${c.makel.filter(Boolean).map(m => `<li><span style="flex:1">${sicher(m)}</span><span class="marke sl">Makel</span></li>`).join('')}
          ${(c.narben || []).map(n => `<li><span style="flex:1">${sicher(n)}</span><span class="marke sl">Narbe</span></li>`).join('')}
        </ul>
        <div class="zeile-eingabe" style="margin-top:12px">
          <input type="text" id="narbe-eingabe" placeholder="Neue Narbe (Körper oder Seele)">
          <button type="button" class="knopf-klein" id="btn-narbe">Hinzufügen</button>
        </div>
        <p class="hinweis-schild">Narben entstehen, wenn du am Boden lagst oder gebrochen warst. Du formulierst sie selbst.</p>
      </div>

      <div class="karte">
        <div class="karte-kopf"><h2>Notizbuch</h2>
          <span class="hinweis">Nur du und deine Spielleitung sehen das. Verdächtige, Gedächtnisstützen, was dein Charakter denkt.</span></div>
        <div class="notizbuch-umriss">
          <textarea class="notizbuch-feld" data-notizbuch rows="8"
            placeholder="Verdacht: der Hausmeister hat gelogen …">${sicher(notizenText)}</textarea>
        </div>
      </div>

      <div class="karte karte-breit">
        <div class="karte-kopf"><h2>Anker, Riss, Ausrüstung</h2></div>
        <label class="feld"><span>Anker</span><input type="text" data-feld="anker" value="${sicher(c.anker)}"></label>
        <label class="feld"><span>Riss</span><input type="text" data-feld="riss" value="${sicher(c.riss)}"></label>
        <label class="feld"><span>Ausrüstung (sechs Dinge am Körper)</span><textarea data-feld="ausruestung" rows="3">${sicher(c.ausruestung)}</textarea></label>
        <p class="hinweis-schild">Zeit mit dem Anker gibt 1W6 Stabilität zurück, einmal pro Spielabend.</p>
      </div>
    </div>

    ${steigerungsKarte(c, darfSteigern)}
  `;

  bindeSpeichernKopf();
  bindeFelder(behaelter);
  bindeZaehler(behaelter);
  bindeWuerfe(behaelter);
  bindeNotizbuch(behaelter);
  bindeSteigerung(behaelter, darfSteigern);

  $('btn-bearbeiten')?.addEventListener('click', async () => {
    meiner.fertig = false;
    geaendert();
    await alleSpeichern();
  });

  $('btn-narbe')?.addEventListener('click', async () => {
    const wert = $('narbe-eingabe').value.trim();
    if (!wert) return;
    meiner.narben = [...(meiner.narben || []), wert];
    geaendert();
    zeichnen();
  });
}

/** Das Notizbuch schreibt nur in den lokalen Entwurf
    (notizenText) — geschrieben wird wie überall erst über den
    Speichern-Knopf bzw. den gemeinsamen Änderungspuffer. */
function bindeNotizbuch(behaelter) {
  const feld = behaelter.querySelector('[data-notizbuch]');
  if (!feld) return;
  feld.addEventListener('input', () => {
    notizenText = feld.value;
    notizenGeaendert();
  });
}

/* ------------------------------------------------------------
   Steigerung
   ------------------------------------------------------------ */

/** Was kostet der nächste Punkt? Werte aus dem Regelheft. */
function kostenAttribut(aktuell) { return aktuell < 5 ? 6 : 10; }
function kostenFertigkeit(aktuell) { return aktuell < 3 ? 2 : 4; }

function steigerungsKarte(c, darfSteigern) {
  if (!darfSteigern) {
    return `
      <div class="karte karte-breit">
        <div class="karte-kopf"><h2>Fortschritt</h2></div>
        <div class="punkte-anzeige offen">
          <span class="zahl">${c.fp || 0}</span><span class="leise">Fortschrittspunkte gesammelt</span>
        </div>
        <p class="hinweis-schild">Der Spielleiter schaltet das Steigern frei, wenn ihr eine Sitzung abgeschlossen habt.
        Bis dahin sammeln sich die Punkte einfach an.</p>
      </div>`;
  }

  const fp = c.fp || 0;

  return `
    <div class="karte karte-breit">
      <div class="karte-kopf">
        <h2>Fortschritt — freigeschaltet</h2>
        <span class="hinweis">Du kannst nur verbessern, was du im Spiel benutzt oder geübt hast. Ein Satz Begründung reicht dem Spielleiter.</span>
      </div>
      <div class="punkte-anzeige ${fp > 0 ? 'offen' : 'passt'}">
        <span class="zahl">${fp}</span><span class="leise">Fortschrittspunkte</span>
      </div>

      <div class="bogen-gitter gitter-drei">
        <div>
          <h3 class="unter" style="font-size:15px;margin-top:0">Attribute (max. 7)</h3>
          ${Object.entries(ATTRIBUTE).map(([k, bez]) => {
            const wert = c.attribute[k], kosten = kostenAttribut(wert);
            return `<div class="stufen-zeile">
              <span class="bez">${bez}</span>
              <span class="stand">${wert}</span>
              <span class="kosten">${wert >= 7 ? 'max' : kosten + ' FP'}</span>
              <button type="button" data-steigern="attribut:${k}:${kosten}" ${wert >= 7 || fp < kosten ? 'disabled' : ''}>+</button>
            </div>`;
          }).join('')}
        </div>

        <div>
          <h3 class="unter" style="font-size:15px;margin-top:0">Fertigkeiten (max. 5)</h3>
          ${Object.entries(FERTIGKEITEN).map(([k, bez]) => {
            const wert = c.fertigkeiten[k], kosten = kostenFertigkeit(wert);
            return `<div class="stufen-zeile">
              <span class="bez">${bez}</span>
              <span class="stand">${wert}</span>
              <span class="kosten">${wert >= 5 ? 'max' : kosten + ' FP'}</span>
              <button type="button" data-steigern="fertigkeit:${k}:${kosten}" ${wert >= 5 || fp < kosten ? 'disabled' : ''}>+</button>
            </div>`;
          }).join('')}
        </div>

        <div>
          <h3 class="unter" style="font-size:15px;margin-top:0">Sonstiges</h3>
          <div class="stufen-zeile">
            <span class="bez">+3 maximale Lebenspunkte</span>
            <span class="kosten">3 FP</span>
            <button type="button" data-steigern="lp::3" ${fp < 3 ? 'disabled' : ''}>+</button>
          </div>
          <div class="stufen-zeile">
            <span class="bez">+3 maximale Stabilität</span>
            <span class="kosten">3 FP</span>
            <button type="button" data-steigern="stab::3" ${fp < 3 ? 'disabled' : ''}>+</button>
          </div>
          <div class="stufen-zeile">
            <span class="bez">Neue Stärke</span>
            <span class="kosten">4 FP</span>
            <button type="button" data-steigern="staerke::4" ${fp < 4 ? 'disabled' : ''}>+</button>
          </div>
        </div>
      </div>
    </div>`;
}

function bindeSteigerung(behaelter, darfSteigern) {
  if (!darfSteigern) return;

  behaelter.querySelectorAll('[data-steigern]').forEach(knopf => {
    knopf.addEventListener('click', async () => {
      const [art, schluessel, kostenText] = knopf.dataset.steigern.split(':');
      const kosten = parseInt(kostenText, 10);
      if ((meiner.fp || 0) < kosten) return;

      const aenderung = { fp: (meiner.fp || 0) - kosten };

      if (art === 'attribut') {
        meiner.attribute[schluessel]++;
        aenderung.attribute = meiner.attribute;
      } else if (art === 'fertigkeit') {
        meiner.fertigkeiten[schluessel]++;
        aenderung.fertigkeiten = meiner.fertigkeiten;
      } else if (art === 'lp') {
        meiner.bonusLp = (meiner.bonusLp || 0) + 3;
        aenderung.bonusLp = meiner.bonusLp;
      } else if (art === 'stab') {
        meiner.bonusStab = (meiner.bonusStab || 0) + 3;
        aenderung.bonusStab = meiner.bonusStab;
      } else if (art === 'staerke') {
        const text = prompt('Neue Stärke — was hat dein Charakter im Spiel gelernt?');
        if (!text || !text.trim()) return;
        meiner.staerken = [...meiner.staerken, text.trim()];
        aenderung.staerken = meiner.staerken;
      }

      meiner.fp = aenderung.fp;
      geaendert();
      zeichnen();
      status('gesteigert — nicht vergessen zu speichern');
    });
  });
}

/* ------------------------------------------------------------
   Zähler und Würfe
   ------------------------------------------------------------ */

function bindeZaehler(behaelter) {
  behaelter.querySelectorAll('[data-zaehler]').forEach(knopf => {
    knopf.addEventListener('click', async () => {
      const [feld, schritt] = knopf.dataset.zaehler.split(':');
      const grenzen = {
        lp:   [0, maxLp(meiner)],
        stab: [0, maxStab(meiner)],
        sp:   [0, 3]
      }[feld];

      const neu = Math.max(grenzen[0], Math.min(grenzen[1], meiner[feld] + parseInt(schritt, 10)));
      meiner[feld] = neu;
      geaendert();
      zeichnen();
    });
  });
}

/* Nur Attribute lassen sich per Antippen würfeln — eindeutig,
   weil ein Attribut allein steht. Bei Fertigkeiten wäre das
   Attribut dazu situationsabhängig (siehe Regeln), ein fest
   verdrahteter Würfeln-Knopf würde also eher verwirren als
   helfen. Der Bogen bietet hier bewusst nur Orientierung. */
function bindeWuerfe(behaelter) {
  behaelter.querySelectorAll('[data-wurf]').forEach(el => {
    el.addEventListener('click', () => {
      const [, schluessel] = el.dataset.wurf.split(':');
      wuerfelnMit(meiner.attribute[schluessel], ATTRIBUTE[schluessel]);
    });
  });
}

/* ------------------------------------------------------------
   Speichern
   ------------------------------------------------------------ */

/* Die frühere Einzelfeld-Speicherung ist entfallen. Geschrieben
   wird nur noch über speichernAlles() oben — ausgelöst durch den
   Speichern-Knopf, die Zehn-Minuten-Sicherung oder eine klare
   Entscheidung wie „Fertig". */
