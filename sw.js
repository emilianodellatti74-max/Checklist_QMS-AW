// Funzionamento offline dell'app Checklist QMS-AW.
// A ogni aggiornamento dei file aumentare VERSIONE: altrimenti i telefoni
// continuano a usare la copia in memoria.
const VERSIONE = 'qmsaw-checklist-v2';
const FILE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(nomi => Promise.all(nomi.filter(n => n !== VERSIONE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// prima la copia in memoria, poi la rete: l'app si apre anche senza segnale
self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    caches.match(ev.request, { ignoreSearch: true }).then(r => r || fetch(ev.request))
  );
});
