/* ============================================================
   TABELLEN — der Inhalt des Improvisationshefts als Daten
   ============================================================

   ERWEITERN:
   Einfach einen String in ein "eintraege"-Array schreiben.
   Die App würfelt automatisch über die neue Länge — es gibt
   keine feste Würfelgröße, die angepasst werden müsste.

   NEUE TABELLE ANLEGEN:
   Ein neues Objekt in "listen" einer Gruppe ergänzen:

     meinetabelle: {
       titel: 'Meine Tabelle',
       eintraege: ['Eins', 'Zwei', 'Drei']
     }

   NEUE GRUPPE ANLEGEN:
   Ein neues Objekt auf oberster Ebene mit titel + listen.

   Die Schlüssel (z. B. "personen.wunsch") werden von den
   Kombiwürfen unten referenziert — beim Umbenennen dort
   mit anpassen.
   ============================================================ */

export const TABELLEN = {

  /* ==========================================================
     ORTE UND RÄUME
     ========================================================== */
  ort: {
    titel: 'Orte & Räume',
    listen: {

      auffaellig: {
        titel: 'Was sofort auffällt',
        eintraege: [
          'Es ist wärmer als draußen, spürbar wärmer',
          'Ein Geräusch, das nicht aufhört — Tropfen, Ticken, Summen',
          'Der Boden ist an einer Stelle abgetreten, sonst staubig',
          'Zu viel Licht für die Tageszeit',
          'Alles ist ordentlicher, als es sein müsste',
          'Jemand hat hier vor kurzem geraucht',
          'Es riecht nach heißem Metall',
          'Ein Fenster steht offen, obwohl es kalt ist',
          'Zwei Stühle, aber nur ein Gedeck',
          'Die Wände sind frisch gestrichen, ungleichmäßig',
          'Kohlenstaub auf allen waagerechten Flächen',
          'Ein Teppich liegt falsch, als hätte man ihn verschoben',
          'Es ist absolut still — auch die Straßengeräusche fehlen',
          'Kondenswasser läuft die Innenwände hinunter',
          'Der Raum ist kleiner als von außen erwartet',
          'Überall Papier, sortiert nach einem System, das man nicht versteht',
          'Eine Tür, die nicht auf den Grundriss passt',
          'Jemand hat abgewaschen, aber schlecht',
          'Es zieht, ohne dass man die Quelle findet',
          'Ein einzelner Gegenstand steht auffällig in der Mitte'
        ]
      },

      geruch: {
        titel: 'Was man riechen kann',
        eintraege: [
          'Kohlerauch und Öl',
          'Nasse Wolle',
          'Karbol und Seife',
          'Süßlich, wie überreifes Obst',
          'Kaltes Fett',
          'Tabak, teuer',
          'Salpeter',
          'Nasses Papier und Schimmel',
          'Etwas Verbranntes, aber nicht Holz',
          'Parfüm, zu viel davon',
          'Blut, alt',
          'Nichts. Gar nichts.'
        ]
      },

      nutzbar: {
        titel: 'Was man benutzen kann',
        eintraege: [
          'Ein Kohlenofen, brennt noch',
          'Ein Seilzug an der Decke',
          'Ein Fenster mit morschem Rahmen',
          'Eine Öllampe an einer Kette',
          'Ein Wandschrank, groß genug für einen Menschen',
          'Ein Druckventil an einem Rohr',
          'Ein loses Bodenbrett über einem Hohlraum',
          'Ein schwerer Vorhang',
          'Eine Karre oder ein Wagen',
          'Ein Werkzeug, das als Waffe taugt',
          'Eine Klingelleitung zum Personal',
          'Ein Regal, das umkippen kann',
          'Ein Gasanschluss',
          'Eine Falltür oder Rutsche',
          'Wasser: Eimer, Trog, Rohrbruch',
          'Ein Spiegel, groß',
          'Ein Gitter, das man abnehmen kann',
          'Ein Kessel unter Druck',
          'Eine Leiter oder Treppe nach oben',
          'Öl in einem offenen Behälter'
        ]
      },

      spuren: {
        titel: 'Wer oder was schon hier war',
        eintraege: [
          'Fußspuren, zwei Größen, dieselbe Richtung',
          'Ein abgerissener Knopf',
          'Eine ausgedrückte Zigarette, noch warm',
          'Kratzspuren am Türrahmen, innen',
          'Ein Glas mit Rest, nicht abgeräumt',
          'Ein Fleck, den jemand wegzuschrubben versucht hat',
          'Ein Blatt Papier, halb verbrannt',
          'Werkzeug liegt bereit, aber niemand ist da',
          'Eine Tasche, gepackt',
          'Blut, gewischt',
          'Jemand hat auf die Wand geschrieben und übermalt',
          'Es ist alles unberührt — auffällig unberührt'
        ]
      },

      schauplatz: {
        titel: 'Schauplatz (wenn du gar nichts hast)',
        eintraege: [
          'Werkstatt', 'Gasse oder Hinterhof', 'Herrenhaus', 'Fabrik',
          'Labor', 'Hafen', 'Luftschiff', 'Keller oder Gewölbe',
          'Bahnhof', 'Krankenhaus', 'Archiv', 'Wirtshaus',
          'Kirche, entwidmet', 'Lagerhalle', 'Wasserwerk', 'Friedhof'
        ]
      }
    }
  },

  /* ==========================================================
     TECHNIK UND MASCHINEN
     ========================================================== */
  technik: {
    titel: 'Technik & Maschinen',
    listen: {

      bauteil: {
        titel: 'Bauteil',
        eintraege: [
          'Zahnradsatz', 'Druckventil', 'Kupferrohr', 'Messingkessel, klein',
          'Manometer', 'Lederschlauch', 'Schwungrad', 'Zündspule',
          'Filterpatrone', 'Gewichtsregler', 'Kolben', 'Kohlebürste',
          'Spiegellinse', 'Federwerk', 'Dichtungsring', 'Ölpumpe',
          'Schaltwalze', 'Thermometer', 'Handkurbel', 'Sicherheitsblende'
        ]
      },

      zustand: {
        titel: 'Zustand',
        eintraege: [
          'Rostig',
          'Überhitzt',
          'Frisch geölt',
          'Notdürftig geflickt',
          'Offensichtlich gestohlen — Nummer herausgefeilt',
          'Summt leise, obwohl nichts angeschlossen ist',
          'Falsch herum eingebaut',
          'Gestempelt mit einem Wappen, das es nicht mehr gibt'
        ]
      },

      taugtZu: {
        titel: 'Wozu es taugt',
        eintraege: [
          'Druck erzeugen', 'Druck ablassen', 'Etwas messen',
          'Etwas blockieren', 'Funken schlagen', 'Kraft übertragen'
        ]
      },

      material: {
        titel: 'Material',
        eintraege: [
          'Messing', 'Gusseisen', 'Kupfer', 'Leder', 'Kautschuk',
          'Glas, dick', 'Zinn', 'Filz', 'Draht', 'Öltuch',
          'Porzellan', 'Ein Metall, das man nicht einordnen kann'
        ]
      },

      werkzeug: {
        titel: 'Werkzeug',
        eintraege: [
          'Schraubenschlüsselsatz', 'Feinmechanikerbesteck', 'Lötkolben und Zinn',
          'Schneidbrenner', 'Handbohrer', 'Feilen und Raspeln', 'Schraubstock',
          'Messschieber', 'Draht und Zange', 'Hebeisen', 'Spiegel am Stiel', 'Dietriche'
        ]
      },

      chemie: {
        titel: 'Chemikalie / Alchemie',
        eintraege: [
          'Ätzsalz — frisst Metall in Minuten · Dämpfe: 1W6 Schaden im engen Raum',
          'Blitzpulver — greller Blitz, blendet · blendet auch, wer nicht wegsieht',
          'Weckwasser — hält 12 Stunden wach · danach 1W6 Stabilitätsverlust',
          'Rauchpatrone — füllt eine Zone · riecht noch Stunden später nach dir',
          'Kaltfeuer — brennt ohne Hitze, leuchtet blau · nicht löschbar, nur ersticken',
          'Wundpaste — 1W6 LP sofort · Nachteil auf Wahrnehmung, eine Stunde',
          'Schlafäther — bewusstlos in Sekunden · bei Nat 1 auch der Anwender',
          'Spürtinktur — macht Blut sichtbar, auch altes · und anderes',
          'Kesselkitt — dichtet alles, hält eine Stunde · danach reißt es schlagartig',
          'Grünöl — schmiert alles lautlos · frisst Leder und Haut langsam',
          'Schwarze Milch — betäubt Schmerz vollständig · macht abhängig ab dem zweiten Mal',
          'Namenlos — der Vorbesitzer wusste, was es tut · du nicht'
        ]
      },

      improvisiert: {
        titel: 'Was sich improvisieren lässt',
        eintraege: [
          'Eine Lärmfalle (Draht, Blech, Feder)',
          'Ein Enterhaken mit Seilwinde',
          'Ein Dampfstoß als Waffe (1W8, einmal)',
          'Ein Türblockierer, der Werkzeug braucht zum Lösen',
          'Ein Signalgeber über Entfernung',
          'Eine Atemmaske mit Filter',
          'Ein Kurzschluss oder ein Feuer, zeitverzögert',
          'Ein Dietrich für genau dieses Schloss',
          'Eine Hebelvorrichtung, die drei Männer ersetzt',
          'Ein Sichtgerät: Spiegel um die Ecke, Linse in die Ferne',
          'Ein Druckminderer, der eine Maschine überlisten kann',
          'Eine Bombe. Klein, unzuverlässig, laut'
        ]
      },

      antrieb: {
        titel: 'Antrieb',
        eintraege: [
          'Dampfkessel, kohlebefeuert',
          'Federwerk, muss aufgezogen werden',
          'Druckluft aus Flaschen',
          'Wasserkraft über eine Welle',
          'Muskelkraft, mindestens zwei Personen',
          'Elektrisch, mit Batteriebank',
          'Verbrennung, stinkt und ruckelt',
          'Man weiß es nicht. Es läuft einfach.'
        ]
      },

      aufgabe: {
        titel: 'Aufgabe der Maschine',
        eintraege: [
          'Bewegt sich fort', 'Hebt oder zieht', 'Bohrt, schneidet, zermahlt',
          'Pumpt oder presst', 'Rechnet oder sortiert', 'Kommuniziert über Entfernung',
          'Erzeugt Licht oder Wärme', 'Reinigt, filtert, trennt',
          'Zeichnet auf oder misst', 'Schießt oder schleudert',
          'Öffnet und schließt', 'Niemand weiß es genau'
        ]
      },

      macke: {
        titel: 'Macke (jede Maschine hat genau eine)',
        eintraege: [
          'Braucht zwei Personen zum Bedienen',
          'Ohrenbetäubend laut',
          'Überhitzt nach zehn Minuten',
          'Frisst Brennstoff wie nichts Gutes',
          'Startet nur bei einem Technik-Wurf über 10',
          'Zieht immer leicht nach links',
          'Die Anzeigen stimmen nicht, man muss es wissen',
          'Bei Erschütterung schaltet sie ab',
          'Lässt sich nicht mehr stoppen, wenn sie erst läuft',
          'Verletzt regelmäßig den, der sie bedient',
          'Hinterlässt eine Spur — Öl, Rauch, Lärm, Geruch',
          'Reagiert manchmal, bevor man den Hebel zieht'
        ]
      },

      fahrzeug: {
        titel: 'Fahrzeug',
        eintraege: [
          'Dampfdroschke', 'Lastfuhrwerk mit Kessel', 'Flussschlepper',
          'Kanalboot', 'Bahndraisine', 'Lokomotive', 'Luftschiff, klein (vier Personen)',
          'Luftschiff, groß', 'Einmann-Gyrokopter', 'Taucherglocke',
          'Panzerwagen der Werkspolizei', 'Kohlenlore'
        ]
      }
    }
  },

  /* ==========================================================
     MENSCHEN
     ========================================================== */
  personen: {
    titel: 'Menschen',
    listen: {

      aussehen: {
        titel: 'Ein Aussehensdetail',
        eintraege: [
          'Zu große Hände für die Statur',
          'Eine Brandnarbe am Hals, halb vom Kragen verdeckt',
          'Trägt bei jedem Wetter Handschuhe',
          'Ein Auge ist Glas, ein gutes',
          'Fingernägel schwarz — Öl, nicht Schmutz',
          'Ungewöhnlich gerader Rücken, wie gelernt',
          'Der Anzug war einmal teuer, vor Jahren',
          'Riecht nach Karbolseife',
          'Eine Zahnlücke vorn, spricht deshalb leiser',
          'Weißes Haar, aber jung im Gesicht',
          'Sehr sauber, bis auf die Schuhe',
          'Trägt einen Ring, der nicht zu ihm passt',
          'Rasiert sich schlecht, immer an derselben Stelle',
          'Etwas zu dünn für die Kleidung',
          'Schielt leicht, wenn er nachdenkt',
          'Eine Tätowierung, halb abgetragen',
          'Hinkt kaum merklich, nur bergauf',
          'Immer eine Zeitung unter dem Arm, immer dieselbe',
          'Zwei verschiedene Manschettenknöpfe',
          'Kein einziges auffälliges Merkmal, und das ist merkwürdig'
        ]
      },

      auftreten: {
        titel: 'Auftreten und Ticks',
        eintraege: [
          'Redet zu schnell und entschuldigt sich dafür',
          'Wiederholt die letzten Worte des Gegenübers',
          'Sieht beim Sprechen ständig zur Tür',
          'Lacht an falschen Stellen',
          'Fasst beim Reden Gegenstände an',
          'Nennt jeden beim Nachnamen, auch Bekannte',
          'Antwortet erst nach einer Pause, immer gleich lang',
          'Steht immer zu nah',
          'Spricht Dialekt, wechselt bei Fremden ins Hochdeutsche',
          'Beantwortet Fragen mit Fragen',
          'Erzählt sofort etwas Persönliches',
          'Sehr höflich, sehr kalt',
          'Rechnet halblaut mit',
          'Verbessert andere ständig',
          'Sagt „verstehen Sie“ nach jedem Satz',
          'Sieht niemandem in die Augen, außer beim Lügen',
          'Raucht Kette, bietet nie an',
          'Duzt sofort',
          'Spricht von sich in der Mehrzahl',
          'Sagt fast nichts und hört sehr genau zu'
        ]
      },

      wunsch: {
        titel: 'Was er will',
        eintraege: [
          'Bezahlt werden, endlich',
          'Dass jemand ihm zuhört',
          'Aus der Stadt weg',
          'Befördert werden',
          'Dass eine bestimmte Person verschwindet',
          'Seine Familie beschützen',
          'Wissen, was mit jemandem passiert ist',
          'Anerkennung von jemandem, der längst tot ist',
          'Ruhe, einfach nur Ruhe',
          'An etwas herankommen, das andere besitzen',
          'Recht behalten',
          'Nicht auffliegen',
          'Zurück in eine Stellung, die er verloren hat',
          'Rache, konkret und benannt',
          'Dass die Arbeit weitergeht, egal was es kostet',
          'Etwas beenden, das er angefangen hat',
          'Jemanden loswerden, der ihn erpresst',
          'Sehen, wie weit man gehen kann',
          'Dazugehören',
          'Vergessen'
        ]
      },

      geheimnis: {
        titel: 'Was er verschweigt',
        eintraege: [
          'Er hat gestohlen, klein und regelmäßig',
          'Er ist nicht der, für den er sich ausgibt',
          'Er hat jemanden sterben lassen, durch Nichtstun',
          'Er wird bezahlt, von jemand anderem als man denkt',
          'Er hat Angst vor jemandem aus dieser Gruppe',
          'Er weiß, was in dem Raum ist, den niemand betritt',
          'Er hat unterschrieben, was er nicht hätte unterschreiben sollen',
          'Er hat es gesehen und niemandem geglaubt, der es auch sah',
          'Sein Bruder ist einer von ihnen',
          'Er ist krank und hat nicht mehr lange',
          'Er hat den Brief gelesen',
          'Er war dabei, damals',
          'Er hat den Schlüssel und behauptet, ihn verloren zu haben',
          'Er glaubt an etwas, das ihn ächten würde',
          'Er hat die Papiere gefälscht',
          'Er kann nicht lesen',
          'Er hat die Maschine sabotiert, aus einem guten Grund',
          'Er hat Schulden bei denen, die man nicht schuldig sein will',
          'Er hört seit einem halben Jahr etwas nachts',
          'Er weiß, dass die Gruppe kommen würde'
        ]
      },

      willVonGruppe: {
        titel: 'Was er von der Gruppe will',
        eintraege: [
          'Nichts — er will nur weg',
          'Er will mitkommen',
          'Er will Geld dafür, dass er redet',
          'Er will einen Gefallen, jetzt oder später',
          'Er will die Gruppe warnen, traut sich aber nicht offen',
          'Er will die Gruppe benutzen, um jemand anderen zu treffen',
          'Er will wissen, wer sie geschickt hat',
          'Er will Schutz',
          'Er will, dass sie etwas holen, das er nicht holen kann',
          'Er will sie ablenken, bis es zu spät ist',
          'Er will beichten',
          'Er will, dass sie ihn aufhalten'
        ]
      },

      unterDruck: {
        titel: 'Unter Druck reagiert er wie',
        eintraege: [
          'Redet sofort und zu viel',
          'Wird laut und droht',
          'Erstarrt vollständig',
          'Wird höflicher, je enger es wird',
          'Rennt weg, ohne Vorwarnung',
          'Bietet Geld an',
          'Gibt einen kleinen Teil zu, um den großen zu decken',
          'Greift an, obwohl er verlieren wird'
        ]
      },

      vorname: {
        titel: 'Vorname',
        eintraege: [
          'Aldous', 'Bertram', 'Cornelius', 'Ealon', 'Ferdinand', 'Gottfried',
          'Hendrik', 'Ignaz', 'Jasper', 'Konrad', 'Leopold', 'Matthias',
          'Nikolaus', 'Osric', 'Pieter', 'Quirin', 'Rutger', 'Silas',
          'Thaddäus', 'Valentin',
          'Adelheid', 'Beatrix', 'Clementine', 'Doreth', 'Elsbeth', 'Friedericke',
          'Gudrun', 'Henriette', 'Isolde', 'Jorinde', 'Karolina', 'Lisbeth',
          'Magdalena', 'Nore', 'Ottilie', 'Philippa', 'Rosamund', 'Sieglinde',
          'Theodora', 'Wilhelmine'
        ]
      },

      nachname: {
        titel: 'Nachname',
        eintraege: [
          'Achtermann', 'Brandhorst', 'Cleve', 'Dahlbeck', 'Eschenbruch',
          'Fahlberg', 'Grothe', 'Hasselkamp', 'Immendorf', 'Kellinghusen',
          'Lüttjohann', 'Mersheim', 'Nachtigal', 'Ohlsdorf', 'Petersilie',
          'Quernheim', 'Rautenberg', 'Steenkamp', 'Trittau', 'Vogelsang',
          'Wehrkamp', 'Zeidler'
        ]
      },

      beiname: {
        titel: 'Beiname oder Titel',
        eintraege: [
          'der Zöllner', 'genannt Zwei-Finger', 'Werkmeister', 'Oberinspektor',
          'die Sammlerin', 'Doktor ohne Praxis', 'Herr Kollege', 'Kesselmutter',
          'der Kartograph', 'Frau Doktor', 'Bahnhofsvorsteher a. D.', 'die Vermieterin'
        ]
      }
    }
  },

  /* ==========================================================
     DAS UNHEIMLICHE
     ========================================================== */
  unheimlich: {
    titel: 'Das Unheimliche',
    listen: {

      raum: {
        titel: 'Was am Raum nicht stimmt',
        eintraege: [
          'Die Tür, durch die ihr gekommen seid, ist woanders',
          'Es gibt kein Echo',
          'Der Staub liegt gleichmäßig — auch auf dem, was jemand eben benutzt hat',
          'Alle Stühle stehen zur Wand gedreht',
          'Die Fenster zeigen eine andere Tageszeit',
          'Der Raum hat eine Ecke zu viel',
          'Es ist warm, aber der Atem geht als Wolke',
          'Etwas tropft nach oben',
          'Der Boden ist an einer Stelle weich',
          'Die Bilder zeigen alle denselben Ort, aus verschiedenen Jahren, unverändert',
          'Ihr hört euch selbst sprechen, mit Verzögerung',
          'Der Spiegel ist einen Moment zu langsam',
          'Es riecht nach dem Zuhause eines der Charaktere',
          'Zwischen zwei Räumen fehlt der Weg — man ist einfach drin',
          'Der Kamin brennt ohne Wärme',
          'Auf dem Tisch steht Essen für so viele Personen, wie ihr seid',
          'Die Wand vibriert im Takt eines Herzschlags, aber langsamer',
          'Kein Insekt, keine Spinne, kein Schimmel — steril',
          'Etwas ist hier zu Hause, und es ist ordentlich',
          'Alles ist normal. Absolut normal. Und niemand kann sagen, warum das falsch ist'
        ]
      },

      koerper: {
        titel: 'Was am Körper nicht stimmt',
        eintraege: [
          'Zu viele Gelenke in einem Finger',
          'Die Augen bewegen sich nicht mit dem Kopf',
          'Er blinzelt nicht. Seit vier Minuten nicht.',
          'Die Haut sitzt zu locker, wie geliehen',
          'Er atmet ein, aber nie aus',
          'Die Stimme kommt aus der Brust, nicht aus dem Hals',
          'Der Schatten passt nicht zur Haltung',
          'Kein Puls, aber er lebt und redet',
          'Die Zähne sind alle gleich groß',
          'Der Kopf dreht sich einen Grad weiter als er sollte',
          'Er wärmt sich nicht auf, egal wie lange er am Feuer sitzt',
          'Unter dem Ärmel: eine Naht, kein Handgelenk',
          'Er isst, aber es ist keine Bewegung im Hals',
          'Die Wunde ist da, aber sie blutet zurück',
          'Er spricht mit der Stimme von jemandem, den ein Charakter kannte',
          'Sein Spiegelbild sieht müder aus als er',
          'Er nimmt Wärme aus dem Raum, spürbar',
          'Er weiß Dinge über die Charaktere, die er nicht wissen kann, und findet das normal',
          'Er ist immer genau gleich weit entfernt',
          'Er sieht aus wie ein Charakter der Gruppe, und nur dieser eine bemerkt es'
        ]
      },

      geraeusch: {
        titel: 'Was am Geräusch nicht stimmt',
        eintraege: [
          'Schritte über euch, in einem Stockwerk, das es nicht gibt',
          'Ein Kinderlied, gesummt, sehr weit weg',
          'Metall, das an Metall schabt, im Takt der eigenen Schritte',
          'Jemand ruft einen Namen, den nur ein Charakter kennt',
          'Ein Geräusch hört genau dann auf, wenn man hinhört',
          'Maschinenlärm aus einem Raum ohne Maschine',
          'Zwei Stimmen im Nebenraum, eine davon eure',
          'Ein tiefer Ton, so tief, dass man ihn im Brustbein spürt',
          'Atmen, dicht am Ohr, außerhalb der Reichweite',
          'Alle Geräusche sind da, aber gedämpft, als wäre Stoff dazwischen',
          'Rückwärts gesprochene Worte, klar verständlich',
          'Absolute Stille, für genau sieben Sekunden'
        ]
      },

      licht: {
        titel: 'Was am Licht nicht stimmt',
        eintraege: [
          'Die Lampe brennt, aber der Raum wird nicht heller',
          'Schatten fallen zur Lichtquelle hin',
          'Ein Schatten zu viel für die Anzahl der Anwesenden',
          'Das Licht flackert im Rhythmus von jemandes Atem',
          'Die Flamme neigt sich immer in dieselbe Richtung',
          'Farben stimmen nicht — Blut ist zu dunkel, Haut zu grau',
          'Etwas wirft Schatten, das nicht da ist',
          'Am Ende des Gangs ist Licht, aber kein Ende',
          'Die Dunkelheit hat eine Kante, wie eine Wand',
          'Was man aus dem Augenwinkel sieht, ist detaillierter als was man ansieht',
          'Der eigene Schatten zögert',
          'Es wird hell, ohne dass die Sonne aufgeht'
        ]
      },

      zeit: {
        titel: 'Was an der Zeit nicht stimmt',
        eintraege: [
          'Alle Uhren im Haus zeigen dieselbe falsche Zeit',
          'Draußen sind drei Stunden vergangen, drinnen zwanzig Minuten',
          'Ein Charakter erinnert sich an ein Gespräch, das noch nicht stattgefunden hat',
          'Dieselbe Person geht zweimal am Fenster vorbei, identisch',
          'Die Kerze ist länger geworden',
          'Das Datum in der Zeitung liegt vier Tage vorn',
          'Jemand beantwortet die Frage, bevor sie gestellt wird',
          'Ein Charakter fehlt für einen Moment und weiß nichts davon',
          'Das Essen auf dem Tisch ist frisch, das Haus seit Jahren leer',
          'Ihr habt diesen Raum heute schon einmal betreten und erinnert euch erst jetzt'
        ]
      },

      schrift: {
        titel: 'Was an Schrift und Sprache nicht stimmt',
        eintraege: [
          'Die Handschrift wird zum Ende hin die eines Charakters',
          'Dieselbe Zeile, dreißigmal untereinander, mit zunehmendem Druck',
          'Ein Text in einer Sprache, die man versteht, ohne sie zu kennen',
          'Ein Name ist überall herausgeschnitten, aus jedem Dokument',
          'Die Seitenzahlen springen von 112 auf 114, überall',
          'Randnotizen beantworten Fragen, die man beim Lesen denkt',
          'Ein Wörterbuch für eine Sprache, die es nicht gibt, sehr gründlich',
          'Das Protokoll notiert Anwesende, die noch nicht geboren waren',
          'Eine Zeichnung des Raumes, in dem ihr gerade steht, mit euch darin',
          'Der Brief ist an einen Charakter adressiert, datiert auf nächste Woche'
        ]
      },

      tiere: {
        titel: 'Was an Tieren nicht stimmt',
        eintraege: [
          'Sie sehen alle zur selben Wand',
          'Die Vögel sind fort. Alle, aus dem ganzen Viertel.',
          'Ein Hund knurrt einen leeren Stuhl an und weicht nicht',
          'Die Ratten laufen auf etwas zu, nicht davon',
          'Ein Pferd geht keinen Schritt weiter, aus keinem Grund',
          'Insekten sammeln sich an einer Stelle der Wand',
          'Die Katze folgt etwas mit den Augen, quer durch den Raum',
          'Ein Tier verhält sich exakt wie ein Mensch, für zwei Sekunden'
        ]
      },

      silhouette: {
        titel: 'Wesen: Silhouette',
        eintraege: [
          'Zu groß und zu dünn',
          'Gebeugt und breit',
          'Unter einem Tuch, das sich falsch bewegt',
          'Eine Gestalt aus dem Wetter (Rauch, Nebel, Regen)',
          'Kleiner als ein Kind',
          'Nicht ganz da, an den Rändern unklar',
          'Viele, die sich wie eins bewegen',
          'Menschlich, bis auf eine Sache',
          'Nur ein Umriss im Licht dahinter',
          'Das, was ihr sucht, aber falsch zusammengesetzt'
        ]
      },

      bewegung: {
        titel: 'Wesen: Bewegung',
        eintraege: [
          'Viel zu schnell für die Größe',
          'Ruckartig, wie ausgelassene Bilder',
          'Fließend, ohne Schritte',
          'Rückwärts, unbeeindruckt',
          'Nur wenn niemand hinsieht',
          'Immer gleich weit entfernt, egal wie schnell man rennt',
          'Es kommt nicht näher, aber es ist näher',
          'Es geht durch, wo nichts durchgeht',
          'Es zittert im Stehen',
          'Es bewegt sich synchron zu einem der Charaktere'
        ]
      },

      falschesDetail: {
        titel: 'Wesen: Das falsche Detail',
        eintraege: [
          'Kein Gesicht, aber es sieht dich an',
          'Zu viele Finger, sonst normale Hände',
          'Es trägt Kleidung, die zu jemandem gehört',
          'Metall, wo Knochen sein sollte',
          'Es hinterlässt keine Spur, aber der Boden ist warm',
          'Es ist nass, obwohl es trocken ist',
          'Es riecht nach etwas Vertrautem',
          'Es macht ein Geräusch, das man aus dem Alltag kennt',
          'Es ist sauber. Vollkommen sauber.',
          'Es hat den Namen eines Charakters gesagt'
        ]
      },

      wesenWill: {
        titel: 'Wesen: Was es will',
        eintraege: [
          'Dass jemand mitkommt',
          'Dass etwas nicht gefunden wird',
          'Dass etwas gefunden wird',
          'Dass die Arbeit weitergeht',
          'Nachahmen, immer besser',
          'Nichts. Es ist einfach da.',
          'Nach Hause',
          'Dass jemand es ansieht'
        ]
      },

      kultGlaube: {
        titel: 'Kult: Was sie glauben',
        eintraege: [
          'Dass es schon gewonnen hat und Anpassung die einzige Vernunft ist',
          'Dass sie es aufhalten, indem sie ihm regelmäßig geben, was es will',
          'Dass es Fortschritt ist und die anderen zu ängstlich sind',
          'Dass sie auserwählt sind und den Rest retten, notfalls gegen dessen Willen',
          'Dass es nur eine Maschine ist, die man richtig bedienen muss',
          'Dass die alte Ordnung verdient hat unterzugehen',
          'Dass ein Toter zurückkommt, wenn sie fertig sind',
          'Sie glauben gar nichts. Sie werden bezahlt.'
        ]
      },

      kultErkennen: {
        titel: 'Kult: Woran man sie erkennt',
        eintraege: [
          'Identische Manschettenknöpfe',
          'Sie schlafen nicht mehr',
          'Dieselbe Handschrift, alle',
          'Sie essen kein Fleisch, aus einem seltsamen Grund',
          'Eine Narbe an derselben Stelle',
          'Sie nennen einander bei Nummern',
          'Sie halten kurz inne, immer zur vollen Stunde',
          'Sie sind auffällig freundlich zu Fremden'
        ]
      }
    }
  },

  /* ==========================================================
     FUNDSTÜCKE
     ========================================================== */
  fundstuecke: {
    titel: 'Fundstücke',
    listen: {

      nuetzlich: {
        titel: 'Gewöhnlich, aber nützlich',
        eintraege: [
          'Ein Schlüsselbund, elf Schlüssel, einer davon frisch',
          'Ein Notizbuch, letzte Seite herausgerissen',
          'Eine Karte mit Bleistiftkreuz, ohne Legende',
          'Ein Empfehlungsschreiben, blanko unterschrieben',
          'Ein Fahrschein, gestempelt, Rückfahrt offen',
          'Ein Beutel Münzen, alle aus demselben Jahr',
          'Eine Fotografie, ein Gesicht durchgestrichen',
          'Werkzeug mit eingeschlagenen Initialen',
          'Ein Pfandschein',
          'Ein Fläschchen ohne Etikett, halb voll',
          'Ein Uniformknopf, kein bekanntes Regiment',
          'Ein Brief, geöffnet und wieder zugeklebt'
        ]
      },

      geschichte: {
        titel: 'Dinge mit Geschichte',
        eintraege: [
          'Eine Taschenuhr, die seit einem bestimmten Datum falsch geht',
          'Ein Kompass, der auf etwas anderes zeigt als Norden',
          'Ein Schlüssel für eine Tür, die niemand kennt',
          'Ein Ehering, zwei Namen eingraviert, einer abgefeilt',
          'Ein Notizbuch in einer Schrift, die der Besitzer selbst nicht mehr liest',
          'Ein Kinderspielzeug in einem Haus ohne Kinder',
          'Ein Kesselabzeichen eines Schiffs, das gesunken ist',
          'Eine Brille mit fremder Stärke, sorgfältig aufbewahrt',
          'Ein Messer, an dem etwas nicht abgeht',
          'Eine Eintrittskarte für eine Vorstellung nächste Woche, benutzt',
          'Ein Zahn, in Silber gefasst',
          'Ein Gerät, dessen Zweck niemand erkennt und das noch warm ist'
        ]
      },

      papiere: {
        titel: 'Papiere',
        eintraege: [
          'Frachtliste mit Kisten, die es nicht gibt',
          'Schichtplan mit Namen von Toten',
          'Ein Vertrag, dessen Gegenpartei nicht genannt wird',
          'Medizinische Notizen über einen Patienten ohne Namen',
          'Konstruktionszeichnung eines Geräts, das nichts tun kann',
          'Eine Liste von Adressen, drei davon durchgestrichen',
          'Ein Testament, drei Wochen vor dem Tod geändert',
          'Rechnungen für Material, das nie geliefert wurde',
          'Ein Tagebuch, das mitten im Satz aufhört',
          'Ein Protokoll einer Sitzung, die nie stattgefunden hat'
        ]
      }
    }
  },

  /* ==========================================================
     KOMPLIKATIONEN
     ========================================================== */
  komplikationen: {
    titel: 'Komplikationen',
    listen: {

      einbruch: {
        titel: 'Beim Einbrechen und Schleichen',
        eintraege: [
          'Ein Hund schlägt an, zwei Häuser weiter',
          'Der Dietrich bricht ab, im Schloss',
          'Jemand kommt, aber nicht der, den ihr erwartet habt',
          'Ihr habt eine Spur hinterlassen, die auffällt',
          'Die Tür fällt hinter euch zu und lässt sich nicht öffnen',
          'Ein Licht geht an, im Stockwerk darüber',
          'Ihr seid im falschen Raum',
          'Es hat länger gedauert als geplant — deutlich länger'
        ]
      },

      maschine: {
        titel: 'An Maschinen',
        eintraege: [
          'Eine Leitung reißt: 1W6 Schaden, Dampf',
          'Es läuft, aber es lässt sich nicht mehr abstellen',
          'Der Lärm ist bis auf die Straße zu hören',
          'Ein Werkzeug bleibt stecken und geht verloren',
          'Es funktioniert — für jemand anderen, nicht für euch',
          'Ihr habt etwas kaputtgemacht, das ihr später braucht',
          'Ein Anzeigewert stimmt nicht, und ihr merkt es zu spät',
          'Der Brennstoff ist alle'
        ]
      },

      gespraech: {
        titel: 'Im Gespräch',
        eintraege: [
          'Er glaubt euch, erzählt es aber weiter',
          'Er will jetzt etwas dafür',
          'Er hat mehr verstanden, als ihr wolltet',
          'Jemand hat mitgehört',
          'Er sagt zu, hält sich aber nicht daran',
          'Er ist beleidigt, dauerhaft',
          'Er gibt euch eine Information, die falsch ist, ohne es zu wissen',
          'Er stellt eine Gegenfrage, die einen Charakter in Bedrängnis bringt'
        ]
      },

      kampf: {
        titel: 'Im Kampf',
        eintraege: [
          'Die Waffe klemmt oder ist leer',
          'Ihr steht plötzlich frei — der nächste Angriff hat Vorteil',
          'Etwas geht kaputt, das euch gehört',
          'Ein Unbeteiligter gerät dazwischen',
          'Der Lärm zieht Verstärkung an, in zwei Runden',
          'Ihr rutscht aus oder stolpert: liegend',
          'Der Gegner erreicht etwas, das er nicht erreichen sollte',
          'Es fängt an zu brennen'
        ]
      },

      ermittlung: {
        titel: 'In der Ermittlung',
        eintraege: [
          'Die Spur ist echt, führt aber zu jemand Unschuldigem',
          'Jemand war vor euch da und hat aufgeräumt',
          'Ihr habt es beschädigt beim Untersuchen',
          'Der Hinweis ergibt erst später Sinn — und dann ist es knapp',
          'Ihr werdet dabei gesehen',
          'Es fehlt ein Stück, offensichtlich entfernt',
          'Zwei Hinweise widersprechen sich, beide stimmen',
          'Ihr habt recht, und das ist das Problem'
        ]
      },

      reise: {
        titel: 'Unterwegs und in der Wildnis',
        eintraege: [
          'Ihr verliert einen halben Tag',
          'Das Wetter schlägt um',
          'Ein Ausrüstungsstück geht verloren',
          'Ihr werdet verfolgt, seit wann ist unklar',
          'Der Weg ist versperrt, der Umweg ist lang',
          'Jemand wird krank oder verletzt sich',
          'Ihr trefft jemanden, der nicht hier sein sollte',
          'Die Vorräte sind knapper als gedacht'
        ]
      }
    }
  }
};

