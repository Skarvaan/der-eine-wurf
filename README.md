# Der Eine Wurf

Ein Pen-&-Paper-Regelwerk mit Spielbereich. Zwei Seiten, drei geschützte Zonen, Echtzeit-Synchronisierung über alle Geräte.

- **`index.html`** — öffentlich, keine Anmeldung. Erklärt das Spiel und die Regeln. **Das ist die Seite, die du deinen Spielern schickst.**
- **`spiel.html`** — der Spielbereich. Anmeldung nötig.

---

## Die drei Zonen

| Zone | Wer sieht sie | Was drin ist |
|---|---|---|
| **Mein Charakter** | jeder nur seinen eigenen | Baukasten, Spielbogen, Steigerungswerkzeug |
| **Gemeinsam** | alle in der Runde | Journal, Indizien, Orte, Personen — was du freigibst |
| **Spielleitung** | nur du | Charakterübersicht, Fallblatt, Weltenbau, Tabellen, Rundenverwaltung |

Der Schutz ist echt, nicht nur ausgeblendet: Der Spielleiterbereich liegt in einer eigenen Datenbanksammlung, die Spieler **nicht lesen dürfen** — geprüft auf Googles Servern, nicht im Browser. Siehe `firestore.rules`.

---

## Dateien

```
index.html            Öffentliche Seite — das Spiel erklärt
spiel.html            Der Spielbereich (Hülle)
stil.css              Design für beide Seiten

app.js                Anmeldung, Runden, Zonen, Würfelleiste
speicher.js           Firestore-Anbindung — die einzige Stelle mit Datenbankcode
firebase-konfig.js    ← HIER trägst du deine Projektdaten ein
charakter.js          Zone „Mein Charakter“
geteilt.js            Zone „Gemeinsam“
sl.js                 Zone „Spielleitung“

daten/tabellen.js     47 Würfeltabellen, 608 Einträge
daten/regeln.js       Regeltexte für die Suche

firestore.rules       ← Die Sicherheitsregeln. Muss eingespielt werden.
manifest.json, sw.js  Damit die App vom Home-Bildschirm läuft
CLAUDE.md             Projektkontext für Claude Code
```

---

# Teil 1 — Firebase einrichten

Dauert etwa fünfzehn Minuten. Danach ist alles synchron.

## Kostet das etwas?

**Nein, und es kann auch nichts kosten.** Der kostenlose Spark-Tarif verlangt keine Zahlungsmethode und schaltet bei Erreichen der Grenzen einfach ab, statt eine Rechnung zu schreiben. Du kannst also nicht versehentlich in eine Kostenfalle laufen.

Die Tagesgrenzen: 50.000 Lesevorgänge, 20.000 Schreibvorgänge, 1 GiB Speicher. Eine Runde mit fünf Leuten erzeugt an einem intensiven Spielabend vielleicht 500 Schreibvorgänge. Du bist um zwei Größenordnungen unter der Grenze.

> **Wichtig: Steige nicht auf den Blaze-Tarif um.** Der ist zwar auch für kleine Nutzung praktisch kostenlos, hat aber keine feste Ausgabenobergrenze. Für dieses Projekt brauchst du ihn nicht.

## Schritt 1 — Projekt anlegen

1. Auf **https://console.firebase.google.com** gehen und mit einem Google-Konto anmelden.
2. **Projekt hinzufügen** → Name eingeben, z. B. `der-eine-wurf`.
3. **Google Analytics abwählen.** Du brauchst es nicht, und es ist datenschutzrechtlich der unangenehmste Teil des Ganzen.
4. Projekt erstellen lassen.

## Schritt 2 — Anmeldung aktivieren

1. Links im Menü: **Build → Authentication → Get started**.
2. Reiter **Sign-in method**.
3. **E-Mail/Passwort** auswählen → oberen Schalter auf **Aktiviert** → Speichern.
   Den zweiten Schalter (E-Mail-Link) lässt du aus.

## Schritt 3 — Datenbank anlegen

