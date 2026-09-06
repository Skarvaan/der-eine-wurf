/* ============================================================
   DER EINE WURF — Hauptablauf
   ============================================================

   Zuständig für:
     - Anmeldung und Registrierung
     - Auswahl der Runde (Gruppe)
     - Rolle bestimmen (Spielleiter oder Spieler)
     - Zonen umschalten
     - Würfelleiste
     - gemeinsam genutzte Hilfsfunktionen

   Die drei Bereiche selbst liegen in eigenen Dateien:
     charakter.js   Zone „Mein Charakter“
     geteilt.js     Zone „Gemeinsam“
     sl.js          Zone „Spielleitung“
   ============================================================ */

import { Auth, Gruppen } from './speicher.js';
import { REGELN } from './daten/regeln.js';
import { starteCharakter, beendeCharakter } from './charakter.js';
import { starteGeteilt, beendeGeteilt } from './geteilt.js';
import { starteSL, beendeSL } from './sl.js';

/* ============================================================
   HILFSFUNKTIONEN — werden auch von den anderen Modulen benutzt
   ============================================================ */

export const $  = (id) => document.getElementById(id);
export const $$ = (sel, wurzel = document) => Array.from(wurzel.querySelectorAll(sel));

/** Maskiert Text vor der Ausgabe per innerHTML */
export function sicher(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const zufall  = (liste) => liste[Math.floor(Math.random() * liste.length)];
export const wuerfel = (seiten) => Math.floor(Math.random() * seiten) + 1;

/** Verzögert wiederholte Aufrufe — beim Tippen soll nicht bei
    jedem Buchstaben in die Datenbank geschrieben werden.
    1500 ms ist ein guter Kompromiss: lang genug, dass ein
    normaler Satz einen einzigen Schreibvorgang erzeugt, kurz
    genug, dass nichts verlorengeht. Zusätzlich speichern die
    Module beim Verlassen des Feldes sofort. */
export function verzoegert(fn, ms = 1500) {
  let zeiger;
  return (...args) => { clearTimeout(zeiger); zeiger = setTimeout(() => fn(...args), ms); };
}

/** Kurze Rückmeldung oben rechts */
let statusZeiger;
export function status(text) {
  const el = $('kopf-status');
  if (!el) return;
  el.textContent = text;
  clearTimeout(statusZeiger);
  statusZeiger = setTimeout(() => { el.textContent = ''; }, 2500);
}

/**
 * Tippt der Nutzer gerade in ein Feld?
 *
 * Wird gebraucht, weil Firestore nach jedem Schreibvorgang die
 * Änderung zurückmeldet. Würden wir daraufhin neu zeichnen,
 * flöge das Eingabefeld mitten im Tippen aus dem Dokument —
 * Cursor weg, Text weg. Deshalb prüfen alle Ansichtsmodule
 * vor dem Neuzeichnen diese Funktion und holen es später nach.
 */
export function nutzerTippt() {
  const el = document.activeElement;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
}

/** Datum eines Firestore-Zeitstempels als tt.mm. hh:mm */
export function zeitpunkt(stempel) {
  if (!stempel?.toDate) return '';
  return stempel.toDate().toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });
}

/* ============================================================
   ÄNDERUNGSPUFFER
   ============================================================

   Es wird NICHTS automatisch geschrieben. Die Ansichtsmodule
   ändern ihre Daten zunächst nur im Arbeitsspeicher und melden
   hier an, dass etwas offen ist. Erst der Speichern-Knopf
   schreibt in die Datenbank.

   Das hat zwei Vorteile:
     - Eine ganze Bearbeitung erzeugt EINEN Schreibvorgang
       statt einem pro Tastendruck.
     - Man sieht jederzeit, ob noch etwas offen ist.

   Als Netz gegen Vergesslichkeit läuft eine Sicherung nach
   zehn Minuten. Die ist ausdrücklich nur die Notbremse, nicht
   der Normalfall.
   ============================================================ */

const offeneSpeicherungen = new Map();   // bereich -> async Funktion
let notfallZeiger = null;
const NOTFALL_MINUTEN = 10;

/**
 * Ein Modul meldet: Ich habe etwas geändert, das noch nicht
 * geschrieben ist. Die Funktion wird beim Speichern aufgerufen.
 * Meldet dasselbe Modul erneut, ersetzt die neue Funktion die
 * alte — es bleibt bei einem Schreibvorgang.
 */
