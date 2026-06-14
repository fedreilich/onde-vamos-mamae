const CACHE = "ovm-v1";
const PRECACHE = [
  "/onde-vamos-mamae/",
  "/onde-vamos-mamae/index.html",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  // Só intercepta GET; deixa Firebase, Cloudinary e Nominatim passarem direto
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const passThrough = ["firebaseio.com","googleapis.com","cloudinary.com","nominatim.openstreetmap.org","fonts.gstatic.com"];
  if (passThrough.some(h => url.hostname.includes(h))) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match("/onde-vamos-mamae/index.html"));
    })
  );
});
