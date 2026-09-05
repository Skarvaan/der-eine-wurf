/* ============================================================
   ZONE „SPIELLEITUNG“
   ============================================================

   Fünf Untertabs:

     uebersicht  Alle Charaktere auf einen Blick, FP vergeben
     fall        Wahrheitsnotiz, Erkenntnisse, Uhr, Festlegungen
     welt        Orte, Personen, Fraktionen, Geheimnisse
                 — jeder Eintrag lässt sich an alle freigeben
     tabellen    Würfeltabellen und Kombiwürfe
     runde       Spieler einladen, Steigern freischalten

   Alles in diesem Bereich liegt in der Sammlung "sl", die
   Spieler laut Sicherheitsregeln gar nicht lesen dürfen.
   Freigeben heißt deshalb: eine Kopie in "geteilt" anlegen.
   Das Original bleibt hier und kann Notizen enthalten, die
   niemand sehen soll.
   ============================================================ */

import { SLNotizen, Geteilt, Charaktere, Gruppen } from './speicher.js';
import { $, $$, sicher, verzoegert, status, sitzung, merkeAbo, zufall } from './app.js';
import { TABELLEN, KOMBIS } from './daten/tabellen.js';

const WELT_ARTEN = {
  ort:        'Ort',
  person:     'Person',
  fraktion:   'Fraktion',
  geheimnis:  'Geheimnis',
  notiz:      'Notiz'
};

let gid = null;
let notizen = [];       // alles aus der Sammlung "sl"
let charaktere = [];
let aktiverTab = 'uebersicht';
let aktiverFallId = null;
let abos = [];

export function beendeSL() {
  abos.forEach(f => { try { f(); } catch (e) {} });
  abos = [];
  notizen = []; charaktere = [];
}

export function starteSL(gruppenId) {
  gid = gruppenId;

  $$('#sl-tabs .untertab').forEach(tab => {
    tab.addEventListener('click', () => {
      aktiverTab = tab.dataset.sl;
      $$('#sl-tabs .untertab').forEach(t => t.classList.toggle('aktiv', t === tab));
      zeichnen();
    });
  });

  const a1 = SLNotizen.abonnieren(gid, (liste) => {
    notizen = liste;
    if (!aktiverFallId) {
      const faelle = notizen.filter(n => n.typ === 'fall');
      aktiverFallId = faelle[0]?.id || null;
    }
    zeichnen();
  });

  const a2 = Charaktere.abonnieren(gid, (liste) => {
    charaktere = liste;
    zeichnen();
  });

  abos = [a1, a2];
  abos.forEach(merkeAbo);
  document.addEventListener('gruppe-geaendert', zeichnen);
}

/* ============================================================
   ZEICHNEN
   ============================================================ */

function zeichnen() {
  const behaelter = $('sl-bereich');
  if (!behaelter || !sitzung.istSL) return;

  const zeichner = {
    uebersicht: zeichneUebersicht,
    fall:       zeichneFall,
    welt:       zeichneWelt,
    tabellen:   zeichneTabellen,
    runde:      zeichneRunde
  }[aktiverTab];

  zeichner(behaelter);
}

/* ============================================================
   1  CHARAKTERÜBERSICHT
   ============================================================ */