export function merkeAenderung(bereich, speicherFunktion) {
  offeneSpeicherungen.set(bereich, speicherFunktion);
  speicherleisteZeichnen();

  if (!notfallZeiger) {
    notfallZeiger = setTimeout(() => {
      if (offeneSpeicherungen.size) alleSpeichern(true);
    }, NOTFALL_MINUTEN * 60 * 1000);
  }
}

/** Gibt es offene Änderungen — insgesamt oder für ein Modul? */
export function hatOffeneAenderungen(bereich) {
  return bereich ? offeneSpeicherungen.has(bereich) : offeneSpeicherungen.size > 0;
}

/** Verwirft die offenen Änderungen eines Moduls ohne zu schreiben */
export function verwirfAenderung(bereich) {
  offeneSpeicherungen.delete(bereich);
  speicherleisteZeichnen();
}

/**
 * Schreibt alles Offene in die Datenbank.
 * @param {boolean} automatisch  true bei der Zehn-Minuten-Sicherung
 */
export async function alleSpeichern(automatisch = false) {
  if (!offeneSpeicherungen.size) return;

  const funktionen = [...offeneSpeicherungen.values()];
  offeneSpeicherungen.clear();
  clearTimeout(notfallZeiger);
  notfallZeiger = null;

  let fehlgeschlagen = 0;
  for (const fn of funktionen) {
    try { await fn(); } catch (fehler) { console.error('Speichern fehlgeschlagen:', fehler); fehlgeschlagen++; }
  }

  speicherleisteZeichnen(fehlgeschlagen
    ? 'Nicht alles konnte gespeichert werden'
    : (automatisch ? 'Automatisch gesichert' : 'Gespeichert'));

  // Die Module dürfen sich jetzt wieder neu zeichnen
  document.dispatchEvent(new CustomEvent('gespeichert'));
}

/** Zeigt oder versteckt die Leiste unten */
function speicherleisteZeichnen(bestaetigung = null) {
  const leiste = $('speicherleiste');
  if (!leiste) return;

  if (bestaetigung) {
    leiste.hidden = false;
    leiste.classList.add('fertig');
    $('speicher-text').textContent = bestaetigung;
    $('btn-speichern').hidden = true;
    $('btn-verwerfen').hidden = true;
    setTimeout(() => { if (!offeneSpeicherungen.size) leiste.hidden = true; }, 2000);
    return;
  }

  leiste.classList.remove('fertig');
  $('btn-speichern').hidden = false;
  $('btn-verwerfen').hidden = false;
  leiste.hidden = offeneSpeicherungen.size === 0;

  const anzahl = offeneSpeicherungen.size;
  $('speicher-text').textContent = anzahl === 1
    ? 'Ungespeicherte Änderungen'
    : `Ungespeicherte Änderungen in ${anzahl} Bereichen`;
}

function speicherleisteAufbauen() {
  $('btn-speichern').addEventListener('click', () => alleSpeichern());

  $('btn-verwerfen').addEventListener('click', () => {
    if (!confirm('Alle ungespeicherten Änderungen verwerfen?')) return;
    offeneSpeicherungen.clear();
    clearTimeout(notfallZeiger);
    notfallZeiger = null;
    speicherleisteZeichnen();
    // Die Module holen sich den Stand aus der Datenbank zurück
    document.dispatchEvent(new CustomEvent('verworfen'));
  });

  // Warnen, wenn die Seite mit offenen Änderungen verlassen wird
  window.addEventListener('beforeunload', (ereignis) => {
    if (!offeneSpeicherungen.size) return;
    ereignis.preventDefault();
    ereignis.returnValue = '';
  });
}

/* ============================================================
   ZUSTAND DER SITZUNG
   ============================================================
   Wird von den anderen Modulen gelesen. Bewusst ein Objekt und
   keine einzelnen Exporte, damit Änderungen überall ankommen.
   ============================================================ */

export const sitzung = {
  nutzer: null,     // Firebase-Nutzer
  gruppe: null,     // { id, name, slUid, mitglieder, freigaben, ... }
  istSL: false
};

/** Alle laufenden Firestore-Abos, damit wir sie beim Wechsel schließen können */
let abos = [];
export function merkeAbo(beenden) { abos.push(beenden); }
function alleAbosBeenden() { abos.forEach(f => { try { f(); } catch (e) {} }); abos = []; }

