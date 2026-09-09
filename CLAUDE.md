# Projektkontext für Claude Code

Wird bei jedem Sitzungsstart gelesen. Der größte Einzelhebel dafür, dass Claude die Konventionen kennt, statt zu raten.

## Was das ist

Drei Seiten für das eigene Pen-&-Paper-Regelwerk „Der Eine Wurf":

- `index.html` — öffentlich, ohne Anmeldung. Erklärt das Spiel. Wird an Spieler verschickt.
- `regelwerk.html` — öffentlich, ohne Anmeldung. Die vollständigen Regeln zum Nachschlagen (alles aus `daten/regeln.js` außer Spielleitungswissen).
- `spiel.html` — Spielbereich mit Anmeldung, drei Zonen, Echtzeit-Synchronisierung.

Benutzt wird das auf einem iPad am Spieltisch, oft bei wenig Licht und schlechtem Netz.

## Technische Grundsätze

- **Vanilla HTML/CSS/JS. Kein Build-Schritt, kein npm, kein Framework.** Was im Repo liegt, läuft im Browser.
- Firebase kommt als ES-Modul vom Google-CDN, mit fester Versionsnummer in `firebase-konfig.js`.
- ES-Module (`type="module"`). Lokal testen braucht einen Server: `python3 -m http.server`.
- Ziel-Browser ist **Safari auf dem iPad**.

## Konventionen

- **Alles auf Deutsch**: Variablen, Funktionen, Kommentare, Oberfläche. `zeichneFall()`, nicht `renderCase()`.
- **Ausführliche Kommentare** — nicht was der Code tut, sondern warum er so ist.
- Keine Umlaute in Dateinamen und Objektschlüsseln (`koerper`, nicht `körper`).
- Benutzertext wird vor `innerHTML` immer durch `sicher()` geschickt.
- Neue Farben als Variable in `:root`, nicht als Hex-Wert im Regelblock.
- Tippflächen mindestens 44 px. Eingabefelder mindestens 16 px Schrift, sonst zoomt iOS beim Fokus hinein.
- `data-attribute-mit-strichen` landen in JavaScript als `dataset.attributeMitStrichen` — häufige Fehlerquelle.

## Architektur

```
app.js               Anmeldung, Runden, Rollen, Zonen, Würfelleiste,
                      gemeinsame Hilfsfunktionen (werden exportiert)
speicher.js           Die EINZIGE Datei mit Firestore-Code
charakter.js          Zone „Mein Charakter“
geteilt.js            Zone „Gemeinsam“
sl.js                 Zone „Spielleitung“
regelwerk.js          Bootstrapt die öffentliche Seite regelwerk.html
daten/regeln.js       Die Regeltexte (Datenquelle)
daten/regeln-render.js  Baut daraus HTML — von app.js UND regelwerk.js
                      benutzt, absichtlich ohne Firebase-Abhängigkeit
```

Die Ansichtsmodule kennen weder Firestore noch Firebase Auth direkt — sie benutzen ausschließlich `Charaktere`, `Geteilt`, `SLNotizen`, `Gruppen` und `Auth` aus `speicher.js`. **Diese Trennung nie durchbrechen.**

`regelwerk.html`/`regelwerk.js` sind bewusst NICHT an `app.js` gekoppelt: `app.js` verbindet sich beim Laden sofort mit Firebase und sucht Elemente wie `#schirm-app`, die es auf einer rein öffentlichen Seite nicht gibt. Neue öffentliche (nicht angemeldete) Seiten bekommen deshalb ein eigenes, schlankes Bootstrap-Skript statt `app.js` einzubinden.

Jedes Modul exportiert `starteX(gid)` und `beendeX()`. Beim Wechsel der Runde werden alle Abos beendet, damit keine Zuhörer auf alten Daten hängenbleiben.

## Sicherheitsmodell — das Wichtigste

Der Schutz der Bereiche kommt **ausschließlich** aus `firestore.rules`, die auf Googles Servern laufen. Was die Oberfläche ausblendet, ist Bequemlichkeit.

Daraus folgen zwei harte Regeln für jede Änderung:

1. **Nie etwas Geheimes in eine Sammlung legen, die Spieler lesen dürfen** — auch nicht in einem Feld, das die Oberfläche versteckt. Geheimes gehört in `sl`, Freigegebenes in `geteilt`. Freigeben heißt: eine gekürzte Kopie anlegen.
2. **Nach jeder Änderung am Datenmodell die Regeln nachziehen.** Eine neue Sammlung ohne Regel ist gesperrt; ein neues Feld in einer offenen Sammlung ist für alle lesbar.