function zeichneUebersicht(behaelter) {
  if (!charaktere.length) {
    behaelter.innerHTML = `<div class="karte"><div class="karte-kopf"><h2>Charaktere</h2></div>
      <p class="leise">Noch keine Charaktere. Lade deine Spieler unter „Runde“ ein.</p></div>`;
    return;
  }

  behaelter.innerHTML = charaktere.map(c => {
    const lpMax   = 10 + (c.attribute?.koerper || 0) * 2 + (c.bonusLp || 0);
    const stabMax = 10 + (c.attribute?.wille || 0) * 2 + (c.bonusStab || 0);
    const vt      = 10 + (c.attribute?.geschick || 0) + (c.fertigkeiten?.nahkampf || 0);

    const lpKlasse   = c.lp <= 0 ? 'gefahr' : c.lp <= lpMax / 2 ? 'warnung' : 'ok';
    const stabKlasse = c.stab <= 0 ? 'gefahr' : c.stab <= stabMax / 2 ? 'warnung' : 'ok';

    // Die drei besten Fertigkeiten — reicht für den Überblick
    const beste = Object.entries(c.fertigkeiten || {})
      .filter(([, w]) => w > 0).sort((a, b) => b[1] - a[1]).slice(0, 4)
      .map(([k, w]) => `${k} ${w}`).join(' · ');

    return `
    <div class="karte">
      <div class="karte-kopf">
        <h2>${sicher(c.name || 'Ohne Namen')}</h2>
        <span class="hinweis">${sicher(c.hintergrund || '')}</span>
      </div>

      <div class="zaehler">
        <span class="titel">LP</span>
        <span class="stand zustand ${lpKlasse}">${c.lp} / ${lpMax}</span>
        <span class="titel">Stabilität</span>
        <span class="stand zustand ${stabKlasse}">${c.stab} / ${stabMax}</span>
        <span class="titel">VT</span>
        <span class="stand">${vt}</span>
        <span class="titel">Schicksal</span>
        <span class="stand">${c.sp || 0}</span>
      </div>

      <div class="werte-gitter">
        ${Object.entries({K:'koerper',G:'geschick',V:'verstand',W:'wahrnehmung',Wi:'wille',A:'ausstrahlung'})
          .map(([kurz, k]) => `<div class="wert-kachel"><span>${kurz}</span><b>${c.attribute?.[k] ?? '–'}</b></div>`).join('')}
      </div>

      <p class="leise" style="margin-bottom:8px">${sicher(beste) || 'Keine Fertigkeiten verteilt.'}</p>

      <ul class="liste">
        ${(c.staerken || []).filter(Boolean).map(s => `<li><span style="flex:1">${sicher(s)}</span><span class="marke ort">Stärke</span></li>`).join('')}
        ${(c.makel || []).filter(Boolean).map(m => `<li><span style="flex:1">${sicher(m)}</span><span class="marke sl">Makel</span></li>`).join('')}
        ${(c.narben || []).map(n => `<li><span style="flex:1">${sicher(n)}</span><span class="marke sl">Narbe</span></li>`).join('')}
      </ul>

      ${c.anker || c.riss ? `
      <p class="leise" style="margin-top:10px">
        ${c.anker ? `<b>Anker:</b> ${sicher(c.anker)}<br>` : ''}
        ${c.riss  ? `<b>Riss:</b> ${sicher(c.riss)}` : ''}
      </p>` : ''}

      <div class="eintrag-fuss">
        <span class="leise" style="font-size:13px">${c.fp || 0} FP</span>
        <button type="button" class="knopf-klein" data-fp="${c.id}:1">+1 FP</button>
        <button type="button" class="knopf-klein" data-fp="${c.id}:2">+2 FP (Abschluss)</button>
        <button type="button" class="knopf-klein" data-heilen="${c.id}">Voll heilen</button>
      </div>
    </div>`;
  }).join('');

  // FP vergeben
  behaelter.querySelectorAll('[data-fp]').forEach(knopf => {
    knopf.addEventListener('click', async () => {
      const [id, menge] = knopf.dataset.fp.split(':');
      const c = charaktere.find(x => x.id === id);
      await Charaktere.aendern(gid, id, { fp: (c.fp || 0) + parseInt(menge, 10) });
      status('FP vergeben');
    });
  });

  behaelter.querySelectorAll('[data-heilen]').forEach(knopf => {
    knopf.addEventListener('click', async () => {
      const c = charaktere.find(x => x.id === knopf.dataset.heilen);
      await Charaktere.aendern(gid, c.id, {
        lp:   10 + (c.attribute?.koerper || 0) * 2 + (c.bonusLp || 0),
        stab: 10 + (c.attribute?.wille || 0) * 2 + (c.bonusStab || 0)
      });
      status('geheilt');
    });
  });
}

/* ============================================================
   2  FALLBLATT
   ============================================================ */