/* ============================================================
   SCHIRME UMSCHALTEN
   ============================================================ */

function zeigeSchirm(id) {
  ['schirm-laden', 'schirm-anmelden', 'schirm-gruppen', 'schirm-app']
    .forEach(s => { $(s).hidden = (s !== id); });
}

/* ============================================================
   ANMELDUNG
   ============================================================ */

let modusRegistrieren = false;

function anmeldungAufbauen() {

  $('link-wechsel').addEventListener('click', (e) => {
    e.preventDefault();
    modusRegistrieren = !modusRegistrieren;

    $('feld-name').hidden = !modusRegistrieren;
    $('btn-anmelden').textContent = modusRegistrieren ? 'Konto anlegen' : 'Anmelden';
    $('link-wechsel').textContent = modusRegistrieren
      ? 'Ich habe schon einen Zugang'
      : 'Noch kein Zugang? Konto anlegen';
    $('anmelde-unterzeile').textContent = modusRegistrieren
      ? 'Lege dir einen Zugang an. Deine E-Mail braucht der Spielleiter für die Einladung.'
      : 'Melde dich an, um weiterzuspielen.';
    $('ein-passwort').autocomplete = modusRegistrieren ? 'new-password' : 'current-password';
    fehlerZeigen('');
  });

  $('btn-anmelden').addEventListener('click', async () => {
    const email    = $('ein-email').value.trim();
    const passwort = $('ein-passwort').value;
    const name     = $('ein-name').value.trim();

    if (!email || !passwort) return fehlerZeigen('E-Mail und Passwort ausfüllen.');
    if (modusRegistrieren && !name) return fehlerZeigen('Bitte einen Namen angeben.');
    if (modusRegistrieren && passwort.length < 6) return fehlerZeigen('Das Passwort braucht mindestens 6 Zeichen.');

    $('btn-anmelden').disabled = true;
    fehlerZeigen('');

    try {
      if (modusRegistrieren) await Auth.registrieren(email, passwort, name);
      else                   await Auth.anmelden(email, passwort);
      // Weiter geht es über den Beobachter unten
    } catch (fehler) {
      fehlerZeigen(fehlerText(fehler.code));
    } finally {
      $('btn-anmelden').disabled = false;
    }
  });

  // Mit Eingabetaste absenden
  ['ein-email', 'ein-passwort', 'ein-name'].forEach(id => {
    $(id).addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-anmelden').click(); });
  });

  $('link-passwort').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = $('ein-email').value.trim();
    if (!email) return fehlerZeigen('Trag zuerst deine E-Mail ein.');
    try {
      await Auth.passwortZuruecksetzen(email);
      fehlerZeigen('Wir haben dir eine E-Mail zum Zurücksetzen geschickt.');
    } catch (fehler) {
      fehlerZeigen(fehlerText(fehler.code));
    }
  });
}

function fehlerZeigen(text) {
  const el = $('anmelde-fehler');
  el.textContent = text;
  el.hidden = !text;
}

/** Firebase-Fehlercodes in verständliches Deutsch übersetzen */
function fehlerText(code) {
  const texte = {
    'auth/invalid-email':        'Diese E-Mail-Adresse sieht nicht richtig aus.',
    'auth/user-not-found':       'Zu dieser E-Mail gibt es keinen Zugang.',
    'auth/wrong-password':       'Passwort stimmt nicht.',
    'auth/invalid-credential':   'E-Mail oder Passwort stimmt nicht.',
    'auth/email-already-in-use': 'Zu dieser E-Mail gibt es schon einen Zugang. Melde dich an.',
    'auth/weak-password':        'Das Passwort ist zu kurz (mindestens 6 Zeichen).',
    'auth/too-many-requests':    'Zu viele Versuche. Warte einen Moment.',
    'auth/network-request-failed':'Keine Verbindung. Netz prüfen.'
  };
  return texte[code] || 'Das hat nicht geklappt. (' + code + ')';
}

/* ============================================================
   GRUPPENWAHL
   ============================================================ */