/* ============================================================
   KOMBIWÜRFE
   Ein Knopfdruck würfelt mehrere Tabellen gleichzeitig.
   "listen" verweist mit "gruppe.liste" in die Struktur oben.
   "label" ist die Beschriftung im Ergebnis.
   ============================================================ */

export const KOMBIS = [
  {
    titel: 'NSC bauen',
    listen: [
      { pfad: 'personen.vorname',      label: 'Vorname' },
      { pfad: 'personen.nachname',     label: 'Nachname' },
      { pfad: 'personen.aussehen',     label: 'Aussehen' },
      { pfad: 'personen.auftreten',    label: 'Auftreten' },
      { pfad: 'personen.wunsch',       label: 'Will' },
      { pfad: 'personen.geheimnis',    label: 'Verschweigt' }
    ]
  },
  {
    titel: 'Raum beschreiben',
    listen: [
      { pfad: 'ort.auffaellig', label: 'Fällt auf' },
      { pfad: 'ort.geruch',     label: 'Riecht nach' },
      { pfad: 'ort.nutzbar',    label: 'Benutzbar' }
    ]
  },
  {
    titel: 'Etwas stimmt nicht',
    listen: [
      { pfad: 'unheimlich.raum',      label: 'Am Raum' },
      { pfad: 'unheimlich.geraeusch', label: 'Am Geräusch' },
      { pfad: 'unheimlich.licht',     label: 'Am Licht' }
    ]
  },
  {
    titel: 'Wesen bauen',
    listen: [
      { pfad: 'unheimlich.silhouette',     label: 'Silhouette' },
      { pfad: 'unheimlich.bewegung',       label: 'Bewegung' },
      { pfad: 'unheimlich.falschesDetail', label: 'Falsches Detail' },
      { pfad: 'unheimlich.wesenWill',      label: 'Will' }
    ]
  },
  {
    titel: 'Maschine bauen',
    listen: [
      { pfad: 'technik.antrieb', label: 'Antrieb' },
      { pfad: 'technik.aufgabe', label: 'Aufgabe' },
      { pfad: 'technik.macke',   label: 'Macke' }
    ]
  },
  {
    titel: 'Bauteil finden',
    listen: [
      { pfad: 'technik.bauteil', label: 'Bauteil' },
      { pfad: 'technik.zustand', label: 'Zustand' },
      { pfad: 'technik.taugtZu', label: 'Taugt zu' }
    ]
  },
  {
    titel: 'Fundstück',
    listen: [
      { pfad: 'fundstuecke.geschichte', label: 'Fundstück' },
      { pfad: 'fundstuecke.papiere',    label: 'Dabei liegt' }
    ]
  },
  {
    titel: 'Fall würfeln',
    listen: [
      { pfad: 'personen.wunsch',        label: 'Er wollte' },
      { pfad: 'personen.geheimnis',     label: 'Er verschweigt' },
      { pfad: 'komplikationen.ermittlung', label: 'Was schiefging' },
      { pfad: 'ort.schauplatz',         label: 'Schauplatz' }
    ]
  }
];