function zeichneFall(behaelter) {
  const faelle = notizen.filter(n => n.typ === 'fall');
  const fall = faelle.find(f => f.id === aktiverFallId) || faelle[0] || null;

  if (!fall) {
    behaelter.innerHTML = `
      <div class="karte">
        <div class="karte-kopf"><h2>Fallblatt</h2>
          <span class="hinweis">Fünf Zeilen Wahrheit, und du kannst den ganzen Abend improvisieren. Alles Weitere begründest du im Spiel rückwärts.</span></div>
        <button type="button" class="knopf knopf-haupt" id="btn-fall-neu">Ersten Fall anlegen</button>
      </div>`;
    $('btn-fall-neu').addEventListener('click', fallAnlegen);
    return;
  }

  aktiverFallId = fall.id;
  const uhr = fall.uhr || 0;

  behaelter.innerHTML = `
    <div class="karte">
      <div class="karte-kopf">
        <h2>Fall</h2>
        <select id="fall-wahl" style="min-height:38px;padding:4px 8px;border:1px solid var(--linie);border-radius:8px;background:var(--bg);color:var(--text)">
          ${faelle.map(f => `<option value="${f.id}" ${f.id === fall.id ? 'selected' : ''}>${sicher(f.titel || 'Ohne Titel')}</option>`).join('')}
        </select>
        <button type="button" class="knopf-klein" id="btn-fall-neu">Neu</button>
      </div>

      <label class="feld"><span>Titel</span>
        <input type="text" data-fall="titel" value="${sicher(fall.titel || '')}"></label>
      <label class="feld"><span>Was ist passiert</span>
        <textarea data-fall="passiert" rows="2">${sicher(fall.passiert || '')}</textarea></label>
      <label class="feld"><span>Wer war es</span>
        <textarea data-fall="wer" rows="2">${sicher(fall.wer || '')}</textarea></label>
      <label class="feld"><span>Was wollte er</span>
        <textarea data-fall="wollte" rows="2">${sicher(fall.wollte || '')}</textarea></label>
      <label class="feld"><span>Was ging schief</span>
        <textarea data-fall="schief" rows="2">${sicher(fall.schief || '')}</textarea></label>
      <label class="feld feld-betont"><span>Was passiert als Nächstes, wenn niemand eingreift</span>
        <textarea data-fall="naechstes" rows="2">${sicher(fall.naechstes || '')}</textarea></label>
    </div>

    <div class="karte">
      <div class="karte-kopf"><h2>Die drei Erkenntnisse</h2>
        <span class="hinweis">Wozu die Gruppe kommen soll. Für jede: drei Hinweise, drei Orte, drei Fertigkeiten.</span></div>
      <label class="feld"><span>1</span><input type="text" data-fall="erkenntnis1" value="${sicher(fall.erkenntnis1 || '')}"></label>
      <label class="feld"><span>2</span><input type="text" data-fall="erkenntnis2" value="${sicher(fall.erkenntnis2 || '')}"></label>
      <label class="feld"><span>3</span><input type="text" data-fall="erkenntnis3" value="${sicher(fall.erkenntnis3 || '')}"></label>
    </div>

    <div class="karte">
      <div class="karte-kopf"><h2>Die Uhr</h2>
        <span class="hinweis">Ein Feld pro Szene ohne Fortschritt oder pro Fehler der Gruppe. Sie füllt sich nicht als Strafe — die Welt läuft weiter.</span></div>
      <div class="uhr">
        ${[1,2,3,4].map(i => `<button type="button" data-uhr="${i}" class="${i <= uhr ? 'voll' : ''}">${i}</button>`).join('')}
      </div>
      <p class="leise">
        <b>1</b> Etwas verschwindet: Zeuge, Dokument, Spur<br>
        <b>2</b> Der Gegner handelt: jemand wird bedroht, versetzt, gekauft<br>
        <b>3</b> Es wird persönlich gefährlich für die Gruppe<br>
        <b>4</b> Das, was in Zeile fünf steht, passiert
      </p>
    </div>

    <div class="karte">
      <div class="karte-kopf"><h2>Festgelegt im Spiel</h2>
        <span class="hinweis">Sobald eine Spielerentscheidung von einer Antwort abhängt: hier eintragen. Ab dann ist es Kanon.</span></div>
      <div class="zeile-eingabe">
        <input type="text" id="festlegung-eingabe" placeholder="z. B. Grothe war an dem Abend im Haus">
        <button type="button" class="knopf" id="btn-festlegung">Festlegen</button>
      </div>
      <ul class="liste">
        ${(fall.festlegungen || []).map((f, i) => `
          <li><span style="flex:1">${sicher(f)}</span>
          <button type="button" class="loeschen" data-fweg="${i}">×</button></li>`).join('')
          || '<li class="leise">Noch nichts festgelegt.</li>'}
      </ul>
    </div>

    <div class="karte">
      <div class="karte-kopf"><h2>Theorien der Spieler</h2>
        <span class="hinweis">Mittippen, was am Tisch gesagt wird. Falsche Theorien werden zu echten Fährten — nie zu Sackgassen.</span></div>
      <div class="zeile-eingabe">
        <input type="text" id="theorie-eingabe" placeholder="„Die haben nachts was anderes produziert“">
        <button type="button" class="knopf" id="btn-theorie">Notieren</button>
      </div>
      <ul class="liste">
        ${(fall.theorien || []).map((t, i) => `
          <li><span style="flex:1">${sicher(t)}</span>
          <button type="button" class="loeschen" data-tweg="${i}">×</button></li>`).join('')
          || '<li class="leise">Noch nichts notiert.</li>'}
      </ul>
    </div>

    <div class="karte">
      <div class="karte-kopf"><h2>Diesen Fall löschen</h2></div>
      <button type="button" class="knopf knopf-gefahr" id="btn-fall-weg">Löschen</button>
    </div>
  `;

  // --- Ereignisse ---
  $('btn-fall-neu').addEventListener('click', fallAnlegen);

  $('fall-wahl').addEventListener('change', (e) => {
    aktiverFallId = e.target.value;
    zeichnen();
  });

  behaelter.querySelectorAll('[data-fall]').forEach(el => {
    el.addEventListener('input', verzoegert(async () => {
      await SLNotizen.aendern(gid, fall.id, { [el.dataset.fall]: el.value });
      status('gespeichert');
    }));
  });

  behaelter.querySelectorAll('[data-uhr]').forEach(knopf => {
    knopf.addEventListener('click', async () => {
      const i = parseInt(knopf.dataset.uhr, 10);
      await SLNotizen.aendern(gid, fall.id, { uhr: uhr === i ? i - 1 : i });
    });
  });

  const anhaengen = async (feld, wert) => {
    const liste = [...(fall[feld] || []), wert];
    await SLNotizen.aendern(gid, fall.id, { [feld]: liste });
  };

  $('btn-festlegung').addEventListener('click', async () => {
    const wert = $('festlegung-eingabe').value.trim();
    if (wert) { await anhaengen('festlegungen', wert); }
  });
  $('festlegung-eingabe').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-festlegung').click(); });

  $('btn-theorie').addEventListener('click', async () => {
    const wert = $('theorie-eingabe').value.trim();
    if (wert) { await anhaengen('theorien', wert); }
  });
  $('theorie-eingabe').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-theorie').click(); });

  behaelter.querySelectorAll('[data-fweg]').forEach(k => k.addEventListener('click', async () => {
    const liste = (fall.festlegungen || []).filter((_, i) => i !== parseInt(k.dataset.fweg, 10));
    await SLNotizen.aendern(gid, fall.id, { festlegungen: liste });
  }));

  behaelter.querySelectorAll('[data-tweg]').forEach(k => k.addEventListener('click', async () => {
    const liste = (fall.theorien || []).filter((_, i) => i !== parseInt(k.dataset.tweg, 10));
    await SLNotizen.aendern(gid, fall.id, { theorien: liste });
  }));

  $('btn-fall-weg').addEventListener('click', async () => {
    if (!confirm('Diesen Fall wirklich löschen?')) return;
    await SLNotizen.loeschen(gid, fall.id);
    aktiverFallId = null;
  });
}

