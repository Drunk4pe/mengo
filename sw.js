// Freizeitküche – Offline-Cache
var CACHE = "fk-v12";
var FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); })); self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); })); })); self.clients.claim(); });
self.addEventListener("fetch", function(e){
  var req = e.request, url = new URL(req.url);
  if(req.method!=="GET" || url.origin!==location.origin) return; // Open Food Facts immer live
  // Seiten: zuerst Netz (damit Updates ankommen), offline aus dem Cache
  if(req.mode==="navigate"){
    e.respondWith(fetch(req).then(function(res){ if(res.ok){ var c = res.clone(); caches.open(CACHE).then(function(ca){ ca.put(req, c); }); } return res; }).catch(function(){ return caches.match(req).then(function(r){ return r || caches.match("./index.html"); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(r){ return r || fetch(req).then(function(res){ if(res.ok){ var c = res.clone(); caches.open(CACHE).then(function(ca){ ca.put(req, c); }); } return res; }); }));
});