async function gruppenSchirmAufbauen() {
  const liste = $('gruppen-liste');
  liste.innerHTML = '<p class="leise">Lade …</p>';

  let meine = [], einladungen = [];
  try {
    meine = await Gruppen.meine();
    einladungen = await Gruppen.einladungen();
  } catch (fehler) {
    liste.innerHTML = '<p class="fehler">Runden konnten nicht geladen werden.</p>';
    console.error(fehler);
    return;
  }

  // --- Meine Runden ---
  if (!meine.length) {
    liste.innerHTML = '<p class="leise">Du bist noch in keiner Runde.</p>';
  } else {
    liste.innerHTML = '';
    meine.forEach(g => {
      const knopf = document.createElement('button');
      knopf.type = 'button';
      knopf.className = 'knopf';
      knopf.style.cssText = 'width:100%;margin-bottom:8px;text-align:left;justify-content:flex-start';
      knopf.innerHTML = `${sicher(g.name)} <span class="leise" style="font-size:13px">
        · ${g.slUid === sitzung.nutzer.uid ? 'du leitest' : 'Spieler'}</span>`;
      knopf.addEventListener('click', () => gruppeOeffnen(g.id));
      liste.appendChild(knopf);
    });
  }

  // --- Einladungen ---
  $('einladungen-block').hidden = !einladungen.length;
  const eLi = $('einladungen-liste');
  eLi.innerHTML = '';
  einladungen.forEach(g => {
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'knopf knopf-haupt';
    knopf.style.cssText = 'width:100%;margin-bottom:8px';
    knopf.textContent = `„${g.name}“ beitreten`;
    knopf.addEventListener('click', async () => {
      knopf.disabled = true;
      await Gruppen.beitreten(g.id, sitzung.nutzer.displayName || sitzung.nutzer.email);
      gruppeOeffnen(g.id);
    });
    eLi.appendChild(knopf);
  });
}

function gruppenSchirmKnoepfe() {
  $('btn-gruppe-anlegen').addEventListener('click', async () => {
    const name = $('neue-gruppe-name').value.trim();
    if (!name) return alert('Bitte einen Namen für die Runde angeben.');

    $('btn-gruppe-anlegen').disabled = true;
    try {
      const gid = await Gruppen.anlegen(name, sitzung.nutzer.displayName || sitzung.nutzer.email);
      gruppeOeffnen(gid);
    } catch (fehler) {
      alert('Die Runde konnte nicht angelegt werden.');
      console.error(fehler);
    } finally {
      $('btn-gruppe-anlegen').disabled = false;
    }
  });

  $('link-abmelden-gruppen').addEventListener('click', (e) => { e.preventDefault(); Auth.abmelden(); });
}

/* ============================================================
   EINE RUNDE ÖFFNEN
   ============================================================ */

function gruppeOeffnen(gid) {
  alleAbosBeenden();
  localStorage.setItem('dew:letzteGruppe', gid);

  // Auf die Gruppe hören: Wenn der Spielleiter eine Freigabe
  // umlegt, merken das alle Geräte sofort.
  merkeAbo(Gruppen.abonnieren(gid, (gruppe) => {
    if (!gruppe) {
      // Beim Start (noch keine Runde geladen) still zur Auswahl
      // zurückfallen — z. B. wenn die gemerkte Runde gelöscht
      // wurde. Erst wenn wir schon drin waren, ist eine Meldung
      // angebracht.
      if (sitzung.gruppe) alert('Diese Runde ist nicht mehr erreichbar.');
      zurZurGruppenwahl();
      return;
    }

    const ersterAufruf = !sitzung.gruppe;
    sitzung.gruppe = gruppe;
    sitzung.istSL = gruppe.slUid === sitzung.nutzer.uid;

    $('kopf-info').textContent =
      `${gruppe.name} · ${sitzung.istSL ? 'Spielleitung' : (gruppe.mitglieder?.[sitzung.nutzer.uid]?.name || 'Spieler')}`;
    $('zone-knopf-sl').hidden = !sitzung.istSL;

    if (ersterAufruf) {
      zeigeSchirm('schirm-app');
      starteCharakter(gid);
      starteGeteilt(gid);
      if (sitzung.istSL) starteSL(gid);
    } else {
      // Freigaben können sich geändert haben
      document.dispatchEvent(new CustomEvent('gruppe-geaendert'));
    }
  }));
}