async function fallAnlegen() {
  const id = await SLNotizen.anlegen(gid, {
    typ: 'fall', titel: 'Neuer Fall',
    passiert: '', wer: '', wollte: '', schief: '', naechstes: '',
    erkenntnis1: '', erkenntnis2: '', erkenntnis3: '',
    uhr: 0, festlegungen: [], theorien: []
  });
  aktiverFallId = id;
}

/* ============================================================
   3  WELT
   ============================================================ */

function zeichneWelt(behaelter) {
  const eintraege = notizen
    .filter(n => n.typ === 'welt')
    .sort((a, b) => (a.art || '').localeCompare(b.art || ''));

  behaelter.innerHTML = `
    <div class="karte">
      <div class="karte-kopf"><h2>Neuer Welteintrag</h2>
        <span class="hinweis">Was du hier notierst, sieht nur du. Mit „An alle freigeben“ schiebst du eine Kopie in den gemeinsamen Bereich — dein Original mit den Geheimnissen bleibt hier.</span></div>
      <div class="zeile-eingabe">
        <select id="welt-art">
          ${Object.entries(WELT_ARTEN).map(([k, b]) => `<option value="${k}">${b}</option>`).join('')}
        </select>
        <input type="text" id="welt-titel" placeholder="Name">
      </div>
      <label class="feld"><span>Text</span><textarea id="welt-text" rows="3"></textarea></label>
      <button type="button" class="knopf knopf-haupt" id="btn-welt-neu">Anlegen</button>
    </div>

    ${eintraege.length ? eintraege.map(e => `
      <div class="eintrag" data-id="${e.id}">
        <div class="eintrag-kopf">
          <h4>${sicher(e.titel || 'Ohne Titel')}</h4>
          <span class="marke ${e.art === 'geheimnis' ? 'sl' : 'nsc'}">${WELT_ARTEN[e.art] || 'Notiz'}</span>
        </div>
        <p>${sicher(e.text || '')}</p>
        <div class="eintrag-fuss">
          <button type="button" class="knopf-klein" data-welt-aendern="${e.id}">Ändern</button>
          <button type="button" class="knopf-klein" data-freigeben="${e.id}">An alle freigeben</button>
          <button type="button" class="knopf-klein knopf-gefahr" data-welt-weg="${e.id}">Löschen</button>
          ${e.freigegeben ? '<span class="marke journal">bereits freigegeben</span>' : ''}
        </div>
      </div>`).join('')
    : '<div class="karte"><p class="leise">Noch nichts notiert. Drei Orte, drei Personen mit je einem Wunsch und einem Geheimnis — das trägt einen ganzen Abend.</p></div>'}
  `;

  $('btn-welt-neu').addEventListener('click', async () => {
    const titel = $('welt-titel').value.trim();
    const text  = $('welt-text').value.trim();
    if (!titel && !text) return;
    await SLNotizen.anlegen(gid, { typ: 'welt', art: $('welt-art').value, titel, text });
    $('welt-titel').value = ''; $('welt-text').value = '';
    status('angelegt');
  });

  // Achtung: data-welt-weg landet in JavaScript als dataset.weltWeg
  behaelter.querySelectorAll('[data-welt-weg]').forEach(k => k.addEventListener('click', async () => {
    if (!confirm('Eintrag löschen?')) return;
    await SLNotizen.loeschen(gid, k.dataset.weltWeg);
  }));

  behaelter.querySelectorAll('[data-freigeben]').forEach(k => k.addEventListener('click', async () => {
    const e = notizen.find(x => x.id === k.dataset.freigeben);
    if (!e) return;

    // Der Spielleiter darf den Text vor der Freigabe kürzen —
    // meistens soll nicht alles nach außen.
    const text = prompt('Was sollen die Spieler sehen? (Text bearbeiten)', e.text || '');
    if (text === null) return;

    await Geteilt.anlegen(gid, {
      typ: e.art === 'person' ? 'nsc' : e.art === 'ort' ? 'ort' : 'indiz',
      titel: e.titel, text, bild: ''
    });
    await SLNotizen.aendern(gid, e.id, { freigegeben: true });
    status('freigegeben');
  }));

  behaelter.querySelectorAll('[data-welt-aendern]').forEach(k => k.addEventListener('click', () => {
    const e = notizen.find(x => x.id === k.dataset.weltAendern);
    if (!e) return;
    const kasten = behaelter.querySelector(`.eintrag[data-id="${e.id}"]`);
    kasten.innerHTML = `
      <label class="feld"><span>Titel</span><input type="text" class="b-titel" value="${sicher(e.titel || '')}"></label>
      <label class="feld"><span>Text</span><textarea class="b-text" rows="5">${sicher(e.text || '')}</textarea></label>
      <div style="display:flex;gap:8px">
        <button type="button" class="knopf knopf-haupt b-ok">Speichern</button>
        <button type="button" class="knopf b-ab">Abbrechen</button>
      </div>`;
    kasten.querySelector('.b-ok').addEventListener('click', async () => {
      await SLNotizen.aendern(gid, e.id, {
        titel: kasten.querySelector('.b-titel').value.trim(),
        text:  kasten.querySelector('.b-text').value.trim()
      });
    });
    kasten.querySelector('.b-ab').addEventListener('click', zeichnen);
  }));
}

