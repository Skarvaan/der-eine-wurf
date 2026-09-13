/* ============================================================
   REGELN — Kurzfassungen zum Nachschlagen am Tisch
   ============================================================

   ERWEITERN: einfach ein weiteres Objekt ins Array.
   "gruppe" bestimmt den Abschnitt, unter dem der Eintrag in der
   Zone "Regeln" auftaucht — neue Gruppen erscheinen automatisch
   in der Reihenfolge ihres ersten Auftretens.
   "schlagworte" hilft der Suche, wenn die Begriffe im Text
   selbst nicht vorkommen (z. B. "AC" für Verteidigung).
   "nurSL: true" blendet einen Eintrag für Spieler komplett aus
   (Titel, Text und Suche) — für Spielleitungswissen, das den
   Spielern die eigenen Tricks verraten würde. Siehe
   regelnZeichnen() in app.js.
   ============================================================ */

export const REGELN = [

  /* ---------------- Grundmechanik ---------------- */
  {
    gruppe: 'Grundmechanik',
    titel: 'Die Grundregel',
    schlagworte: 'probe wurf grundmechanik w20 sg schwierigkeit',
    text: `W20 + Attribut + Fertigkeit ≥ Schwierigkeitsgrad.

Passt keine Fertigkeit: W20 + Attribut. Fertigkeit 0 gibt keinen Bonus, aber auch keinen Abzug — jeder darf alles versuchen.

Gewürfelt wird nur, wenn der Ausgang ungewiss ist UND ein Misserfolg interessant wäre.

Beispiel: Über eine Mauer klettern → W20 + Körper + Athletik gegen SG 15.`
  },
  {
    gruppe: 'Grundmechanik',
    titel: 'Schwierigkeitsgrade',
    schlagworte: 'sg schwierigkeit zielwert dc',
    text: `10 leicht · 15 normal · 20 schwierig · 25 sehr schwierig · 30 extrem

Im Zweifel: 15. Kein SG 5 — was so leicht ist, wird nicht gewürfelt.

Beispiel: ein unverschlossenes Schloss knacken SG 10, ein gutes Vorhängeschloss SG 15, ein Tresor SG 25.`
  },
  {
    gruppe: 'Grundmechanik',
    titel: 'Die vier Ergebnisse',
    schlagworte: 'erfolg misserfolg preis komplikation ergebnis',
    text: `+5 über SG → Erfolg mit Bonus (schneller, leiser, eine Zusatzinformation)
SG erreicht → Erfolg
1–4 unter SG → ERFOLG MIT PREIS: es klappt, kostet aber Zeit, Lärm, Material, eine Verletzung oder eine Spur. Der Spieler darf ablehnen.
5+ unter SG → Misserfolg mit Komplikation

Natürliche 20: Erfolg + etwas Unerwartetes. Natürliche 1: Misserfolg + Komplikation.

Ein Misserfolg blockiert nie den einzigen Weg.`
  },
  {
    gruppe: 'Grundmechanik',
    titel: 'Vorteil und Nachteil',
    schlagworte: 'vorteil nachteil 2w20 hilfe unterstützung',
    text: `Vorteil: 2W20, höheres Ergebnis zählt.
Nachteil: 2W20, niedrigeres Ergebnis zählt.

Keine Stufen. Vorteil und Nachteil heben sich immer vollständig auf.

Hilfe: genau EIN Mitspieler kann helfen, wenn er beschreibt wie. Das gibt Vorteil. Weitere Helfer geben nichts.

Beispiel: Du kletterst mit einem Seil (Vorteil) im Dunkeln (Nachteil) — beides hebt sich auf, du würfelst ganz normal.`
  },
  {
    gruppe: 'Grundmechanik',
    titel: 'Passiver Wert, Gegeneinander, Gruppenproben',
    schlagworte: 'passiv vergleich gegeneinander gruppe',
    text: `Passiver Wert = 10 + Attribut + Fertigkeit (prüfen, ohne würfeln zu lassen).

Gegeneinander: beide würfeln, höher gewinnt. Gleichstand: nichts ändert sich, wer verteidigt behält die Lage.

Gruppenprobe: schafft die Hälfte, gelingt es der Gruppe.

Wiederholung nur, wenn sich etwas geändert hat.

Beispiel: Ein Wächter bemerkt eine schleichende Person, wenn deren Heimlichkeits-Ergebnis unter seinem passiven Wahrnehmungswert liegt — ohne dass dafür gewürfelt wird.`
  },

  /* ---------------- Attribute & Fertigkeiten ---------------- */
  {
    gruppe: 'Attribute & Fertigkeiten',
    titel: 'Die sechs Attribute',
    schlagworte: 'attribute körper geschick verstand wahrnehmung wille ausstrahlung',
    text: `KÖRPER — Muskeln, Zähigkeit, Gift überstehen, Schläge wegstecken. Bestimmt die LP.
GESCHICK — Feinmotorik, Reflexe, Balance, Zielen. Bestimmt die Verteidigung.
VERSTAND — Wissen, Logik, Analyse, Planung.
WAHRNEHMUNG — Sinne, Instinkt, Menschen lesen. Bestimmt die Initiative.
WILLE — Mut, Selbstbeherrschung, geistige Härte. Bestimmt die Stabilität.
AUSSTRAHLUNG — Auftreten, Überzeugen, Lügen, Präsenz.`
  },
  {
    gruppe: 'Attribute & Fertigkeiten',
    titel: 'Die fünfzehn Fertigkeiten',
    schlagworte: 'fertigkeiten liste athletik nahkampf fernkampf technik wissen mysterien',
    text: `Athletik · Nahkampf · Fernkampf · Heimlichkeit · Fingerfertigkeit · Technik · Handwerk · Ermittlung · Wissen · Mysterien · Heilkunde · Überzeugen · Widerstand · Überleben · Steuern

Attribut und Fertigkeit sind nicht fest verdrahtet: Schloss aufbrechen = Körper + Athletik, knacken = Geschick + Fingerfertigkeit, verstehen = Verstand + Technik.`
  },

  /* ---------------- Eigenschaften ---------------- */
  {
    gruppe: 'Eigenschaften',
    titel: 'Eigenschaften & Schicksalspunkte',
    schlagworte: 'eigenschaften stärke makel talent schicksalspunkt',
    text: `2 Stärken + 1 Makel (oder 3 + 2). Ist eine Eigenschaft für die Situation wirklich relevant: Vorteil bzw. Nachteil. Sonst nichts. Keine Sonderregeln.

Wenn dein Makel dir einen Nachteil einbringt, bekommst du einen Schicksalspunkt.
Schicksalspunkt ausgeben: Vorteil auf einen beliebigen Wurf. Höchstens drei besitzen.

Beispiel: Die Stärke „Zwölf Jahre Kriminalpolizei" gibt Vorteil beim Verhören eines Verdächtigen. Der Makel „Kann nicht loslassen" bringt einen Nachteil, wenn ein Fall längst geschlossen ist — und dafür einen Schicksalspunkt.`
  },

  /* ---------------- Gesundheit ---------------- */
  {
    gruppe: 'Gesundheit',
    titel: 'Gesundheit und Tod',
    schlagworte: 'lp lebenspunkte angeschlagen am boden tod sterben heilung',
    text: `LP = 10 + (Körper × 2). Verteidigung = 10 + Geschick + Nahkampf.

UNVERSEHRT — über der Hälfte.
ANGESCHLAGEN — auf der Hälfte oder darunter: Nachteil auf alle Proben mit Körper oder Geschick.
AM BODEN — 0 LP: keine Handlung, kein Würfeln.

Wer am Boden liegt und erneut Schaden nimmt, ist tot.
Wer am Boden liegt und bis Szenenende niemanden hat, der ihn versorgt, ist tot.

Versorgen: Verstand + Heilkunde SG 15 → 1 LP, wach, angeschlagen.
Erfolg mit Preis: er lebt und behält eine Narbe (neuer dauerhafter Makel).

Beispiel: Körper 3 → 16 LP. Bei 8 LP oder weniger angeschlagen, bei 0 am Boden.`
  },
  {
    gruppe: 'Gesundheit',
    titel: 'Heilung',
    schlagworte: 'heilung rasten verschnaufen erholung lp',
    text: `Verschnaufen (einmal pro Szene): 1W6 + Körper LP
Versorgt werden (Heilkunde SG 15, einmal pro Person und Szene): 1W6 + Heilkunde LP
Eine Nacht Schlaf: halbe maximale LP
Mehrere Tage Ruhe: vollständig geheilt`
  },
  {
    gruppe: 'Gesundheit',
    titel: 'Umgebungsschaden',
    schlagworte: 'sturz feuer gefahr schaden fallen',
    text: `Schmerzhaft (kurzer Sturz, Schlägerei): 1W6
Ernsthaft (Feuer, Absturz, Säure, Maschinenunfall): 2W6
Lebensgefährlich (Explosion, große Höhe, Kesselbersten): 3W6+

Ausweichen: Geschick + Athletik SG 15 halbiert den Schaden.`
  },

  /* ---------------- Kampf ---------------- */
  {
    gruppe: 'Kampf',
    titel: 'Kampf: Initiative und Bewegung',
    schlagworte: 'initiative zonen bewegung nah kurz fern',
    text: `Initiative: einmal pro Kampf W20 + Wahrnehmung. Alle Gegner würfeln gemeinsam einen Wurf.

Zonen statt Raster: NAH (Armlänge) — KURZ (selber Raum) — FERN (anderes Ende).
Pro Runde eine Zone. Aktion opfern für eine zweite Zone.

Aus dem Nahkampf lösen: der Gegner bekommt einen freien Angriff, außer du gibst deine Aktion auf.

Beispiel: Du stehst NAH bei einem Gegner, ein zweiter ist KURZ entfernt. Um beide gleichzeitig zu erreichen, opferst du deine Aktion für eine zweite Zone.`
  },
  {
    gruppe: 'Kampf',
    titel: 'Kampf: Die fünf Aktionen',
    schlagworte: 'aktion angreifen wehren manöver unterstützen umgebung',
    text: `ANGREIFEN — W20 + Attribut + Fertigkeit gegen Verteidigung. +5 über VT: +2 Schaden.
SICH WEHREN — Aktion aufgeben: alle Angriffe gegen dich haben Nachteil.
MANÖVER — Angriffswurf, aber statt Schaden: entwaffnen, umwerfen, blenden, festhalten. Liegend/festgehalten = Angriffe mit Vorteil.
UNTERSTÜTZEN — beschreiben wie: der Verbündete hat Vorteil.
UMGEBUNG NUTZEN — SL nennt Attribut, Fertigkeit, SG. Wirkt meist stärker als ein Angriff.`
  },
  {
    gruppe: 'Kampf',
    titel: 'Waffen, Rüstung, Kritische',
    schlagworte: 'waffen schaden rüstung deckung kritisch nachladen',
    text: `Leicht 1W6 · Mittel 1W8 · Schwer 1W10
Schwere Waffen: Nachteil in engen Räumen, im Handgemenge, bei Heimlichkeit.
Nachladen (Einzelschuss) = volle Aktion.

Rüstung reduziert Schaden: leicht 1, mittel 2, schwer 3. Schwer = Nachteil auf Heimlichkeit und Athletik.
Deckung gibt dem Schützen Nachteil.

Natürliche 20: maximaler Waffenschaden + ein Effekt (Gegner zu Boden, entwaffnet, eine Zone zurück).
Natürliche 1: Fehlschlag + Komplikation.

Kein Schadensbonus durch Attribute.`
  },
  {
    gruppe: 'Kampf',
    titel: 'Gegner aus dem Kopf',
    schlagworte: 'gegner monster werte statist stark monströs',
    text: `STATIST — VT 11, Angriff +3, Schaden 1W6, geht bei jedem Treffer zu Boden
NORMAL — VT 13, +5, 1W8, 15 LP
STARK — VT 15, +7, 1W10, 25 LP
MONSTRÖS — VT 17, +9, 2W6, 40 LP, handelt zweimal pro Runde

Höchstens EINE Sonderfähigkeit pro Gegner, in einem Satz.`
  },

  /* ---------------- Stabilität ---------------- */
  {
    gruppe: 'Stabilität',
    titel: 'Stabilität: Der Schockwurf',
    schlagworte: 'stabilität horror schock wahnsinn geist nerven',
    text: `Stabilität = 10 + (Wille × 2). Wurf: W20 + Wille + Widerstand.

SG 10 verstörend → 1
SG 15 unnatürlich → 1W6
SG 20 unmöglich → 2W6
SG 25 Offenbarung → 3W6

Bei Erfolg KEIN Verlust. Erfolg mit Preis: du hältst es aus, schreist aber, erstarrst oder handelst in der nächsten Runde nicht.

Pro Schockquelle einmal, nicht pro Anblick.`
  },
  {
    gruppe: 'Stabilität',
    titel: 'Stabilität: Erschüttert und Gebrochen',
    schlagworte: 'erschüttert gebrochen tick narbe seele',
    text: `ERSCHÜTTERT (halbe Stabilität oder weniger): Nachteil auf alle Proben mit Wille oder Wahrnehmung, dazu ein Tick, den der Spieler ausspielt.

GEBROCHEN (0): Der SPIELER wählt selbst, wie sein Charakter bricht — fliehen, erstarren, um sich schlagen, zusammenbrechen. Der SL sagt nur, DASS es passiert.
Dauert bis Szenenende. Danach 1W6 Stabilität und eine neue "Narbe der Seele" (dauerhafter Makel, vom Spieler formuliert).

Beispiel-Tick: den Anblick nicht loslassen können und ihn zwanghaft weiter beschreiben, statt zu handeln.`
  },
  {
    gruppe: 'Stabilität',
    titel: 'Stabilität: Erholung',
    schlagworte: 'stabilität erholung anker regeneration',
    text: `Ruhige Nacht an sicherem Ort: 2
Mehrere Tage echter Ruhe: halbe maximale Stabilität
Zeit mit dem Anker: 1W6, einmal pro Spielabend
Jemand redet mit dir (Ausstrahlung + Überzeugen SG 15): 1W6, einmal pro Person und Abenteuer
Abgeschlossenes Abenteuer: 1W6, bei echtem Sieg 2W6`
  },
  {
    gruppe: 'Stabilität',
    titel: 'Mysterien und verbotenes Wissen',
    schlagworte: 'mysterien okkult verbotenes wissen ritual magie',
    text: `Mysterien 1 oder höher: bei einem misslungenen Schockwurf +1 Stabilitätsverlust. Dafür erkennt man mit Verstand + Mysterien, WAS es ist und wo die Schwachstelle liegt.

Verbotenes Wissen: 1W6 Stabilität ohne Wurf, dafür +1 Mysterien oder eine konkrete Antwort.

Rituale: Wille + Mysterien, SG 15/20/25. Brauchen Zeit, einen Ort und einen Preis, kosten immer Stabilität.

Beispiel: Ein verbotenes Buch lesen, um den Namen einer Sache zu erfahren — 1W6 Stabilität, dafür kennt der Charakter jetzt die Antwort.`
  },

  /* ---------------- Wesen ----------------
     Optionales Modul. Wer nur Menschen spielt, überspringt die
     ganze Gruppe — es gibt keine Regel weiter unten, die davon
     abhängt. Der Leitgedanke: Ein Wesen ist KEINE neue
     Regelschicht, sondern drei Zeilen in der Grammatik, die es
     schon gibt (Stärke, Makel, Stabilität). ---------------- */
  {
    gruppe: 'Wesen',
    titel: 'Was ein Wesen ist',
    schlagworte: 'wesen gabe bann zeichen ventil vampir übernatürlich unmensch',
    text: `Es gibt keine Arten. Es gibt Menschen, denen etwas widerfahren ist.

Ein Wesen hat vier Zeilen mehr auf dem Bogen, sonst nichts:

GABE — eine Sache, die ein Mensch nicht kann. Ein Satz.
BANN — eine Sache, die dich zwingt oder die dir verwehrt ist.
ZEICHEN — woran man dich erkennt, wenn jemand genau hinsieht.
VENTIL — wodurch (und nur wodurch) sich deine Stabilität erholt.

Buchhaltung: Die Gabe ersetzt eine deiner Stärken. Der Bann kommt als zusätzlicher Makel obendrauf. Wesen sein ist also ein leicht schlechtes Geschäft — der Gewinn liegt in der Fiktion, nicht auf dem Blatt.

Beispiel: Ein Vampirmädchen — Gabe „Wer mich für ein Kind hält, unterschätzt mich“, Bann „Bei Tage sehe ich nur Umrisse“, Zeichen „Ich wachse nicht“, Ventil „Blut und mein Anker, nicht Schlaf“.`
  },
  {
    gruppe: 'Wesen',
    titel: 'Was eine Gabe darf',
    schlagworte: 'gabe kräfte fähigkeit disziplin grenze bonus',
    text: `Für Gaben gilt dieselbe Regel wie für Ausrüstung: Sie erlauben etwas, sie geben Vorteil, oder ihr Fehlen gibt Nachteil. KEIN Zahlenbonus. Keine zusätzlichen LP, keine höhere Verteidigung, kein +2 Schaden.

Drei Grenzen, wie bei Maschinen:
1. Sie tut genau EINE Sache.
2. Sie kostet etwas Benennbares — Zeit, Stabilität, Blut, eine Spur, die bleibt.
3. Höchstens einmal pro Szene, wenn sie stark ist.

Passt eine Gabe in einen Satz und benennt sie ihren Preis, ist sie zulässig. Braucht sie einen Absatz, ist sie es nicht.

Beispiel: „Ich höre, was ein Mensch denkt, wenn ich seine Haut berühre — und er spürt es.“`
  },
  {
    gruppe: 'Wesen',
    titel: 'Der Bann',
    schlagworte: 'bann makel zwang schwäche schicksalspunkt',
    text: `Der Bann wirkt wie ein Makel: Bringt er dir einen Nachteil ein, bekommst du einen Schicksalspunkt.

Zwei Unterschiede: Er ist nicht verhandelbar — wenn er greift, greift er. Und er verschwindet nie dadurch, dass du ihn im Spiel überwindest. Ein Bann bleibt.

Dafür ist er dein zuverlässigster Schicksalspunkt-Hahn. Wer seinen Bann selbst ins Spiel bringt, statt ihn zu umgehen, spielt sich reicher.

Beispiel: „Ich betrete kein Haus, in das mich niemand gebeten hat“ — die Gruppe steht vor der offenen Tür, du bleibst draußen und redest durchs Fenster. Ein Schicksalspunkt.`
  },
  {
    gruppe: 'Wesen',
    titel: 'Das Ventil: Stabilität für Wesen',
    schlagworte: 'ventil stabilität hunger durst zehrung erholung wesen',
    text: `Ein Wesen erholt seine Stabilität NICHT nach den normalen Regeln. Schlaf, Ruhe und ein abgeschlossenes Abenteuer bringen nichts. Nur das eigene Ventil füllt auf, und zwar 1W6, einmal pro Spielabend.

Keine neue Leiste, keine neue Zahl — nur ein anderer Hahn an derselben Anzeige.

ERSCHÜTTERT heißt bei einem Wesen: Deine Natur fährt mit. Der Tick ist ihrer, nicht deiner.
GEBROCHEN heißt: Sie übernimmt. Wie sie übernimmt, entscheidest weiterhin DU als Spieler — die Spielleitung sagt nur, dass es passiert.

Beispiel: Der Blutwandel füllt nur durch Blut und durch seinen Anker. Nach drei Tagen Ermittlung ohne beides steht er bei halber Stabilität, und die Gruppe merkt es.`
  },
  {
    gruppe: 'Wesen',
    titel: 'Wesen im Kampf: Zähigkeit',
    schlagworte: 'kampf zähigkeit unsterblich erlöschen tod wesen am boden',
    text: `Wesen haben ganz normale LP, normale Verteidigung, normale Rüstung. Im Kampf gilt jede Regel wie für Menschen — mit einer Ausnahme:

Wer am Boden liegt und erneut getroffen wird, stirbt nicht. Er ERLISCHT: raus aus der Szene, regungslos, für alle Anwesenden tot. Er erwacht Stunden später — am selben Ort oder dort, wohin man ihn geschafft hat.

Preis: 1W6 Stabilität und eine sichtbare Spur, die bleibt.

Damit bleibt die Spannung am Tisch vollständig erhalten: In der Szene ist das Wesen genauso raus wie ein Mensch. Die Unsterblichkeit wirkt erst danach — und öffnet dafür die Fiktion. Jemand hat sie weggetragen. Jemand hat sie begraben. Jemand hat gesehen, dass sie wieder aufsteht.`
  },
  {
    gruppe: 'Wesen',
    titel: 'Das Wahre Ende',
    schlagworte: 'wahres ende sterben endgültig tod vernichtung schwachstelle',
    text: `Zu jedem Wesen gehört genau eine Bedingung, unter der es endgültig stirbt. Ein Satz, konkret, im Spiel auffindbar.

Der Spieler weiß, DASS es ein Wahres Ende gibt. Er weiß nicht, welches. Die Spielleitung legt es bei der Erschaffung fest und schreibt es in ihren Bereich — es kommt irgendwann aus einem alten Buch, von einem Ältesten oder von einem Feind.

Dazu: Wer den BANN eines Wesens kennt und im Kampf gegen ihn arbeitet, hebt die Zähigkeit für diese Szene auf. Trifft er es am Boden, ist es wirklich tot.

Deshalb ist der halbe Kampf gegen ein Wesen Ermittlung, bevor er anfängt — in beide Richtungen.`
  },
  {
    gruppe: 'Wesen',
    titel: 'Entdeckt werden',
    schlagworte: 'zeichen entdeckung geheimnis schleier verrat tarnung',
    text: `Das Zeichen ist kein Nachteil, den die Spielleitung nach Laune zieht. Es greift, wenn jemand GENAU HINSIEHT: eine Person mit einem Grund, ein zweites Treffen, ein Apparat, eine Aufnahme.

Passiver Wert der anderen Seite = 10 + Wahrnehmung + Ermittlung. Willst du es verbergen: Ausstrahlung + Überzeugen, oder Geschick + Heimlichkeit, je nachdem wie du es versteckst.

Wer dich enttarnt hat, hat damit noch keine Macht über dich — die hat er erst, wenn er deinen Bann kennt.

Beispiel: Das Vampirmädchen wird von einem Beamten zum zweiten Mal in acht Jahren gesehen. Er sagt nichts. Er notiert es.`
  },
  {
    gruppe: 'Wesen',
    titel: 'Menschen bleiben mitspielbar',
    schlagworte: 'mensch balance ausgleich gruppe gemischt',
    text: `Wer in einer Runde mit Wesen einen Menschen spielt, bekommt eine dritte Stärke. Das ist der ganze Ausgleich, und er reicht — weil Gaben keine Zahlen geben und jedes Wesen mit einem Bann und einem Ventil bezahlt.

Wozu ein Mensch immer gut ist: Er darf überall hin. Er verträgt Tageslicht, Einladungen, Behörden und Fotografen. In einer Runde voller Wesen ist er der, ohne den nichts geht.`
  },
  {
    gruppe: 'Wesen',
    nurSL: true,
    titel: 'Eine Gabe prüfen: drei Fragen',
    schlagworte: 'gabe prüfen genehmigen balance spielleitung wesen',
    text: `1. Passt sie in EINEN Satz? Wenn nein: kürzen lassen, bis sie es tut.
2. Was kostet sie, jedes Mal? Wenn die Antwort „nichts“ ist, fehlt noch die halbe Gabe.
3. Welche Art von Abenteuer löst sie auf?

Frage 3 ist die wichtige. „Ich sehe, was ein Ort erlebt hat“ löscht jede Spurensuche — also Preis dranhängen (Stabilität, einmal pro Szene, nur Bruchstücke) oder Bedingung (nur an Orten, an denen jemand gestorben ist).

Faustregel: Eine Gabe darf einen Weg abkürzen. Sie darf nie die Frage beantworten, um die das Abenteuer geht.`
  },
  {
    gruppe: 'Wesen',
    nurSL: true,
    titel: 'Wesen als Gegner',
    schlagworte: 'gegner wesen nsc monster werte ältester',
    text: `Nimm die Gegnerzeilen: STATIST, NORMAL, STARK, MONSTRÖS. Plus GENAU EINE Sonderfähigkeit in einem Satz. Mehr braucht kein Wesen, auch kein Ältester.

Ein gegnerisches Wesen hat ebenfalls Zähigkeit — das heißt, die Gruppe muss seinen Bann herausfinden, sonst steht es wieder auf. Das ist der Fall, nicht der Kampf.

Drei Hinweise auf den Bann, an drei Orten, über drei Fertigkeiten. Wie immer.

Beispiel: Ältester — MONSTRÖS, Sonderfähigkeit „Wer ihm in die Augen sieht, verliert seine nächste Handlung (Wille + Widerstand SG 20)“. Bann: Er muss jede Zahl zählen, die er sieht.`
  },
  {
    gruppe: 'Wesen',
    nurSL: true,
    titel: 'Das Wahre Ende setzen',
    schlagworte: 'wahres ende festlegen spielleitung geheimnis',
    text: `Drei Eigenschaften machen ein gutes Wahres Ende:

KONKRET — kein Zustand, sondern eine Handlung mit Gegenständen. Nicht „wenn sie die Hoffnung verliert“, sondern „wenn ihr eigener Name auf ihrem Grabstein steht und sie ihn liest“.
AUFFINDBAR — es muss mindestens zwei Wege geben, davon zu erfahren.
BEZAHLBAR — auch der Feind muss es leisten können, sonst ist es Deko.

Sag es niemals als Regelsatz an. Sag es als Fund: ein Eintrag in einem Register, ein Satz eines Sterbenden, ein Bild in einem Buch.

Schreib es in den Spielleitungsbereich, bevor der erste Abend läuft. Danach gilt die Festlegungsregel.`
  },
  {
    gruppe: 'Wesen',
    nurSL: true,
    titel: 'Die Zeitalterfalle',
    schlagworte: 'setting vermessung behörden fotografie schleier spielleitung',
    text: `Der Druck, der alle Wesen gleichzeitig trifft, unabhängig von ihren Gaben: Das Maschinenzeitalter vermisst gerade das, was sich jahrhundertelang nicht vermessen ließ. Meldewesen, Fotografie, Fingerabdrücke, Chemie, Kataster.

Was seit dreihundert Jahren funktioniert — verschwinden, den Namen wechseln, nicht auffallen — funktioniert seit dreißig Jahren immer schlechter.

Damit hast du eine Bedrohung, die keine Kampfwerte braucht, jeden Charakter trifft und Alter in Tragik verwandelt: Die Ältesten sind mächtig und gleichzeitig überholt.

Konkret am Tisch: Akten, Stempel, ein Beamter mit einem Notizbuch. Das macht mehr Angst als ein Monster.`
  },

  /* ---------------- Technik ---------------- */
  {
    gruppe: 'Technik',
    titel: 'Maschinen und Erfindungen',
    schlagworte: 'maschine technik erfindung bauen dampf steampunk',
    text: `Bedienen: Geschick oder Verstand + Steuern
Alles andere (verstehen, reparieren, umbauen, sabotieren): Verstand + Technik
Unter Beschuss reparieren: Nachteil

Bauen: Verstand + Technik, SG 15 Behelf / 20 solide / 25 neuartig.
Erfolg mit Preis: funktioniert EINMAL, dann Schrott — oder mit hässlichem Nebeneffekt.

Drei Grenzen: Material, Zeit, und es tut nur eine Sache.
Bei natürlicher 1 an einer Maschine geht die Maschine kaputt.

Beispiel: Ein Behelfs-Fallschirm aus Stoffbahnen und Seilen, SG 15 — funktioniert einmal.`
  },
  {
    gruppe: 'Technik',
    titel: 'Ausrüstung',
    schlagworte: 'ausrüstung traglast geld munition verbrauch',
    text: `Sechs Dinge am Körper. Schwere Rüstung zählt als zwei. Alltägliches wird nicht aufgeschrieben.

Ausrüstung tut nur drei Dinge: sie erlaubt etwas, sie gibt Vorteil, oder ihr Fehlen gibt Nachteil. Kein Gegenstand gibt einen Zahlenbonus.

Bei natürlicher 1 geht aus, was gerade verbraucht wird.

Geld: arm — auskömmlich — wohlhabend. Keine Preisliste.`
  },

  /* ---------------- Fortschritt ---------------- */
  {
    gruppe: 'Fortschritt',
    titel: 'Fortschritt',
    schlagworte: 'fortschritt fp erfahrung steigern level aufstieg',
    text: `1 FP pro Sitzung, 2 bei einem Abschluss.

Fertigkeit +1: 2 FP (auf 4 oder 5: 4 FP)
Attribut +1: 6 FP (auf 6 oder 7: 10 FP)
+3 max. LP oder +3 max. Stabilität: 3 FP
Neue Stärke: 4 FP

Obergrenzen: Attribute 7, Fertigkeiten 5.
Nur verbessern, was benutzt oder geübt wurde.
Makel verschwinden, wenn sie im Spiel überwunden werden — nicht durch Bezahlen.`
  },

  /* ---------------- Spielleitung ---------------- */
  {
    gruppe: 'Spielleitung',
    nurSL: true,
    titel: 'SG in zwei Sekunden setzen',
    schlagworte: 'spielleiter improvisation sg setzen',
    text: `Wäre das für einen fähigen Menschen mit Übung machbar?
Ja, locker → 10 · Ja, mit Konzentration → 15 · Nur wenn er richtig gut ist → 20 · Nur mit Hilfe oder Glück → 25 · Eigentlich nicht → 30

Im Zweifel 15.`
  },
  {
    gruppe: 'Spielleitung',
    nurSL: true,
    titel: 'Hinweise legen',
    schlagworte: 'hinweis ermittlung drei fährte fall',
    text: `Für jede wichtige Erkenntnis drei Hinweise, an drei Orten, über drei Fertigkeiten. Dann darf jeder Wurf danebengehen.

Falsche Fährten müssen zu etwas Echtem führen — nur nicht zur Lösung. Fährten ins Nichts bringen der Gruppe bei, Details nicht mehr zu untersuchen.

Nichts bleibt zweimal bedeutungslos: Kommt ein Spieler auf ein Detail zurück, gib ihm etwas.`
  },
  {
    gruppe: 'Spielleitung',
    nurSL: true,
    titel: 'Rückwärts begründen',
    schlagworte: 'improvisation rückwärts begründen wahrheitsnotiz',
    text: `1. Ein Detail entsteht (gewürfelt, erfragt, eingefallen).
2. Frage dich: Wie erklärt meine Wahrheitsnotiz das?
3. Sag die Antwort so, als hätte sie immer festgestanden.

Erlaubt bei Details, Personen und Orten. Bei der Wahrheit selbst nie.

Beispiel: Ein Spieler fragt, warum der Hausmeister nervös wirkt. Passt „er hat etwas gesehen" zur Wahrheitsnotiz — dann ist es das, gesagt, als wäre es von Anfang an so gewesen.`
  },
  {
    gruppe: 'Spielleitung',
    nurSL: true,
    titel: 'Festlegungsregel',
    schlagworte: 'festlegen kanon entscheidung improvisation',
    text: `Sobald ein Spieler eine Frage stellt, deren Antwort seine nächste Entscheidung beeinflusst, legst du dich fest — und bleibst dabei. Aufschreiben.

Vorher darf alles Nebel sein. Nachher ist es Kanon.

Beispiel: „War Grothe an dem Abend im Haus?" — sobald die Gruppe danach handelt, ist die Antwort festgelegt und ändert sich nicht mehr.`
  },
  {
    gruppe: 'Spielleitung',
    nurSL: true,
    titel: 'Wenn die Gruppe feststeckt',
    schlagworte: 'feststecken hilfe sackgasse notfall',
    text: `1. Uhr füllen — etwas passiert und bringt neue Information mit.
2. Jemanden schicken, der etwas will.
3. Einen bekannten Hinweis neu beleuchten: „Dir fällt jetzt erst auf, dass …“
4. Am Tisch fragen: „Was würdet ihr tun, wenn ihr in einem Roman wärt?“ — und es möglich machen.`
  }
];