async function zurZurGruppenwahl() {
  // Offenes zuerst wegschreiben, sonst geht es verloren
  if (hatOffeneAenderungen() && confirm('Es gibt ungespeicherte Änderungen. Vorher speichern?')) {
    await alleSpeichern();
  } else {
    offeneSpeicherungen.clear();
    speicherleisteZeichnen();
  }

  alleAbosBeenden();
  beendeCharakter(); beendeGeteilt(); beendeSL();
  sitzung.gruppe = null;
  sitzung.istSL = false;
  localStorage.removeItem('dew:letzteGruppe');
  zeigeSchirm('schirm-gruppen');
  gruppenSchirmAufbauen();
}

/* ============================================================
   ZONEN
   ============================================================ */

function zonenAufbauen() {
  $$('.zone-knopf').forEach(knopf => {
    knopf.addEventListener('click', () => {
      $$('.zone-knopf').forEach(k => k.classList.toggle('aktiv', k === knopf));
      $$('.ansicht').forEach(a => a.classList.toggle('aktiv', a.id === knopf.dataset.zone));
      window.scrollTo({ top: 0 });
    });
  });

  $('btn-abmelden').addEventListener('click', () => Auth.abmelden());
  $('btn-gruppe-wechseln').addEventListener('click', zurZurGruppenwahl);
}

/* ============================================================
   REGELN
   ============================================================ */

/**
 * Baut die Reihenfolge der Gruppen aus dem ersten Auftreten in
 * REGELN — eine neue "gruppe" in daten/regeln.js taucht damit
 * automatisch an der richtigen Stelle auf, ohne dass hier etwas
 * gepflegt werden müsste.
 */
const REGEL_GRUPPEN = [...new Set(REGELN.map(r => r.gruppe))];