/* ============================================================
   4  TABELLEN
   ============================================================ */

let letztesErgebnis = [];

function eintraegeVon(pfad) {
  const [g, l] = pfad.split('.');
  return TABELLEN[g]?.listen[l]?.eintraege || [];
}

function zeichneTabellen(behaelter) {
  behaelter.innerHTML = `
    <div class="karte">
      <div class="karte-kopf"><h2>Kombiwürfe</h2>
        <span class="hinweis">Ein Tipp, mehrere Tabellen gleichzeitig.</span></div>
      <div class="knopf-gitter" id="kombi-knoepfe"></div>
    </div>

    <div class="karte karte-ergebnis" id="tab-ergebnis" hidden>
      <div class="karte-kopf"><h2>Ergebnis</h2>
        <button type="button" class="knopf-klein" id="btn-erg-welt">Als Welteintrag speichern</button></div>
      <div id="erg-inhalt"></div>
    </div>

    <div class="karte">
      <div class="karte-kopf"><h2>Einzeltabellen</h2></div>
      <label class="feld"><span>Suchen</span>
        <input type="search" id="tab-suche" placeholder="z. B. unheimlich, Bauteil, Wunsch"></label>
      <div id="tab-liste"></div>
    </div>`;

  // Kombiwürfe
  const gitter = $('kombi-knoepfe');
  KOMBIS.forEach(kombi => {
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.textContent = kombi.titel;
    knopf.addEventListener('click', () => {
      ergebnisZeigen(kombi.listen.map(l => ({ label: l.label, wert: zufall(eintraegeVon(l.pfad)) })));
    });
    gitter.appendChild(knopf);
  });

  einzelnZeichnen();
  $('tab-suche').addEventListener('input', e => einzelnZeichnen(e.target.value));

  $('btn-erg-welt').addEventListener('click', async () => {
    if (!letztesErgebnis.length) return;
    const titel = prompt('Name für den Eintrag?', letztesErgebnis[0].wert.slice(0, 40));
    if (!titel) return;
    await SLNotizen.anlegen(gid, {
      typ: 'welt', art: 'notiz', titel,
      text: letztesErgebnis.map(z => `${z.label}: ${z.wert}`).join('\n')
    });
    status('als Welteintrag gespeichert');
  });
}

