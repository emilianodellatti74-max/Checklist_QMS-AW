// Funzionamento offline dell'app Checklist QMS-AW.
// A ogni aggiornamento dei file aumentare VERSIONE (e VERSIONE_APP in
// index.html): altrimenti i telefoni continuano a usare la copia in memoria.
const VERSIONE = 'qmsaw-checklist-v4';
const FILE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// I file si scaricano con cache 'reload' e con la versione nell'indirizzo:
// cosi' arrivano quelli appena pubblicati e non copie rimaste nella memoria
// del browser o del server (GitHub Pages le tiene fino a 10 minuti).
self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(VERSIONE).then(c => Promise.all(FILE.map(u =>
      fetch(new Request(u + '?v=' + VERSIONE, { cache: 'reload' })).then(r => {
        if (!r.ok) throw new Error('file non scaricato: ' + u);
        return c.put(u, r);
      })
    ))).then(() => self.skipWaiting())
  );
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
