/* ============================================================
   REGELN — die vollständigen Regeln zum Nachschlagen
   ============================================================

   Jeder Eintrag ist STRUKTURIERT statt ein einziger Textblock.
   Der Grund: daten/regeln-render.js baut daraus Kästen, Leisten
   und Tabellen. Ein langer Fließtext ließe sich nur als Fließtext
   darstellen, und genau der war am Handy schwer zu lesen.

   Alle Felder außer gruppe und titel sind optional. Der Renderer
   zeichnet sie immer in dieser Reihenfolge:

     kurz       Ein, zwei Sätze. Das Wichtigste zuerst.
     formel     Große Formelzeile (nur für die Grundregel).
     skala      [{ wert, text }]          Zahlenleiste (SG)
     stufen     [{ ton, titel, text }]    Ergebnisleiter
     zustaende  [{ ton, titel, text }]    Zustandsleiter
     zonen      [{ titel, text }]         Entfernungen
     schritte   [{ titel, text }]         nummerierte Kette
     tabelle    { kopf: [], zeilen: [[]] }
     marken     ['…']                     kleine Etiketten
     punkte     [{ titel, text, icon? }]  Regelpunkte
     warnung    { text, kritisch? }       auffälliger Kasten
     merke      '…'                       ruhiger Merkkasten
     beispiele  [{ genre, text }]         Szene aus dem Spiel

   ton: 'gut' | 'mittel' | 'schlecht'
   genre: 'wesen' | 'steampunk' | 'mystery' | 'fantasy' | 'horror'
   icon: Schlüssel aus PFADE in regeln-render.js

   **so** wird fett. Sonst gibt es keine Auszeichnung, alles
   andere läuft durch sicher().

   "schlagworte" hilft der Suche bei Begriffen, die im Text nicht
   vorkommen (z. B. "AC" für Verteidigung).
   "nurSL: true" blendet einen Eintrag für Spieler ganz aus, siehe
   regelnZeichnen() in app.js und regelwerk.js.

   TONFALL (siehe CLAUDE.md): neutral, direkt, keine Ich/Wir-
   Perspektive. Keine Gedankenstriche. Alltagswörter statt
   ausgefallener Fachbegriffe. Was aus D&D bekannt ist
   (natürliche 20, Initiative, Manöver, Rettungswurf, W20 …),
   darf ohne Erklärung stehen bleiben. Beispiele sollen nach einem echten
   Spielabend klingen. Übernatürliches allgemein halten und nicht
   immer dasselbe Wesen als Beispiel nehmen, die Spieler sollen
   ihre eigenen Ideen nicht schon vorgekaut bekommen.
   ============================================================ */

/* Kurzer Einleitungssatz pro Gruppe. Eine Gruppe ohne Eintrag
   hier bekommt einfach keine Einleitung. */
export const GRUPPEN_INFO = {
  'Grundregeln':            'Ein Wurf, eine Zahl, vier mögliche Ausgänge. Alles andere baut darauf auf.',
  'Dein Charakter':         'In einer Viertelstunde fertig. Zahlen sagen, wie gut deine Figur etwas kann. Eigenschaften sagen, wer sie ist.',
  'Reden und Ermitteln':    'Für Verhöre, Verhandlungen, Intrigen und Tatorte.',
  'Gesundheit':             'Figuren können sterben. Aber selten nur durch Würfelpech.',
  'Kampf':                  'Schnell, gefährlich und ohne Spielplan.',
  'Horror und Stabilität':  'Für Runden mit Grusel. Wer keinen Horror spielt, lässt diesen Teil weg.',
  'Technik und Ausrüstung': 'Erfindungen, Maschinen und was man sonst bei sich trägt.',
  'Fortschritt':            'Figuren werden besser durch das, was sie erleben.',
  'Welten':                 'Ein Regelwerk für sehr verschiedene Runden.',
  'Spielleitung':           'Werkzeuge zum Improvisieren. Nur für die Spielleitung sichtbar.'
};

