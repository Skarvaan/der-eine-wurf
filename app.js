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
    jedem Buchstaben in die Datenbank geschrieben werden. */
export function verzoegert(fn, ms = 600) {
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

/** Datum eines Firestore-Zeitstempels als tt.mm. hh:mm */
export function zeitpunkt(stempel) {
  if (!stempel?.toDate) return '';
  return stempel.toDate().toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
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

function zurZurGruppenwahl() {
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

function regelnZeichnen(filter = '') {
  const suche = filter.trim().toLowerCase();
  const treffer = REGELN.filter(r =>
    !suche || r.titel.toLowerCase().includes(suche)
           || r.text.toLowerCase().includes(suche)
           || (r.schlagworte || '').toLowerCase().includes(suche));

  $('regel-liste').innerHTML = treffer.length
    ? treffer.map(r => `<div class="regel"><h4>${sicher(r.titel)}</h4><p>${sicher(r.text)}</p></div>`).join('')
    : '<p class="leise">Nichts gefunden. Im Zweifel: W20 + Attribut gegen 15.</p>';
}

function regelnAufbauen() {
  regelnZeichnen();
  $('regel-suche').addEventListener('input', e => regelnZeichnen(e.target.value));
}

/* ============================================================
   WÜRFELLEISTE
   ============================================================ */

let wuerfelModus = 'normal';

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
gruppenSchirmKnoepfe();
zonenAufbauen();
regelnAufbauen();
wuerfelleisteAufbauen();

Auth.beobachten(async (nutzer) => {
  sitzung.nutzer = nutzer;

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
