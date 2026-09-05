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

import { Charaktere } from './speicher.js';
import { $, sicher, verzoegert, status, sitzung, merkeAbo, wuerfelnMit } from './app.js';

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
   Zustand dieses Moduls
   ------------------------------------------------------------ */

let gid = null;
let meiner = null;         // mein Charakter oder null
let aboBeenden = null;

export function beendeCharakter() {
  if (aboBeenden) { aboBeenden(); aboBeenden = null; }
  meiner = null;
}

export function starteCharakter(gruppenId) {
  gid = gruppenId;

  aboBeenden = Charaktere.abonnieren(gid, (alle) => {
    meiner = alle.find(c => c.besitzer === sitzung.nutzer.uid) || null;
    zeichnen();
  });
  merkeAbo(aboBeenden);

  // Wenn der Spielleiter die Steigerung freischaltet, neu zeichnen
  document.addEventListener('gruppe-geaendert', zeichnen);
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
        <span class="hinweis">Alle starten auf 0. Verteile 10 Punkte, höchstens bis 3. Eine 0 ist kein Abzug — du darfst alles versuchen.</span>
      </div>
      <div class="punkte-anzeige ${fertigkeitRest === 0 ? 'passt' : fertigkeitRest < 0 ? 'zuviel' : 'offen'}">
        <span class="zahl">${fertigkeitRest}</span>
        <span class="leise">${fertigkeitRest === 0 ? 'Punkte verteilt — passt' : fertigkeitRest > 0 ? 'Punkte übrig' : 'Punkte zu viel'}</span>
      </div>
      ${Object.entries(FERTIGKEITEN).map(([k, bez]) => stufenZeile(
        k, bez, c.fertigkeiten[k], 0, MAX_FERTIGKEIT_START, 'fertigkeit', fertigkeitRest
      )).join('')}
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
      <p class="leise">Wenn dein Makel dir einen Nachteil einbringt, bekommst du einen Schicksalspunkt.</p>
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
      ${fertigMoeglich ? '' : '<p class="leise" style="margin-top:8px">Es fehlt noch: '
        + [ !c.name.trim() ? 'ein Name' : null,
            attributRest !== 0 ? 'die Attributspunkte' : null,
            fertigkeitRest !== 0 ? 'die Fertigkeitspunkte' : null
          ].filter(Boolean).join(', ') + '.</p>'}
    </div>
  `;

  bindeFelder(behaelter);
  bindeStufen(behaelter);

  $('btn-fertig')?.addEventListener('click', async () => {
    meiner.fertig = true;
    meiner.lp = maxLp(meiner);
    meiner.stab = maxStab(meiner);
    await speichern({ fertig: true, lp: meiner.lp, stab: meiner.stab });
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

      zeichnen();   // sofort neu zeichnen, damit die Punkte stimmen
      await speichern(art === 'attribut'
        ? { attribute: meiner.attribute }
        : { fertigkeiten: meiner.fertigkeiten });
    });
  });
}

/** Textfelder an den Charakter binden */
function bindeFelder(behaelter) {
  behaelter.querySelectorAll('[data-feld]').forEach(el => {
    el.addEventListener('input', verzoegert(async () => {
      const feld = el.dataset.feld;

      if (feld.startsWith('staerke')) {
        const i = parseInt(feld.slice(7), 10);
        meiner.staerken[i] = el.value;
        await speichern({ staerken: meiner.staerken });
      } else if (feld.startsWith('makel')) {
        const i = parseInt(feld.slice(5), 10);
        meiner.makel[i] = el.value;
        await speichern({ makel: meiner.makel });
      } else {
        meiner[feld] = el.value;
        await speichern({ [feld]: el.value });
      }
    }));
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
    <div class="karte">
      <div class="karte-kopf">
        <h2>${sicher(c.name)}</h2>
        <button type="button" class="knopf-klein" id="btn-bearbeiten">Bearbeiten</button>
        <span class="hinweis">${sicher(c.hintergrund)}</span>
      </div>

      <div class="zaehler">
        <span class="titel">Lebenspunkte</span>
        <button type="button" data-zaehler="lp:-1">−</button>
        <span class="stand">${c.lp} / ${lpMax}</span>
        <button type="button" data-zaehler="lp:1">+</button>
        ${lpZustand}
      </div>
      <div class="zaehler">
        <span class="titel">Stabilität</span>
        <button type="button" data-zaehler="stab:-1">−</button>
        <span class="stand">${c.stab} / ${stabMax}</span>
        <button type="button" data-zaehler="stab:1">+</button>
        ${stabZustand}
      </div>
      <div class="zaehler">
        <span class="titel">Schicksal</span>
        <button type="button" data-zaehler="sp:-1">−</button>
        <span class="stand">${c.sp} / 3</span>
        <button type="button" data-zaehler="sp:1">+</button>
        <span class="leise" style="font-size:13px">Makel greift → +1</span>
      </div>

      ${angeschlagen && c.lp > 0 ? '<p class="leise" style="color:var(--messing-hell)">Angeschlagen: Nachteil auf alles mit Körper oder Geschick.</p>' : ''}
      ${erschuettert && c.stab > 0 ? '<p class="leise" style="color:var(--messing-hell)">Erschüttert: Nachteil auf alles mit Wille oder Wahrnehmung. Spiel deinen Tick.</p>' : ''}
      ${c.stab <= 0 ? '<p class="leise" style="color:var(--rost)"><b>Gebrochen.</b> Du entscheidest selbst, wie dein Charakter bricht — fliehen, erstarren, zusammenbrechen. Bis zum Ende der Szene.</p>' : ''}
    </div>

    <div class="karte">
      <div class="karte-kopf">
        <h2>Attribute</h2>
        <span class="hinweis">Antippen würfelt nur mit dem Attribut — für alles, was man nicht lernen kann.</span>
      </div>
      <div class="werte-gitter">
        ${Object.entries(ATTRIBUTE).map(([k, bez]) => `
          <button type="button" class="wert-kachel" data-wurf="attribut:${k}" style="cursor:pointer">
            <span>${bez}</span><b>${c.attribute[k]}</b>
          </button>`).join('')}
      </div>
      <div class="werte-gitter">
        <div class="wert-kachel"><span>Verteidigung</span><b>${vert(c)}</b></div>
      </div>
    </div>

    <div class="karte">
      <div class="karte-kopf">
        <h2>Fertigkeiten</h2>
        <span class="hinweis">Antippen: das passende Attribut wählen, dann wird gewürfelt.</span>
      </div>
      ${Object.entries(FERTIGKEITEN).map(([k, bez]) => `
        <div class="stufen-zeile">
          <span class="bez">${bez}</span>
          <span class="stand">${c.fertigkeiten[k]}</span>
          <select data-attributwahl="${k}" style="width:130px;min-height:38px;padding:4px 6px;border:1px solid var(--linie);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px">
            ${Object.entries(ATTRIBUTE).map(([ak, ab]) => `<option value="${ak}">${ab}</option>`).join('')}
          </select>
          <button type="button" class="knopf-klein" data-wurf="fertigkeit:${k}">Würfeln</button>
        </div>`).join('')}
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
      <p class="leise">Narben entstehen, wenn du am Boden lagst oder gebrochen warst. Du formulierst sie selbst.</p>
    </div>

    <div class="karte">
      <div class="karte-kopf"><h2>Anker, Riss, Ausrüstung</h2></div>
      <label class="feld"><span>Anker</span><input type="text" data-feld="anker" value="${sicher(c.anker)}"></label>
      <label class="feld"><span>Riss</span><input type="text" data-feld="riss" value="${sicher(c.riss)}"></label>
      <label class="feld"><span>Ausrüstung (sechs Dinge am Körper)</span><textarea data-feld="ausruestung" rows="3">${sicher(c.ausruestung)}</textarea></label>
      <p class="leise">Zeit mit dem Anker gibt 1W6 Stabilität zurück, einmal pro Spielabend.</p>
    </div>

    ${steigerungsKarte(c, darfSteigern)}
  `;

  bindeFelder(behaelter);
  bindeZaehler(behaelter);
  bindeWuerfe(behaelter);
  bindeSteigerung(behaelter, darfSteigern);

  $('btn-bearbeiten')?.addEventListener('click', async () => {
    meiner.fertig = false;
    await speichern({ fertig: false });
  });

  $('btn-narbe')?.addEventListener('click', async () => {
    const wert = $('narbe-eingabe').value.trim();
    if (!wert) return;
    meiner.narben = [...(meiner.narben || []), wert];
    await speichern({ narben: meiner.narben });
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
      <div class="karte">
        <div class="karte-kopf"><h2>Fortschritt</h2></div>
        <p><b>${c.fp || 0} Fortschrittspunkte</b> gesammelt.</p>
        <p class="leise">Der Spielleiter schaltet das Steigern frei, wenn ihr eine Sitzung abgeschlossen habt.
        Bis dahin sammeln sich die Punkte einfach an.</p>
      </div>`;
  }

  const fp = c.fp || 0;

  return `
    <div class="karte">
      <div class="karte-kopf">
        <h2>Fortschritt — freigeschaltet</h2>
        <span class="hinweis">Du kannst nur verbessern, was du im Spiel benutzt oder geübt hast. Ein Satz Begründung reicht dem Spielleiter.</span>
      </div>
      <div class="punkte-anzeige ${fp > 0 ? 'offen' : 'passt'}">
        <span class="zahl">${fp}</span><span class="leise">Fortschrittspunkte</span>
      </div>

      <h3 class="unter" style="font-size:15px">Attribute (max. 7)</h3>
      ${Object.entries(ATTRIBUTE).map(([k, bez]) => {
        const wert = c.attribute[k], kosten = kostenAttribut(wert);
        return `<div class="stufen-zeile">
          <span class="bez">${bez}</span>
          <span class="stand">${wert}</span>
          <span class="kosten">${wert >= 7 ? 'max' : kosten + ' FP'}</span>
          <button type="button" data-steigern="attribut:${k}:${kosten}" ${wert >= 7 || fp < kosten ? 'disabled' : ''}>+</button>
        </div>`;
      }).join('')}

      <h3 class="unter" style="font-size:15px">Fertigkeiten (max. 5)</h3>
      ${Object.entries(FERTIGKEITEN).map(([k, bez]) => {
        const wert = c.fertigkeiten[k], kosten = kostenFertigkeit(wert);
        return `<div class="stufen-zeile">
          <span class="bez">${bez}</span>
          <span class="stand">${wert}</span>
          <span class="kosten">${wert >= 5 ? 'max' : kosten + ' FP'}</span>
          <button type="button" data-steigern="fertigkeit:${k}:${kosten}" ${wert >= 5 || fp < kosten ? 'disabled' : ''}>+</button>
        </div>`;
      }).join('')}

      <h3 class="unter" style="font-size:15px">Sonstiges</h3>
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
      await speichern(aenderung);
      status('gesteigert');
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
      zeichnen();
      await speichern({ [feld]: neu });
    });
  });
}