export const REGELN = [

  /* ---------------- Grundregeln ---------------- */
  {
    gruppe: 'Grundregeln',
    titel: 'Die Grundregel',
    schlagworte: 'probe wurf grundmechanik w20 w6 sg schwierigkeit würfel',
    kurz: 'Würfle einen W20 und zähle Attribut und Fertigkeit dazu. Erreichst du den Schwierigkeitsgrad (SG), gelingt es.',
    formel: 'W20 + Attribut + Fertigkeit ≥ SG',
    punkte: [
      { icon: 'frage', titel: 'Keine passende Fertigkeit?', text: 'Dann nur W20 + Attribut. Wer eine Fertigkeit nicht hat, bekommt keinen Abzug. Jede Figur darf alles versuchen.' },
      { icon: 'ziel', titel: 'Wann wird gewürfelt?', text: 'Nur wenn unklar ist, ob es klappt, und ein Fehlschlag die Geschichte spannender macht. Alles andere gelingt einfach.' }
    ],
    beispiele: [
      { genre: 'steampunk', text: 'Das Luftschiff sinkt, und der Kirchturm kommt näher. Der Anker klemmt. Du hängst dich mit aller Kraft in die Kurbel: Körper 3 + Athletik 2 + Würfel 11 = 16. Der SG ist 15, geschafft. Der Anker fällt, das Schiff ruckt hoch und streift nur noch die Turmspitze.' }
    ]
  },
  {
    gruppe: 'Grundregeln',
    titel: 'Schwierigkeitsgrade',
    schlagworte: 'sg schwierigkeit zielwert dc',
    kurz: 'Die Spielleitung (SL) sagt, wie schwer etwas ist. Im Zweifel gilt 15.',
    skala: [
      { wert: '10', text: 'leicht' },
      { wert: '15', text: 'normal' },
      { wert: '20', text: 'schwierig' },
      { wert: '25', text: 'sehr schwierig' },
      { wert: '30', text: 'fast unmöglich' }
    ],
    merke: 'Was noch leichter als 10 wäre, gelingt ohne Wurf.',
    beispiele: [
      { genre: 'mystery', text: 'Die Tür zum Arbeitszimmer des Toten hat ein billiges Schloss: SG 10. Seine Schreibtischschublade: SG 15. Der Tresor hinter dem Gemälde: SG 25. Wer den aufbekommt, will wirklich wissen, was darin liegt.' }
    ]
  },
  {
    gruppe: 'Grundregeln',
    titel: 'Vier Ergebnisse statt zwei',
    schlagworte: 'erfolg misserfolg preis komplikation ergebnis kritisch natürliche',
    kurz: 'Es gibt nicht nur „geschafft" oder „nicht geschafft". Wie knapp du liegst, macht einen Unterschied.',
    stufen: [
      { ton: 'gut',      titel: '5 oder mehr über dem SG', text: 'Erfolg mit Bonus. Schneller, leiser oder du erfährst etwas zusätzlich.' },
      { ton: 'gut',      titel: 'SG erreicht',             text: 'Erfolg.' },
      { ton: 'mittel',   titel: '1 bis 4 darunter',        text: '**Erfolg mit Preis.** Es klappt, aber es kostet etwas: Zeit, Lärm, eine Verletzung, oder jemand bemerkt dich. Du darfst den Preis ablehnen. Dann hat es eben nicht geklappt.' },
      { ton: 'schlecht', titel: '5 oder mehr darunter',    text: 'Misserfolg, und die Lage wird schlechter.' }
    ],
    punkte: [
      { icon: 'stern', titel: 'Natürliche 20', text: 'Erfolg, und zusätzlich passiert etwas Gutes.' },
      { icon: 'blitz', titel: 'Natürliche 1',  text: 'Misserfolg mit Folgen, egal wie gut deine Werte sind.' }
    ],
    merke: 'Ein Misserfolg ist nie eine Sackgasse. Es geht immer irgendwie weiter, nur eben schwieriger oder teurer.',
    beispiele: [
      { genre: 'mystery', text: 'Du willst dich als Kellnerin auf den Ball schmuggeln. Ausstrahlung + Überzeugen ergibt 13, der SG ist 15. Erfolg mit Preis: Der Oberkellner lässt dich rein, drückt dir aber ein Tablett in die Hand. Jetzt musst du servieren, während du eigentlich spionieren willst.' }
    ]
  },
  {
    gruppe: 'Grundregeln',
    titel: 'Vorteil und Nachteil',
    schlagworte: 'vorteil nachteil 2w20 hilfe unterstützung helfen',
    kurz: 'Du würfelst mit zwei W20. Bei Vorteil zählt der höhere Würfel, bei Nachteil der niedrigere.',
    punkte: [
      { icon: 'hoch',   titel: 'Vorteil gibt es für', text: 'eine passende Stärke, gutes Werkzeug, gute Vorbereitung, Überraschung oder Hilfe.' },
      { icon: 'runter', titel: 'Nachteil gibt es für', text: 'eine passende Schwäche, Dunkelheit, Zeitdruck, Verletzungen oder schlechtes Werkzeug.' },
      { icon: 'waage',  titel: 'Beides auf einmal', text: 'Dann heben sie sich auf, und du würfelst normal. Zweimal Vorteil ist nicht besser als einmal.' },
      { icon: 'hand',   titel: 'Helfen', text: 'Ein Mitspieler kann helfen, wenn er sagt, wie. Das gibt Vorteil. Ein zweiter Helfer bringt nichts mehr.' }
    ],
    beispiele: [
      { genre: 'fantasy', text: 'Der Zwerg hält mit seinem Schild das Gitter hoch, damit du drunter durchrollen kannst: Vorteil. Aber hinter euch speit der Drache Feuer und dein Mantel brennt: Nachteil. Beides hebt sich auf. Ein Würfel. Alle halten die Luft an.' }
    ]
  },
  {
    gruppe: 'Grundregeln',
    titel: 'Würfeln gegeneinander und als Gruppe',
    schlagworte: 'passiv vergleich gegeneinander gruppe wiederholen gruppenprobe',
    kurz: 'Drei Sonderfälle, alle nach demselben Prinzip.',
    punkte: [
      { icon: 'kampf',  titel: 'Gegeneinander', text: 'Armdrücken, ein Wettrennen, jemand schleicht und jemand passt auf: Beide würfeln, das höhere Ergebnis gewinnt. Bei Gleichstand ändert sich nichts.' },
      { icon: 'gruppe', titel: 'Die ganze Gruppe', text: 'Alle würfeln. Schafft es mindestens die Hälfte, schafft es die Gruppe.' },
      { icon: 'auge',   titel: 'Ohne zu würfeln', text: 'Manchmal soll niemand merken, dass es etwas zu bemerken gibt. Dann rechnet die SL einfach 10 + Attribut + Fertigkeit, statt würfeln zu lassen.' },
      { icon: 'pfeil',  titel: 'Noch ein Versuch?', text: 'Nur wenn sich etwas geändert hat, zum Beispiel mit besserem Werkzeug oder einem neuen Plan.' }
    ],
    beispiele: [
      { genre: 'mystery', text: 'Ihr schleicht nachts durchs Herrenhaus. Alle vier würfeln auf Heimlichkeit, zwei schaffen es. Das ist die Hälfte, also reicht es. Der Butler im Sessel schnarcht weiter. Hätten drei gepatzt, stünde er jetzt mit dem Kerzenleuchter in der Tür.' }
    ]
  },
  {
    gruppe: 'Grundregeln',
    titel: 'Hausregeln',
    schlagworte: 'hausregel eigene regel ändern anpassen improvisieren',
    kurz: 'Passt eine Regel nicht zu eurer Runde, ändert ihr sie. Fehlt eine, erfindet die SL am Tisch eine.',
    punkte: [
      { icon: 'feder',  titel: 'Aufschreiben', text: 'Die SL schreibt jede Hausregel auf. Dann gilt sie beim nächsten Mal genauso und niemand muss streiten.' },
      { icon: 'waage',  titel: 'Einfach bleiben', text: 'Eine gute Hausregel passt in einen Satz. Wenn nicht, reicht meistens die Grundregel: W20 + Attribut gegen 15.' }
    ],
    beispiele: [
      { genre: 'steampunk', text: 'Eure Runde spielt viel auf Luftschiffen. Die SL legt fest: „Wer bei Sturm an Deck kämpft, hat Nachteil, außer er ist angeseilt." Ein Satz, aufgeschrieben, fertig.' }
    ]
  },

  /* ---------------- Dein Charakter ---------------- */
  {
    gruppe: 'Dein Charakter',
    titel: 'Ein Charakter in fünf Schritten',
    schlagworte: 'charaktererstellung erschaffen bauen punkte verteilen anker riss',
    schritte: [
      { titel: 'Attribute',     text: 'Alle sechs beginnen bei 2. Verteile 7 Punkte, höchstens 5 pro Attribut. 3 ist ein ganz normaler Mensch.' },
      { titel: 'Fertigkeiten',  text: 'Alle beginnen bei 0. Verteile 10 Punkte, höchstens 3 pro Fertigkeit.' },
      { titel: 'Eigenschaften', text: 'Zwei Stärken und eine Schwäche (Makel). Wer ein übernatürliches Wesen spielt, macht aus einer Stärke eine Gabe.' },
      { titel: 'Hintergrund',   text: 'Ein Satz, wer du bist und warum du dabei bist. Dazu ein **Anker**: eine Person, ein Ort oder etwas, woran du glaubst und das dir Halt gibt. Und ein **Riss**: etwas in deinem Leben, das nicht in Ordnung ist.' },
      { titel: 'Ausrüstung',    text: 'Eine Waffe, Werkzeug für deinen Beruf und drei besondere Gegenstände. Kleinkram schreibt niemand auf.' }
    ],
    merke: 'Je genauer, desto besser. „War fünf Jahre Hebamme im Armenviertel" sagt viel mehr als „kann heilen". Ideen für Wesen, Berufe und Beweggründe stehen weiter unten.'
  },
  {
    gruppe: 'Dein Charakter',
    titel: 'Die sechs Attribute',
    schlagworte: 'attribute körper geschick verstand wahrnehmung wille ausstrahlung',
    kurz: 'Was deine Figur von Natur aus mitbringt.',
    punkte: [
      { icon: 'koerper',      titel: 'Körper',       text: 'Kraft und Ausdauer. Tragen, Schlagen, Aushalten. Bestimmt, wie viel deine Figur einstecken kann.' },
      { icon: 'geschick',     titel: 'Geschick',     text: 'Schnelligkeit und geschickte Hände. Klettern, Zielen, Ausweichen.' },
      { icon: 'verstand',     titel: 'Verstand',     text: 'Wissen und Nachdenken. Rätsel lösen, Maschinen verstehen, Pläne schmieden.' },
      { icon: 'wahrnehmung',  titel: 'Wahrnehmung',  text: 'Augen, Ohren und Bauchgefühl. Etwas bemerken, Menschen durchschauen.' },
      { icon: 'wille',        titel: 'Wille',        text: 'Mut und Nerven. Nicht in Panik geraten, Versuchungen widerstehen.' },
      { icon: 'ausstrahlung', titel: 'Ausstrahlung', text: 'Wie du auf andere wirkst. Überreden, Lügen, Anführen.' }
    ]
  },
  {
    gruppe: 'Dein Charakter',
    titel: 'Die fünfzehn Fertigkeiten',
    schlagworte: 'fertigkeiten liste athletik nahkampf fernkampf technik wissen mysterien heilkunde steuern',
    kurz: 'Was deine Figur gelernt hat. Jede Fertigkeit deckt viel ab.',
    tabelle: {
      kopf: ['Fertigkeit', 'Zum Beispiel'],
      zeilen: [
        ['Athletik',         'Klettern, Springen, Schwimmen, Rennen, Tragen'],
        ['Nahkampf',         'Mit Fäusten, Messern, Schwertern oder Knüppeln kämpfen'],
        ['Fernkampf',        'Schießen und Werfen'],
        ['Heimlichkeit',     'Schleichen, Verstecken, jemandem unbemerkt folgen'],
        ['Fingerfertigkeit', 'Schlösser öffnen, Taschen leeren, Zaubertricks'],
        ['Technik',          'Maschinen verstehen, reparieren, bauen'],
        ['Handwerk',         'Etwas herstellen: schmieden, nähen, fälschen, Tränke brauen'],
        ['Ermittlung',       'Spuren suchen, Hinweise finden, Akten durchgehen'],
        ['Wissen',           'Geschichte, Sprachen, Gesetze, Wissenschaft'],
        ['Mysterien',        'Magie, Flüche, Geister, alles Übernatürliche'],
        ['Heilkunde',        'Wunden versorgen, Gift erkennen, Krankheiten behandeln'],
        ['Überzeugen',       'Überreden, Lügen, Verhandeln, Drohen'],
        ['Widerstand',       'Schmerz, Gift, Kälte und Angst aushalten'],
        ['Überleben',        'Spuren lesen, sich in der Wildnis zurechtfinden'],
        ['Steuern',          'Kutschen, Pferde, Boote, Luftschiffe lenken']
      ]
    },
    merke: 'Die SL sucht aus, welches Attribut und welche Fertigkeit passen. Eine Tür eintreten ist Körper + Athletik. Das Schloss öffnen ist Geschick + Fingerfertigkeit.'
  },
  {
    gruppe: 'Dein Charakter',
    titel: 'Stärken und Schwächen',
    schlagworte: 'eigenschaften stärke makel talent schwäche',
    kurz: 'Ein kurzer Satz über deine Figur. Passt er zur Lage, gibt eine Stärke Vorteil und eine Schwäche (Makel) Nachteil.',
    punkte: [
      { icon: 'start', titel: 'Zum Start', text: 'Zwei Stärken und eine Schwäche. Wer mag, nimmt drei Stärken und zwei Schwächen.' },
      { icon: 'ziel',  titel: 'Nur wenn es passt', text: '„Kann gut mit Pferden" hilft bei einer Verfolgungsjagd zu Pferd, aber nicht beim Schlossknacken.' },
      { icon: 'plus',  titel: 'Schwächen lohnen sich', text: 'Jedes Mal, wenn deine Schwäche dir Nachteil bringt, bekommst du einen Schicksalspunkt.' }
    ],
    beispiele: [
      { genre: 'steampunk', text: 'Stärke „Hat zehn Jahre im Kesselraum eines Dampfschiffs gearbeitet": Vorteil, als in der Fabrik der Kessel zu pfeifen anfängt und alle anderen wegrennen. Schwäche „Hat Spielschulden bei den falschen Leuten": Nachteil, als dich in der Oper ein Geldeintreiber erkennt. Dafür gibt es einen Schicksalspunkt.' }
    ]
  },
  {
    gruppe: 'Dein Charakter',
    titel: 'Gaben: übernatürliche Kräfte',
    schlagworte: 'gabe gaben magie zauber kraft kräfte wesen übernatürlich segen fluch fähigkeit',
    kurz: 'Eine Gabe ist eine Stärke, die etwas erlaubt, was kein Mensch kann. Sie ersetzt eine deiner Stärken.',
    punkte: [
      { icon: 'feder',   titel: 'Ein Satz', text: 'Schreib genau auf, was die Gabe kann: „Kann im Dunkeln sehen wie eine Katze" oder „Kann Feuer mit bloßen Händen entfachen".' },
      { icon: 'wuerfel', titel: 'Einsetzen', text: 'Die Gabe macht etwas möglich. Gewürfelt wird wie immer, meist mit Wille + Mysterien. Je größer die Wirkung, desto höher der SG: 10 für eine Kleinigkeit, bis 25 für etwas Gewaltiges.' },
      { icon: 'tropfen', titel: 'Jede Gabe hat einen Preis', text: 'Zur Gabe gehört eine passende Schwäche. Oder jeder Einsatz kostet etwas, zum Beispiel Lebenspunkte. Was es ist, legt ihr gemeinsam fest.' }
    ],
    merke: 'Spielt eure Runde ganz ohne Übernatürliches, lasst Gaben einfach weg.',
    beispiele: [
      { genre: 'fantasy', text: 'Die Hängebrücke reißt, die halbe Gruppe ist noch drauf. Die Magierin will sie mit ihrer Gabe festhalten: Wille + Mysterien gegen 20. Sie würfelt 18, Erfolg mit Preis. Die Brücke hält, bis alle drüben sind. Dann blutet sie aus der Nase und verliert 1W6 Lebenspunkte.' },
      { genre: 'wesen', text: 'Gabe: „Ich kann mich in einen großen Wolf verwandeln." Schwäche dazu: „Wenn ich wütend werde, verwandle ich mich, ob ich will oder nicht." Beides zusammen ergibt eine Figur, bei der jeder Streit am Tisch plötzlich gefährlich wird.' }
    ]
  },
  {
    gruppe: 'Dein Charakter',
    titel: 'Ideen: Wesen',
    schlagworte: 'wesen rasse volk spezies übernatürlich elf zwerg hexe werwolf geist automat',
    kurz: 'Deine Figur muss kein Mensch sein. Ein paar Ideen, die ihr frei abändern könnt. Ob ein Wesen in eure Welt passt, klärt ihr mit der SL.',
    tabelle: {
      kopf: ['Wesen', 'Mögliche Gabe', 'Möglicher Preis'],
      zeilen: [
        ['Hexe oder Magier', 'Zaubern', 'Jeder Zauber kostet Lebenspunkte'],
        ['Werwesen', 'Sich in ein Tier verwandeln', 'Verwandelt sich bei Wut von selbst'],
        ['Vampir', 'Übermenschlich stark und schnell', 'Braucht Blut, verträgt keine Sonne'],
        ['Elf', 'Sieht im Dunkeln, spürt Magie', 'Eisen brennt auf der Haut'],
        ['Fee', 'Kann Trugbilder erschaffen', 'Kann nicht lügen und muss Versprechen halten'],
        ['Medium', 'Spricht mit den Toten', 'Die Toten lassen einen nie ganz in Ruhe'],
        ['Wiedergänger', 'Spürt keinen Schmerz', 'Der Körper zerfällt langsam'],
        ['Uhrwerkmensch', 'Körper aus Metall', 'Muss täglich aufgezogen werden'],
        ['Dämonenblut', 'Kann Feuer rufen', 'Geweihte Orte sind unerträglich']
      ]
    },
    merke: 'Nicht jedes Wesen braucht eine Gabe. Ein Zwerg oder ein Halbling kann ganz normale Stärken haben, zum Beispiel „Zäh wie ein alter Stiefel".'
  },
  {
    gruppe: 'Dein Charakter',
    titel: 'Ideen: Berufe',
    schlagworte: 'beruf job klasse rolle hintergrund',
    kurz: 'Was deine Figur macht, wenn sie nicht gerade Abenteuer erlebt. Daneben stehen Fertigkeiten, die gut dazu passen.',
    tabelle: {
      kopf: ['Beruf', 'Passende Fertigkeiten'],
      zeilen: [
        ['Detektivin', 'Ermittlung, Überzeugen, Heimlichkeit'],
        ['Ärztin', 'Heilkunde, Wissen, Ermittlung'],
        ['Erfinder', 'Technik, Handwerk, Wissen'],
        ['Soldat', 'Nahkampf, Fernkampf, Widerstand'],
        ['Diebin', 'Fingerfertigkeit, Heimlichkeit, Athletik'],
        ['Journalist', 'Ermittlung, Überzeugen, Wissen'],
        ['Priesterin', 'Mysterien, Heilkunde, Überzeugen'],
        ['Adliger', 'Überzeugen, Wissen, Steuern'],
        ['Jägerin', 'Überleben, Fernkampf, Heimlichkeit'],
        ['Schauspieler', 'Überzeugen, Fingerfertigkeit, Athletik'],
        ['Kutscherin oder Pilotin', 'Steuern, Technik, Überleben'],
        ['Gelehrter', 'Wissen, Mysterien, Ermittlung'],
        ['Söldnerin', 'Nahkampf, Widerstand, Überleben'],
        ['Händler', 'Überzeugen, Wissen, Handwerk']
      ]
    }
  },
  {
    gruppe: 'Dein Charakter',
    titel: 'Ideen: Warum bist du dabei?',
    schlagworte: 'beweggrund motivation ziel grund gruppe warum hintergrund',
    kurz: 'Jede Figur braucht einen Grund, mit den anderen loszuziehen. Such dir einen aus oder erfinde einen.',
    punkte: [
      { icon: 'blitz',     titel: 'Rache', text: 'Jemand hat dir etwas genommen, und du willst ihn finden.' },
      { icon: 'muenze',    titel: 'Schulden', text: 'Du schuldest jemandem Geld oder einen Gefallen, und er fordert ihn jetzt ein.' },
      { icon: 'lupe',      titel: 'Neugier', text: 'Hier passiert etwas Seltsames, und du musst wissen, was dahintersteckt.' },
      { icon: 'herz',      titel: 'Jemanden beschützen', text: 'Ein Freund, deine Schwester, dein Kind ist in Gefahr oder Teil der Gruppe.' },
      { icon: 'tropfen',   titel: 'Einen Fluch loswerden', text: 'Auf dir liegt etwas, und die Spur zur Heilung führt hierher.' },
      { icon: 'schild',    titel: 'Wiedergutmachung', text: 'Du hast früher etwas Schlimmes getan und willst es ausgleichen.' },
      { icon: 'pfeil',     titel: 'Auf der Flucht', text: 'Jemand sucht dich, und in einer Gruppe fällst du weniger auf.' },
      { icon: 'stern',     titel: 'Ruhm oder Reichtum', text: 'Du willst berühmt werden oder reich. Am liebsten beides.' },
      { icon: 'buch',      titel: 'Ein Auftrag', text: 'Dein Orden, deine Zeitung oder deine Familie hat dich geschickt.' },
      { icon: 'welt',      titel: 'Ein Platz in der Welt', text: 'Du gehörst nirgends richtig hin. Diese Gruppe ist das Nächste an einem Zuhause.' }
    ],
    merke: 'Am besten verbindet ihr eure Gründe: Vielleicht sucht die eine den Mann, bei dem der andere Schulden hat.'
  },
  {
    gruppe: 'Dein Charakter',
    titel: 'Schicksalspunkte',
    schlagworte: 'schicksalspunkt schicksal belohnung makel riss tatsache',
    kurz: 'Eine Belohnung dafür, die Schwächen deiner Figur ins Spiel zu bringen.',
    punkte: [
      { icon: 'plus',  titel: 'So bekommst du einen', text: 'Wenn deine Schwäche dir Nachteil bringt. Oder wenn die SL deinen Riss ins Spiel bringt und dir damit das Leben schwer macht.' },
      { icon: 'stern', titel: 'So gibst du ihn aus', text: 'Für Vorteil auf einen Wurf deiner Wahl. Oder du legst eine kleine Sache fest, die zur Szene passt: Du kennst den Wirt, oder die Hintertür ist zufällig offen. Ist das zu viel, sagt die SL nein und du behältst den Punkt.' },
      { icon: 'drei',  titel: 'Höchstens drei', text: 'Mehr Schicksalspunkte kann niemand gleichzeitig haben.' }
    ],
    beispiele: [
      { genre: 'mystery', text: 'Der Verdächtige rennt über den Bahnsteig, der Zug fährt gleich ab. Du gibst einen Schicksalspunkt aus: „Ich kenne den Schaffner von früher, er schuldet mir was." Die SL ist einverstanden. Der Zug wartet zwei Minuten länger, und der Verdächtige sitzt in der Falle.' }
    ]
  },

  /* ---------------- Reden und Ermitteln ---------------- */
  {
    gruppe: 'Reden und Ermitteln',
    titel: 'Überreden, Lügen, Durchschauen',
    schlagworte: 'überzeugen lügen bluffen sozial verhandeln einschüchtern lüge durchschauen gedankenkontrolle',
    kurz: 'Erst wird geredet, dann gewürfelt. Gewürfelt wird nur, wenn das Gegenüber noch nicht entschieden ist.',
    punkte: [
      { icon: 'sprechen', titel: 'Erst spielen', text: 'Sag, was deine Figur sagt. Ein gutes Argument kann Vorteil geben, ein schlechtes Nachteil.' },
      { icon: 'schild',   titel: 'Deine Figur gehört dir', text: 'Andere Figuren können dich nicht per Wurf zu etwas überreden. Sie dürfen dir Argumente bringen, aber was deine Figur glaubt und tut, entscheidest du.' },
      { icon: 'auge',     titel: 'Lügen erkennen', text: 'Wahrnehmung + Ermittlung gegen den Wurf des Lügners. Gelingt es, merkst du, dass etwas nicht stimmt. Was genau, musst du selbst herausfinden.' },
      { icon: 'funke',    titel: 'Magischer Zwang', text: 'Will dich ein Zauber zu etwas zwingen, würfelst du Wille + Widerstand. Misslingt es, muss deine Figur nachgeben. Wie sie das tut, spielst du selbst.' }
    ],
    beispiele: [
      { genre: 'steampunk', text: 'Der Fabrikbesitzer will deine Erfindung für ein paar Münzen kaufen. Du legst ihm einen gefälschten Brief hin, laut dem die Konkurrenz das Dreifache bietet: Vorteil. Ausstrahlung + Überzeugen, eine 22. Er wischt sich den Schweiß von der Stirn und verdoppelt sein Angebot.' }
    ]
  },
  {
    gruppe: 'Reden und Ermitteln',
    titel: 'Spuren und Hinweise',
    schlagworte: 'hinweis spur ermittlung tatort indiz fall lösen detektiv',
    kurz: 'Wichtige Hinweise findet man immer, wenn man an der richtigen Stelle sucht. Dafür wird nicht gewürfelt.',
    punkte: [
      { icon: 'schluessel', titel: 'Wichtige Hinweise', text: 'Ohne sie kommt die Geschichte nicht weiter. Deshalb gibt es sie ohne Wurf, sobald jemand an der richtigen Stelle sucht oder die richtige Frage stellt.' },
      { icon: 'wuerfel',    titel: 'Gewürfelt wird für mehr', text: 'Für zusätzliche Hinweise, für Schnelligkeit, oder damit niemand merkt, dass ihr herumschnüffelt.' },
      { icon: 'verstand',   titel: 'Lösen müsst ihr selbst', text: 'Den Fall knackt die Gruppe durch Nachdenken am Tisch. Ein Wurf kann einen Tipp geben, aber nie die Lösung verraten.' }
    ],
    beispiele: [
      { genre: 'mystery', text: 'Die Hausherrin liegt tot im Wintergarten, ein Brieföffner in der Brust. Wer sich die Leiche ansieht, bemerkt ohne Wurf: Die Lippen sind blau, und es ist kaum Blut geflossen. Die Ärztin der Gruppe würfelt Verstand + Heilkunde und erfährt mehr: Sie wurde vergiftet, Stunden vor dem Stich. Jemand wollte, dass es nach einem Streit aussieht.' }
    ]
  },

  /* ---------------- Gesundheit ---------------- */
  {
    gruppe: 'Gesundheit',
    titel: 'Lebenspunkte',
    schlagworte: 'lp lebenspunkte angeschlagen am boden tod sterben versorgen narbe',
    kurz: 'Lebenspunkte (LP) = 10 + (Körper × 2). Mit Körper 3 hast du also 16 LP. Schaden zieht LP ab.',
    zustaende: [
      { ton: 'gut',      titel: 'Unverletzt',   text: 'Mehr als die Hälfte deiner LP.' },
      { ton: 'mittel',   titel: 'Angeschlagen', text: 'Die Hälfte oder weniger. Alles, was Körper oder Geschick braucht, hat Nachteil.' },
      { ton: 'schlecht', titel: 'Am Boden',     text: '0 LP. Du liegst und kannst nichts tun.' }
    ],
    warnung: { kritisch: true, text: 'Es gibt **keine Rettungswürfe**. Wer am Boden liegt und noch einmal getroffen wird, stirbt. Wer am Boden liegt und bis zum Ende der Szene von niemandem versorgt wird, stirbt auch.' },
    punkte: [
      { icon: 'herz', titel: 'Jemanden retten', text: 'Verstand + Heilkunde gegen 15: Die Figur wacht mit 1 LP auf. Bei Erfolg mit Preis überlebt sie, behält aber eine Narbe. Das ist eine neue Schwäche, die bleibt.' }
    ],
    merke: 'Ob jemand stirbt, entscheidet also vor allem die Gruppe. Wer seine Leute nicht im Stich lässt, überlebt meistens.',
    beispiele: [
      { genre: 'fantasy', text: 'Die Ritterin liegt am Boden, über ihr hebt der Troll die Keule. Der Dieb könnte sie jetzt retten. Oder er schnappt sich die Schatztruhe, solange der Troll abgelenkt ist. Er schaut auf die Truhe. Er schaut auf die Ritterin. Am Tisch wird es sehr still.' }
    ]
  },
  {
    gruppe: 'Gesundheit',
    titel: 'Heilung',
    schlagworte: 'heilung rasten verschnaufen erholung lp schlaf',
    tabelle: {
      kopf: ['Wie', 'LP zurück'],
      zeilen: [
        ['Kurz durchatmen, einmal pro Szene', '1W6 + Körper'],
        ['Verarztet werden (Heilkunde gegen 15), einmal pro Szene', '1W6 + Heilkunde'],
        ['Eine Nacht schlafen', 'die Hälfte'],
        ['Mehrere Tage Ruhe', 'alle']
      ]
    },
    merke: 'Heilt ein Wesen in eurer Welt anders, zum Beispiel nur im Mondlicht, ist das Teil seiner Gabe. Eine eigene Regel braucht es dafür nicht.'
  },
  {
    gruppe: 'Gesundheit',
    titel: 'Stürze, Feuer und andere Gefahren',
    schlagworte: 'sturz feuer gefahr schaden fallen explosion säure umgebungsschaden',
    tabelle: {
      kopf: ['Gefahr', 'Schaden'],
      zeilen: [
        ['Tut weh: Sturz aus dem ersten Stock, Kneipenschlägerei', '1W6'],
        ['Ernst: Feuer, Säure, Sturz vom Dach', '2W6'],
        ['Lebensgefährlich: Explosion, Drachenfeuer', '3W6 oder mehr']
      ]
    },
    punkte: [
      { icon: 'blitz', titel: 'Ausweichen', text: 'Geschick + Athletik gegen 15: Du nimmst nur die Hälfte.' }
    ],
    beispiele: [
      { genre: 'steampunk', text: 'Der Kessel der Lokomotive glüht rot und gleich explodiert er. Wer bleibt, nimmt 3W6 Schaden. Wer abspringt, würfelt Geschick + Athletik und landet bei Erfolg nur halb so hart neben den Gleisen.' }
    ]
  },

  /* ---------------- Kampf ---------------- */
  {
    gruppe: 'Kampf',
    titel: 'Initiative und Entfernungen',
    schlagworte: 'initiative zonen bewegung nah kurz fern runde lösen reihenfolge',
    kurz: 'Kein Spielplan, keine Figuren. Es gibt nur drei Entfernungen.',
    zonen: [
      { titel: 'Nah',  text: 'Armlänge' },
      { titel: 'Kurz', text: 'im selben Raum' },
      { titel: 'Fern', text: 'Rufweite' }
    ],
    punkte: [
      { icon: 'blitz', titel: 'Initiative', text: 'Zu Beginn würfelt jeder einmal W20 + Wahrnehmung. Wer höher hat, ist früher dran. Alle Gegner würfeln zusammen einmal.' },
      { icon: 'pfeil', titel: 'Bewegen', text: 'Pro Runde kommst du eine Entfernung weiter und kannst trotzdem etwas tun. Willst du zwei weiter, kannst du in der Runde nichts anderes machen.' },
      { icon: 'kampf', titel: 'Weglaufen', text: 'Wer aus einem Handgemenge wegläuft, bekommt einen Schlag hinterher. Außer er tut in dieser Runde sonst nichts.' }
    ],
    beispiele: [
      { genre: 'wesen', text: 'Der Werwolf steht direkt neben der Hexe, du bist am anderen Ende des Raums. Du rennst los und wirfst dich zwischen die beiden. Angreifen kannst du in dieser Runde nicht mehr, dafür treffen die Krallen jetzt dich statt sie.' }
    ]
  },
  {
    gruppe: 'Kampf',
    titel: 'Aktionen im Kampf',
    schlagworte: 'aktion angreifen wehren manöver unterstützen umgebung verteidigung vt ac',
    kurz: 'Du hast eine Aktion pro Runde. Wie schwer du zu treffen bist, zeigt deine Verteidigung (VT) = 10 + Geschick + Nahkampf.',
    punkte: [
      { icon: 'kampf',  titel: 'Angreifen', text: 'W20 + Attribut + Fertigkeit. Erreichst du die VT des Gegners, triffst du. Liegst du 5 oder mehr darüber, machst du 2 Schaden extra.' },
      { icon: 'schild', titel: 'Abwehren', text: 'Du greifst nicht an und konzentrierst dich ganz aufs Ausweichen. Bis du wieder dran bist, haben alle Angriffe gegen dich Nachteil.' },
      { icon: 'hand',   titel: 'Manöver', text: 'Wie ein Angriff, aber statt Schaden: entwaffnen, umstoßen, blenden oder festhalten. Wer am Boden liegt oder festgehalten wird, ist leichter zu treffen (Vorteil).' },
      { icon: 'gruppe', titel: 'Helfen', text: 'Sag, wie du hilfst. Dein Verbündeter hat Vorteil.' },
      { icon: 'zahnrad', titel: 'Die Umgebung nutzen', text: 'Einen Kronleuchter abschneiden, ein Regal umwerfen, Sand ins Gesicht. Die SL sagt, was du würfelst. Das wirkt oft besser als ein normaler Schlag.' }
    ],
    beispiele: [
      { genre: 'steampunk', text: 'Drei Schläger kommen die Treppe hoch. Statt zu kämpfen, drehst du das Ventil an der Dampfleitung auf: Geschick + Technik gegen 15. Heißer Dampf füllt das Treppenhaus. Die drei sehen nichts mehr und haben Nachteil, einer fällt die Stufen hinunter.' }
    ]
  },
  {
    gruppe: 'Kampf',
    titel: 'Waffen und Rüstung',
    schlagworte: 'waffen schaden rüstung deckung kritisch nachladen schwer leicht mittel',
    tabelle: {
      kopf: ['Waffe', 'Schaden'],
      zeilen: [
        ['Leicht: Messer, kleine Pistole, Faust', '1W6'],
        ['Mittel: Schwert, Revolver, Axt', '1W8'],
        ['Schwer: großes Schwert, Gewehr, Hammer', '1W10']
      ]
    },
    punkte: [
      { icon: 'gewicht', titel: 'Schwere Waffen', text: 'Nachteil in engen Räumen und beim Schleichen.' },
      { icon: 'uhr',     titel: 'Nachladen', text: 'Waffen mit nur einem Schuss brauchen eine ganze Runde zum Nachladen.' },
      { icon: 'schild',  titel: 'Rüstung', text: 'Zieht von jedem Treffer etwas ab: leicht 1, mittel 2, schwer 3. Schwere Rüstung gibt Nachteil beim Schleichen und Klettern.' },
      { icon: 'mauer',   titel: 'Deckung', text: 'Wer auf jemanden hinter einer Deckung schießt, hat Nachteil.' },
      { icon: 'stern',   titel: 'Natürliche 20', text: 'Höchster Schaden der Waffe, und der Gegner fällt um, verliert die Waffe oder fliegt zurück.' },
      { icon: 'blitz',   titel: 'Natürliche 1', text: 'Daneben, und es passiert etwas Ungünstiges.' }
    ]
  },
  {
    gruppe: 'Kampf',
    titel: 'Gegner',
    schlagworte: 'gegner monster werte statist stark monströs nsc',
    kurz: 'Vier Stufen reichen für jeden Gegner, vom Taschendieb bis zum Drachen.',
    tabelle: {
      kopf: ['Stufe', 'VT', 'Angriff', 'Schaden', 'LP'],
      zeilen: [
        ['Schwach',  '11', '+3', '1W6',  'fällt beim ersten Treffer'],
        ['Normal',   '13', '+5', '1W8',  '15'],
        ['Stark',    '15', '+7', '1W10', '25'],
        ['Monster',  '17', '+9', '2W6',  '40, ist zweimal pro Runde dran']
      ]
    },
    merke: 'Jeder Gegner bekommt höchstens eine Besonderheit, in einem Satz.',
    beispiele: [
      { genre: 'fantasy', text: 'Ein Troll unter der Brücke: Stark. Besonderheit: „Wunden heilen sofort, außer sie kommen von Feuer." Mehr muss die SL nicht aufschreiben. Den Rest erledigt die Gruppe, die verzweifelt nach einer Fackel sucht.' }
    ]
  },

  /* ---------------- Horror und Stabilität ---------------- */
  {
    gruppe: 'Horror und Stabilität',
    titel: 'Stabilität und Schreckmomente',
    schlagworte: 'stabilität horror schock wahnsinn geist nerven grauen schockwurf',
    kurz: 'Stabilität zeigt, wie viel deine Figur verkraftet, bevor die Nerven reißen. Stabilität = 10 + (Wille × 2).',
    punkte: [
      { icon: 'auge', titel: 'Der Schreckwurf', text: 'Sieht deine Figur etwas Grauenhaftes, würfelst du Wille + Widerstand. Schaffst du es, passiert nichts. Wenn nicht, verlierst du Stabilität.' },
      { icon: 'waage', titel: 'Erfolg mit Preis', text: 'Du verlierst nichts, aber du schreist, erstarrst oder kannst die nächste Runde nichts tun.' },
      { icon: 'eins',  titel: 'Nur einmal', text: 'Pro Schrecken wird nur einmal gewürfelt, nicht bei jedem neuen Hinsehen.' }
    ],
    tabelle: {
      kopf: ['SG', 'Was man sieht', 'Verlust'],
      zeilen: [
        ['10', 'Verstörend: eine Leiche, die nicht nach Unfall aussieht', '1'],
        ['15', 'Unheimlich: ein Spiegelbild, das sich zu spät bewegt', '1W6'],
        ['20', 'Unmöglich: der tote Bruder steht in der Tür', '2W6'],
        ['25', 'Zu viel für den Verstand', '3W6']
      ]
    },
    beispiele: [
      { genre: 'horror', text: 'Ihr öffnet den Sarg des Großvaters. Er ist seit vierzig Jahren tot, aber seine Fingernägel sind blutig. Innen am Deckel sind Kratzspuren. SG 15.' }
    ]
  },
  {
    gruppe: 'Horror und Stabilität',
    titel: 'Wenn die Nerven reißen',
    schlagworte: 'erschüttert gebrochen tick narbe seele zusammenbruch',
    zustaende: [
      { ton: 'mittel',   titel: 'Erschüttert', text: 'Die Hälfte deiner Stabilität oder weniger. Nachteil bei allem mit Wille oder Wahrnehmung. Dazu bekommt deine Figur eine Macke, die du ausspielst.' },
      { ton: 'schlecht', titel: 'Zusammengebrochen', text: '0 Stabilität. Deine Figur verliert bis zum Ende der Szene die Fassung.' }
    ],
    warnung: { text: 'Wie deine Figur zusammenbricht, entscheidest **du**: wegrennen, erstarren, um sich schlagen, weinend zusammensacken. Die SL sagt nur, **dass** es passiert, nie wie.' },
    punkte: [
      { icon: 'narbe', titel: 'Danach', text: 'Deine Figur bekommt 1W6 Stabilität zurück und behält eine seelische Narbe. Das ist eine neue Schwäche, die du selbst aufschreibst.' }
    ],
    beispiele: [
      { genre: 'horror', text: 'Mögliche Macken: Du zählst ständig die Fenster im Raum. Du summst das Kinderlied, das aus dem Keller kam. Du wäschst dir die Hände, bis sie rot sind.' }
    ]
  },
  {
    gruppe: 'Horror und Stabilität',
    titel: 'Stabilität zurückgewinnen',
    schlagworte: 'stabilität erholung anker regeneration',
    tabelle: {
      kopf: ['Wie', 'Zurück'],
      zeilen: [
        ['Eine ruhige Nacht an einem sicheren Ort', '2'],
        ['Mehrere Tage echte Ruhe', 'die Hälfte'],
        ['Zeit mit deinem Anker, einmal pro Spielabend', '1W6'],
        ['Jemand redet dir gut zu (Ausstrahlung + Überzeugen gegen 15)', '1W6'],
        ['Ein Abenteuer erfolgreich beendet', '1W6']
      ]
    }
  },
  {
    gruppe: 'Horror und Stabilität',
    titel: 'Verbotenes Wissen und Rituale',
    schlagworte: 'mysterien okkult verbotenes wissen ritual magie buch beschwörung',
    punkte: [
      { icon: 'tropfen', titel: 'Wer mehr weiß, fürchtet mehr', text: 'Hast du Mysterien 1 oder höher, verlierst du bei jedem misslungenen Schreckwurf 1 Stabilität extra. Du weißt eben, wie schlimm es wirklich ist.' },
      { icon: 'auge',    titel: 'Dafür erkennst du es', text: 'Mit Verstand + Mysterien weißt du, was vor dir steht und wie man ihm schaden kann.' },
      { icon: 'buch',    titel: 'Verbotene Bücher', text: 'Wer so etwas liest, verliert 1W6 Stabilität, ohne zu würfeln. Dafür bekommt er eine klare Antwort auf eine Frage.' },
      { icon: 'kerze',   titel: 'Rituale', text: 'Große Magie, die Zeit, einen passenden Ort und ein Opfer braucht. Wille + Mysterien gegen 15, 20 oder 25. Kostet immer Stabilität.' }
    ],
    beispiele: [
      { genre: 'horror', text: 'Das Ding im Brunnen hat einen Namen, und nur wer ihn kennt, kann es vertreiben. Der Professor schlägt das alte Buch auf. 1W6 Stabilität, ohne Wurf. Er liest den Namen. Er wird ihn nie wieder vergessen.' }
    ]
  },

  /* ---------------- Technik und Ausrüstung ---------------- */
  {
    gruppe: 'Technik und Ausrüstung',
    titel: 'Maschinen und Erfindungen',
    schlagworte: 'maschine technik erfindung bauen dampf steampunk reparieren sabotieren alchemie',
    punkte: [
      { icon: 'steuer',  titel: 'Fahren und Bedienen', text: 'Geschick + Steuern.' },
      { icon: 'zahnrad', titel: 'Verstehen, reparieren, kaputtmachen', text: 'Verstand + Technik. Unter Beschuss mit Nachteil.' },
      { icon: 'werkzeug', titel: 'Etwas bauen', text: 'Verstand + Technik. SG 15 für etwas Zusammengebasteltes, 20 für etwas Ordentliches, 25 für etwas völlig Neues.' },
      { icon: 'waage',   titel: 'Erfolg mit Preis', text: 'Das Ding funktioniert genau einmal. Oder es macht etwas, das keiner wollte.' },
      { icon: 'ziel',    titel: 'Grenzen', text: 'Jede Erfindung braucht Material und Zeit und kann genau eine Sache.' }
    ],
    merke: 'In Fantasy-Runden funktionieren Tränke, Fallen und Zwergenmaschinen genauso.',
    beispiele: [
      { genre: 'steampunk', text: 'Ihr sitzt auf dem Dach fest, unten brennt das Lagerhaus. Die Erfinderin baut aus einer großen Plane, zwei Gasflaschen und einem Regenschirm einen Ballon. Verstand + Technik gegen 20, sie würfelt 17. Erfolg mit Preis: Er fliegt. Wohin, entscheidet der Wind.' }
    ]
  },
  {
    gruppe: 'Technik und Ausrüstung',
    titel: 'Ausrüstung und Geld',
    schlagworte: 'ausrüstung traglast geld munition verbrauch gegenstand',
    punkte: [
      { icon: 'tasche',  titel: 'Was du trägst', text: 'Sechs Dinge am Körper. Eine schwere Rüstung zählt doppelt. Kleinkram schreibt niemand auf.' },
      { icon: 'schluessel', titel: 'Was Ausrüstung bringt', text: 'Sie macht etwas möglich oder gibt Vorteil. Fehlt sie, gibt es Nachteil. Mehr nicht.' },
      { icon: 'blitz',   titel: 'Verbraucht', text: 'Bei einer natürlichen 1 ist aus, was du gerade benutzt: die Munition, das Lampenöl, der letzte Dietrich.' },
      { icon: 'muenze',  titel: 'Geld', text: 'Du bist arm, kommst zurecht oder bist reich. Es gibt keine Preislisten.' }
    ],
    beispiele: [
      { genre: 'fantasy', text: 'Ohne Seil kommt niemand in die Schlucht. Mit Seil ist es ein normaler Wurf. Mit dem Elfenseil, das sich von selbst festknotet, gibt es Vorteil.' }
    ]
  },

  /* ---------------- Fortschritt ---------------- */
  {
    gruppe: 'Fortschritt',
    titel: 'Besser werden',
    schlagworte: 'fortschritt fp erfahrung steigern level aufstieg kosten',
    kurz: 'Nach jedem Spielabend gibt es 1 Fortschrittspunkt (FP). Endet ein Abenteuer, gibt es 2.',
    tabelle: {
      kopf: ['Was', 'Kosten'],
      zeilen: [
        ['Fertigkeit +1', '2 FP (ab 4: 4 FP)'],
        ['Attribut +1', '6 FP (ab 6: 10 FP)'],
        ['+3 LP oder +3 Stabilität', '3 FP'],
        ['Neue Stärke oder Gabe', '4 FP']
      ]
    },
    punkte: [
      { icon: 'hoch',  titel: 'Höchstwerte', text: 'Attribute bis 7, Fertigkeiten bis 5.' },
      { icon: 'ziel',  titel: 'Nur was du benutzt hast', text: 'Verbessern kannst du nur, was im Spiel vorkam oder was du geübt hast.' },
      { icon: 'narbe', titel: 'Schwächen', text: 'Lassen sich nicht kaufen. Sie verschwinden nur, wenn deine Figur sie im Spiel überwindet.' }
    ],
    beispiele: [
      { genre: 'fantasy', text: 'Drei Abenteuer lang hatte deine Figur Angst vor Wasser. Im vierten springt sie in den Fluss, um ein ertrinkendes Kind zu retten. Danach streicht ihr die Schwäche. Mit Punkten hätte man das nicht kaufen können.' }
    ]
  },

  /* ---------------- Welten ---------------- */
  {
    gruppe: 'Welten',
    titel: 'Ein Regelwerk, viele Welten',
    schlagworte: 'setting genre welt wesen übernatürlich steampunk krimi mystery fantasy dnd horror',
    kurz: 'Die Regeln funktionieren in jeder Welt. Je nach Runde sind manche Teile wichtiger und andere fallen weg.',
    punkte: [
      { icon: 'funke',   titel: 'Übernatürliche Wesen', text: 'Gaben, jede mit Preis. Viel Reden und Intrigen. Stabilität, wenn es gruselig werden soll.' },
      { icon: 'zahnrad', titel: 'Steampunk', text: 'Maschinen und Erfindungen, Luftschiffe, Dampf. Gaben nur, wenn es Magie geben soll.' },
      { icon: 'lupe',    titel: 'Murder Mystery', text: 'Spuren und Hinweise stehen im Mittelpunkt. Kämpfe sind selten und gefährlich.' },
      { icon: 'kampf',   titel: 'Fantasy im D&D-Stil', text: 'Gaben für Magie, viele Gegner, Schätze und Ausrüstung. Stabilität meist nicht nötig.' },
      { icon: 'mond',    titel: 'Horror', text: 'Stabilität und verbotenes Wissen. Wenig Kampf, viel Unbekanntes.' }
    ],
    merke: 'Mischen ist ausdrücklich erlaubt: ein Mord auf einem Luftschiff, Hexen in einer Dampfmaschinenstadt, ein Drache als Hauptverdächtiger.'
  },

  /* ---------------- Spielleitung ---------------- */
  {
    gruppe: 'Spielleitung',
    nurSL: true,
    titel: 'Den SG in zwei Sekunden festlegen',
    schlagworte: 'spielleiter improvisation sg setzen',
    kurz: 'Frag dich: Könnte jemand mit Übung das schaffen?',
    tabelle: {
      kopf: ['Antwort', 'SG'],
      zeilen: [
        ['Ja, locker', '10'],
        ['Ja, mit Konzentration', '15'],
        ['Nur wer richtig gut ist', '20'],
        ['Nur mit Hilfe oder Glück', '25'],
        ['Eigentlich nicht', '30']
      ]
    },
    merke: 'Im Zweifel 15.'
  },
  {
    gruppe: 'Spielleitung',
    nurSL: true,
    titel: 'Hinweise verteilen',
    schlagworte: 'hinweis ermittlung drei fährte fall falsche',
    punkte: [
      { icon: 'drei',  titel: 'Dreimal pro Erkenntnis', text: 'Für alles, was die Gruppe herausfinden muss, drei Hinweise an drei Orten. Dann ist es egal, wenn einer übersehen wird.' },
      { icon: 'pfeil', titel: 'Falsche Spuren', text: 'Sie führen zu etwas Echtem, nur nicht zur Lösung. Spuren ins Nichts bringen Spieler dazu, nichts mehr zu untersuchen.' },
      { icon: 'auge',  titel: 'Nachfragen belohnen', text: 'Kommt jemand auf ein Detail zurück, gib ihm etwas dafür.' }
    ],
    beispiele: [
      { genre: 'mystery', text: 'Die Gruppe soll herausfinden: Der Gärtner war in der Mordnacht im Haus. Hinweis 1: Erde aus dem Rosenbeet auf dem Teppich. Hinweis 2: Die Köchin hat um Mitternacht seine Stimme gehört. Hinweis 3: Sein Fahrrad fehlt, und die Reifenspur führt zur Hintertür.' }
    ]
  },
  {
    gruppe: 'Spielleitung',
    nurSL: true,
    titel: 'Im Nachhinein erklären',
    schlagworte: 'improvisation rückwärts begründen wahrheitsnotiz',
    schritte: [
      { titel: 'Etwas Neues taucht auf', text: 'Ein Spieler fragt etwas, das du nicht vorbereitet hast.' },
      { titel: 'Prüfen', text: 'Passt eine Antwort zu dem, was in Wahrheit passiert ist?' },
      { titel: 'Sagen', text: 'Antworte so, als hätte es immer schon festgestanden.' }
    ],
    warnung: { text: 'Das geht bei Nebenfiguren, Orten und Kleinigkeiten. Die eigentliche Lösung des Falls wird nie nachträglich geändert.' },
    beispiele: [
      { genre: 'mystery', text: 'Eine Spielerin fragt, warum der Hausmeister so nervös ist. Bisher war er nur Statist. Passt „Er hat in der Nacht etwas gesehen und wird erpresst" zum Fall? Dann ist es ab jetzt so.' }
    ]
  },
  {
    gruppe: 'Spielleitung',
    nurSL: true,
    titel: 'Einmal gesagt, bleibt gesagt',
    schlagworte: 'festlegen kanon entscheidung improvisation festlegungsregel',
    kurz: 'Sobald die Gruppe nach einer Antwort handelt, steht sie fest. Aufschreiben.',
    merke: 'Vorher darf alles offen sein. Danach wird nichts mehr geändert.',
    beispiele: [
      { genre: 'mystery', text: '„War der Bruder in der Brandnacht in der Stadt?" Die Gruppe entscheidet danach, wen sie beschuldigt. Ab dieser Antwort ändert sich daran nichts mehr, auch wenn später eine andere Wendung besser gepasst hätte.' }
    ]
  },
  {
    gruppe: 'Spielleitung',
    nurSL: true,
    titel: 'Wenn die Gruppe feststeckt',
    schlagworte: 'feststecken hilfe sackgasse notfall',
    schritte: [
      { titel: 'Etwas passieren lassen', text: 'Ein Ereignis bringt neue Informationen.' },
      { titel: 'Jemanden schicken', text: 'Eine Figur taucht auf, die etwas will.' },
      { titel: 'Einen Hinweis neu zeigen', text: '„Dir fällt erst jetzt auf, dass …"' },
      { titel: 'Am Tisch fragen', text: '„Was würdet ihr tun, wenn das ein Film wäre?" Und das dann möglich machen.' }
    ]
  }
];