function einzelnZeichnen(filter = '') {
  const behaelter = $('tab-liste');
  const suche = filter.trim().toLowerCase();
  behaelter.innerHTML = '';

  Object.entries(TABELLEN).forEach(([gs, gruppe]) => {
    const treffer = Object.entries(gruppe.listen).filter(([, l]) =>
      !suche || l.titel.toLowerCase().includes(suche) || gruppe.titel.toLowerCase().includes(suche));
    if (!treffer.length) return;

    const block = document.createElement('div');
    block.className = 'tabellen-gruppe';
    block.innerHTML = `<h3>${sicher(gruppe.titel)}</h3>`;

    treffer.forEach(([ls, liste]) => {
      const pfad = `${gs}.${ls}`;
      const reihe = document.createElement('div');
      reihe.className = 'tabellen-reihe';
      reihe.innerHTML = `<span class="name">${sicher(liste.titel)}</span>
                         <span class="anzahl">${liste.eintraege.length}</span>`;
      const knopf = document.createElement('button');
      knopf.className = 'knopf-klein';
      knopf.type = 'button';
      knopf.textContent = 'Würfeln';
      knopf.addEventListener('click', () =>
        ergebnisZeigen([{ label: liste.titel, wert: zufall(eintraegeVon(pfad)) }]));
      reihe.appendChild(knopf);
      block.appendChild(reihe);
    });

    behaelter.appendChild(block);
  });
}

