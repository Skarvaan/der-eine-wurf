/* ============================================================
   SERVICE WORKER — Offline-Betrieb
   ============================================================
   WICHTIG: Nach jeder Änderung an einer der Dateien unten die
   VERSION hochzählen. Sonst liefert der Browser weiter die
   alte Fassung aus, und du suchst den Fehler im Code.

   Firebase wird bewusst NICHT zwischengespeichert — die
   Bibliothek kommt vom Google-CDN und bringt ihren eigenen
   Offline-Speicher mit (siehe speicher.js).
   ============================================================ */

const VERSION = 'dew-v20';

const DATEIEN = [
  './', './index.html', './spiel.html', './regelwerk.html', './session-0.html', './stil.css',
  './app.js', './speicher.js', './firebase-konfig.js', './regelwerk.js',
  './charakter.js', './geteilt.js', './sl.js', './druckbogen.js',
  './daten/tabellen.js', './daten/regeln.js', './daten/regeln-render.js',
  './manifest.json', './icon-192.png', './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      // 'reload' holt jede Datei frisch vom Server. Sonst könnte die
      // neue Version ihren Offline-Speicher mit alten Dateien aus dem
      // HTTP-Speicher des Browsers füllen (siehe fetch unten).
      .then(s => s.addAll(DATEIEN.map(d => new Request(d, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n !== VERSION).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

/* Erst Netz, dann Zwischenspeicher: beim Entwickeln siehst du
   immer die neueste Fassung, offline funktioniert es trotzdem.
   Anfragen an Google lassen wir unangetastet durch. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('firebase')) return;

  /* „no-cache“ heißt NICHT „nichts speichern“, sondern: vor dem
     Benutzen beim Server nachfragen, ob die Datei noch aktuell ist.
     Ohne das geht auch fetch() hier durch den HTTP-Speicher des
     Browsers, und GitHub Pages erlaubt dem bis zu 10 Minuten
     (max-age=600) ohne Nachfrage. Dann lieferte „erst Netz“ nach
     einem Update noch zehn Minuten lang die alte Fassung aus.
     Seitenaufrufe (mode 'navigate') lassen sich nicht neu
     verpacken, die bleiben unverändert; die HTML-Seiten ändern
     sich ohnehin selten. */
  const anfrage = e.request.mode === 'navigate'
    ? e.request
    : new Request(e.request, { cache: 'no-cache' });

  e.respondWith(
    fetch(anfrage)
      .then(antwort => {
        const kopie = antwort.clone();
        caches.open(VERSION).then(s => s.put(e.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(e.request))
  );
});