function bindeWuerfe(behaelter) {
  behaelter.querySelectorAll('[data-wurf]').forEach(el => {
    el.addEventListener('click', () => {
      const [art, schluessel] = el.dataset.wurf.split(':');

      if (art === 'attribut') {
        wuerfelnMit(meiner.attribute[schluessel], ATTRIBUTE[schluessel]);
        return;
      }

      // Fertigkeit: das gewählte Attribut aus dem Auswahlfeld daneben
      const wahl = behaelter.querySelector(`[data-attributwahl="${schluessel}"]`);
      const attributSchluessel = wahl ? wahl.value : 'verstand';
      const bonus = (meiner.attribute[attributSchluessel] || 0) + (meiner.fertigkeiten[schluessel] || 0);
      wuerfelnMit(bonus, `${ATTRIBUTE[attributSchluessel]} + ${FERTIGKEITEN[schluessel]}`);
    });
  });
}

/* ------------------------------------------------------------
   Speichern
   ------------------------------------------------------------ */

async function speichern(aenderung) {
  try {
    await Charaktere.aendern(gid, meiner.id, aenderung);
    status('gespeichert');
  } catch (fehler) {
    console.error('Charakter konnte nicht gespeichert werden:', fehler);
    status('nicht gespeichert!');
  }
}