1. Links: **Build → Firestore Database → Datenbank erstellen**.
2. **Standort:** Wähle eine **europäische Region** — `eur3 (europe-west)` oder `europe-west3 (Frankfurt)`.
   **Das lässt sich später nicht mehr ändern.** Für dich heißt europäische Region: Die Daten deiner Spieler liegen in der EU, nicht in den USA.
3. **Modus:** **Im Produktionsmodus starten** (der gesperrte Modus). Der Testmodus lässt nach 30 Tagen jeden alles lesen — den willst du nicht.

## Schritt 4 — Sicherheitsregeln einspielen

Das ist der wichtigste Schritt. Ohne ihn funktioniert nichts, und mit dem falschen Inhalt wäre alles offen.

1. In **Firestore Database** oben auf den Reiter **Regeln**.
2. Den kompletten Inhalt der Datei **`firestore.rules`** aus diesem Projekt hineinkopieren — der vorhandene Text wird ersetzt.
3. **Veröffentlichen**.

Was die Regeln tun:

- Spieler sehen die Runden, in denen sie Mitglied sind oder eingeladen wurden — sonst keine.
- Charaktere: alle in der Runde dürfen sie lesen, ändern darf nur der Besitzer oder du.
- Gemeinsamer Bereich: alle lesen; Spieler dürfen **ausschließlich Journaleinträge** schreiben, und nur ihre eigenen ändern.
- Spielleiterbereich: **nur du**. Ein Spieler, der eigene Anfragen an die Datenbank schickt, bekommt hier nichts — nicht einmal die Anzahl der Einträge.

## Schritt 5 — Web-App registrieren und Zugangsdaten holen

1. Oben links auf das **Zahnrad → Projekteinstellungen**.
2. Runterscrollen zu **Meine Apps** → auf das **`</>`-Symbol** (Web) klicken.
3. Spitzname vergeben, z. B. `Spielbereich`. **Firebase Hosting nicht ankreuzen** — wir nehmen GitHub Pages.
4. Es erscheint ein Codeblock mit `firebaseConfig`. Die sechs Werte daraus in die Datei **`firebase-konfig.js`** übertragen.

```js
export const FIREBASE_KONFIG = {
  apiKey:            "AIza…",
  authDomain:        "der-eine-wurf.firebaseapp.com",
  projectId:         "der-eine-wurf",
  storageBucket:     "der-eine-wurf.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId:             "1:123456789012:web:abc…"
};
```

> **Diese Werte sind kein Geheimnis.** Sie dürfen im öffentlichen Repo stehen. Sie sagen nur, *welches* Projekt gemeint ist — sie berechtigen zu nichts. Der Schutz kommt allein aus den Sicherheitsregeln.
>
> Die Konfiguration ist die Postadresse. Die Regeln sind das Türschloss.

## Schritt 6 — Deine Domain freischalten

Firebase lässt Anmeldungen nur von Adressen zu, die du eingetragen hast.

1. **Build → Authentication → Settings → Autorisierte Domains**.
2. **Domain hinzufügen** → `deinname.github.io` eintragen.
   (`localhost` steht schon drin, damit funktioniert das lokale Testen.)

---

# Teil 2 — Veröffentlichen

## Lokal testen

Die App benutzt ES-Module, die laufen nicht per Doppelklick. Im Projektordner:

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen.

## Auf GitHub Pages

1. Neues Repository anlegen, z. B. `der-eine-wurf`. **Öffentlich ist in Ordnung** — im Repo steht kein Geheimnis.
2. Alle Dateien hochladen.
3. **Settings → Pages → Source: Deploy from a branch**, Branch `main`, Ordner `/ (root)`.
4. Nach ein bis zwei Minuten: `https://deinname.github.io/der-eine-wurf/`

Diese Adresse schickst du deinen Spielern. Sie landen auf der öffentlichen Seite mit den Regeln.

## Auf dem iPad einrichten

Adresse in Safari öffnen → Teilen → **Zum Home-Bildschirm**. Läuft ab dann im Vollbild und auch bei schlechtem Netz weiter, weil Firestore lokal zwischenspeichert und später abgleicht.

---

# Teil 3 — Loslegen