function ergebnisZeigen(zeilen) {
  letztesErgebnis = zeilen;
  $('tab-ergebnis').hidden = false;
  $('erg-inhalt').innerHTML = zeilen.map(z =>
    `<div class="ergebnis-zeile"><span class="label">${sicher(z.label)}</span>
     <span class="wert">${sicher(z.wert)}</span></div>`).join('');
  $('tab-ergebnis').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ============================================================
   5  RUNDE
   ============================================================ */

function zeichneRunde(behaelter) {
  const g = sitzung.gruppe;
  const mitglieder = Object.entries(g.mitglieder || {});

  behaelter.innerHTML = `
    <div class="karte">
      <div class="karte-kopf"><h2>Spieler einladen</h2>
        <span class="hinweis">Trag die E-Mail ein, mit der sich der Spieler anmeldet. Er sieht die Einladung dann beim nächsten Start.</span></div>
      <div class="zeile-eingabe">
        <input type="email" id="einladung-mail" placeholder="name@beispiel.de" inputmode="email">
        <button type="button" class="knopf knopf-haupt" id="btn-einladen">Einladen</button>
      </div>
      <ul class="liste">
        ${(g.eingeladeneMails || []).map(m => `
          <li><span style="flex:1">${sicher(m)}</span>
          <button type="button" class="loeschen" data-einladung-weg="${sicher(m)}" title="Einladung zurücknehmen">×</button></li>`).join('')
          || '<li class="leise">Noch niemand eingeladen.</li>'}
      </ul>
    </div>

    <div class="karte">
      <div class="karte-kopf"><h2>In der Runde</h2></div>
      <ul class="liste">
        ${mitglieder.map(([uid, m]) => `
          <li><span style="flex:1">${sicher(m.name)}</span>
          <span class="marke ${m.rolle === 'sl' ? 'sl' : 'journal'}">${m.rolle === 'sl' ? 'Spielleitung' : 'Spieler'}</span></li>`).join('')}
      </ul>
    </div>

    <div class="karte">
      <div class="karte-kopf"><h2>Freigaben</h2>
        <span class="hinweis">Schalte das Steigern frei, wenn ihr eine Sitzung abgeschlossen habt. Danach wieder zu — dann sammeln sich die Punkte nur an.</span></div>
      <div class="zaehler">
        <span class="titel" style="flex:1">Charaktere dürfen steigern</span>
        <button type="button" class="knopf ${g.freigaben?.steigern ? 'knopf-haupt' : ''}" id="btn-steigern">
          ${g.freigaben?.steigern ? 'Freigeschaltet — jetzt schließen' : 'Steigern freischalten'}
        </button>
      </div>
    </div>

    <div class="karte">
      <div class="karte-kopf"><h2>Fortschrittspunkte für alle</h2>
        <span class="hinweis">1 FP pro Sitzung, 2 bei einem Abschluss.</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="knopf" data-alle-fp="1">Allen +1 FP</button>
        <button type="button" class="knopf" data-alle-fp="2">Allen +2 FP</button>
      </div>
    </div>`;

  $('btn-einladen').addEventListener('click', async () => {
    const mail = $('einladung-mail').value.trim().toLowerCase();
    if (!mail || !mail.includes('@')) return alert('Bitte eine gültige E-Mail eintragen.');
    await Gruppen.einladen(gid, mail);
    $('einladung-mail').value = '';
    status('eingeladen');
  });

  behaelter.querySelectorAll('[data-einladung-weg]').forEach(k =>
    k.addEventListener('click', () => Gruppen.einladungZuruecknehmen(gid, k.dataset.einladungWeg)));

  $('btn-steigern').addEventListener('click', async () => {
    await Gruppen.freigabeSetzen(gid, 'steigern', !g.freigaben?.steigern);
    status(g.freigaben?.steigern ? 'geschlossen' : 'freigeschaltet');
  });

  behaelter.querySelectorAll('[data-alle-fp]').forEach(k =>
    k.addEventListener('click', async () => {
      const menge = parseInt(k.dataset.alleFp, 10);
      for (const c of charaktere) {
        await Charaktere.aendern(gid, c.id, { fp: (c.fp || 0) + menge });
      }
      status(`allen +${menge} FP`);
    }));
}