## Wichtig bei jeder Änderung

Wenn eine Datei aus der Liste in `sw.js` geändert wird, **muss dort die `VERSION` hochgezählt werden** (`dew-v1` → `dew-v2`). Sonst ist die Änderung auf dem iPad unsichtbar.

## Inhaltliche Grundsätze des Regelwerks

Das System ist bewusst minimal. Einfachheit hat Vorrang vor Vollständigkeit. Keine Sonderregeln erfinden, wenn eine allgemeine Regel reicht. Im Zweifel: W20 + Attribut gegen SG 15.

Bei der Horror-Mechanik gilt: Der Spieler behält immer die Kontrolle über seine Figur. Der Spielleiter sagt, *dass* etwas passiert, nie *was*.

**Tonfall der Regeltexte: neutral und sachlich, keine Ich/Wir-Perspektive der Autoren.** Also nicht „das ist uns wichtig" oder „wir finden" — die Regel einfach direkt hinschreiben. Betrifft `index.html`, `regelwerk.html` und `daten/regeln.js`.

## Design — Steampunk-Anmutung

Genietete „Messingplatten" statt Fließtext: `.karte` bekommt vier
Eck-Nieten und einen doppelten Rahmen rein über CSS-Verläufe
(kein Bild). Erklärender Text steht in `.hinweis-schild`
(gestrichelter Kupferrahmen), Zustandswarnungen in `.warnschild`.
LP/Stabilität/Schicksal zeigen sich als rundes `.messgeraet`
(Kegelverlauf als Füllstand). Mehrere gleichmäßig hohe Karten stehen im responsiven
`.bogen-gitter` (1 Spalte mobil, 2+ auf Tablet/Desktop) — für eine
**lange Liste unterschiedlich langer Karten** (z. B. das
Regelwerk) stattdessen `.regelwerk-spalten` (CSS-Spalten,
`break-inside: avoid`): Ein Raster streckt jede Zeile auf die
höchste Karte darin und reißt darunter Lücken; Spalten lassen
jede Karte in eigener Höhe direkt an die vorherige andocken.
Schriften:
Cinzel für Überschriften, Special Elite fürs Notizbuch — beide per
Google Fonts in `index.html`/`spiel.html` eingebunden, mit
System-Schrift als Fallback.

**Mobil ohne seitliches Scrollen:** `html, body` setzt
`overflow-wrap: anywhere` (bricht auch mitten in einem langen Wort
um — wichtig bei deutschen Komposita) und `overflow-x: hidden` als
Sicherheitsnetz. Ein Flex-Kind mit Text bekommt zusätzlich
`min-width: 0`, sonst verweigert es laut Flexbox-Standard das
Schrumpfen unter seine Inhaltsbreite und drückt Nachbarelemente aus
der Zeile (z. B. `.kopf-info`, `.attribut-schild-text`).

## Würfeln in der App — standardmäßig AUS

`wuerfelnAktiv()` in app.js liest `localStorage['dew:wuerfelnInApp']`
(Gerät, nicht Runde). Ist es aus, zeigt charakter.js statt
Würfeln-Knöpfen nur den fertigen Bonus, und die Würfelleiste bleibt
eingeklappt (`#wuerfel-koerper[hidden]`). Der Schalter im
Würfelleisten-Kopf löst `wuerfeln-umgeschaltet` aus — Module, die
Würfeln-Knöpfe zeigen, hören darauf und zeichnen neu.

## Notizbuch — private Charakternotizen

Bewusst NICHT im Charakterdokument (das dürfen alle in der Runde
lesen), sondern eigene Sammlung `gruppen/{gid}/notizbuch/{uid}` —
ein Dokument pro Person, Dokument-ID = eigene UID. Nur die Person
selbst schreibt; sie selbst und die Spielleitung lesen. Siehe
`Notizbuch` in speicher.js und `firestore.rules`. **Nach einem
Rules-Update immer daran denken: die Datei muss erneut in der
Firebase-Konsole eingespielt werden, sonst greift die alte Fassung
weiter.**

## Offene Punkte

- Bilder werden verlinkt, nicht hochgeladen (Firebase Storage bräuchte den Blaze-Tarif)
- Kein Sitzungsprotokoll für Würfe
- Ein Charakter pro Spieler in der Oberfläche
- Spielleitung nicht übertragbar