1. Auf `spiel.html` gehen, **Konto anlegen**.
2. **Eigene Runde gründen** — wer gründet, ist Spielleiter.
3. In der Zone **Spielleitung → Runde** die E-Mail-Adressen deiner Spieler eintragen.
4. Spieler legen sich mit **genau dieser E-Mail** einen Zugang an und sehen die Einladung sofort beim Start.

## Wie das Steigern funktioniert

Fortschrittspunkte vergibst du unter **Spielleitung → Charaktere** (einzeln) oder **Runde** (an alle). Die Punkte sammeln sich an, aber niemand kann sie ausgeben.

Erst wenn du unter **Runde → Freigaben** das Steigern freischaltest, erscheint bei den Spielern das Steigerungswerkzeug mit den Kosten aus dem Regelwerk. Nach der Verteilung schaltest du es wieder zu.

## Wie das Freigeben funktioniert

Du notierst unter **Welt** alles, was du brauchst — inklusive der Geheimnisse. Wenn die Gruppe etwas herausfindet, drückst du **An alle freigeben**. Dann kannst du den Text vorher kürzen, und nur die gekürzte Fassung landet im gemeinsamen Bereich. Dein Original bleibt bei dir.

Das Gleiche gilt für Indizien und Orte: Du legst sie direkt unter **Gemeinsam** an, sobald sie entdeckt wurden.

---

# Teil 4 — Datenschutz, ehrlich

Was du wissen solltest, bevor du deine Spieler einlädst:

- Die Daten liegen bei **Google (Firebase)**, in der Region, die du in Schritt 3 gewählt hast. Bei einer europäischen Region: in der EU.
- Gespeichert werden: **E-Mail-Adresse, Anzeigename, Charakterdaten, Notizen, Journaleinträge.** Keine Passwörter im Klartext, das übernimmt Firebase.
- Google kann technisch auf die Daten zugreifen — wie bei jedem gehosteten Dienst.
- Für eine private Spielrunde ist das unkritisch. Sag deinen Leuten trotzdem einen Satz dazu, bevor sie sich anmelden. Das ist einfach fair.
- Wer weg will: Du kannst sein Konto in der Firebase-Konsole unter **Authentication → Nutzer** löschen und seine Charaktere in **Firestore** entfernen.

---

# Teil 5 — Weiterarbeiten mit Claude Code

Claude Code arbeitet direkt in deinem Projektordner: liest alle Dateien, ändert sie, committet. Es gibt keine gesonderte Verbindung — du startest es einfach im Ordner.

```bash
git clone https://github.com/DEINNAME/der-eine-wurf.git
cd der-eine-wurf
claude
```

**Installieren:**

- macOS, Linux, WSL: `curl -fsSL https://claude.ai/install.sh | bash`
- Homebrew: `brew install --cask claude-code`
- Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`
- Ohne Terminal: Es gibt dieselbe Sache als Desktop-App mit Oberfläche.

Vorausgesetzt wird ein Pro-, Max-, Team-, Enterprise- oder Console-Konto; der kostenlose Plan enthält Claude Code nicht.

Die Datei **`CLAUDE.md`** wird bei jedem Sitzungsstart gelesen und enthält die Konventionen dieses Projekts. Ohne sie würde jede Sitzung neu raten.

**Nach jeder Änderung:** in `sw.js` die `VERSION` hochzählen (`dew-v1` → `dew-v2`). Sonst liefert der Browser die alte Fassung aus, und du suchst den Fehler im Code.

---

# Was noch fehlt

Ehrlich benannt, damit du weißt, wo du stehst:

- **Bilder** werden als Link eingebunden, nicht hochgeladen. Firebase Storage bräuchte den Blaze-Tarif. Für Karten reicht ein Link auf ein Bild in einem anderen Repo oder in einer Cloud.
- **Kein Sitzungsprotokoll** mehr — die Würfelleiste zeigt das Ergebnis, schreibt es aber nicht mit. Falls du das willst, ist es eine kleine Ergänzung.
- **Ein Spieler pro Charakter.** Mehrere Charaktere pro Person gehen technisch, die Oberfläche zeigt aber nur den ersten.
- **Spielleitung ist nicht übertragbar.** Wer die Runde gründet, behält sie.