function regelnZeichnen(filter = '') {
  const suche = filter.trim().toLowerCase();
  const treffer = REGELN.filter(r =>
    !suche || r.titel.toLowerCase().includes(suche)
           || r.text.toLowerCase().includes(suche)
           || (r.schlagworte || '').toLowerCase().includes(suche));

  if (!treffer.length) {
    $('regel-liste').innerHTML = '<p class="hinweis-schild">Nichts gefunden. Im Zweifel: W20 + Attribut gegen 15.</p>';
    return;
  }

  // Nach Gruppe sortiert ausgeben — nur Gruppen mit mindestens
  // einem Treffer erscheinen überhaupt.
  $('regel-liste').innerHTML = REGEL_GRUPPEN.map(gruppe => {
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

function regelnAufbauen() {
  regelnZeichnen();
  $('regel-suche').addEventListener('input', e => regelnZeichnen(e.target.value));
}

/* ============================================================
   WÜRFELLEISTE
   ============================================================ */

let wuerfelModus = 'normal';

/* ------------------------------------------------------------
   Würfeln in der App — standardmäßig AUS
   ------------------------------------------------------------
   Die meisten Runden würfeln mit echten Würfeln am Tisch und
   nutzen das Programm nur, um den Bonus abzulesen. Deshalb ist
   die Würfelleiste standardmäßig eingeklappt, und der
   Charakterbogen zeigt statt Würfeln-Knöpfen nur den Bonus an.
   Wer in der App würfeln will, klappt es über den Schalter auf —
   die Einstellung merkt sich das Gerät (nicht die Runde). */
const WUERFELN_SCHLUESSEL = 'dew:wuerfelnInApp';

export function wuerfelnAktiv() {
  return localStorage.getItem(WUERFELN_SCHLUESSEL) === 'ja';
}

function wuerfelnUmschalten(aktiv) {
  try { localStorage.setItem(WUERFELN_SCHLUESSEL, aktiv ? 'ja' : 'nein'); } catch (e) {}
  $('wuerfel-koerper').hidden = !aktiv;
  // Der Charakterbogen zeigt Würfeln-Knöpfe nur, wenn diese
  // Einstellung an ist — neu zeichnen lassen.
  document.dispatchEvent(new CustomEvent('wuerfeln-umgeschaltet', { detail: { aktiv } }));
}

function wuerfelSchalterAufbauen() {
  const kontrolle = $('schalter-wuerfeln');
  const aktiv = wuerfelnAktiv();
  kontrolle.checked = aktiv;
  $('wuerfel-koerper').hidden = !aktiv;
  kontrolle.addEventListener('change', () => wuerfelnUmschalten(kontrolle.checked));
}

/** Wirft einen W20 nach dem gewählten Modus */
export function w20(modus = wuerfelModus) {
  if (modus === 'normal') { const w = wuerfel(20); return { wuerfe: [w], roh: w }; }
  const a = wuerfel(20), b = wuerfel(20);
  return { wuerfe: [a, b], roh: modus === 'vorteil' ? Math.max(a, b) : Math.min(a, b) };
}

/** Die vier Ergebnisse aus dem Regelheft */
export function auswerten(ergebnis, sg, roh) {
  if (roh === 20) return { text: 'Natürliche 20 — Erfolg und etwas Unerwartetes', klasse: 'erfolg' };
  if (roh === 1)  return { text: 'Natürliche 1 — Misserfolg mit Komplikation', klasse: 'misserfolg' };
  const d = ergebnis - sg;
  if (d >= 5)  return { text: `Erfolg mit Bonus (+${d})`, klasse: 'erfolg' };
  if (d >= 0)  return { text: `Erfolg (+${d})`, klasse: 'erfolg' };
  if (d >= -4) return { text: `ERFOLG MIT PREIS (${d})`, klasse: 'preis' };
  return { text: `Misserfolg mit Komplikation (${d})`, klasse: 'misserfolg' };
}

/**
 * Setzt Bonus und SG von außen und würfelt sofort.
 * Wird vom Charakterbogen benutzt: Tippen auf eine Fertigkeit
 * trägt den passenden Bonus ein und würfelt.
 */
export function wuerfelnMit(bonus, beschriftung = '') {
  $('wuerfel-bonus').value = bonus;
  wuerfelnAusfuehren(beschriftung);
}

function wuerfelnAusfuehren(beschriftung = '') {
  const bonus = parseInt($('wuerfel-bonus').value, 10) || 0;
  const sg    = parseInt($('wuerfel-sg').value, 10) || 15;

  const { wuerfe, roh } = w20();
  const ergebnis = roh + bonus;
  const urteil = auswerten(ergebnis, sg, roh);

  $('wuerfel-ergebnis').querySelector('.wuerfel-zahl').textContent = ergebnis;
  const textEl = $('wuerfel-ergebnis').querySelector('.wuerfel-text');
  textEl.textContent = (beschriftung ? beschriftung + ' — ' : '') + urteil.text;
  textEl.className = 'wuerfel-text ' + urteil.klasse;

  document.dispatchEvent(new CustomEvent('gewuerfelt', {
    detail: { wuerfe, bonus, sg, ergebnis, urteil, beschriftung }
  }));
}

function wuerfelleisteAufbauen() {
  $('btn-wuerfeln').addEventListener('click', () => wuerfelnAusfuehren());
  $$('#wuerfel-modus button').forEach(btn => {
    btn.addEventListener('click', () => {
      wuerfelModus = btn.dataset.modus;
      $$('#wuerfel-modus button').forEach(b => b.classList.toggle('aktiv', b === btn));
    });
  });
}

/* ============================================================
   START
   ============================================================ */

anmeldungAufbauen();
speicherleisteAufbauen();
gruppenSchirmKnoepfe();
zonenAufbauen();
regelnAufbauen();
wuerfelleisteAufbauen();
wuerfelSchalterAufbauen();

Auth.beobachten(async (nutzer) => {
  sitzung.nutzer = nutzer;

  // Das Passwortfeld leeren, sobald die Anmeldung durch ist.
  // Bleibt es gefüllt im Dokument stehen, hält der Browser die
  // folgende Ansichtsänderung für ein abgeschicktes Formular
  // und fragt, ob er das Passwort speichern soll.
  if (nutzer) {
    $('ein-passwort').value = '';
    $('ein-name').value = '';
  }

  if (!nutzer) {
    alleAbosBeenden();
    beendeCharakter(); beendeGeteilt(); beendeSL();
    sitzung.gruppe = null;
    zeigeSchirm('schirm-anmelden');
    return;
  }

  // Angemeldet — direkt in die zuletzt benutzte Runde springen
  const letzte = localStorage.getItem('dew:letzteGruppe');
  if (letzte) {
    gruppeOeffnen(letzte);
    // Falls die Runde nicht mehr erreichbar ist, fängt das der
    // Rückruf in gruppeOeffnen ab.
  } else {
    zeigeSchirm('schirm-gruppen');
    gruppenSchirmAufbauen();
  }
});

/* Dienst für den Offline-Betrieb */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
