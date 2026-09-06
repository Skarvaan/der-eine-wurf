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

const VERSION = 'dew-v8';

const DATEIEN = [
  './', './index.html', './spiel.html', './stil.css',
  './app.js', './speicher.js', './firebase-konfig.js',
  './charakter.js', './geteilt.js', './sl.js',
  './daten/tabellen.js', './daten/regeln.js',
  './manifest.json', './icon-192.png', './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then(s => s.addAll(DATEIEN))
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

  e.respondWith(
    fetch(e.request)
      .then(antwort => {
        const kopie = antwort.clone();
        caches.open(VERSION).then(s => s.put(e.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(e.request))
  );
});
